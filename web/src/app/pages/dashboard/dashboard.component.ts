import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services/google-maps-api-wrapper';
import { MarkerManager } from '@agm/core/services/managers/marker-manager';

import { MqttService } from '../../services/mqtt.service';
import { SharedService } from '../../services/shared.service';
import {Paho} from 'ng2-mqtt/mqttws31';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {

  cityMarker: any;
  sensorsData: any = [];
  cityMap: any;
  private connectionOptions: any = {};

  constructor(public markerManager: MarkerManager, private mapsAPIWrapper: GoogleMapsAPIWrapper,
              public mqttService: MqttService, public sharedService: SharedService) {
          let mqttTopic: string = "iot-2/type/" +this.sharedService.CONFIG.GATEWAY_TYPE +"/id/000000008c0be72b/evt/airquality/fmt/json";
          this.connectionOptions.subscribeToTopic = mqttTopic;
          this.mqttService.connectMQTT(this.connectionOptions);
  }

  ngOnInit() {
    this.sensorsData = [];
    this.cityMarker = {zoom: 13, title: "San Diego Air Quality Monitoring", lat: 32.7157, lng: -117.1611};
    this.mqttService.mqttMsgEvent.subscribe((message: Paho.MQTT.Message) => {
        console.log('\n\nMQTT Message Payload: >> ', message.payloadString);
        let msg: any = JSON.parse(message.payloadString);
        this.showMarkerOnMap(msg);
    });
  }

  showMarkerOnMap = function(markerData){
      var marker = {"title":markerData.d.uniqueId, "label":markerData.d.uniqueId, "lat":markerData.d.lat, "lng":markerData.d.lng, "iconUrl":"/assets/images/green-small.png"};
      if((markerData.d.NO2 && markerData.d.NO2 > 220) || (markerData.d.CO && markerData.d.CO > 320)){
        marker.iconUrl = "/assets/images/blue-small.png"
      }
      if((markerData.d.NO2 && markerData.d.NO2 > 230) || (markerData.d.CO && markerData.d.CO > 330)){
        marker.iconUrl = "/assets/images/orange-small.png"
      }
      if((markerData.d.NO2 && markerData.d.NO2 > 240) || (markerData.d.CO && markerData.d.CO > 340)){
        marker.iconUrl = "/assets/images/red-small.png"
      }

      for(let m of this.sensorsData){
          if(m.title == marker.title){
            this.sensorsData.splice(m);
          }
      }
      this.sensorsData.push(marker);
  }

  onMapReadyCall = function(map){
    this.cityMap = map;
    console.log(this.cityMap);
    this.sensorsData.push(this.cityMarker);
    // this.sensorsData.push({"title":"AQSensor","label":"AQSensor1","lat":32.73807709793893,"lng":-117.12421417236328,"iconUrl":"/assets/images/green-small.png"});
    // this.sensorsData.push({"title":"AQSensor","label":"AQSensor1","lat":32.71757089988447,"lng":-117.13005065917969,"iconUrl":"/assets/images/green-small.png"});
    // this.sensorsData.push({"title":"AQSensor","label":"AQSensor1","lat":32.73302319137002,"lng":-117.08473205566406,"iconUrl":"/assets/images/red-small.png"});
  }

  handleMapClick = function(event){
      console.log(event);
      let marker: any = {title: "AQSensor", label:"AQSensor1", lat: event.coords.lat, lng: event.coords.lng};
      var isEven:number = (event.coords.lat * 2) % 2;
      // this.sensorsData.push(marker);
      // this.markerManager.addMarker(marker);
      // marker.map = this.cityMap;
      // this.mapsAPIWrapper.createMarker(marker);

      console.log("Marker should be created: ", isEven, " : ",  JSON.stringify(marker));
      // console.log("Add Marker to Map: ", this.cityMap);
  }


}
