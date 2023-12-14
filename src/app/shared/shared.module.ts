import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { TimeagoModule } from 'ngx-timeago';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports:[FormsModule,ReactiveFormsModule,IonicModule,NgSelectModule,TimeagoModule]
})
export class SharedModule { }
