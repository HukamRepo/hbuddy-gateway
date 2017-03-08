#include "mbed.h"
#include "TTP229.h"
#include "MbedJSONValue.h"
#include <string>

using namespace std;

#define IAP_LOCATION 0x1FFF1FF1

typedef void (*IAP)(unsigned long [], unsigned long[] );
IAP iap_entry = (IAP) IAP_LOCATION;

MbedJSONValue command;
Ticker tempTicker;
Ticker energyTicker;

    TTP229 touchpad(p9, p10); // For Connecting Capacitive Touchpad using I2C

    Serial xbeeSerial(p13, p14);
    DigitalOut rst1(p11);

    Serial pc(USBTX, USBRX);//Opens up serial communication through the USB port via the computer
    DigitalOut heartbeatLED(p20); // LED1

    DigitalOut DSw1_p5(p5);
    DigitalOut DSw2_p6(p6);
    DigitalOut DSw3_p7(p7);
    DigitalOut DSw4_p8(p8);
    DigitalOut DSw5_p12(p12);
    DigitalOut DSw6_p15(p15);
    DigitalOut DSw7_p16(p16);
    DigitalOut ASw1P_p17(p17);
    DigitalOut ASw1_p18(p18);
    DigitalOut ASw1M_p19(p19);
    DigitalOut ASw2P_p21(p21); // LED2
    DigitalOut ASw2_p22(p22); // LED3
    DigitalOut ASw2M_p23(p23); // LED3
    DigitalOut ASw3P_p24(p24);
    DigitalOut ASw3_p25(p25);
    DigitalOut ASw3M_p26(p26);

    DigitalOut p27Led(p27);
    DigitalOut p28Led(p28);
    DigitalOut p29Led(p29);

void broadcastChange(std::string command){
    command = command + "\n";
    printf("Broadcast = %s\r\n" ,  command.c_str());
    xbeeSerial.puts(command.c_str());
    ASw2P_p21 = 1;
    wait_ms(1);
    ASw2P_p21 = 0;
}

void refreshMyStatus(){
  //  printf("Ask Gateway to refresh board status for all switches\n\n");
}

void readTempHumidityData(){
    command["temp"] = 25.1;
    command["hum"] = 45.7;
}

void readEnergyConsumption(){
    command["energy"] = 2.3;
}

void readNSaveSensorsData(){
    tempTicker.attach(&readTempHumidityData, 5.0);
    energyTicker.attach(&readEnergyConsumption, 2.0);
}

void switchTouched(){
//    printf("%16s\r\n",to_string(touchpad).c_str());
    int8_t key = touchpad.onkey();
    // printf("%d\r\n", key);
    //int sw=touchpad.getsingle();
    //if(sw!=0) myleds=sw%16;
    command["type"] = "sb";
    command["index"] = key;
    switch(key){
        case 1:
            DSw1_p5 = !DSw1_p5;
            command["dv"] = DSw1_p5;
            break;
        case 2:
            DSw2_p6 = !DSw2_p6;
            command["dv"] = DSw2_p6;
            break;
        case 3:
            DSw3_p7 = !DSw3_p7;
            command["dv"] = DSw3_p7;
            break;
        case 4:
            DSw4_p8 = !DSw4_p8;
            command["dv"] = DSw4_p8;
            break;
        case 5:
            DSw5_p12 = !DSw5_p12;
            command["dv"] = DSw5_p12;
            break;
        case 6:
            DSw6_p15 = !DSw6_p15;
            command["dv"] = DSw6_p15;
            break;
        case 7:
            DSw7_p16 = !DSw7_p16;
            command["dv"] = DSw7_p16;
            break;
        case 8:
            ASw1P_p17 = !ASw1P_p17;
            command["dv"] = ASw1P_p17;
            break;
        case 9:
            ASw1_p18 = !ASw1_p18;
            command["dv"] = ASw1_p18;
            break;
        case 10:
            ASw1M_p19 = !ASw1M_p19;
            command["dv"] = ASw1M_p19;
            break;
        case 11:
            ASw2P_p21 = !ASw2P_p21;
            command["dv"] = ASw2P_p21;
            break;
        case 12:
            ASw2_p22 = !ASw2_p22;
            command["dv"] = ASw2_p22;
            break;
        case 13:
            ASw2M_p23 = !ASw2M_p23;
            command["dv"] = ASw2M_p23;
            break;
        case 14:
            ASw3P_p24 = !ASw3P_p24;
            command["dv"] = ASw3P_p24;
            break;
        case 15:
            ASw3_p25 = !ASw3_p25;
            command["dv"] = ASw3_p25;
            break;
        case 16:
            ASw3M_p26 = !ASw3M_p26;
            command["dv"] = ASw3M_p26;
            break;
    }

    if(key > 0){
        std::string str = command.serialize();
        broadcastChange(str);
    }
}

void setDeviceId(){
    unsigned long comm[5] = {0,0,0,0,0};
    unsigned long result[5] = {0,0,0,0,0};
    comm[0] = 58;  // read device serial number
    printf("\r\nSerial number:\r\n");
    iap_entry(comm, result);
    command["id"] = "";
    char tmpbuf[256];
    if (result[0] == 0) {
        printf("\nSerial Number: ");
        sprintf(tmpbuf,"%08X%08X",result[0], result[1]);
        printf(tmpbuf);
        sprintf(tmpbuf,"%08X%08X", result[2], result[3]);
        printf(tmpbuf);
        command["id"] = tmpbuf;
        /*
        std::string temp = "";
        for(int i = 1; i < 5; i++) {
           // printf( "0x%x\r\n", result[i] );
            unsigned char *s=(unsigned char *)&result[i];
            char buffer [10];
            sprintf (buffer, "%lu" , result[i] );
            temp = temp + buffer;
        }
        command["id"] = temp;
        */
    } else {
        printf("Status error!\r\n");
    }
}

// main() runs in its own thread in the OS
int main() {
    rst1 = 0; //Set reset pin to 0
    wait_ms(1);//Wait another millisecond
    rst1 = 1;//Set reset pin to 1
    setDeviceId();
    refreshMyStatus();
    readNSaveSensorsData();
    touchpad.attach(&switchTouched);

    while (true) {
        heartbeatLED = 0;
        wait_ms(1);//Wait at least one millisecond
        heartbeatLED = 1;

        if (pc.readable()) {//Checking for serial comminication
            ASw2P_p21 = 0;
            xbeeSerial.putc(pc.getc()); //XBee write whatever the PC is sending
            ASw2P_p21 = 1;
        }
        if(xbeeSerial.readable()){
            ASw2_p22 = 0;
            pc.putc(xbeeSerial.getc());
            ASw2_p22 = 1;
        }

    }
}
