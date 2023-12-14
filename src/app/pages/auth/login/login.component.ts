import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {
  model:any={};
  returnUrl: string='';
  currentYear:number=new Date().getFullYear();
  constructor(public apiService:ApiService,public router:Router) { }

  ngOnInit() {
    //get ? parameter returnUrl
    this.returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'] || '/';
    this.apiService.show_split_pane=false;
  }

  formSubmit($event){
    console.log(this.model);
    this.apiService.is_autologout=false;
    this.apiService.auth('login',this.model).subscribe((response)=>{
      console.log(response);
      this.router.navigateByUrl(this.returnUrl, { replaceUrl: true });
    },(error)=>{
      console.log(error);
    })
  }
}
