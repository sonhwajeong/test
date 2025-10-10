import * as SecureStore from 'expo-secure-store';

class StorageService {
  private readonly ACCESS_TOKEN_KEY = 'myapp_access_token';
  private readonly REFRESH_TOKEN_KEY = 'myapp_refresh_token';
  private readonly USER_INFO_KEY = 'myapp_user_info';
  private readonly DEVICE_ID_KEY = 'myapp_device_id';

  // Access Token 저장/조회
  async setAccessToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save access token:', error);
      throw error;
    }
  }

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return null;
    }
  }

  // Refresh Token 저장/조회
  async setRefreshToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to save refresh token:', error);
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get refresh token:', error);
      return null;
    }
  }

  // 토큰 쌍으로 저장
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        this.setAccessToken(accessToken),
        this.setRefreshToken(refreshToken),
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  }

  // 사용자 정보 저장/조회
  async setUserInfo(userInfo: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.USER_INFO_KEY, userInfo);
    } catch (error) {
      console.error('Failed to save user info:', error);
      throw error;
    }
  }

  async getUserInfo(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.USER_INFO_KEY);
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // 토큰 삭제
  async clearAccessToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear access token:', error);
    }
  }

  async clearRefreshToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to clear refresh token:', error);
    }
  }

  async clearUserInfo(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.USER_INFO_KEY);
    } catch (error) {
      console.error('Failed to clear user info:', error);
    }
  }

  // 모든 데이터 삭제
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.clearAccessToken(),
        this.clearRefreshToken(),
        this.clearUserInfo(),
      ]);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  // 토큰 존재 여부 확인
  async hasTokens(): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();
      return !!(accessToken && refreshToken);
    } catch (error) {
      console.error('Failed to check tokens:', error);
      return false;
    }
  }

  // Device ID 저장/조회
  async setDeviceId(deviceId: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.DEVICE_ID_KEY, deviceId);
    } catch (error) {
      console.error('Failed to save device ID:', error);
      throw error;
    }
  }

  async getDeviceId(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.DEVICE_ID_KEY);
    } catch (error) {
      console.error('Failed to get device ID:', error);
      return null;
    }
  }

  async clearDeviceId(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(this.DEVICE_ID_KEY);
    } catch (error) {
      console.error('Failed to clear device ID:', error);
    }
  }
}

export const storageService = new StorageService();