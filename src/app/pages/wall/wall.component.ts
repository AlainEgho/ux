import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { WallService } from '../../services/wall.service';
import type { WallPost } from '../../services/wall-api.model';

const DEFAULT_PAGE_SIZE = 20;
const MAX_CONTENT_LENGTH = 10000;

@Component({
  selector: 'app-wall',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wall.component.html',
})
export class WallComponent implements OnInit {
  private wallService = inject(WallService);

  readonly posts = signal<WallPost[]>([]);
  readonly loading = signal(false);
  readonly loadingMore = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly hasMore = computed(() => this.currentPage() < this.totalPages() - 1);

  content = '';
  imageFile: File | null = null;
  imagePreview = '';
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly fileInputRef = viewChild<ElementRef<HTMLInputElement>>('fileInputRef');

  ngOnInit(): void {
    this.loadPosts(0, true);
  }

  loadPosts(page: number, replace: boolean): void {
    const setLoading = page === 0 ? this.loading : this.loadingMore;
    setLoading.set(true);
    this.error.set(null);
    this.wallService.getPosts(page, DEFAULT_PAGE_SIZE).subscribe({
      next: (res) => {
        setLoading.set(false);
        if (!res.success || !res.data) return;
        const { content, totalPages, number } = res.data;
        this.totalPages.set(totalPages);
        this.currentPage.set(number);
        if (replace) this.posts.set(content);
        else this.posts.update((prev) => [...prev, ...content]);
      },
      error: () => {
        setLoading.set(false);
        this.error.set('Failed to load posts.');
        if (replace) this.posts.set([]);
      },
    });
  }

  loadMore(): void {
    if (!this.hasMore() || this.loadingMore()) return;
    this.loadPosts(this.currentPage() + 1, false);
  }

  onFileSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.submitError.set('Please select an image file (e.g. JPEG, PNG).');
      input.value = '';
      return;
    }
    this.imageFile = file;
    this.submitError.set(null);
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.imageFile = null;
    this.imagePreview = '';
    const input = this.fileInputRef()?.nativeElement;
    if (input) input.value = '';
  }

  onSubmit(): void {
    const text = this.content.trim();
    const hasImage = !!this.imageFile || !!this.imagePreview;
    if (!text && !hasImage) {
      this.submitError.set('Add some text or an image to post.');
      return;
    }
    if (text.length > MAX_CONTENT_LENGTH) {
      this.submitError.set(`Content must be at most ${MAX_CONTENT_LENGTH} characters.`);
      return;
    }
    this.submitError.set(null);
    this.submitting.set(true);
    const body: { content?: string; imageBase64?: string } = {};
    if (text) body.content = text;
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        body.imageBase64 = reader.result as string;
        this.sendPost(body);
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      this.sendPost(body);
    }
  }

  private sendPost(body: { content?: string; imageBase64?: string }): void {
    this.wallService.createPost(body).subscribe({
      next: (res) => {
        this.submitting.set(false);
        if (res.success && res.data) {
          this.posts.update((list) => [res.data!, ...list]);
          this.content = '';
          this.clearImage();
        } else {
          this.submitError.set(res.message || 'Failed to publish.');
        }
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(
          err?.error?.message || err?.message || 'Failed to publish post.'
        );
      },
    });
  }

  authorName(post: WallPost): string {
    return `${post.authorFirstName} ${post.authorLastName}`.trim() || post.authorEmail;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  imageUrl(post: WallPost): string | null {
    const path = post.imagePath;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = environment.apiBaseUrl.replace(/\/$/, '');
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  }
}
