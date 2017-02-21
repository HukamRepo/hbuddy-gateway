/*
pin is changed mannually without interrupt 

*/

#include <SoftwareSerial.h>

#define rxPin 2
#define txPin 4

char cb[3];  // to store the command

// pins for serial communication to devices

#define rxPin_node  3
#define txPin_node  5
/*
int rxPin_node  = 3;
int txPin_node  = 5;
*/

SoftwareSerial mySerial (rxPin,txPin);   // Serial from master
SoftwareSerial serial_node (rxPin_node,txPin_node);   // Serial from master

void setup() {
  
    Serial.begin(9600);
    mySerial.begin(9600);    
    serial_node.begin(9600);

    pinMode(rxPin, INPUT);
    pinMode(txPin, OUTPUT);  
       
    pinMode(rxPin_node, INPUT);
    pinMode(txPin_node, OUTPUT);  
 }

void loop() {
  mySerial.listen();    
  if(mySerial.available()) {

//          String cmd = mySerial.readString();
          mySerial.readBytes(cb,3);
          serial_node.listen();
//          serial_node.println("Analog_node");
//          for(int i=0;i<4;i++) {
               serial_node.print(cb);                
//          }

/*
          digitalWrite(rxPin_node,HIGH);
          digitalWrite(txPin_node,LOW);
          delay(500);
          digitalWrite(rxPin_node,LOW);
          digitalWrite(txPin_node,HIGH);
          delay(500);            
          digitalWrite(txPin_node,LOW);           
*/
  }  

}


