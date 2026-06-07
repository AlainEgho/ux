export interface CreateShortUrlRequest {
  url: string;
}

export interface CreateShortUrlResponse {
  shortCode: string;
  shortUrl: string;
  fullUrl: string;
  originalUrl: string;
}
