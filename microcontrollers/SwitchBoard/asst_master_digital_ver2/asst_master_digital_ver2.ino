/*
pin is changed mannually without interrupt 

The node react as per the command sent to it
1. Switch A = High
2. Switch A = Low
3. Switch B = High
4. Switch B = LOW
*/

#include <SoftwareSerial.h>

#define rxPin 10
#define txPin  11

SoftwareSerial mySerial (rxPin,txPin);

const String a_ON  = "A";
const String a_OFF = "B";
const String b_ON  = "C";
const String b_OFF = "D";
const String c_ON  = "E";
const String c_OFF = "F";
const String d_ON  = "G";
const String d_OFF = "H";
const String e_ON  = "I";
const String e_OFF = "J";
const String f_ON  = "K";
const String f_OFF = "L";

int sw_a = 9;
int sw_b = 8;
int sw_c = 6;
int sw_d = 7;
int sw_e = 5;
int sw_f = 4;

int handler_a = 12;
int handler_b = 13;
int handler_c = 2;
int handler_d = 3;
int handler_e = 1;
int handler_f = 0;

int stateHandler_a;
int stateHandler_b;
int stateHandler_c;
int stateHandler_d;
int stateHandler_e;
int stateHandler_f;

int previous_a = LOW;
int previous_b = LOW;
int previous_c = LOW;
int previous_d = LOW;
int previous_e = LOW;
int previous_f = LOW;

long debounceDelay = 300;  // milliseconds to wait until stable 

int state_a = LOW;
int state_b = LOW;
int state_c = LOW;
int state_d = LOW;
int state_e = LOW;
int state_f = LOW;

long time =0;

int state;

void setup() {
    Serial.begin(9600);     
    pinMode(rxPin, INPUT);
    pinMode(txPin, OUTPUT);  
    
    mySerial.begin(9600);
    // switch pins
    pinMode(sw_a,OUTPUT);
    pinMode(sw_b,OUTPUT);
    pinMode(sw_c,OUTPUT);
    pinMode(sw_d,OUTPUT);
    pinMode(sw_e,OUTPUT);
    pinMode(sw_f,OUTPUT);
           
    // handlers for switch a and b
    pinMode(handler_a,INPUT);
    pinMode(handler_b,INPUT);
    pinMode(handler_c,INPUT);
    pinMode(handler_d,INPUT);
    pinMode(handler_e,INPUT);
    pinMode(handler_f,INPUT);    

    digitalWrite(handler_a,HIGH);
    digitalWrite(handler_b,HIGH);
    digitalWrite(handler_c,HIGH);
    digitalWrite(handler_d,HIGH);
    digitalWrite(handler_e,HIGH);
    digitalWrite(handler_f,HIGH);    

    digitalWrite(sw_e,HIGH);
    digitalWrite(sw_f,HIGH);    
    
 }

void loop() {
  
  mySerial.listen();
  setSwiches();
  delay(100);  
//  mySerial.listen();
  setSwiches_button();
  delay(100);

}  

void setSwiches_button() {
  stateHandler_a = digitalRead(handler_a);
  stateHandler_b = digitalRead(handler_b);
  stateHandler_c = digitalRead(handler_c);
  stateHandler_d = digitalRead(handler_d);
  stateHandler_e = digitalRead(handler_e);
  stateHandler_f = digitalRead(handler_f); 

  if(stateHandler_a == LOW) {
     state = digitalRead(sw_a);
     digitalWrite(sw_a,!state); 
     if(state == 0) {
      mySerial.println(a_ON);
     }
     if(state == 1) {
      mySerial.println(a_OFF);
     }
     delay(debounceDelay);
  }
  
  if(stateHandler_b == LOW) {
    state = digitalRead(sw_b);
    digitalWrite(sw_b,!state);    
     if(state == 0) {
      mySerial.println(b_ON);
     }
     if(state == 1) {
      mySerial.println(b_OFF);
     }
    delay(debounceDelay);    
  }

  if(stateHandler_c == LOW) {
     state = digitalRead(sw_c);
     digitalWrite(sw_c,!state);     
     if(state == 0) {
      mySerial.println(c_ON);
     }
     if(state == 1) {
      mySerial.println(c_OFF);
     }
     delay(debounceDelay);
  }
  
  if(stateHandler_d == LOW) {
     state = digitalRead(sw_d);
     digitalWrite(sw_d,!state);
     if(state == 0) {
      mySerial.println(d_ON);
     }
     if(state == 1) {
      mySerial.println(d_OFF);
     }
     delay(debounceDelay);
  }
  
  if(stateHandler_e == LOW) {
     state = digitalRead(sw_e);
     digitalWrite(sw_e,!state);
     if(state == 0) {
      mySerial.println(e_ON);
     }
     if(state == 1) {
      mySerial.println(e_OFF);
     }
     delay(debounceDelay);
  }
  
  if(stateHandler_f == LOW) {
     state = digitalRead(sw_f);
     digitalWrite(sw_f,!state);     
     if(state == 0) {
      mySerial.println(f_ON);
     }
     if(state == 1) {
      mySerial.println(f_OFF);
     }
     delay(debounceDelay);
  }

}

void setSwiches() {
 char cb[1];  // to store the command
 if(mySerial.available()) {
   delay(1);
   String msg;
   mySerial.readBytes(cb,1);
   delay(30);
   switch(cb[0]) {
     case 'a':
            state_a = HIGH;     
            digitalWrite(sw_a,state_a);
            mySerial.println(a_ON);            
            break;
     case 'b':
            state_a = LOW;     
            digitalWrite(sw_a,state_a);
            mySerial.println(a_OFF);                        
            break;
     case 'c':
            state_b = HIGH;
            digitalWrite(sw_b,state_b);
            mySerial.println(b_ON);                        
            break;
     case 'd':
            state_b = LOW;
            digitalWrite(sw_b,state_b);
            mySerial.println(b_OFF);                        
            break;     
     case 'e':
            state_d = HIGH;
            digitalWrite(sw_d,state_d);
            mySerial.println(d_ON);                        
            break;     
     case 'f':
            state_d = LOW;
            digitalWrite(sw_d,state_d);
            mySerial.println(d_OFF);                        
            break;     
     case 'g':
            state_c = HIGH;
            digitalWrite(sw_c,state_c);
            mySerial.println(c_ON);                       
            break;     
     case 'h':
            state_c = LOW;
            digitalWrite(sw_c,state_c);
            mySerial.println(c_OFF);            
            break;     
     case 'i':
            state_e = HIGH;
            digitalWrite(sw_e,state_e);
            mySerial.println(e_ON);            
            break;     
     case 'j':
            state_e = LOW;
            digitalWrite(sw_e,state_e);
            mySerial.println(e_OFF);                       
            break;     
     case 'k':
            state_f = HIGH;
            digitalWrite(sw_f,state_f);
            mySerial.println(f_ON);
            break;     
     case 'l':
            state_f = LOW;
            digitalWrite(sw_f,state_f);
            mySerial.println(f_OFF);            
            break;     
    }

  }  
}


