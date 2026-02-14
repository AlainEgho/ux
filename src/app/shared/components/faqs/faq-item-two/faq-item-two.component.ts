import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq-item-two',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-lg border border-gray-200 dark:border-gray-800">
      <button
        type="button"
        class="flex w-full items-center justify-between px-5 py-4 text-left text-theme-sm font-medium text-gray-900 dark:text-white/90"
        (click)="toggle.emit()"
      >
        <span>{{ title }}</span>
        <span class="transition-transform" [class.rotate-180]="isOpen">▼</span>
      </button>
      @if (isOpen) {
        <div class="border-t border-gray-200 px-5 py-4 text-theme-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          {{ content }}
        </div>
      }
    </div>
  `,
})
export class FaqItemTwoComponent {
  @Input() title = '';
  @Input() content = '';
  @Input() isOpen = false;
  @Output() toggle = new EventEmitter<void>();
}
