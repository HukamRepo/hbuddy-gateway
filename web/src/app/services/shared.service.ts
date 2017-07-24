import { Injectable } from '@angular/core';

@Injectable()
export class SharedService {

  private sessionData: any;
  private currentUser: any;

  public CONFIG = {
                    API_BASE_URL: "//hukamtechnologies.com/api",
                    GATEWAY_TYPE: "AQ-Gateway",
                    MQTT_OPTIONS: {
                                    api_key: "a-kwhgvg-w667tv552u",
                                    auth_token: "i?ZazBDehiQwoSnKo!",
                                    orgId: "kwhgvg",
                                    clientId: "a:kwhgvg:",
                                    hostname: "kwhgvg.messaging.internetofthings.ibmcloud.com",
                                    port: 8883,
                                    protocol: "https",
                                    connectOnCreate: false,
                                    path: '/mqtt',
                                    keepAliveInterval: 3600,
                                    useSSL: true
                                  }
                  };

    constructor() {
        this.sessionData = {};
     }

     public setCurrentUser(user){
       console.log("IN setCurrentUser: >> ", user);
       this.currentUser = user;       
     }

     public getCurrentUser(){
       return this.currentUser;
     }

}
