import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `<p>footer works!</p>`,
  styles: [`
    p {
      color: red;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent { }
