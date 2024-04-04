import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShortUrlService {

  constructor(
    private http: HttpClient,
    private cookies: CookieService,
  ) {}

  private api = this.getBaseUrl();

  async getShortUrl(url: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://estebanbss.github.io/'
    });
    const options = { headers: headers };
    return await firstValueFrom(this.http.post(`${this.api}`, url, options));
  }

  async getUrlById(id: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://estebanbss.github.io/'
    });
    const options = { headers: headers };
    return await firstValueFrom(this.http.get(`${this.api}/${id}`, options));
  }

  async getLongUrl(shortUrl: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://estebanbss.github.io/'
    });
    const options = { headers: headers };
    return await firstValueFrom(this.http.get(`${this.api}/${shortUrl}`, options));
  }

  async updateUrl(url:any){
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://estebanbss.github.io/'
    });
    const options = { headers: headers };
    return await firstValueFrom(this.http.put(`${this.api}/${url.Id}`, url, options));
  }

  async getData(){
    return await firstValueFrom(this.http.get('https://ipinfo.io/json'))
  }

  getBaseUrl() {
    console.log(environment.production)
    return environment.production ? 'https://paroot.somee.com' : '/api';
  }


}
