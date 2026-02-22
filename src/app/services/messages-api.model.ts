import { environment } from '../../environments/environment';
import type { ApiResponse } from './auth-api.model';

const API_BASE = environment.apiBaseUrl;

export const MESSAGES_API = {
  onlineUsers: `${API_BASE}/api/users/online`,
  sendMessage: `${API_BASE}/api/messages`,
  conversation: (userId: number) =>
    `${API_BASE}/api/messages/conversation/${userId}`,
  conversations: `${API_BASE}/api/messages/conversations`,
  markRead: (id: number) => `${API_BASE}/api/messages/${id}/read`,
} as const;

export interface OnlineUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  country: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  readAt: string | null;
  fromCurrentUser: boolean;
}

export interface ConversationSummary {
  peerUserId: number;
  peerFirstName: string;
  peerLastName: string;
  peerEmail: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface SendMessageRequest {
  receiverId: number;
  content: string;
}

/** Spring Page response for GET conversation */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type OnlineUsersResponse = ApiResponse<OnlineUser[]>;
export type SendMessageResponse = ApiResponse<Message>;
export type ConversationResponse = ApiResponse<SpringPage<Message>>;
export type ConversationsListResponse = ApiResponse<ConversationSummary[]>;
