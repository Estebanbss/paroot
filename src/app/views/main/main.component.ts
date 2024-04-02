import { ShortUrlService } from './../../services/shortUrl.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, inject, ChangeDetectorRef } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Url } from '../../interfaces/url';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './main.component.html',
  styles: `

    .bg-noise{
      width: 100%;
      height: 100%;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.14' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.4;

    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainComponent {

    shortUrlService = inject(ShortUrlService)
    fb = inject(FormBuilder)
    cookies = inject(CookieService)
    cdr = inject(ChangeDetectorRef)
    buttons = [
        "Short Link",
        "Qr Code",
    ]
    urls:any;
    urlLong: FormGroup;
    alert = signal('Invalid URL')
    chooseButton = signal('Short Link')

    constructor() {
      this.urlLong  = this.fb.group({
        url:['', [Validators.required, Validators.pattern('https?://.+')]]
      })

      this.getUrlsLocalStorage()
    }

    ngOnInit() {
      console.log(this.urls)
    }

    choose(button: string) {
        this.chooseButton.set(button)
    }

    getURL(){
      if(this.urlLong.invalid){
        this.showAlert()
          return
      }

      const url = {
          OriginalUrl: this.urlLong.value.url,
          ShortUrl: '',
      }


      this.shortUrlService.getShortUrl(url).then((response: Url) => {
        let urls: Url[] = this.cookies.get('urls') ? JSON.parse(this.cookies.get('urls')) : [];
        let exists = urls.some((element: Url) => element.originalUrl === response.originalUrl);

        if (exists) {
          console.log('Ya existe');
        } else {
          urls.push(response);
          this.cookies.set('urls', JSON.stringify(urls));
          this.urls = urls;
          this.cdr.detectChanges();
        }
      });


    }

    getUrlsLocalStorage(){
      if(this.cookies.check('urls')){
        this.urls = JSON.parse(this.cookies.get('urls'))
      }else{
        this.urls = []
      }
    }

    go(){
      console.log('go');
    }

    copyUrl(url: Url){
      if (url.shortUrl) {
        navigator.clipboard.writeText('https://paroot.somee.com/'+url.shortUrl).then(() => {
          this.showAlertCopy();
        });
      } else {
        console.log('url.shortUrl is undefined');
      }
    }

    deleteUrlFromLocalStorage(url: Url){
      let urls: Url[] = this.cookies.get('urls') ? JSON.parse(this.cookies.get('urls')) : [];
      urls = urls.filter((element: Url) => element.originalUrl !== url.originalUrl);
      this.cookies.set('urls', JSON.stringify(urls));
      this.urls = urls;
    }

    showAlert(){
      this.alert.set('Invalid URL')
      let alert = document.getElementById('alertBox');
      let input = document.getElementById('urlInput');
      alert?.classList.add('bg-red-400');
      alert!.style.display = 'flex';
      input!.style.border = '2px solid red';
      //ahora borramos lo que hay dentro del input
      this.urlLong.reset();
      setTimeout(function(){
        alert!.classList.remove('bg-red-400');
        alert!.style.display = "none";
        input!.style.border = '2px solid #ccc';
      }, 3000);
    }


    showAlertCopy(){
      this.alert.set('Link copied!')
      let alert = document.getElementById('alertBox');
      alert?.classList.add('bg-green-400');
      alert!.style.display = 'flex';
      setTimeout(function(){
        alert!.classList.remove('bg-green-400');
        alert!.style.display = "none";
      }, 3000);
    }
}
