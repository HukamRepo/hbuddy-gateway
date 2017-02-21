
/*
 *Act as master for both digital and analog switches
 *Returns current state of all switches in board if asked as <UID>getState
 *Returns sensor data (Temparature and Humidity) if asked as <UID>getData
*/
#include <SPI.h>

// library for user serial port
#include <SoftwareSerial.h>
// library for using DHT sensor for Humidity and Temparature
#include <DHT.h>

#define DHTPIN 8
#define DHTTYPE DHT22   // DHT 22  (AM2302)

DHT dht(DHTPIN, DHTTYPE);

// pins used as serial for communication with all three nodes
#define rxPin_asst_digital 5
#define txPin_asst_digital 6

#define rxPin_asst_analog 2
#define txPin_asst_analog 4

#define broadcast_pin 7  // led for check
// variables to sabe sensor data
static int h;
static int t;
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
String swNo_value = "";
// char cb[1];  // to store the command
String board = "P4yd1RJhDfSDUS02";
const char* boardID = board.c_str();     // ID of the board


SoftwareSerial asst_master_analog_serial(rxPin_asst_analog, txPin_asst_analog);
SoftwareSerial asst_master_digital_serial(rxPin_asst_digital, txPin_asst_digital);

boolean change_digital = false;    // to check the status of digital switches
boolean change_analog = false;    // to check the status of analog switches


void setup() {
  Serial.begin(9600); 
  dht.begin();
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }  

      pinMode(broadcast_pin, OUTPUT);
      
      pinMode(rxPin_asst_digital, INPUT);
      pinMode(txPin_asst_digital, OUTPUT);
      pinMode(rxPin_asst_analog, INPUT);
      pinMode(txPin_asst_analog, OUTPUT);
        
  asst_master_analog_serial.begin(9600);
  asst_master_digital_serial.begin(9600);
  
}

void loop() {

  //  Serial.println("in loop..");
  
    if ( Serial.available() )
    {

      // Read the data payload until we've received everything
      String command;
      command = Serial.readString();
      char cmdForBoard[23];
      strcpy(cmdForBoard,command.c_str());                
      
      if(checkCommand(cmdForBoard)) {
/*
           digitalWrite(broadcast_pin,HIGH);
           delay(1000);
           digitalWrite(broadcast_pin,LOW);
           delay(1000);    
           
*/
           command.trim();
           if(command == "#"+board+"#getState") {
            Serial.println(getStatusOfBoard());
           }

           if(command == "#"+board+"#getData") {
            Serial.println(getSensorData());
           }
           
           updateSwitches(command);  
         }  
         
    }
    else
    {
    //      Serial.println("No radio available");
    }
    
  updateCloud();
 
}  // --(end main loop)--

