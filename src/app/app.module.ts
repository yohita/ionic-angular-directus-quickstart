import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';


import { IonicStorageModule } from '@ionic/storage-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { TokenInterceptor } from './services/token.interceptor';
import { ErrorInterceptor } from './services/error.interceptor';
import { AuthGuard } from './services/auth-guard.service';
import { TimeagoModule } from 'ngx-timeago';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule,IonicStorageModule.forRoot(),TimeagoModule.forRoot(), IonicModule.forRoot({  mode: 'ios',
  innerHTMLTemplatesEnabled: true}), AppRoutingModule,HttpClientModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },],
  bootstrap: [AppComponent],
})
export class AppModule {}
