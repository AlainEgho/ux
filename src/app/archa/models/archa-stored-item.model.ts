export type ArchaItemType = 'url' | 'image';

export interface ArchaStoredItem {
  id: string;
  type: ArchaItemType;
  shortCode: string;
  shortPath: string;
  fullShortUrl: string;
  originalUrl?: string;
  originalFileName?: string | null;
  contentType?: string;
  createdAt: string;
}
