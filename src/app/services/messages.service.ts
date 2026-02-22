import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from './auth-api.model';
import {
  MESSAGES_API,
  OnlineUsersResponse,
  SendMessageRequest,
  SendMessageResponse,
  ConversationResponse,
  ConversationsListResponse,
} from './messages-api.model';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  constructor(private http: HttpClient) {}

  getOnlineUsers(): Observable<OnlineUsersResponse> {
    return this.http.get<OnlineUsersResponse>(MESSAGES_API.onlineUsers);
  }

  sendMessage(body: SendMessageRequest): Observable<SendMessageResponse> {
    return this.http.post<SendMessageResponse>(MESSAGES_API.sendMessage, body);
  }

  getConversation(
    userId: number,
    page = 0,
    size = 50
  ): Observable<ConversationResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size));
    return this.http.get<ConversationResponse>(
      MESSAGES_API.conversation(userId),
      { params }
    );
  }

  getConversations(): Observable<ConversationsListResponse> {
    return this.http.get<ConversationsListResponse>(MESSAGES_API.conversations);
  }

  markAsRead(messageId: number): Observable<ApiResponse<null>> {
    return this.http.patch<ApiResponse<null>>(
      MESSAGES_API.markRead(messageId),
      {}
    );
  }
}
