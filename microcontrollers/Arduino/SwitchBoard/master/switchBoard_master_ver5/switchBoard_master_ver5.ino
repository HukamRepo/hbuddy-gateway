
/*
 *Act as master for both digital and analog switches
 *Returns the value of switches to the cloud
*/
#include <SPI.h>
#include <Filters.h>  // library for current measurement
#include <EEPROM.h>

// library for user serial port
#include <SoftwareSerial.h>
// library for using DHT sensor for Humidity and Temparature

// pins used as serial for communication with all three nodes
#define rxPin_asst_digital 5
#define txPin_asst_digital 6

#define rxPin_asst_analog  2
#define txPin_asst_analog 4

#define broadcast_pin 7  // led for check

static int boardIdBaseAddress = 0 ;
static int timer = 0;
static byte b5 = 0;
static byte b6 = 0;
static byte b7 = 0;
static byte b8 = 0;
static String uniqueId;

// ISR(WDT_vect) { Sleepy::watchdogEvent(); } // Setup the watchdog

unsigned long setupEeprom()
{
  byte b1 = EEPROM.read(boardIdBaseAddress);
  byte b2 = EEPROM.read(boardIdBaseAddress + 1);
  byte b3 = EEPROM.read(boardIdBaseAddress + 2);
  byte b4 = EEPROM.read(boardIdBaseAddress + 3);
  b5 = EEPROM.read(boardIdBaseAddress + 4);
  b6 = EEPROM.read(boardIdBaseAddress + 5);
  b7 = EEPROM.read(boardIdBaseAddress + 6);
  b8 = EEPROM.read(boardIdBaseAddress + 7);
  
  if ((b1 != 'A') || (b2 != 'P') || (b3 != 'P') || (b4 != '1') || ((b5 == 0xff) && (b6 == 0xff) && (b7 == 0xff) && (b8 == 0xff)))
  {
    b1 = 'A';
    b2 = 'P';
    b3 = 'P';
    b4 = '1';
    randomSeed(timer);
    b5 = random(256);
    b6 = random(256);
    b7 = random(256);
    b8 = random(256);
    EEPROM.write(boardIdBaseAddress, b1); 
    EEPROM.write(boardIdBaseAddress + 1, b2); 
    EEPROM.write(boardIdBaseAddress + 2, b3); 
    EEPROM.write(boardIdBaseAddress + 3, b4); 
    EEPROM.write(boardIdBaseAddress + 4, b5); 
    EEPROM.write(boardIdBaseAddress + 5, b6); 
    EEPROM.write(boardIdBaseAddress + 6, b7); 
    EEPROM.write(boardIdBaseAddress + 7, b8); 
  }
}

//variables to save the state of switch
static int swState_1 = 0;
static int swState_2 = 0;
static int swState_3 = 0;
static int swState_4 = 0;
static int swState_5 = 0;
static int swState_6 = 0;
static int swState_7 = 0;
static int swState_8 = 0;
static int swState_9 = 0;

const String a_ON  = "#a";
const String a_OFF = "#b";
const String b_ON  = "#c";
const String b_OFF = "#d";
const String c_ON  = "#e";
const String c_OFF = "#f";
const String d_ON  = "#g";
const String d_OFF = "#h";
const String e_ON  = "#i";
const String e_OFF = "#j";
const String f_ON  = "#k";
const String f_OFF = "#l";

//const String analog_msg = "#m";
int cmdForDevice[2];  // to store the command for the devices
String swNo_value = "";
// char cb[1];  // to store the command
// String board = "P4yd1RJhDfSDUS02";

SoftwareSerial asst_master_analog_serial(rxPin_asst_analog, txPin_asst_analog);
SoftwareSerial asst_master_digital_serial(rxPin_asst_digital, txPin_asst_digital);

static boolean change_digital = false;    // to check the status of digital switches
static boolean change_analog = false;    // to check the status of analog switches
static boolean change = false;

// variables for current measurement 


float voltage = 230;
float testFrequency = 50;                     // test signal frequency (Hz)
float windowLength = 25.0/testFrequency;     // how long to average the signal, for statistist
int sensorValue = 0;
float intercept = -0.0000; // to be adjusted based on calibration testing
float slope = 0.0657; // to be adjusted based on calibration testing
float current_amps; // estimated actual current in amps

unsigned long printPeriod = 10000; // in milliseconds
// Track time in milliseconds since last reading 
unsigned long previousMillis = 0;


