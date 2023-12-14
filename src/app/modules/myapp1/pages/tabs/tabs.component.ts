import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent  implements OnInit {
  tabs=[{name:'home',icon:'home',link:'home'},{name:'customers',icon:'people-outline',link:'customers'},{name:'settings',icon:'settings-outline',link:'settings'}];
  constructor(public apiService:ApiService) { }

  ngOnInit() {
    this.apiService.show_split_pane=true;
  }

}
