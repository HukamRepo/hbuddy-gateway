/*
pin is changed mannually without interrupt 
msg back to display in cloud

*/

#include <SoftwareSerial.h>

#define rxPin 2
#define txPin 4

char cb[3];  // to store the command

// pins for serial communication to devices

 #define rxPin_node_1  0
 #define txPin_node_1  3

 #define rxPin_node_2  1
 #define txPin_node_2  5

 #define rxPin_node_3  6
 #define txPin_node_3  7

/*
int rxPin_node  = 3;
int txPin_node  = 5;
*/

int plus_node1=0;    // pin 1 of connector
int minus_node1=14;  // pin 2 of connector
int switch_node1=8;  // pin 4 of connector

int plusStatus_node1;
int minusStatus_node1;
int switchStatus_node1;

int plus_node2=1;    // pin 1 of connector
int minus_node2=15;  // pin 2 of connector
int switch_node2=10;  // pin 4 of connector

int plus_node3=6;    // pin 1 of connector
int minus_node3=16;  // pin 2 of connector
int switch_node3=12;  // pin 4 of connector

int plusStatus_node2;
int minusStatus_node2;
int switchStatus_node2;

int plusStatus_node3;
int minusStatus_node3;
int switchStatus_node3;
 


long debounceDelay = 300;  // milliseconds to wait until stable

static int switch1_value = 0;
static int switch2_value = 0;
static int switch3_value = 0;

 SoftwareSerial mySerial (rxPin,txPin);   // Serial from master
 SoftwareSerial serial_node_1 (rxPin_node_1,txPin_node_1);   // Serial for node_1
 SoftwareSerial serial_node_2 (rxPin_node_2,txPin_node_2);   // Serial for node_2
 SoftwareSerial serial_node_3 (rxPin_node_3,txPin_node_3);   // Serial for node_3

void setup() {

    
    Serial.begin(9600);

    pinMode(rxPin, INPUT);
    pinMode(txPin, OUTPUT);  
    
    pinMode(rxPin_node_1, INPUT);
    pinMode(txPin_node_1, OUTPUT);      
     
    mySerial.begin(9600);    

    serial_node_1.begin(9600);
    serial_node_2.begin(9600);
    serial_node_3.begin(9600);
    
       
    pinMode(rxPin_node_2, INPUT);
    pinMode(txPin_node_2, OUTPUT);  
    pinMode(rxPin_node_3, INPUT);
    pinMode(txPin_node_3, OUTPUT);  
    
// set handlers for buttons    

    pinMode(plus_node1, INPUT);
    pinMode(minus_node1, INPUT);
    pinMode(switch_node1, INPUT);
    pinMode(plus_node2, INPUT);
    pinMode(minus_node2, INPUT);
    pinMode(switch_node2, INPUT);
    pinMode(plus_node3, INPUT);
    pinMode(minus_node3, INPUT);
    pinMode(switch_node3, INPUT);

    digitalWrite(plus_node1, HIGH);
    digitalWrite(minus_node1, HIGH);    
    digitalWrite(switch_node1, HIGH);
    digitalWrite(plus_node2, HIGH);
    digitalWrite(minus_node2, HIGH);    
    digitalWrite(switch_node2, HIGH);
    digitalWrite(plus_node3, HIGH);
    digitalWrite(minus_node3, HIGH);    
    digitalWrite(switch_node3, HIGH);        
}

void loop() {
  
  mySerial.listen();
  delay(5); 
  setSwitches_button();  
  mySerial.listen();
  delay(5);  
  setSwitches();
    
/*     
      serial_node_1.listen();
      delay(4);
      serial_node_1.println("H");
      delay(500);
*/
}