void setup() {
  Serial.begin(9600); 
  setupEeprom();
  uniqueId = "SWB-" +(String(b5) + String(b6) + String(b7) + String(b8));
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }  

      pinMode(broadcast_pin, OUTPUT);
      
      pinMode(rxPin_asst_digital, INPUT);
      pinMode(txPin_asst_digital, OUTPUT);
      pinMode(rxPin_asst_analog, INPUT);
      pinMode(txPin_asst_analog, OUTPUT);
        
  asst_master_digital_serial.begin(9600);
  asst_master_analog_serial.begin(9600);
  
}

void loop() {
  //  Serial.println("in loop..");
    if ( Serial.available() ) {
      // Read the data payload until we've received everything
      String command;
      command = Serial.readString();
      if((checkCommand(command))[0]>0) {
           command.trim();
           updateSwitches(command);  
      }
      else {
        Serial.println("Sorry wrong board : ");            
      }
    }

    //UPDATING CLOUD
    check_asst_master_digital_serial();
    check_asst_master_analog_serial();
    
  checkNbradcastUsage();
 
}  // --(end main loop)--

/*-----( Declare User-written Functions )-----*/
// function to return status of all switches in Board
String getStatusOfBoard() {
  String state;
   state += "{uniqueId:";
   state += uniqueId;
   state += ",state:{1:";
   state += swState_1;
   state += ",2:";
   state += swState_2;
   state += ",3:";
   state += swState_3;
   state += ",4:";
   state += swState_4;
   state += ",5:";
   state += swState_5;
   state += ",6:";
   state += swState_6;
   state += ",7:";
   state += swState_7;
   state += ",8:";
   state += swState_8;
   state += ",9:";
   state += swState_9;
   state += "}";
  return state;
}

// function to check if the command is for this board
int* checkCommand(String command) {

//    Serial.println("<<<IN cmdForTheBoard() method>>> ");
    String cmd_in;
    boolean flag_board = true;
    boolean flag_device= true;
    boolean flag_value = true;
    int incr = 0;
    
    while(flag_board){
      if(command[incr+1]=='#') {
        incr++;
        flag_board = false;
        continue;
      }      
        cmd_in += command[incr+1];        
        incr++;
    }    
//    Serial.println(cmd_in);  // check cmd_in set
    
    if (strcmp(cmd_in.c_str(), uniqueId.c_str()) == 0) {
      cmdForDevice[0] = incr+1;
      cmdForDevice[1] = incr+3;      
    }
    else {      
      cmdForDevice[0] = -1;
    }
    
    return cmdForDevice;
}

// function to update switches
void updateSwitches(String cmd_s) {
//  Serial.println("<<<IN updateSwitch() method>>> ");
  int l=0;
  int switchNo = cmd_s[cmdForDevice[0]]-'0';
  int switchValue = cmd_s[cmdForDevice[1]]-'0';

  switch (switchNo) {
    asst_master_digital_serial.listen();
    case  1:
      if (switchValue == 1) {
        asst_master_digital_serial.println(a_ON);
      }
      else {
        asst_master_digital_serial.println(a_OFF);
      }
      break;
    case  2:
      if (switchValue == 1) {
        asst_master_digital_serial.println(b_ON);
      }
      else {
        asst_master_digital_serial.println(b_OFF);
      }
      break;
    case  3:
      if (switchValue == 1) {
        asst_master_digital_serial.println(c_ON);
      }
      else {
        asst_master_digital_serial.println(c_OFF);
      }
      break;
    case  4:
      if (switchValue == 1) {
        asst_master_digital_serial.println(d_ON);
      }
      else {
        asst_master_digital_serial.println(d_OFF);
      }
      break;
    case  5:
      if (switchValue == 1) {
        asst_master_digital_serial.println(e_ON);
      }
      else {
        asst_master_digital_serial.println(e_OFF);
      }
      break;
    case  6:
      if (switchValue == 1) {
        asst_master_digital_serial.println(f_ON);
      }
      else {
        asst_master_digital_serial.println(f_OFF);
      }
      break;
     
// for analog devices
    case  7:    
        asst_master_analog_serial.print("7");
        asst_master_analog_serial.print("#");
        asst_master_analog_serial.print(switchValue);
        asst_master_analog_serial.println();
           break;
    case  8:
        asst_master_analog_serial.print("8");
        asst_master_analog_serial.print("#");
        asst_master_analog_serial.print(switchValue);
        asst_master_analog_serial.println();
            break;
    case  9:
        asst_master_analog_serial.print("9");
        asst_master_analog_serial.print("#");
        asst_master_analog_serial.print(switchValue);
        asst_master_analog_serial.println();
            break;
     
  }

}


