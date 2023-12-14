import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent  implements OnInit {

  stats:any=[{name:'Orders',icon:'cart-outline'},{name:'Revenue',icon:'cash-outline'},{name:'Customers',icon:'people-outline'}]
  constructor(public apiService:ApiService) { }

  ngOnInit() {
    this.apiService.show_split_pane=true;
  }

}
