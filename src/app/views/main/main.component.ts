import { ShortUrlService } from './../../services/shortUrl.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, inject, ChangeDetectorRef, HostListener, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { HeaderComponent } from '../../shared/header/header.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { Url } from '../../interfaces/url';
import countriesData from '../../../../countries.json';
import { DatePipe } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { ColorPickerModule } from 'ngx-color-picker';



@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FormsModule,
    ReactiveFormsModule,
    QRCodeModule,
    ColorPickerModule
  ],
  templateUrl: './main.component.html',
  styles: `

  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainComponent {


    shortUrlService = inject(ShortUrlService)
    fb = inject(FormBuilder)
    cookies = inject(CookieService)
    cdr = inject(ChangeDetectorRef)
    sanitizer = inject(DomSanitizer)
    buttons = [
        "Short Link",
        "Qr Code",
    ]

    urls:any;
    ids:any;
    urlLong: FormGroup;
    alert = signal('Invalid URL')
    chooseButton = signal('Short Link')
    loading = signal(false)
    statBool = signal(false)
    selectUrl:any;
    textQr = ' '
    qrCodeDownloadLink: SafeResourceUrl | undefined = '';
    width = 200;
    type:any;
    backGroundColor = '#FFFFFF'
    foreGroundColor = '#000000'
    margin = 0
    fileUrl: any;
    src: any;
    qrCodeBlob: Blob | undefined;
    qrCodeUrl: string | undefined;

    @ViewChild('qrcodeImage', { static: false }) qrcodeImage: ElementRef | undefined;

    constructor() {
      this.urlLong  = this.fb.group({
        url:['', [Validators.required, Validators.pattern('https?://.+')]]
      })

      enum QRCodeElementType{
        Canvas = 'canvas',
        Svg = 'svg+xml',
        Url = 'url',
        Img = 'img',
      }

      this.type = QRCodeElementType.Img;
    }

    ngOnInit() {
      let ids = this.cookies.get('urls') ? JSON.parse(this.cookies.get('urls')) : [];
      this.getUrlsById(ids);

    }

    choose(button: string) {
        this.chooseButton.set(button)
    }


    getURL(){
      if(this.urlLong.invalid){
        this.showAlert()
          return
      }
      this.loading.set(true)
      const url = {
          OriginalUrl: this.urlLong.value.url,
          ShortUrl: '',
      }

      this.shortUrlService.getShortUrl(url).then((response: Url) => {
        let ids = this.cookies.get('urls') ? JSON.parse(this.cookies.get('urls')) : [];
        let exists = ids.some((element:any) => element === response.id);

        if (exists) {
          console.log('Ya existe');
          this.loading.set(false)
        } else {
          ids.push(response.id);
          this.cookies.set('urls', JSON.stringify(ids));
          this.getUrlsById(ids);
          this.loading.set(false)
          this.cdr.detectChanges();
        }
      });
    }

    UpdatingUrl(urlID:any){
      this.shortUrlService.getUrlById(urlID).then((response: Url) => {
        //encontramos el indice del elemento que queremos actualizar
        let index = this.urls.findIndex((element:any) => element.id === response.id);
        //actualizamos el elemento
        this.urls[index] = response;
        this.cdr.detectChanges();
      });
    }

    getUrlsById(idsToUpdate:any){
      let ids = idsToUpdate
      ids.forEach((element: string) => {
        this.shortUrlService.getUrlById(element).then((response: Url) => {
          if(this.urls === undefined){
               this.urls = [];
               this.urls.push(response);
          }else{

               let exists = this.urls.some((element:any) => element.id === response.id);
               if (exists) {
               this.urls = this.urls.map((element:any) => {
               if (element.id === response.id) {
               return response;
               }
               return element;
               }
               );
               } else {
               this.urls.push(response);
               }
          }
          this.cdr.detectChanges();
        });
       });

    }


    go(){
      console.log('go');
    }

    clickToShortUrl(url:Url){
      if(url.shortUrl === undefined || url.shortUrl === '' || url.shortUrl === null){
        console.log('url.shortUrl is undefined')
        return
      }
      window.open('https://paroot.somee.com/'+url.shortUrl, '_blank');
      let createdAtDate = new Date(url.createdAt!);
      const urlToUpdate = {
        Id: url.id,
        OriginalUrl: url.originalUrl,
        ShortUrl: url.shortUrl,
        CreatedAt: createdAtDate.toISOString(),
        Clicks : url!.clicks! + 1,
        LastClickedAt: new Date().toISOString(),
        LastClickedCountry: '',
        }

        this.shortUrlService.getData().then((response: any) => {
          let value = countriesData.find((element: any) => element.code === response.country);
          urlToUpdate.LastClickedCountry = value!.name;
          this.shortUrlService.updateUrl(urlToUpdate).then((response: any) => {
            this.UpdatingUrl(url.id);
          });
        })
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
     let ids = this.cookies.get('urls') ? JSON.parse(this.cookies.get('urls')) : [];

      let urls = ids.filter((element: Url) => element !== url.id);
      this.cookies.set('urls', JSON.stringify(urls));

      this.urls = this.urls.filter((element: Url) => element.id !== url.id);

    }

    onQrCodeURLChange(url: any) {
        this.qrCodeDownloadLink = url
    }

    downloadQrCode() {
      try {
        // Generar el Blob
        this.qrCodeBlob = new Blob([this.textQr], {type: this.type === 'svg+xml' ? 'image/svg+xml' : 'image/png'});

        // Crear la URL segura para el Blob
        if (this.qrCodeBlob) {
          this.qrCodeUrl = URL.createObjectURL(this.qrCodeBlob);
        }

        // Crear el enlace de descarga
        if (this.qrCodeDownloadLink) {
          const a = document.createElement('a');
          a.href = this.sanitizer.sanitize(SecurityContext.URL, this.qrCodeDownloadLink) as string;
          a.download = 'qrcode';
          a.click();
          a.remove();
        }
      } catch (error) {
        console.error('Error:', error);
      }


    }

    startStat(url: Url){
      this.statBool.set(true)
      this.selectUrl = url;
      this.selectUrl.createdAt = new DatePipe('en-US').transform(this.selectUrl.createdAt, 'yyyy-MM-dd HH:mm:ss');
      this.selectUrl.lastClickedAt = new DatePipe('en-US').transform(this.selectUrl.lastClickedAt, 'yyyy-MM-dd HH:mm:ss');

      this.cdr.detectChanges();
    }

    finishStat(){
      this.statBool.set(false)
      this.selectUrl = undefined;
      this.cdr.detectChanges();
    }

    showAlert(){
      this.alert.set('Invalid URL')
      let alert = document.getElementById('alertBox');
      let input = document.getElementById('urlInput');
      alert?.classList.remove('bg-green-400');
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

    onBColorChange(value: string) {
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        this.backGroundColor = value.toUpperCase();
      } else if (value === '') {
        this.backGroundColor = '#FFFFFF';
      }
    }

    onFColorChange(value: string) {
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        this.foreGroundColor = value.toUpperCase();
      } else if (value === '') {
        this.foreGroundColor  = '#000000';
      }
    }


    showAlertCopy(){
      this.alert.set('Link copied!')
      let alert = document.getElementById('alertBox');
      alert?.classList.remove('bg-red-400');
      alert?.classList.add('bg-green-400');
      alert!.style.display = 'flex';
      setTimeout(function(){
        alert!.classList.remove('bg-green-400');
        alert!.style.display = "none";
      }, 3000);
    }

    @HostListener('document:keydown.esc', ['$event'])
    onEsc(event: KeyboardEvent) {
      this.finishStat();
    }

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
      if (!this.isButtonElement(event.target) && event.target !== document.getElementsByClassName('dont')[0] && !this.isInputElement(event.target) && !this.isTextAreaElement(event.target)) {
        this.finishStat();
      }}

          // Método para verificar si un elemento es un elemento de entrada (input)
      private isInputElement(target: EventTarget | null): boolean {
        return target instanceof HTMLInputElement;
      }

      private isButtonElement(target: EventTarget | null): boolean {
        return target instanceof HTMLButtonElement;
      }

      private isTextAreaElement(target: EventTarget | null): boolean {
        return target instanceof HTMLTextAreaElement;
      }
}
