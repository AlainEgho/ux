import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Message } from './messages-api.model';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_PATH = '/ws';
const MESSAGES_DESTINATION = '/user/queue/messages';

@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private subscription: { unsubscribe: () => void } | null = null;
  private currentToken: string | null = null;

  /** Emits when a new message is received over the WebSocket (same shape as REST Message). */
  readonly message$ = new Subject<Message>();

  /** Whether the client is currently connected. */
  get isConnected(): boolean {
    return !!this.client?.connected;
  }

  /**
   * Connect to the WebSocket using SockJS + STOMP.
   * URL: {apiBaseUrl}/ws?token={accessToken}
   * Call after login or on app init when user is already authenticated.
   */
  connect(accessToken: string): void {
    if (!accessToken) return;
    if (this.client?.connected && this.currentToken === accessToken) return;
    this.disconnect();
    this.currentToken = accessToken;
    const baseUrl = environment.apiBaseUrl.replace(/\/$/, '');
    const wsUrl = `${baseUrl}${WS_PATH}?token=${encodeURIComponent(accessToken)}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl) as unknown as WebSocket,
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = () => {
      this.subscription = this.client!.subscribe(MESSAGES_DESTINATION, (msg) => {
        try {
          const body = JSON.parse(msg.body) as Message;
          this.message$.next(body);
        } catch {
          // ignore malformed payload
        }
      });
    };

    this.client.activate();
  }

  /** Disconnect and clean up. Call on logout. */
  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
    this.currentToken = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.message$.complete();
  }
}