/*-----( Declare User-written Functions )-----*/
// function to return status of all switches in Board
String getStatusOfBoard() {
  String state;
   state += "{UID:";
   state += boardID;
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

// function to get Sensor data 
String getSensorData() {
  String sensorData = "{UID:";
  h = dht.readHumidity();
  t = dht.readTemperature(); 
  sensorData += board;
  sensorData += ",data : {temp:";
  sensorData += t;
  sensorData += ", Hum:";
  sensorData += h;
  sensorData += "}}";
  return sensorData;
}
// function to check if the command is for this board
boolean checkCommand(const char *command) {

    Serial.println("<<<IN cmdForTheBoard() method>>> ");
    String cmd_in;
    boolean flag_while=true;
    boolean res = 0;
    int incr = 0;
    char cmd_temp[20];
    while(flag_while){
      if(command[incr+1]=='#') {
        flag_while = false;
        continue;
      }      
        cmd_in += command[incr+1];
        incr++;
    }
    
    strcpy(cmd_temp,cmd_in.c_str());
//    cmd_temp = cmd_in;
    if (strcmp(cmd_temp, boardID) == 0) {
      res = 1;
    }
    else {
      Serial.println("Sorry wrong board");
      res = 0;
    }
    
    return res;
}

void mgCmd(char task[]) {
//  Serial.println(task);
}


// function to update switches
void updateSwitches(String cmd_s) {
  Serial.println("<<<IN updateSwitch() method>>> ");
  int switchNo = cmd_s[18] - '0';
  int switchValue = cmd_s[20] - '0';
  switch (switchNo) {
    asst_master_digital_serial.listen();
    case  1:
      if (switchValue == 1) {
        swState_1 = 1;
        asst_master_digital_serial.println(a_ON);
      }
      else {
        swState_1 = 0;
        asst_master_digital_serial.println(a_OFF);
      }
      break;
    case  2:
      if (switchValue == 1) {
        swState_2 = 1;
        asst_master_digital_serial.println(b_ON);
      }
      else {
        swState_2 = 0;
        asst_master_digital_serial.println(b_OFF);
      }
      break;
    case  3:
      if (switchValue == 1) {
        swState_3 = 1;
        asst_master_digital_serial.println(c_ON);
      }
      else {
        asst_master_digital_serial.println(c_OFF);
        swState_3 = 0;
      }
      break;
    case  4:
      if (switchValue == 1) {
        swState_4 = 1;
        asst_master_digital_serial.println(d_ON);
      }
      else {
        swState_4 = 0;
        asst_master_digital_serial.println(d_OFF);
      }
      break;
    case  5:
      if (switchValue == 1) {
        swState_5 = 1;
        asst_master_digital_serial.println(e_ON);
      }
      else {
        swState_5 = 0;
        asst_master_digital_serial.println(e_OFF);
      }
      break;
    case  6:
      if (switchValue == 1) {
        swState_6 = 1;
        asst_master_digital_serial.println(f_ON);
      }
      else {
        swState_6 = 0;
        asst_master_digital_serial.println(f_OFF);
      }
      break;
     
// for analog devices
    case  7:
    case  8:
    case  9:
    case  10:
//    asst_master_analog_serial.listen();
//    asst_master_analog_serial.println(analog_msg);
    
    asst_master_analog_serial.listen();
    asst_master_analog_serial.flush();
/*
    swNo_value += (char)switchNo;      
    swNo_value += '#'+(char)switchValue;
*/ 
/*   
    swNo_value += cmd_s[18];
    swNo_value += '#';
    swNo_value += cmd_s[20];
    
    const String analog_msg = swNo_value;    
    asst_master_analog_serial.flush();    
    asst_master_analog_serial.println(analog_msg);
*/    
//    asst_master_analog_serial.print(cmd_s[18]);
    const char swNo = cmd_s[18];
    const char swValue = cmd_s[20];
    asst_master_analog_serial.print(swNo);
    asst_master_analog_serial.print('#');
    asst_master_analog_serial.print(swValue);
//    asst_master_analog_serial.print(cmd_s[20]);
    
        digitalWrite(broadcast_pin,HIGH);
        delay(500);
        digitalWrite(broadcast_pin,LOW);
        delay(500);
        break;
     
  }

}

void updateCloud() {
//  Serial.println("<<<IN updateCloud() method>>> ");
  boolean done = false;
  String toSend = "*";
  toSend += boardID;
  toSend += "*";
  char data[24];
//  char up[1]; 
    if(!change_digital) {
      toSend = check_asst_master_digital_serial(toSend);
    }
    else if (!change_analog) {
      toSend = check_asst_master_analog_serial(toSend);
    }
   
 // if (change_digital || change_analog ) { 
   if (change_digital) {    
     Serial.println(toSend);
     digitalWrite(broadcast_pin,HIGH);
     delay(500);
     digitalWrite(broadcast_pin,LOW);
     delay(500);    
    }
    asst_master_digital_serial.flush();
//    asst_master_analog_serial.flush();
                      
    change_digital = false;
    change_analog = false;
    
}


String check_asst_master_digital_serial(String toSend) {
 char cb[1];  // to store the command  
  asst_master_digital_serial.listen();
//  delay(10);
  if (asst_master_digital_serial.available()) {
//    asst_master_digital_serial.readBytes(cb,1);
    String d = asst_master_digital_serial.readString();    
//    byte c = asst_master_digital_serial.read();
    cb[0] = d[0];
//    cb[0] = c;
//    switch (cb[0]) {
    switch (d[0]) {
      case 'A':
        toSend += "1*1";
        swState_1 = 1;
        break;

      case 'B':
        toSend += "1*0";
        swState_1 = 0;
        break;

      case 'C':
        toSend += "2*1";
        swState_2 = 1;
        break;

      case 'D':
        toSend += "2*0";
        swState_2 = 0;
        break;

      case 'E':
        toSend += "3*1";
        swState_3 = 1;
        break;
        
      case 'F':
        toSend += "3*0";
        swState_3 = 0;
        break;

      case 'G':
        toSend += "4*1";
        swState_4 = 1;
        break;

      case 'H':
        toSend += "4*0";
        swState_4 = 0;
        break;

      case 'I':
        toSend += "5*1";
        swState_5 = 1;
        break;

      case 'J':
        toSend += "5*0";
        swState_5 = 0;
        break;

      case 'K':
        toSend += "6*1";
        swState_6 = 1;
        break;

      case 'L':
        toSend += "6*0";
        swState_6 = 0;
        break;
      default:      
      toSend += d;      
     }
    change_digital = true;    
    }
  return toSend;  
  }


String check_asst_master_analog_serial(String toSend) {
  
 char cb[1];  // to store the command  
  asst_master_analog_serial.listen();
//  delay(10);
  if (asst_master_analog_serial.available()) {
//    asst_master_analog_serial.readBytes(cb,1);
      String d = asst_master_analog_serial.readString();    
//    byte c = asst_master_analog_serial.read();
      toSend += "#"+d+"#";
//      toSend += asst_master_analog_serial.readString();
      change_analog = true;    
 }
 return toSend;  
}

//NONE
//*********( THE END )***********


