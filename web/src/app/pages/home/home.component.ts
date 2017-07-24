import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser: any;

  constructor(public sharedService: SharedService) {

  }

  ngOnInit() {
    this.currentUser = this.sharedService.getCurrentUser();
  }

}
