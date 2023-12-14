import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { catchError, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { map } from 'rxjs/operators';
import { AlertController, IonicSafeString, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { Storage } from '@ionic/storage-angular'; 
//import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
//import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
//import html2canvas from 'html2canvas';

declare const idata:any;
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  environment = environment;
  is_autologout=true;
  public show_split_pane=false;
  public current_year:number=new Date().getFullYear();
  public idata:any=idata;
  public portal_url =  environment.portal_url;//idata.tenant.portal_url ??   // Replace with the common API path
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cachedData: { [key: string]: Observable<any> } = {};

  app_version:any={};
  private _storage: Storage | null = null;

  public globalEventEmitter$: any = new EventEmitter<{}>();

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private storage: Storage, private http: HttpClient,  public alertController: AlertController,
   // public iab:InAppBrowser,
   // public socialSharing:SocialSharing,
    public toastController: ToastController, 
    public location:Location,
    public router: Router) {
    this.storage_init();
    this.currentUserSubject = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('currentUser')!)
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get(
    collectionORendpoint: string,
    params: any={},
    useCache: boolean = false
  ) {
    const cacheKey = params
      ? `${collectionORendpoint}_${this.md5(JSON.stringify(params))}`
      : collectionORendpoint;

      //use md5 hash of cacheKey as key
      

    //check if cachedData is available
    let cachedDatadata='';
    (async () => { 
      try {
        // Get cachedData from storage
      cachedDatadata=  await this.storage_get(cacheKey);
        //return of();

        // Your code using cachedData
      } catch (error) {
        // Handle errors here
        console.error(error);
      }
    })();

    if (useCache && cachedDatadata ) {//this.cachedData[cacheKey]
      console.log('cache hit ',cacheKey);
      return of(cachedDatadata);
//      return of(this.cachedData[cacheKey]);
//        let cachedData=await this.storage_get(cacheKey);
        // add async await to  let cachedData=await this.storage_get(cacheKey);
       // let cachedData= await(async()=>this.storage_get(cacheKey));

      


    }

    

    //if contains / then it is an endpoint else it is a collection
    let urlendpoint = collectionORendpoint;
    if (collectionORendpoint.includes('/')) {
      urlendpoint = this.portal_url + '/' + collectionORendpoint;
    } else {
      urlendpoint = this.portal_url + '/items/' + collectionORendpoint;
     // params.filter={...params.filter, _or:[{tenant:{'_empty':true}},{tenant: this.currentUserValue?.tenant?.id ?? idata.tenant.id }] };
    }
    console.log('urlendpoint',urlendpoint);
    const get$ = this.http.get<any>(urlendpoint, {
      params: this.removeUndefinedParams(params),
    });


    if (params.filter) {
      params.filter = JSON.stringify(params.filter);
    }

    return this.http
    .get<any>(urlendpoint, { params:this.removeUndefinedParams(params) })
    .pipe(
      map((data) => { 
        //save in cachedData
//        this.cachedData[cacheKey] = data;
        this.storage_set(cacheKey,data);
        return data;
      })
    );

  }

  public save<T>(
    collection: string,
    payload: any
  ): Observable<T> {
    const isEdit = payload && payload['id']; // Check if it's an edit (has an 'id')

    //compare payload and item and remove the same properties which are not changed
    //if item is undefined then it is a new item so no need to remove properties
     
    //add tenant
    //payload.tenant=this.currentUserValue?.tenant?.id ?? idata.tenant.id;

    const save$ = isEdit
      ? this.http.patch<T>(
          `${this.portal_url}/items/${collection}/${payload['id']}`,
          payload
        )
      : this.http.post<T>(`${this.portal_url}/items/${collection}`, payload);

    // Invalidate cache for the collection
   // this.invalidateCache(collection, params);

    return save$;
  }

  delete(collection: string, itemId: any, params?: any): Observable<void> {
    // Logic for deleting an item from the collection
    // You may want to handle the HTTP DELETE request here

    // Invalidate cache for the collection
    this.invalidateCache(collection, params);

    return of(undefined); // Return nothing (for demonstration purposes)
  }

  auth(action:any='login',payload:any={},provider:any=''){
    
    let url=this.portal_url+'/auth';
        switch(action){
          case 'login':
            url+='/login';
          break;

          case 'refresh':
            url+='/refresh';
            console.log(this.currentUserValue);
            payload={refresh_token:this.currentUserValue?.session?.refresh_token};
            if(!payload.refresh_token){
              //return observable error
              return new Observable((observer) => {
                observer.error('refresh_token not found');
                observer.complete();
              });
            }
          break;

          case 'logout':
            payload={refresh_token:this.currentUserValue.refresh_token};
          break;

        }

        //send POST request
        return this.http.post<any>(url, payload).pipe(
          map((res) => {
            console.log(res);
            if (res.data?.access_token) {
              //console.log(res.data);
              // store user details and jwt token in local storage to keep user logged in between page refreshes
              // localStorage.setItem('currentUser', JSON.stringify(res.data));
               this.currentUserSubject.next({session:res.data});
              // this.globalEventEmitter$.emit({refreshuser:true,user:res.data}); 

              this.getSetCurrentUser(res.data);
            }
            return res;
          })
        );
  }


  private invalidateCache(collection: string, params?: any): void {
    const cacheKey = params
      ? `${collection}_${JSON.stringify(params)}`
      : collection;
    delete this.cachedData[cacheKey];
  }

  private removeUndefinedParams(params: any): HttpParams {
    let cleanedParams = new HttpParams();
    for (const key in params) {
      if (params.hasOwnProperty(key) && params[key] !== undefined) {
        cleanedParams = cleanedParams.append(key, params[key]);
      }
    }
    return cleanedParams;
  }

  removeNonChangedProperties(payload: any, item: any) {
    //compare payload and item and remove the same properties which are not changed
    for (const key in payload) {
      if (payload.hasOwnProperty(key) && payload[key] === item[key]) {
        delete payload[key];
      }
    }

    //add id if in payload OR item
    if (payload['id']) {
      payload['id'] = item['id'];
    } else if (item['id']) {
      payload['id'] = item['id'];
    }

    return payload;
  }

  uploadFile(fileo, blob, reportProgress = false) {
    //console.log(fileo,blob);
    let formData: FormData = new FormData();
    formData.append('file', blob, fileo.name);

    return this.http
      .post<any>(environment.portal_url + '/files', formData)
      .pipe(map((res) => res));
  }

   //storage
   async storage_init(){
    const storage = await this.storage.create();
    this._storage = storage; 
  }
  async storage_get(key:any){
    return await this._storage?.get(key);
  }
  storage_set(key:any,value:any){
    this._storage?.set(key, value);
  }
  

  getSetCurrentUser(session:any={}){
    console.log('getSetCurrentUser',this.currentUser,session);
    //console.log(this.currentUserValue?.id);
    if(this.currentUserValue?.id || session?.access_token){
      this.get('users/me',{fields:'*,tenant.*,role.id,role.name,role.slug'}).subscribe((res:any)=>{ 
        console.log('setuserInfo');
        this.setUser({...res.data,session:session});
      });
    }
  }

  setUser(user: any) {
    let uid = user.name ?? user.first_name + ' - ' + user.mobile;
    console.log('assign id ' + uid.toString());
    //this.analytics.setUserId(uid.toString());
    //_paq.push(['setUserId', uid]);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    // _paq.push(['trackPageView']);
    this.globalEventEmitter$.emit({refreshuser:true,user:user}); 
  }

  logout(goto='') {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.clear();
    this.currentUserSubject.next(null!);

    if( window['plugins']){
      //window['plugins'].OneSignal.logout();
    }

    //this.router.navigate(['/'+goto??'', { replaceUrl: true }]);
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }



  getPlainNameString(s: any) {
    return s.toLowerCase().replace(/\s/g, '');
  }

  cloneWR(p) {
    return p ? JSON.parse(JSON.stringify(p)) : '';
  }

  present_alert(heading: string, msg: string = '') { 
    let alert: any = this.alertController.create({
      header: heading,
      message: msg,
      buttons: ['OK'],
    });
    alert.then((alert: { present: () => any }) => alert.present());
  }

  async present_toast(type, header, msg = '') {
    let color = 'primary';
    //console.log(type);
    switch (type) {
      case 'success':
        color = 'success';
        break;

      case 'info':
        color = 'success';
        break;

      case 'error':
        color = 'danger';
        break;

      default:
        color = 'primary';
    }
    const toast = await this.toastController.create({
      header: header,
      message: msg ?? '',
      duration: 3000,
      color: color,
      position: 'top',
      buttons: [
        {
          text: 'Close',
          role: 'cancel',
          handler: () => {
            //console.log('Cancel clicked');
          },
        },
      ],
    });
    await toast.present();
  }

  async playVideoUrlInAlertBox(url: any = '', language = 'marathi') {
    if (url) {
      url = url.replace('marathi', language);
      url = url.replace('english', language);
      url = url.replace('hindi', language);
      let vid =
        "<video autoplay controls src='" + url + "'    width=100%>  </video>";
      let html =
        '<iframe class="sample-code-frame"    height="500" width=281 srcdoc="' +
        vid +
        '" loading="lazy"></iframe>';

      if (url.includes('youtube')) {
        html =
          '<iframe class="sample-code-frame"    height="500" width=281 src="' +
          url +
          '" loading="lazy"></iframe>';
        //youtube embed code
        //get youtube id from url
        let youtube_id = url.split('v=')[1];
        //get embed code
        html =
          '<iframe class="sample-code-frame"    height="550" width=290 src="https://www.youtube.com/embed/' +
          youtube_id +
          '" loading="lazy"></iframe>';
      }

      const alert = await this.alertController.create({
        cssClass: 'video-url-alert-box',
        message: new IonicSafeString(html),
        buttons: ['Close'],
        backdropDismiss: false,
      });

      await alert.present();
    }
  }

  /*
  openExternalLink(url:any): void {
    let browser = this.iab.create(url, '_blank', { hideurlbar: 'yes' });    
  }

  share_link(message, link) {
    var options = {
      message: message, // not supported on some apps (Facebook, Instagram)
      url: link,
    };
    this.socialSharing.shareWithOptions(options);
  }

  share_screenshot(id: any = '', name: any = 'screenshot', message: any = '') {
    this.present_toast('info', 'Please Wait...');
    const captureElement: any = document.querySelector('#capture-' + id);
    html2canvas(captureElement, {
      allowTaint: true,
      useCORS: true,
      logging: true,
    }).then((canvas) => {
      // Get the image data as a base64-encoded string
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      if (window['plugins']) {
        console.log('share');

        let options: any = {
          message: message,
          files: [imageData],
          chooserTitle: null,
          // appPackageName: 'com.whatsapp'
        };
        console.log('link', message);

        this.socialSharing.shareWithOptions(options);
      } else {
        const link = document.createElement('a');
        link.setAttribute('download', name + '.jpeg');
        link.setAttribute('href', imageData);
        link.click();
      }
    });
  }
  */

  goBack() {
    this.location.back();
  }

  lat_lon_distance(lat1, lon1, lat2, lon2, unit = 'K') {
    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == 'K') {
        dist = dist * 1.609344;
      }
      if (unit == 'N') {
        dist = dist * 0.8684;
      }
      return dist;
    }
  }

  get_cdn_url(id,params:any={},src='portal'){
    let   url=this.portal_url+'/assets/'+id;  

    if(params){
      url+='?'+this.serialize(params);
    }
    return url;
  }
  serialize(obj:any) {
    var str :any= [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(p + '=' + obj[p]);
      }
    return str.join('&');
  }

  //  Formatted version of a popular md5 implementation
