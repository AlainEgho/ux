import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  viewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessagesService } from '../../services/messages.service';
import { AuthService } from '../../services/auth.service';
import { WebSocketService } from '../../services/websocket.service';
import type {
  OnlineUser,
  ConversationSummary,
  Message,
} from '../../services/messages-api.model';

type Peer = { id: number; firstName: string; lastName: string; email: string };

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './messages.component.html',
  styles: [
    `
      .messages-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .messages-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column-reverse;
      }
    `,
  ],
})
export class MessagesComponent implements OnInit, AfterViewChecked, OnDestroy {
  private messagesService = inject(MessagesService);
  private authService = inject(AuthService);
  private wsService = inject(WebSocketService);
  private wsSubscription: Subscription | null = null;

  readonly onlineUsers = signal<OnlineUser[]>([]);
  readonly conversations = signal<ConversationSummary[]>([]);
  readonly loadingOnline = signal(true);
  readonly loadingConversations = signal(true);
  readonly errorOnline = signal<string | null>(null);
  readonly errorConversations = signal<string | null>(null);

  /** Currently selected peer (from online or conversations). */
  readonly selectedPeer = signal<Peer | null>(null);
  readonly messages = signal<Message[]>([]);
  readonly loadingMessages = signal(false);
  readonly loadingMore = signal(false);
  readonly sendError = signal<string | null>(null);
  readonly currentPage = signal(0);
  readonly totalPages = signal(0);
  readonly hasMorePages = computed(() => this.currentPage() < this.totalPages() - 1);

  newMessageText = '';
  private scrollToBottomAfterRender = false;
  readonly messagesEndRef = viewChild<ElementRef<HTMLDivElement>>('messagesEndRef');

  readonly currentUserId = computed(() => this.authService.currentUser()?.id ?? 0);

  ngOnInit(): void {
    this.loadOnlineUsers();
    this.loadConversations();
    this.wsSubscription = this.wsService.message$.subscribe((msg) =>
      this.onWebSocketMessage(msg)
    );
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  private onWebSocketMessage(msg: Message): void {
    const me = this.currentUserId();
    const peer = this.selectedPeer();
    const isForCurrentConversation =
      peer &&
      ((msg.senderId === peer.id && msg.receiverId === me) ||
        (msg.senderId === me && msg.receiverId === peer.id));
    const normalized: Message = {
      ...msg,
      fromCurrentUser: msg.senderId === me,
    };
    if (isForCurrentConversation) {
      this.messages.update((list) => {
        if (list.some((m) => m.id === msg.id)) return list;
        return [...list, normalized];
      });
      this.scrollToBottomAfterRender = true;
    }
    this.loadConversations();
  }

  ngAfterViewChecked(): void {
    if (this.scrollToBottomAfterRender) {
      this.scrollToBottomAfterRender = false;
      this.messagesEndRef()?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  loadOnlineUsers(): void {
    this.loadingOnline.set(true);
    this.errorOnline.set(null);
    this.messagesService.getOnlineUsers().subscribe({
      next: (res) => {
        this.loadingOnline.set(false);
        if (res.success && res.data) this.onlineUsers.set(res.data);
        else this.onlineUsers.set([]);
      },
      error: () => {
        this.loadingOnline.set(false);
        this.errorOnline.set('Failed to load online users.');
        this.onlineUsers.set([]);
      },
    });
  }

  loadConversations(): void {
    this.loadingConversations.set(true);
    this.errorConversations.set(null);
    this.messagesService.getConversations().subscribe({
      next: (res) => {
        this.loadingConversations.set(false);
        if (res.success && res.data) this.conversations.set(res.data);
        else this.conversations.set([]);
      },
      error: () => {
        this.loadingConversations.set(false);
        this.errorConversations.set('Failed to load conversations.');
        this.conversations.set([]);
      },
    });
  }

  selectOnlineUser(user: OnlineUser): void {
    this.selectPeer({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });
  }

  selectConversation(c: ConversationSummary): void {
    this.selectPeer({
      id: c.peerUserId,
      firstName: c.peerFirstName,
      lastName: c.peerLastName,
      email: c.peerEmail,
    });
  }

  private selectPeer(peer: Peer): void {
    this.selectedPeer.set(peer);
    this.sendError.set(null);
    this.currentPage.set(0);
    this.loadConversation(peer.id, 0, true);
  }

  loadConversation(userId: number, page: number, replace: boolean): void {
    const loadingSignal = page === 0 ? this.loadingMessages : this.loadingMore;
    loadingSignal.set(true);
    this.messagesService.getConversation(userId, page, 50).subscribe({
      next: (res) => {
        loadingSignal.set(false);
        if (!res.success || !res.data) return;
        const { content, totalPages, number } = res.data;
        this.totalPages.set(totalPages);
        this.currentPage.set(number);
        if (replace) {
          this.messages.set([...content].reverse()); // API returns newest first; show oldest first
          // Mark unread messages as read (messages we received)
          const currentId = this.currentUserId();
          [...content]
            .filter((m) => m.receiverId === currentId && !m.readAt)
            .forEach((m) =>
              this.messagesService.markAsRead(m.id).subscribe()
            );
        } else {
          this.messages.update((prev) => [...content].reverse().concat(prev));
        }
        this.scrollToBottomAfterRender = replace && content.length > 0;
        if (replace) this.loadConversations();
      },
      error: () => {
        loadingSignal.set(false);
        if (replace) this.messages.set([]);
      },
    });
  }

  loadMore(): void {
    const peer = this.selectedPeer();
    if (!peer || !this.hasMorePages() || this.loadingMore()) return;
    this.loadConversation(peer.id, this.currentPage() + 1, false);
  }

  sendMessage(): void {
    const text = this.newMessageText.trim();
    const peer = this.selectedPeer();
    if (!text || !peer) return;
    this.sendError.set(null);
    this.messagesService
      .sendMessage({ receiverId: peer.id, content: text })
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.messages.update((list) => [...list, res.data!]);
            this.newMessageText = '';
            this.scrollToBottomAfterRender = true;
            this.loadConversations();
          }
        },
        error: (err) => {
          this.sendError.set(
            err?.error?.message || err?.message || 'Failed to send message.'
          );
        },
      });
  }

  peerDisplayName(peer: Peer): string {
    return `${peer.firstName} ${peer.lastName}`.trim() || peer.email;
  }

  formatMessageTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
