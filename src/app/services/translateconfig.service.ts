import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class TranslateConfigService {
  applanguage:any = '';
  constructor(public translateService: TranslateService) {}

  setAppLanguage(l = 'english') {
    this.applanguage = l;
    localStorage.setItem('applanguage', l);
    this.translateService.use(l);
  }

  translate(key) {
    return this.gettranslate(key);
  }

  gettranslate(key) {
    return this.translateService.instant(key);
  }

  getAppLanguage() {
    if (!this.applanguage) {
      this.applanguage = localStorage.getItem('applanguage');
      if (!this.applanguage) {
        this.applanguage = 'english';
        this.setAppLanguage('english');
      }
    }
    return this.applanguage;
  }
}
