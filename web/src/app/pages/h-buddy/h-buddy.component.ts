import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-h-buddy',
  templateUrl: './h-buddy.component.html',
  styleUrls: ['./h-buddy.component.css']
})
export class HBuddyComponent implements OnInit {

  currentUser: any;

  constructor(public sharedService: SharedService) {

  }

  ngOnInit() {
    this.currentUser = this.sharedService.getCurrentUser();
  }

}
