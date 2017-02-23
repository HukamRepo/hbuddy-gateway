/*
pin is changed mannually without interrupt 

*/

#include <SoftwareSerial.h>

#define rxPin 2
#define txPin 4

static int switch1_value;
static int switch2_value;
static int switch3_value;

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
    
//    serial_node_1.begin(9600);
    
    mySerial.begin(9600);    

    serial_node_1.begin(9600);
    serial_node_2.begin(9600);
    serial_node_3.begin(9600);
    
       
    pinMode(rxPin_node_2, INPUT);
    pinMode(txPin_node_2, OUTPUT);  
    pinMode(rxPin_node_3, INPUT);
    pinMode(txPin_node_3, OUTPUT);  
    
        
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
  
}

void setSwitches() {
    if(mySerial.available()) {
      delay(3);
//      char cb[1];      
//       cb[0] = mySerial.read();     
        String msg = mySerial.readString();

        serial_node_1.listen();
        delay(3);
//        serial_node_1.println(msg);
//      mySerial.flush();
//        serial_node_1.print(msg[0]);
//        serial_node_1.println(msg[2]);        
//        mySerial.listen();

      
      switch(msg[0]) {
        case '7':           
           serial_node_1.listen();
           delay(3);
           serial_node_1.println(msg[2]);
           switch1_value = msg[2]-'0';
            break;
           
        case '8':
           serial_node_2.listen();
           delay(3);
           serial_node_2.println(msg[2]);
           switch2_value = msg[2]-'0';
           break;
                    
        case '9':
           serial_node_3.listen();
           delay(3);
           serial_node_3.println(msg[2]);
           switch3_value = msg[2]-'0'; 
           break;  
           
        default :
           serial_node_1.listen();
           delay(3);
           serial_node_1.println(msg[2]);
      }
      
//         mySerial.print(msg);
     /*
        for (int i=0;i<4;i++) {
          mySerial.print(cb[i]);
        }
        mySerial.println();
      }
     */ 
/*     
      serial_node_1.listen();
      delay(2);
      serial_node_1.println(d);
      delay(10);  
*/     
//       mySerial.println(data);     

     }
        
 }


