// 
// PURPOSE: DHT11 library test sketch for Arduino
//

#include <dht11.h>

dht11 DHT11;

#define DHT11PIN 5

#include <EEPROM.h>

static int delayInSec = 5;

static int boardIdBaseAddress = 0;
static int timer = 0;
static byte b5 = 0;
static byte b6 = 0;
static byte b7 = 0;
static byte b8 = 0;
static String uniqueId;

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
  Serial.begin( 9600 );
  setupEeprom();
  uniqueId = "SN-" +(String(b5) + String(b6) + String(b7) + String(b8));
}

void loop()
{
  
  int chk = DHT11.read(DHT11PIN);

  char temperature[8];
  dtostrf((float)DHT11.temperature,1,2, temperature);
  char humidity[5];
  dtostrf((float)DHT11.humidity,1,2, humidity);

  String val = "{\"type\":\"microcontroller\", \"uniqueId\":\""+uniqueId+"\", \"data\": {\"temp\":" +String(temperature)+", \"hum\":"+String(humidity)+"}}";
  Serial.println( val );
  delay(delayInSec * 1000);
  timer++;
}

