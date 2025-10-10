/**
 * 쿠키 관리 유틸리티 함수들
 */

interface CookieOptions {
  expires?: number; // 만료 시간 (일 단위)
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * 쿠키 설정
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + options.expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${expirationDate.toUTCString()}`;
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += `; secure`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * 쿠키 가져오기
 */
export function getCookie(name: string): string | null {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    let c = cookie.trim();
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * 쿠키 삭제
 */
export function deleteCookie(name: string, path?: string, domain?: string): void {
  let cookieString = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  if (path) {
    cookieString += `; path=${path}`;
  }

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  document.cookie = cookieString;
}

/**
 * 토큰 관련 쿠키 관리 함수들
 */

const TOKEN_COOKIE_NAME = 'myapp_access_token';
const REFRESH_TOKEN_COOKIE_NAME = 'myapp_refresh_token';
const USER_INFO_COOKIE_NAME = 'myapp_user_info';

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  expires: 7, // 7일
  path: '/',
  secure: process.env.NODE_ENV === 'production', // 프로덕션에서만 secure
  sameSite: 'lax'
};

/**
 * Access Token을 쿠키에 저장
 */
export function setAccessTokenCookie(token: string): void {
  console.log('🍪 Saving access token to cookie');
  setCookie(TOKEN_COOKIE_NAME, token, DEFAULT_COOKIE_OPTIONS);
}

/**
 * 쿠키에서 Access Token 가져오기
 */
export function getAccessTokenCookie(): string | null {
  const token = getCookie(TOKEN_COOKIE_NAME);
  console.log('🍪 Getting access token from cookie:', token ? 'found' : 'not found');
  return token;
}

/**
 * Refresh Token을 쿠키에 저장
 */
export function setRefreshTokenCookie(token: string): void {
  console.log('🍪 Saving refresh token to cookie');
  setCookie(REFRESH_TOKEN_COOKIE_NAME, token, DEFAULT_COOKIE_OPTIONS);
}

/**
 * 쿠키에서 Refresh Token 가져오기
 */
export function getRefreshTokenCookie(): string | null {
  return getCookie(REFRESH_TOKEN_COOKIE_NAME);
}

/**
 * 사용자 정보를 쿠키에 저장
 */
export function setUserInfoCookie(userInfo: any): void {
  console.log('🍪 Saving user info to cookie:', userInfo.email);
  setCookie(USER_INFO_COOKIE_NAME, JSON.stringify(userInfo), DEFAULT_COOKIE_OPTIONS);
}

/**
 * 쿠키에서 사용자 정보 가져오기
 */
export function getUserInfoCookie(): any | null {
  const userInfoStr = getCookie(USER_INFO_COOKIE_NAME);
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr);
    } catch (error) {
      console.error('Failed to parse user info from cookie:', error);
      return null;
    }
  }
  return null;
}

/**
 * 모든 토큰 쿠키 삭제
 */
export function clearTokenCookies(): void {
  console.log('🍪 Clearing all token cookies');
  deleteCookie(TOKEN_COOKIE_NAME, '/');
  deleteCookie(REFRESH_TOKEN_COOKIE_NAME, '/');
  deleteCookie(USER_INFO_COOKIE_NAME, '/');
}