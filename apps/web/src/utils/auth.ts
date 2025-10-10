/**
 * 웹 앱 인증 관련 유틸리티 함수들
 */

import { getAccessTokenCookie, getRefreshTokenCookie, getUserInfoCookie } from './cookies';

/**
 * 현재 access token 가져오기 (웹에서는 쿠키에서만)
 */
export function getCurrentAccessToken(): string | null {
  return getAccessTokenCookie();
}

/**
 * 현재 refresh token 가져오기 (웹에서는 쿠키에서만)
 */
export function getCurrentRefreshToken(): string | null {
  return getRefreshTokenCookie();
}

/**
 * 현재 사용자 정보 가져오기 (웹에서는 쿠키에서만)
 */
export function getCurrentUserInfo(): any | null {
  return getUserInfoCookie();
}

/**
 * 로그인 상태 확인
 */
export function isLoggedIn(): boolean {
  const token = getCurrentAccessToken();
  return !!token;
}

/**
 * API 호출 시 사용할 헤더 생성
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getCurrentAccessToken();

  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  return {
    'Content-Type': 'application/json'
  };
}