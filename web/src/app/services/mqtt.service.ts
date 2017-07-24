import { Injectable, Output, EventEmitter } from '@angular/core';
import {Paho} from 'ng2-mqtt/mqttws31';
import { SharedService } from './shared.service'

@Injectable()
export class MqttService {

  private client: Paho.MQTT.Client;
  private isConnected: boolean = false;
  private connectOptions: any;

   @Output() mqttMsgEvent: EventEmitter<any> = new EventEmitter(true);

  constructor(public sharedService: SharedService) {
    console.log('IN MqttProvider Constructor >>>>>>>> ');
    this.createMqttClient();
  }

  private createMqttClient(){
    let clientId: string = this.sharedService.CONFIG.MQTT_OPTIONS.clientId+(new Date().getTime());
    this.client = new Paho.MQTT.Client(this.sharedService.CONFIG.MQTT_OPTIONS.hostname, this.sharedService.CONFIG.MQTT_OPTIONS.port, clientId);
    this.client.onConnectionLost = (responseObject: Object) => {
      console.log('MQTT Connection lost >>> ');
      this.isConnected = false;
      // this.connectMQTT(this.connectOptions);
    };
    this.client.onMessageArrived = (message: Paho.MQTT.Message) => {
       console.log('MQTT Message arrived: >>> ', message.payloadString);
       this.mqttMsgEvent.emit(message);
    };
  }

  public connectMQTT(connectOptions){
      try{
          this.connectOptions = connectOptions;
          this.client.connect({
                                keepAliveInterval: this.sharedService.CONFIG.MQTT_OPTIONS.keepAliveInterval,
                                useSSL: this.sharedService.CONFIG.MQTT_OPTIONS.useSSL,
                                userName: this.sharedService.CONFIG.MQTT_OPTIONS.api_key,
                                password: this.sharedService.CONFIG.MQTT_OPTIONS.auth_token,
                                onSuccess: this.onConnected.bind(this),
                                onFailure: this.onFailure.bind(this)
                              });
        }catch(err){
            console.log("Error while connectin to MQTT:  ", err);
            if(this.connectOptions.subscribeToTopic){
                this.client.subscribe(this.connectOptions.subscribeToTopic, {});
            }
        }
  }

  private onConnected() {
    console.log("MQTT Connected: >>>> ");
    this.isConnected = true;
    if(this.connectOptions.subscribeToTopic){
      this.client.subscribe(this.connectOptions.subscribeToTopic, {});
      console.log("MQTT Subscribed to Topic: ", this.connectOptions.subscribeToTopic);
    }
  }

  private onFailure(e) {
    console.log("MQTT Connection Failed: >>> ", e);
    this.isConnected = false;
  }

  public subscribeTopic(topic, options){
    console.log("IN subscribeTopic: >> ", topic);
    if(this.client && this.isConnected){
        this.client.subscribe(topic, options);
    }else{
      return new Error("MQTT Client not available !! ");
    }
  }

  public publishTopic(topic, message){
    console.log("IN publichTopic: >> Topic: ", topic, ", Message: ", message);
    if(this.client && this.isConnected){
      let packet = new Paho.MQTT.Message(JSON.stringify(message));
      packet.destinationName = topic;
      this.client.send(packet);
    }else{
      return new Error("MQTT Client not available !! ");
    }
  }


}
