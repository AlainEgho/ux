import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-sidebar-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isSidebarOpen) {
      <div class="fixed right-0 top-0 z-40 h-full w-72 border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 xl:relative xl:z-0">
        <div class="flex items-center justify-between p-4">
          <span class="text-theme-sm font-medium text-gray-800 dark:text-white/90">Chat history</span>
          <button
            type="button"
            class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            (click)="closeSidebar.emit()"
          >
            ✕
          </button>
        </div>
      </div>
    }
  `,
})
export class AiSidebarHistoryComponent {
  @Input() isSidebarOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
}
