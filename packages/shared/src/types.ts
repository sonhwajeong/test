export interface User {
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  id: string;
  password: string;
  deviceId?: string;
  appVersion?: string;
  platform?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
  biometricEligible: boolean;
  success: boolean;
}

export interface TokenCheckRequest {
  accessToken: string;
  deviceId: string;
}

export interface TokenCheckResponse {
  success: boolean;
  message: string;
  data: {
    valid: boolean;
    userEmail: string;
    tokenDeviceId: string;
    expiresAt: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceId: string;
}

export interface RefreshTokenResponse {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  success: boolean;
  user: User | null;
  biometricEligible: boolean | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  publishedAt: string;
  imageUrl?: string;
  category: 'general' | 'update' | 'event' | 'announcement';
  isImportant: boolean;
  author: string;
}

export interface NewsListResponse {
  news: NewsItem[];
  totalCount: number;
  hasMore: boolean;
}