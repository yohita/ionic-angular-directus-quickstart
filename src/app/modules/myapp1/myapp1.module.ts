import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TabsComponent } from './pages/tabs/tabs.component'; 
import { CustomersComponent } from './pages/customers/customers.component';
import { SettingsComponent } from './pages/settings/settings.component'; 

const routes: Routes = [
  {
    path: '', 
    component:TabsComponent,
    children:[

      {path:'',component:HomeComponent},
      {path:'home',component:HomeComponent}, 
      {path:'customers',component:CustomersComponent},
      {path:'settings',component:SettingsComponent},  
      
       
    ]
  }
];

@NgModule({
  declarations: [HomeComponent,TabsComponent,CustomersComponent,SettingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class Myapp1Module { }
