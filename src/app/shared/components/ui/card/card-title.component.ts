import { Component } from '@angular/core';

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<h3 class="mb-2 text-theme-sm font-semibold text-gray-900 dark:text-white/90"><ng-content></ng-content></h3>`,
})
export class CardTitleComponent {}
