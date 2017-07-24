import { Component, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from "angular2-social-login";
import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public _auth: AuthService, public sharedService: SharedService){
      this.currentUser = this.sharedService.getCurrentUser();
   }

  sub: any;
  currentUser: any;
  @ViewChild('closeBtn') closeBtn: ElementRef;

  signIn(provider){
    console.log("Sign In to: >>> ", provider);
    this.sub = this._auth.login(provider).subscribe(
      (data) => {
                  console.log(data);
                  this.currentUser = data;
                  this.sharedService.setCurrentUser(this.currentUser);
                  this.closeBtn.nativeElement.click();
                }
    );
  }

  logout(){
    this._auth.logout().subscribe(
      (data)=>{
        this.currentUser = null;
      }
    );
  }

}
