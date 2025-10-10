import React from 'react';
import { apiClient, TokenCheckRequest, TokenCheckResponse, RefreshTokenRequest, RefreshTokenResponse } from '@myapp/shared';
import { storageService } from './storage';
import { deviceService } from './device';
import { Platform } from 'react-native';

class AuthService {
  private readonly SSO_BASE_URL = 'http://172.16.2.84:8080';

  /**
   * Access Token 검증
   */
  async verifyAccessToken(accessToken: string): Promise<boolean> {
    try {
      const deviceId = await deviceService.getDeviceId();
      const request: TokenCheckRequest = {
        accessToken,
        deviceId,
      };

      console.log('🔍 Token verification URL:', `${this.SSO_BASE_URL}/auth/check`);
      console.log('📱 Using Device ID:', deviceId);
      
      const response = await fetch(`${this.SSO_BASE_URL}/auth/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        timeout: 10000, // 10초 타임아웃
      });

      if (response.ok) {
        const data: TokenCheckResponse = await response.json();
        return data.success && data.data.valid;
      }

      return false;
    } catch (error) {
      console.error('🚨 Token verification network error:', {
        url: `${this.SSO_BASE_URL}/auth/check`,
        error: error.message,
        type: error.name
      });
      return false;
    }
  }

  /**
   * Refresh Token으로 새 Access Token 발급
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    try {
      const deviceId = await deviceService.getDeviceId();
      const request: RefreshTokenRequest = {
        refreshToken,
        deviceId,
      };

      console.log('🔄 Token refresh URL:', `${this.SSO_BASE_URL}/auth/refresh`);
      console.log('📱 Using Device ID:', deviceId);

      const response = await fetch(`${this.SSO_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        const data: RefreshTokenResponse = await response.json();

        if (data.success) {
          // 새 토큰들을 저장
          if (data.accessToken && data.refreshToken) {
            console.log('💾 Saving new tokens to storage');
            await storageService.setTokens(data.accessToken, data.refreshToken);
          } else {
            console.warn('⚠️ Token refresh successful but missing tokens in response');
          }

          // 사용자 정보도 업데이트
          if (data.user) {
            console.log('👤 Updating user info in storage:', data.user.email);
            await storageService.setUserInfo(JSON.stringify(data.user));
          } else {
            console.warn('⚠️ Token refresh successful but no user info in response');
          }

          return data.accessToken;
        } else {
          console.error('❌ Token refresh failed on server side');
          return null;
        }
      } else {
        console.error('🚨 Token refresh HTTP error:', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('🚨 Token refresh network error:', {
        url: `${this.SSO_BASE_URL}/auth/refresh`,
        error: error.message,
        type: error.name
      });
      return null;
    }
  }

  /**
   * 웹뷰 URL 생성 - 직접 라우트로 이동 (GET 방식)
   */
  async buildWebUrl(routePath: string, accessToken: string): Promise<string> {
    const baseUrl = 'http://172.16.2.84:3000'; // 웹 앱 IP URL
    const params = new URLSearchParams({
      token: accessToken,
      platform: 'mobile',
    });

    return `${baseUrl}${routePath}?${params.toString()}`;
  }

  /**
   * 웹뷰 POST 요청 데이터 생성
   */
  async buildWebPostData(routePath: string, accessToken: string) {
    const baseUrl = 'http://172.16.2.84:3000'; // 웹 앱 IP URL
    return {
      uri: `${baseUrl}${routePath}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `token=${encodeURIComponent(accessToken)}&platform=mobile`,
    };
  }

  /**
   * 로그인 처리
   */
  async login(id: string, password: string): Promise<{success: boolean; error?: string}> {
    try {
      const deviceInfo = await deviceService.getDeviceInfo();
      const result = await apiClient.login({
        id,
        password,
        deviceId: deviceInfo.deviceId,
        appVersion: deviceInfo.appVersion,
        platform: deviceInfo.platform === 'ios' ? 'iOS' : 'Android',
      });

      if (result.success) {
        // 토큰과 사용자 정보 저장
        console.log('✅ Login successful, saving tokens and user info');
        console.log('👤 User info:', { email: result.user.email, name: result.user.name, role: result.user.role });

        await storageService.setTokens(result.accessToken, result.refreshToken);
        await storageService.setUserInfo(JSON.stringify(result.user));

        console.log('💾 Tokens and user info saved to secure storage');
        return { success: true };
      } else {
        console.error('❌ Login failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: '로그인에 실패했습니다.' };
    }
  }

  /**
   * 로그아웃 처리
   */
  async logout(webViewRef?: React.RefObject<any>): Promise<void> {
    try {
      const accessToken = await storageService.getAccessToken();

      if (accessToken) {
        // 서버에 로그아웃 요청
        await fetch(`${this.SSO_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // 로컬 저장소 정리
      await this.clearAllStorages(webViewRef);
    }
  }

  /**
   * 앱 storage와 웹 쿠키 모두 정리
   */
  async clearAllStorages(webViewRef?: React.RefObject<any>): Promise<void> {
    try {
      console.log('🗑️ Clearing all storages (app + web cookies)');
      console.log('📋 webViewRef received:', !!webViewRef);
      console.log('📋 webViewRef.current exists:', !!(webViewRef && webViewRef.current));

      // 앱 storage 정리
      await storageService.clearAll();

      // WebView가 제공되면 쿠키 정리 메시지 전달
      if (webViewRef && webViewRef.current) {
        console.log('📱 Sending CLEAR_WEB_COOKIES message to WebView');
        webViewRef.current.postMessage(JSON.stringify({
          type: 'CLEAR_WEB_COOKIES'
        }));
      } else if (webViewRef) {
        // WebView가 아직 마운트되지 않은 경우 짧은 딜레이 후 재시도
        console.log('⏳ WebView not ready, retrying in 100ms...');
        setTimeout(() => {
          if (webViewRef.current) {
            console.log('📱 Sending CLEAR_WEB_COOKIES message to WebView (retry)');
            webViewRef.current.postMessage(JSON.stringify({
              type: 'CLEAR_WEB_COOKIES'
            }));
          } else {
            console.log('⚠️ WebView still not ready after retry - skipping web cookie clear');
          }
        }, 100);
      } else {
        console.log('ℹ️ WebView reference not provided - only clearing app storage');
      }
    } catch (error) {
      console.error('Failed to clear all storages:', error);
    }
  }

  /**
   * 현재 로그인 상태 확인
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const accessToken = await storageService.getAccessToken();
      
      if (!accessToken) {
        return false;
      }

      // 토큰 검증
      const isValid = await this.verifyAccessToken(accessToken);
      
      if (!isValid) {
        // 토큰이 만료된 경우 갱신 시도
        const refreshToken = await storageService.getRefreshToken();
        if (refreshToken) {
          const newAccessToken = await this.refreshAccessToken(refreshToken);
          return !!newAccessToken;
        }
        return false;
      }

      return true;
    } catch (error) {
      console.error('Login status check failed:', error);
      return false;
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<any> {
    try {
      const userInfoStr = await storageService.getUserInfo();
      if (userInfoStr) {
        return JSON.parse(userInfoStr);
      }
      return null;
    } catch (error) {
      console.error('Get current user failed:', error);
      return null;
    }
  }
}

export const authService = new AuthService();