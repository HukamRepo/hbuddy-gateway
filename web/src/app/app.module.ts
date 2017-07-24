import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Angular2SocialLoginModule } from "angular2-social-login";

import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgmCoreModule } from '@agm/core';
import { GoogleMapsAPIWrapper } from '@agm/core/services/google-maps-api-wrapper';
import { MarkerManager } from '@agm/core/services/managers/marker-manager';
import { MqttService } from './services/mqtt.service';
import { SharedService } from './services/shared.service';
import { HBuddyComponent } from './pages/h-buddy/h-buddy.component';

let providers = {
    "google": {
      "clientId": "874807563899-9kk6gpacomg9t56pqfc4o8n4gn365ppg.apps.googleusercontent.com"
    },
    "linkedin": {
      "clientId": "81ann4egou3i6j"
    },
    "facebook": {
      "clientId": "330079704089458",
      "apiVersion": "v2.9" //like v2.4
    }
  };

const appRoutes: Routes = [
  { path: 'public/dashboard', component: DashboardComponent },
  { path: '',      component: HomeComponent },
  { path: 'iot/hbuddy', component: HBuddyComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    HBuddyComponent
  ],
  imports: [
    RouterModule.forRoot(appRoutes),
    BrowserModule,
    Angular2SocialLoginModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD3oMSe59cIpUnouvFcWT3oP3iPwsRp5zk'
    })
  ],
  providers: [GoogleMapsAPIWrapper, MarkerManager, MqttService, SharedService],
  bootstrap: [AppComponent]
})
export class AppModule { }

Angular2SocialLoginModule.loadProvidersScripts(providers);
