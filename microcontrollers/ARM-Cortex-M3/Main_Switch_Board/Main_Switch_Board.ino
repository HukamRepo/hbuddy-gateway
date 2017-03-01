/**
 * Hukam hBuddy Main Switch Board
 *
 * Date: Wednesday, March 1st 2017
 */

#include "mbed.h"


Ticker flipper;
Serial xbeeSerial(p9, p10); //Creates a variable for serial comunication through pin 9 and 10

DigitalOut rst1(p11); //Digital reset for the XBee, 200ns for reset

DigitalOut led3(LED3);//Create variable for Led 3 on the mbed
DigitalOut heartbeat(LED4);//Create variable for Led 4 on the mbed

Serial pc(USBTX, USBRX);//Opens up serial communication through the USB port via the computer

extern "C" mbed_mac_address(char *);
#define char mac[6];

void readNSaveUniqueId(){
    mbed_mac_address(mac);
}

void readTempHumidityData(){
    // read and save temperature and humidity data in a global variable
}

void readEnergyConsumption(){
    // read and save Energy Consumption data in a global variable
}

void readNSaveSensorsData(){
    flipper.attach(&readTempHumidityData, 5.0);
    readEnergyConsumption();
}

int main() {
    rst1 = 0; //Set reset pin to 0
    myled = 0;//Set LED3 to 0
    myled2= 0;//Set LED4 to 0
    wait_ms(1);//Wait at least one millisecond
    rst1 = 1;//Set reset pin to 1
    wait_ms(1);//Wait another millisecond

    readNSaveUniqueId();
    readNSaveSensorsData();
    readNSaveSwitchesState();


    while (1) {//Neverending Loop
      heartbeat= !heartbeat;
      wait(0.25);
        if (pc.readable()) {//Checking for serial comminication
            led3 = 0; //Turn Led 3 Off
            xbeeSerial.putc(pc.getc()); //XBee write whatever the PC is sending
            led3 = 1; //Turn Led 3 on for succcessfull communication
        }
    }
}
