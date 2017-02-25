/*
 HC-SR04 Ping distance sensor:
 VCC to arduino 5v 
 GND to arduino GND
 Echo to Arduino pin 7 
 Trig to Arduino pin 8
 */

#include <EEPROM.h>
#define echoPin 7 // Echo Pin
#define trigPin 8 // Trigger Pin
#define LEDPin 13 // Onboard LED

int maximumRange = 300; // Maximum range needed
int minimumRange = 0; // Minimum range needed
long duration, distance; // Duration used to calculate distance

static int delayInSec = 1;

static int boardIdBaseAddress = 0;
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

void setup()
{
  Serial.begin (9600);
  setupEeprom();
  uniqueId = "SNB-" +(String(b5) + String(b6) + String(b7) + String(b8));
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(LEDPin, OUTPUT); // Use LED indicator (if required)
}

void loop() {

//delay(2000);

//Sleepy::loseSomeTime(delayInSec * 1000);

/* The following trigPin/echoPin cycle is used to determine the
 distance of the nearest object by bouncing soundwaves off of it. */  
 digitalWrite(trigPin, LOW); 
 delayMicroseconds(2); 

 digitalWrite(trigPin, HIGH);
 delayMicroseconds(10); 
 
 digitalWrite(trigPin, LOW);
 duration = pulseIn(echoPin, HIGH);
 
 //Calculate the distance (in cm) based on the speed of sound.
 distance = duration/58.2;
 if (distance <= maximumRange && distance >= minimumRange){
     String val = "{\"type\":\"sensor_board\", \"uniqueId\":\""+uniqueId+"\", \"data\": {\"distance\":" +String(distance)+"}}";
     Serial.println( val );
     digitalWrite(LEDPin, HIGH);
     delay(500);
     digitalWrite(LEDPin, LOW);
     delay(500);
 }else{
//    Serial.println( distance );
     String val = "{\"type\":\"sensor_board\", \"uniqueId\":\""+uniqueId+"\", \"data\": {\"distance\":" +String(distance)+"}}";
     Serial.println( val );
    digitalWrite(LEDPin, LOW);
 }

delay(delayInSec * 1000);
//delay(500);
//Sleepy::loseSomeTime(delayInSec * 1000);

}
