import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storageService } from '../services/storage';
import { authService } from '../services/auth';

interface UserInfo {
  name: string;
  email: string;
  role: string;
}

export const MyPageScreen: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 탭이 포커스될 때마다 사용자 정보를 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log('마이페이지 탭 포커스: 사용자 정보 로드 시작');
      loadUserInfo();
    }, [])
  );

  const loadUserInfo = async () => {
    try {
      // 로그인 상태 확인 (토큰 유효성 검사 포함)
      const isLoggedInStatus = await authService.isLoggedIn();
      
      if (isLoggedInStatus) {
        // 로그인 상태면 사용자 정보 가져오기
        const user = await authService.getCurrentUser();
       //
         if (user) {
           setUserInfo(user);
          setIsLoggedIn(true);
           console.log('✅ 사용자 정보 로드 성공:', user.name);
         } else {
           console.log('⚠️  사용자 정보 없음');
           setIsLoggedIn(false);
           setUserInfo(null);
         }
      } else {
        console.log('❌ 로그인 상태 아님');
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    } catch (error) {
      console.error('❌ 사용자 정보 로드 실패:', error);
      setIsLoggedIn(false);
      setUserInfo(null);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              // authService를 통한 완전한 로그아웃 처리
              await authService.logout();
              setUserInfo(null);
              setIsLoggedIn(false);
              console.log('✅ 로그아웃 완료');
              Alert.alert('로그아웃', '로그아웃되었습니다.');
            } catch (error) {
              console.error('❌ 로그아웃 오류:', error);
              // 오류가 있어도 로컬 데이터는 정리
              await storageService.clearAll();
              setUserInfo(null);
              setIsLoggedIn(false);
              Alert.alert('로그아웃', '로그아웃되었습니다.');
            }
          },
        },
      ]
    );
  };

  const MenuButton: React.FC<{ title: string; onPress: () => void }> = ({ title, onPress }) => (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuButtonText}>{title}</Text>
      <Text style={styles.menuButtonArrow}>{'>'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* 페이지 제목 */}
      <View style={styles.titleSection}>
        <Text style={styles.pageTitle}>마이페이지</Text>
      </View>

      {/* 사용자 정보 섹션 */}
      <View style={styles.userSection}>
        {isLoggedIn && userInfo ? (
          <>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
            <Text style={styles.userRole}>역할: {userInfo.role}</Text>
          </>
        ) : (
          <>
            <Text style={styles.userName}>로그인이 필요합니다</Text>
            <Text style={styles.userEmail}>로그인 후 이용해 주세요</Text>
          </>
        )}
      </View>

      {/* 메뉴 섹션 */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>계정 관리</Text>
        
        <MenuButton
          title="프로필 수정"
          onPress={() => Alert.alert('프로필 수정', '프로필 수정 기능입니다.')}
        />
        
        <MenuButton
          title="비밀번호 변경"
          onPress={() => Alert.alert('비밀번호 변경', '비밀번호 변경 기능입니다.')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>설정</Text>
        
        <MenuButton
          title="알림 설정"
          onPress={() => Alert.alert('알림 설정', '알림 설정 기능입니다.')}
        />
        
        <MenuButton
          title="언어 설정"
          onPress={() => Alert.alert('언어 설정', '언어 설정 기능입니다.')}
        />
      </View>

      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>지원</Text>
        
        <MenuButton
          title="고객센터"
          onPress={() => Alert.alert('고객센터', '고객센터 기능입니다.')}
        />
        
        <MenuButton
          title="앱 정보"
          onPress={() => Alert.alert('앱 정보', 'MyApp v1.0.0')}
        />
      </View>

      {/* 로그아웃 버튼 */}
      {isLoggedIn && (
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>로그아웃</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  titleSection: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#888',
  },
  menuSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuButtonText: {
    fontSize: 16,
    color: '#333',
  },
  menuButtonArrow: {
    fontSize: 16,
    color: '#ccc',
  },
  logoutSection: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});