//  Original copyright (c) Paul Johnston & Greg Holt.
//  The function itself is now 42 lines long.

 md5(inputString) {
  var hc="0123456789abcdef";
  function rh(n) {var j,s="";for(j=0;j<=3;j++) s+=hc.charAt((n>>(j*8+4))&0x0F)+hc.charAt((n>>(j*8))&0x0F);return s;}
  function ad(x,y) {var l=(x&0xFFFF)+(y&0xFFFF);var m=(x>>16)+(y>>16)+(l>>16);return (m<<16)|(l&0xFFFF);}
  function rl(n,c)            {return (n<<c)|(n>>>(32-c));}
  function cm(q,a,b,x,s,t)    {return ad(rl(ad(ad(a,q),ad(x,t)),s),b);}
  function ff(a,b,c,d,x,s,t)  {return cm((b&c)|((~b)&d),a,b,x,s,t);}
  function gg(a,b,c,d,x,s,t)  {return cm((b&d)|(c&(~d)),a,b,x,s,t);}
  function hh(a,b,c,d,x,s,t)  {return cm(b^c^d,a,b,x,s,t);}
  function ii(a,b,c,d,x,s,t)  {return cm(c^(b|(~d)),a,b,x,s,t);}
  function sb(x) {
      var i;var nblk=((x.length+8)>>6)+1;var blks=new Array(nblk*16);for(i=0;i<nblk*16;i++) blks[i]=0;
      for(i=0;i<x.length;i++) blks[i>>2]|=x.charCodeAt(i)<<((i%4)*8);
      blks[i>>2]|=0x80<<((i%4)*8);blks[nblk*16-2]=x.length*8;return blks;
  }
  var i,x=sb(""+inputString),a=1732584193,b=-271733879,c=-1732584194,d=271733878,olda,oldb,oldc,oldd;
  for(i=0;i<x.length;i+=16) {olda=a;oldb=b;oldc=c;oldd=d;
      a=ff(a,b,c,d,x[i+ 0], 7, -680876936);d=ff(d,a,b,c,x[i+ 1],12, -389564586);c=ff(c,d,a,b,x[i+ 2],17,  606105819);
      b=ff(b,c,d,a,x[i+ 3],22,-1044525330);a=ff(a,b,c,d,x[i+ 4], 7, -176418897);d=ff(d,a,b,c,x[i+ 5],12, 1200080426);
      c=ff(c,d,a,b,x[i+ 6],17,-1473231341);b=ff(b,c,d,a,x[i+ 7],22,  -45705983);a=ff(a,b,c,d,x[i+ 8], 7, 1770035416);
      d=ff(d,a,b,c,x[i+ 9],12,-1958414417);c=ff(c,d,a,b,x[i+10],17,     -42063);b=ff(b,c,d,a,x[i+11],22,-1990404162);
      a=ff(a,b,c,d,x[i+12], 7, 1804603682);d=ff(d,a,b,c,x[i+13],12,  -40341101);c=ff(c,d,a,b,x[i+14],17,-1502002290);
      b=ff(b,c,d,a,x[i+15],22, 1236535329);a=gg(a,b,c,d,x[i+ 1], 5, -165796510);d=gg(d,a,b,c,x[i+ 6], 9,-1069501632);
      c=gg(c,d,a,b,x[i+11],14,  643717713);b=gg(b,c,d,a,x[i+ 0],20, -373897302);a=gg(a,b,c,d,x[i+ 5], 5, -701558691);
      d=gg(d,a,b,c,x[i+10], 9,   38016083);c=gg(c,d,a,b,x[i+15],14, -660478335);b=gg(b,c,d,a,x[i+ 4],20, -405537848);
      a=gg(a,b,c,d,x[i+ 9], 5,  568446438);d=gg(d,a,b,c,x[i+14], 9,-1019803690);c=gg(c,d,a,b,x[i+ 3],14, -187363961);
      b=gg(b,c,d,a,x[i+ 8],20, 1163531501);a=gg(a,b,c,d,x[i+13], 5,-1444681467);d=gg(d,a,b,c,x[i+ 2], 9,  -51403784);
      c=gg(c,d,a,b,x[i+ 7],14, 1735328473);b=gg(b,c,d,a,x[i+12],20,-1926607734);a=hh(a,b,c,d,x[i+ 5], 4,    -378558);
      d=hh(d,a,b,c,x[i+ 8],11,-2022574463);c=hh(c,d,a,b,x[i+11],16, 1839030562);b=hh(b,c,d,a,x[i+14],23,  -35309556);
      a=hh(a,b,c,d,x[i+ 1], 4,-1530992060);d=hh(d,a,b,c,x[i+ 4],11, 1272893353);c=hh(c,d,a,b,x[i+ 7],16, -155497632);
      b=hh(b,c,d,a,x[i+10],23,-1094730640);a=hh(a,b,c,d,x[i+13], 4,  681279174);d=hh(d,a,b,c,x[i+ 0],11, -358537222);
      c=hh(c,d,a,b,x[i+ 3],16, -722521979);b=hh(b,c,d,a,x[i+ 6],23,   76029189);a=hh(a,b,c,d,x[i+ 9], 4, -640364487);
      d=hh(d,a,b,c,x[i+12],11, -421815835);c=hh(c,d,a,b,x[i+15],16,  530742520);b=hh(b,c,d,a,x[i+ 2],23, -995338651);
      a=ii(a,b,c,d,x[i+ 0], 6, -198630844);d=ii(d,a,b,c,x[i+ 7],10, 1126891415);c=ii(c,d,a,b,x[i+14],15,-1416354905);
      b=ii(b,c,d,a,x[i+ 5],21,  -57434055);a=ii(a,b,c,d,x[i+12], 6, 1700485571);d=ii(d,a,b,c,x[i+ 3],10,-1894986606);
      c=ii(c,d,a,b,x[i+10],15,   -1051523);b=ii(b,c,d,a,x[i+ 1],21,-2054922799);a=ii(a,b,c,d,x[i+ 8], 6, 1873313359);
      d=ii(d,a,b,c,x[i+15],10,  -30611744);c=ii(c,d,a,b,x[i+ 6],15,-1560198380);b=ii(b,c,d,a,x[i+13],21, 1309151649);
      a=ii(a,b,c,d,x[i+ 4], 6, -145523070);d=ii(d,a,b,c,x[i+11],10,-1120210379);c=ii(c,d,a,b,x[i+ 2],15,  718787259);
      b=ii(b,c,d,a,x[i+ 9],21, -343485551);a=ad(a,olda);b=ad(b,oldb);c=ad(c,oldc);d=ad(d,oldd);
  }
  return rh(a)+rh(b)+rh(c)+rh(d);
}

}
