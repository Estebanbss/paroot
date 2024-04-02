import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShortUrlService {

  constructor(
    private http: HttpClient,
    private cookies: CookieService,

  ) {}

  private api = "https://paroot.somee.com"

  async getShortUrl(url: any) {
    return await firstValueFrom(this.http.post(`${this.api}`, url))
  }

  async getLongUrl(shortUrl: string) {
    return await firstValueFrom(this.http.get(`${this.api}/${shortUrl}`))
  }

}
