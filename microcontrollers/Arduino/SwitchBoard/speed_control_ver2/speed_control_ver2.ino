volatile char mydata='a';
const int opto_in=9;
const int opto_out=10;
String mystring;
int relay_pin= 8;
volatile int myDelay;

void setup()
{
  
  Serial.begin(9600);
  
  pinMode(2, INPUT);
  
  attachInterrupt(digitalPinToInterrupt(2), serialInterrupt, CHANGE);
  
//  Serial.begin(9600);
  
  pinMode(relay_pin, OUTPUT);
  pinMode(opto_in, INPUT);
  pinMode(opto_out, OUTPUT);
  digitalWrite(opto_in,HIGH);
  digitalWrite(opto_out,LOW);
  digitalWrite(relay_pin,LOW);
  sei();
}


void loop()
{
  
       do {
        digitalWrite(opto_out,LOW);
      }while(mydata=='0');
      
      do {
       if(digitalRead(opto_in)==LOW)
       {
        delayMicroseconds(myDelay);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
       }
        delayMicroseconds(myDelay);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
      
    }while((digitalRead(relay_pin) == LOW) && !(mydata=='0'));
    
}



volatile boolean busy_state = false;

void setTimeDelay() {

    mystring= Serial.readStringUntil('\n');
    delay(2);
    mydata=mystring[0];

    switch(mydata) {
    
    case '0':
    digitalWrite(opto_out,LOW); 
    break;
    
    case '1':
    myDelay = 5000;
    break;
    
    case '2':
    myDelay = 4500;
    break;
    
    case '3':
    myDelay = 4000;
    break;
    
    case '4':
    myDelay = 3500;
    break;
    
    case '5':
    myDelay = 3000;
    break;
    
    case '6':
    myDelay = 2500;
    break;
    
    case '7':
    myDelay = 2000;
    break;
    
    case '8':
    myDelay = 1500;
    break;
    
    case '9':
    myDelay = 1000;
    break;
    
    }    
}

void serialInterrupt()
{
  if (busy_state) return;   
   busy_state = true;

   interrupts(); 
   setTimeDelay();       
   busy_state = false;
}


