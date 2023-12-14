import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public links = [
    { title: 'Home', url: '/home', icon: 'mail' },
    { title: 'Customers', url: '/customers', icon: 'people-outline' }, 
    { title: 'Settings', url: '/settings', icon: 'settings-outline' }, 
    
  ];
  
 
  constructor(public apiService:ApiService,public alertController:AlertController) {}

  ngOnInit() {

      this.refresh_token();
  }

  refresh_token(){

    setTimeout(()=>{                           // <<<---using ()=> syntax
    this.apiService.auth('refresh').subscribe((response)=>{
      console.log(response);
    });
  },1000);
  }

  logout(){
    let alert = this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('logout Cancelled');
          }
        },
        {
          text: 'Logout',
          handler: () => {
            console.log('logout Confirmed');
            this.apiService.logout();

            setTimeout(()=>{  
              location.href="/";
            },500);
          }
        }
      ]
    }).then((alert)=>{
      alert.present();
    });
  }


}