void check_asst_master_digital_serial() { 
  String toSend = "{\"type\":\"switch_board\", \"uniqueId\":\""+uniqueId+"\", \"data\": {";
  toSend.trim();
  char cb[1];  // to store the command  
  asst_master_digital_serial.listen();
  
  if (asst_master_digital_serial.available()) {
      delay(1);
      asst_master_digital_serial.readBytes(cb,1);
      delay(30);

    switch (cb[0]) {
      case 'A':
        toSend += "\"deviceIndex\":1,\"deviceValue\":1}}";
        swState_1 = 1;
        break;

      case 'B':
        toSend += "\"deviceIndex\":1,\"deviceValue\":0}}";
        swState_1 = 0;
        break;

      case 'C':
        toSend += "\"deviceIndex\":2,\"deviceValue\":1}}";
        swState_2 = 1;
        break;

      case 'D':
        toSend += "\"deviceIndex\":2,\"deviceValue\":0}}";
        swState_2 = 0;
        break;

      case 'E':
        toSend += "\"deviceIndex\":3,\"deviceValue\":1}}";
        swState_3 = 1;
        break;
        
      case 'F':
        toSend += "\"deviceIndex\":3,\"deviceValue\":0}}";
        swState_3 = 0;
        break;

      case 'G':
        toSend += "\"deviceIndex\":4,\"deviceValue\":1}}";
        swState_4 = 1;
        break;

      case 'H':
        toSend += "\"deviceIndex\":4,\"deviceValue\":0}}";
        swState_4 = 0;
        break;

      case 'I':
        toSend += "\"deviceIndex\":5,\"deviceValue\":1}}";
        swState_5 = 1;
        break;

      case 'J':
        toSend += "\"deviceIndex\":5,\"deviceValue\":0}}";
        swState_5 = 0;
        break;

      case 'K':
        toSend += "\"deviceIndex\":6,\"deviceValue\":1}}";
        swState_6 = 1;
        break;

      case 'L':
        toSend += "\"deviceIndex\":6,\"deviceValue\":0}}";
        swState_6 = 0;
        break;
      default: 
      toSend = " "+cb[0];      
     }

     toSend.trim();
     broadcastMsg(toSend);

    }
 
  }


void check_asst_master_analog_serial() { 
  String analogData = "{\"type\":\"switch_board\", \"uniqueId\":\""+uniqueId+"\", \"data\": {";
  analogData.trim();
 // asst_master_analog_serial.listen();
  if (asst_master_analog_serial.available()) {
    
      delay(1);
      String action = asst_master_analog_serial.readString();
      delay(30);
      analogData += "\"deviceIndex\":";
      analogData += action[0];
      analogData += ",\"deviceValue\":";
      analogData += action[2];
      analogData += ",\"analogValue\":";
      analogData += action[4];
      analogData += "}}";      
      
     analogData.trim();
     broadcastMsg(analogData);    
 }
 
}

void broadcastMsg(String msg) {
     Serial.println(msg);     
     digitalWrite(broadcast_pin,HIGH);
     delay(200);
     digitalWrite(broadcast_pin,LOW);
     delay(300);    
     Serial.flush();
}

void checkNbradcastUsage() {
  RunningStatistics inputStats;                 // create statistics to look at the raw test signal
  inputStats.setWindowSecs( windowLength );
   
    sensorValue = analogRead(A0);  // read the analog in value:
    inputStats.input(sensorValue);  // log to Stats function
        
    if((unsigned long)(millis() - previousMillis) >= printPeriod) {
      previousMillis = millis();   // update time
      
      // display current values to the screen
      // output sigma or variation values associated with the inputValue itsel
//      Serial.print( "\tsigma: " ); Serial.print( inputStats.sigma() );
      // convert signal sigma value to current in amps
      current_amps = intercept + slope * inputStats.sigma();      

      String usage = "{\"type\":\"switch_board\", \"uniqueId\":\""+uniqueId+"\", \"data\": {\"power\": ";
      usage += current_amps*voltage;
      usage += ", \"unit\":\"W\" }}";
      broadcastMsg(usage);
     }
  
}

//NONE
//*********( THE END )***********