void setSwitches_button() {

// check the status of all buttons of nodes

   plusStatus_node1 =   digitalRead(plus_node1);
   minusStatus_node1 =  digitalRead(minus_node1);
   switchStatus_node1 = digitalRead(switch_node1);
   plusStatus_node2 =   digitalRead(plus_node2);
   minusStatus_node2 =  digitalRead(minus_node2);
   switchStatus_node2 = digitalRead(switch_node2);
   plusStatus_node3 =   digitalRead(plus_node3);
   minusStatus_node3 =  digitalRead(minus_node3);
   switchStatus_node3 = digitalRead(switch_node3);


// Node_1

   if(plusStatus_node1==LOW) {
           if(switch1_value<9) {
            switch1_value += 1;
           }
           serial_node_1.listen();
           delay(2);                    
           serial_node_1.flush();
           delay(3);
           serial_node_1.println(switch1_value);
           mySerial.listen();
           delay(2);
           mySerial.flush();
           delay(3);
           mySerial.print("7#");
           mySerial.println(switch1_value);           
           delay(debounceDelay);  
   }
   
   if(minusStatus_node1==LOW) {
           serial_node_1.listen();
           delay(5);
           if(switch1_value > 0) {
              switch1_value -= 1;
              serial_node_1.println(switch1_value);
           }           
           mySerial.listen();
           delay(5);
           mySerial.print("7#");
           mySerial.println(switch1_value);           
           delay(debounceDelay);  
   }
   if(switchStatus_node1==LOW) {
           serial_node_1.listen();
           delay(5);
           serial_node_1.println('x');
           mySerial.listen();
           delay(5);
           mySerial.print("7#");
           mySerial.println('*');           
           delay(debounceDelay);  
   }


// Node_2

   if(plusStatus_node2==LOW) {
//           char checkMsg[15] = "button Pressed";
           if(switch2_value<9) {
            switch2_value += 1;
           }
           serial_node_2.listen();
           delay(4);                    
           serial_node_2.println(switch2_value);
//          serial_node_1.println('x');
           mySerial.listen();
           delay(4);
           mySerial.print("8#");
           mySerial.println(switch2_value);           
           delay(debounceDelay);  
   }
   
   if(minusStatus_node2==LOW) {
           serial_node_2.listen();
           delay(4);
           if(switch2_value > 0) {
              switch2_value -= 1;
              serial_node_2.println(switch2_value);
           }           
           mySerial.listen();
           delay(4);
           mySerial.print("8#");
           mySerial.println(switch2_value);           
           delay(debounceDelay);  
   }
   if(switchStatus_node2==LOW) {
           serial_node_2.listen();
           delay(4);
           serial_node_2.println('x');
           mySerial.listen();
           delay(4);
           mySerial.print("8#");
           mySerial.println('*');           
           delay(debounceDelay);  
   }

// Node_3

   if(plusStatus_node3==LOW) {
//           char checkMsg[15] = "button Pressed";
           if(switch3_value<9) {
            switch3_value += 1;
           }
           serial_node_3.listen();
           delay(4);                    
           serial_node_3.println(switch3_value);
//          serial_node_1.println('x');
           mySerial.listen();
           delay(4);
           mySerial.print("9#");
           mySerial.println(switch3_value);           
           delay(debounceDelay);  
   }
   
   if(minusStatus_node3==LOW) {
           serial_node_3.listen();
           delay(4);
           if(switch3_value > 0) {
              switch3_value -= 1;
              serial_node_3.println(switch3_value);
           }           
           mySerial.listen();
           delay(4);
           mySerial.print("9#");
           mySerial.println(switch3_value);           
           delay(debounceDelay);  
   }
   if(switchStatus_node3==LOW) {
           serial_node_3.listen();
           delay(4);
           serial_node_3.println('x');
           mySerial.listen();
           delay(4);
           mySerial.print("9#");
           mySerial.println('*');           
           delay(debounceDelay);  
   }
 
}

void setSwitches() {
    if(mySerial.available()) {
      delay(5);
        String msg = mySerial.readString();

      switch(msg[0]) {
        case '7':           
           serial_node_1.listen();
           delay(5);
           serial_node_1.println(msg[2]);
           switch1_value = msg[2]-'0';
           mySerial.listen();
           delay(5);
           mySerial.println(msg);
            break;
           
        case '8':
           serial_node_2.listen();
           delay(5);
           serial_node_2.println(msg[2]);
           switch2_value = msg[2]-'0';
           break;                    
        case '9':
           serial_node_3.listen();
           delay(5);
           serial_node_3.println(msg[2]);
           switch3_value = msg[2]-'0'; 
           break;             
        default :
           serial_node_1.listen();
           delay(5);
           serial_node_1.println(msg[2]);
      }
     }       
 }


