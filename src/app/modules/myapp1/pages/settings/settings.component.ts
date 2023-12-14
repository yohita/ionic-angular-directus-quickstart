import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent  implements OnInit {
  segment='profile';
  constructor(public apiService:ApiService) { }

  ngOnInit() {}
  segmentChanged($event){

  }
}
