char mydata='0';
const int opto_in=9;
const int opto_out=10;
String mystring;

void setup()
{
  pinMode(2, INPUT);
  attachInterrupt(digitalPinToInterrupt(2), serialInterrupt, CHANGE);
  Serial.begin(9600);
  
  pinMode(opto_in, INPUT);
  digitalWrite(opto_in,HIGH);

  pinMode(opto_out, OUTPUT);
  digitalWrite(opto_out,LOW);

}


void loop()
{
    do{
       if(digitalRead(opto_in)==LOW)
      {
        delayMicroseconds(1000);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
        delayMicroseconds(1000);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
        
    }while(mydata=='9');
    

    do{
       if(digitalRead(opto_in)==LOW)
      {
        delayMicroseconds(1500);
         digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
        delayMicroseconds(1500);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='8');


    do{
       if(digitalRead(opto_in)==LOW)
      {
        delayMicroseconds(2000);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
      delayMicroseconds(2000);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='7');



        do{
       if(digitalRead(opto_in)==LOW)
      {
        delayMicroseconds(2500);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }

      delayMicroseconds(2500);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='6');


        do{
       if(digitalRead(opto_in)==LOW)
      {
        delayMicroseconds(3000);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
      delayMicroseconds(3000);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='5');


        do{
       if(digitalRead(opto_in)==LOW)
      {
        delayMicroseconds(3500);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
      delayMicroseconds(3500);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='4');
 

        do{
       if(digitalRead(opto_in)==LOW)
      {
         delayMicroseconds(4000);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
      delayMicroseconds(4000);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
        
    }while(mydata=='3');


      do{
           if(digitalRead(opto_in)==LOW)
      {
       delayMicroseconds(4500);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
      delayMicroseconds(4500);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='2');



    do{
           if(digitalRead(opto_in)==LOW)
      {
       delayMicroseconds(5000);
        digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==LOW)
        digitalWrite(opto_out,LOW);
      }
      delayMicroseconds(5000);
      digitalWrite(opto_out,HIGH);  
        delay(1);
        while(digitalRead(opto_in)==HIGH)
        digitalWrite(opto_out,LOW);
    }while(mydata=='1');

    do{     
     digitalWrite(opto_out,LOW); 
    }while(mydata=='0');
      
}



volatile boolean busy_state = false;

void serialInterrupt()
{
  if (busy_state) return;
   busy_state = true;
   interrupts();

    

    mystring= Serial.readStringUntil('\n');
//    Serial.println("mydata");
//    Serial.println(mystring[0]);
    delay(10);
    mydata=mystring[0];
    
    

    busy_state = false;
}


