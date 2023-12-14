import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup/signup.component';
import { ResetComponent } from './reset/reset.component';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [  
  {path:'',redirectTo:'login',pathMatch:'full'},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: SignupComponent },
  {path:'reset',component:ResetComponent},
];

@NgModule({
  declarations: [LoginComponent, SignupComponent, ResetComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class AuthModule { }
