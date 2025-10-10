import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { storageService } from './storage';

class DeviceService {
  private deviceId: string | null = null;
  private readonly DEVICE_ID_KEY = 'myapp_device_id';

  /**
   * 고유한 Device ID 생성 및 조회
   */
  async getDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId;
    }

    // 먼저 저장된 Device ID가 있는지 확인
    const savedDeviceId = await storageService.getDeviceId();
    if (savedDeviceId) {
      this.deviceId = savedDeviceId;
      return savedDeviceId;
    }

    // 새로운 Device ID 생성
    try {
      // Expo를 사용한 기기 정보 수집
      const brand = Device.brand || 'Unknown';
      const model = Device.modelName || Device.modelId || 'Unknown';
      const systemVersion = Device.osVersion || 'Unknown';
      
      // 고유 ID 생성 (Constants.sessionId 또는 fallback)
      const uniqueId = Constants.sessionId || 
                      Application.androidId || 
                      Constants.installationId || 
                      Math.random().toString(36).substr(2, 12);
      
      // 플랫폼과 기기 정보를 조합한 고유 ID 생성
      const deviceId = `${Platform.OS}-${uniqueId}-${brand}-${model}`.toLowerCase().replace(/\s+/g, '-');
      
      // Device ID 저장
      await storageService.setDeviceId(deviceId);
      this.deviceId = deviceId;
      
      console.log('🔧 New Device ID generated:', {
        deviceId,
        platform: Platform.OS,
        brand,
        model,
        systemVersion,
        uniqueId: uniqueId.substring(0, 8) + '...'
      });
      
      return deviceId;
    } catch (error) {
      console.error('Failed to generate device ID:', error);
      
      // 폴백: 타임스탬프 기반 ID 생성
      const fallbackId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await storageService.setDeviceId(fallbackId);
      this.deviceId = fallbackId;
      
      return fallbackId;
    }
  }

  /**
   * Device 정보 조회
   */
  async getDeviceInfo() {
    try {
      const deviceId = await this.getDeviceId();
      const brand = Device.brand || 'Unknown';
      const model = Device.modelName || Device.modelId || 'Unknown';
      const systemVersion = Device.osVersion || 'Unknown';
      const appVersion = Application.nativeApplicationVersion || Constants.expoConfig?.version || '1.0.0';
      
      return {
        deviceId,
        platform: Platform.OS,
        brand,
        model,
        systemVersion,
        appVersion
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        deviceId: await this.getDeviceId(),
        platform: Platform.OS,
        brand: 'Unknown',
        model: 'Unknown',
        systemVersion: 'Unknown',
        appVersion: '1.0.0'
      };
    }
  }

  /**
   * Device ID 초기화 (개발용)
   */
  async resetDeviceId(): Promise<void> {
    try {
      await storageService.clearDeviceId();
      this.deviceId = null;
      console.log('Device ID reset completed');
    } catch (error) {
      console.error('Failed to reset device ID:', error);
    }
  }
}

export const deviceService = new DeviceService();