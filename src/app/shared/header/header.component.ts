import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {  RouterModule } from '@angular/router';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `

  <header class=" w-full min-h-[60px] flex justify-center bg-green-900  z-50 items-center">
    <nav class="w-full max-w-[1280px] p-3 ">
      <button class="mx-auto max-h-[40px] h-full max-w-[150px] w-full flex flex-row justify-center items-center gap-2 text-white font-bold text-2xl"><img class="w-full max-w-[40px] h-full rounded-full bg-white  pointer-events-none"  src="assets/paroot.svg"><img class="max-w-[100px] h-full w-full pointer-events-none" src="assets/parootText.svg"></button>
    </nav>
  </header>


  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {

}
