import { Component } from '@angular/core';

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<p class="text-theme-sm text-gray-500 dark:text-gray-400"><ng-content></ng-content></p>`,
})
export class CardDescriptionComponent {}
