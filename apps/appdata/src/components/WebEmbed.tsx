import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { authService } from '../services/auth';
import { storageService } from '../services/storage';
import * as Location from 'expo-location';

interface WebEmbedProps {
  routePath: string;
  style?: any;
  usePostMethod?: boolean; // POST 방식 사용 여부
}

export const WebEmbed: React.FC<WebEmbedProps> = ({ routePath, style, usePostMethod = false }) => {
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();
  const [webViewUrl, setWebViewUrl] = useState<string>('');
  const [webViewSource, setWebViewSource] = useState<any>(null);
  const [injectedJS, setInjectedJS] = useState<string>('');
  const [currentRoutePath, setCurrentRoutePath] = useState<string>(routePath);

  // 탭이 포커스될 때마다 SSO 체크 실행
  useFocusEffect(
    useCallback(() => {
      console.log(`${routePath} 탭 포커스: 강제 페이지 이동 시작`);

      // WebView URL을 초기화하여 새로운 페이지 로드
      setWebViewUrl('');
      setWebViewSource(null);

      // 현재 경로 업데이트
      setCurrentRoutePath(routePath);

      // 약간의 지연 후 초기화 실행하여 해당 경로로 강제 이동
      setTimeout(() => {
        initializeWebView();
      }, 100);
    }, [routePath])
  );

  const initializeWebView = async () => {
    try {
      // SSO 체크: access token 존재 여부 확인
      const accessToken = await storageService.getAccessToken();
      console.log('✅ token start!!!');
      
      if (accessToken) {
        console.log('✅accessToken is exist!!!');
        // 토큰이 존재하면 검증
        const isValid = await authService.verifyAccessToken(accessToken);
        console.log('isValid : ' + isValid);
        if (isValid) {
          // 유효한 토큰이면 해당 페이지로 직접 이동 (쿠키 기반)
          console.log(`✅ Valid token, loading page: ${routePath}`);
          setWebViewUrl(`http://172.16.2.84:3000${routePath}`);
          return;
        } else {
          // 만료된 토큰이면 refresh 시도
          console.log('refresh 시도  ' );
          const refreshToken = await storageService.getRefreshToken();

          console.log('refreshToken :  ' + refreshToken);

          if (refreshToken) {
            const newAccessToken = await authService.refreshAccessToken(refreshToken);
            console.log('newAccessToken :  ' + newAccessToken);
            if (newAccessToken) {
              console.log(`✅ Token refreshed, loading page: ${routePath}`);
              setWebViewUrl(`http://172.16.2.84:3000${routePath}`);
              return;
            } else {
              console.log('❌ Token refresh failed, clearing all storages');
              await authService.clearAllStorages(webViewRef);
            }
          } else {
            console.log('❌ No refresh token, clearing all storages');
            await authService.clearAllStorages(webViewRef);
          }
        }
      } else {
        console.log('accessToken is not exist   ');
        await authService.clearAllStorages(); // webViewRef 제거
      }

      // 토큰이 없거나 갱신 실패시 로그인 페이지로 리디렉션 (쿠키 정리 플래그 추가)
      setWebViewUrl(`http://172.16.2.84:3000/login?clearCookies=true&redirect=${encodeURIComponent(routePath)}`);
    } catch (error) {
      console.error('WebEmbed initialization error:', error);
      // storage 오류 발생시에도 로그인 페이지로
      setWebViewUrl(`http://172.16.2.84:3000/login?redirect=${encodeURIComponent(routePath)}`);
    }
  };

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'LOGIN_SUCCESS') {
        console.log('🎉 WebView LOGIN_SUCCESS received:', {
          hasAccessToken: !!data.accessToken,
          hasRefreshToken: !!data.refreshToken,
          hasUser: !!data.user,
          userEmail: data.user?.email
        });

        // 웹에서 로그인 성공시 토큰과 사용자 정보를 받아서 저장
        await storageService.setTokens(data.accessToken, data.refreshToken);

        // 사용자 정보도 저장
        if (data.user) {
          console.log('👤 Saving user info from WebView:', data.user);
          await storageService.setUserInfo(JSON.stringify(data.user));
        } else {
          console.warn('⚠️ LOGIN_SUCCESS received but no user info provided');
        }

        // 저장된 데이터 즉시 확인
        const savedAccessToken = await storageService.getAccessToken();
        const savedRefreshToken = await storageService.getRefreshToken();
        const savedUserInfo = await storageService.getUserInfo();

        console.log('💾 Data saved to storage:', {
          hasAccessToken: !!savedAccessToken,
          hasRefreshToken: !!savedRefreshToken,
          hasUserInfo: !!savedUserInfo
        });

        // 로그인 성공 후 원래 요청한 페이지로 리디렉션
        console.log(`🎉 Login success, redirecting to: ${routePath}`);
        setWebViewUrl(`http://172.16.2.84:3000${routePath}`);
      } else if (data.type === 'TOKEN_REFRESH_REQUEST') {
        console.log('🔄 WebView TOKEN_REFRESH_REQUEST received');

        // 앱의 refresh token으로 새 access token 발급
        const refreshToken = await storageService.getRefreshToken();
        if (refreshToken) {
          const newAccessToken = await authService.refreshAccessToken(refreshToken);

          if (newAccessToken) {
            console.log('✅ Token refresh successful, sending to WebView');

            // 웹뷰에 새 토큰 전달 - JavaScript 함수 직접 실행 방식 사용
            const tokenSuccessScript = `
              (function() {
                const tokenData = {
                  type: 'TOKEN_REFRESH_SUCCESS',
                  accessToken: '${newAccessToken}'
                };
                console.log('✅ 앱에서 웹으로 토큰 갱신 성공 전달');

                if (window.handleTokenRefreshResponse) {
                  window.handleTokenRefreshResponse(tokenData);
                } else {
                  console.warn('⚠️ handleTokenRefreshResponse 함수가 없음');
                }
              })();
              true;
            `;

            console.log('💉 토큰 성공 JavaScript 주입');
            webViewRef.current?.injectJavaScript(tokenSuccessScript);
          } else {
            console.log('❌ Token refresh failed, sending failure to WebView');

            // 앱 storage와 웹 쿠키 모두 정리
            await authService.clearAllStorages(webViewRef);

            // 웹뷰에 실패 알림 - JavaScript 함수 직접 실행 방식 사용
            const tokenFailScript = `
              (function() {
                const tokenData = {
                  type: 'TOKEN_REFRESH_FAILED'
                };
                console.log('❌ 앱에서 웹으로 토큰 갱신 실패 전달');

                if (window.handleTokenRefreshResponse) {
                  window.handleTokenRefreshResponse(tokenData);
                } else {
                  console.warn('⚠️ handleTokenRefreshResponse 함수가 없음');
                }
              })();
              true;
            `;

            console.log('💉 토큰 실패 JavaScript 주입');
            webViewRef.current?.injectJavaScript(tokenFailScript);
          }
        } else {
          console.log('❌ No refresh token in app, sending failure to WebView');

          // 앱 storage와 웹 쿠키 모두 정리
          await authService.clearAllStorages(webViewRef);

          // 웹뷰에 실패 알림 - JavaScript 함수 직접 실행 방식 사용
          const tokenNoRefreshScript = `
            (function() {
              const tokenData = {
                type: 'TOKEN_REFRESH_FAILED'
              };
              console.log('❌ 앱에서 웹으로 토큰 갱신 실패 전달 (refresh token 없음)');

              if (window.handleTokenRefreshResponse) {
                window.handleTokenRefreshResponse(tokenData);
              } else {
                console.warn('⚠️ handleTokenRefreshResponse 함수가 없음');
              }
            })();
            true;
          `;

          console.log('💉 토큰 실패 JavaScript 주입 (refresh token 없음)');
          webViewRef.current?.injectJavaScript(tokenNoRefreshScript);
        }
      } else if (data.type === 'ADD_TO_CART_SUCCESS') {
        // 장바구니 추가 성공 메시지 처리 - 웹에서 모달로 처리하므로 앱에서는 로그만
        console.log('🛒 Cart item added:', data.productName, 'quantity:', data.quantity);
      } else if (data.type === 'SIGNATURE_COMPLETED') {
        // 서명 완료 메시지 처리
        console.log('✍️ Signature completed:', {
          hasSignature: !!data.signature,
          cartItems: data.cartData?.totalCount || 0,
          totalPrice: data.cartData?.totalPrice || 0
        });

        // 서명 데이터를 앱의 로컬 스토리지나 서버에 저장하는 로직을 추가할 수 있습니다
        if (data.signature) {
          // 예: 서명 이미지를 파일로 저장하거나 서버에 업로드
          console.log('서명 이미지 데이터 길이:', data.signature.length);
        }
      } else if (data.type === 'CHECKOUT_REQUEST') {
        // 웹에서 결제하기 버튼 클릭시 네이티브 서명 화면으로 이동
        console.log('🛒 결제 요청 받음:', data.cartData);

        // React Navigation 사용하여 서명 화면으로 이동
        if (navigation) {
          navigation.navigate('Signature' as never, {
            cartData: data.cartData
          } as never);
        } else {
          console.warn('⚠️ Navigation 객체가 없어서 서명 화면으로 이동할 수 없음');
        }
      } else if (data.type === 'GET_LOCATION_REQUEST') {
        // 웹에서 위치 정보 요청이 왔을 때 처리
        console.log('📍 웹에서 위치 정보 요청 받음');
        handleLocationRequest();
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  };

  const handleLocationRequest = async () => {
    try {
      console.log('📱 앱에서 위치 정보 가져오기 시작');

      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('❌ 위치 권한이 거부됨');
        // 웹으로 권한 오류 전달 - JavaScript 함수 직접 실행 방식 사용
        const permissionErrorScript = `
          (function() {
            const errorData = {
              message: '위치 권한이 허용되지 않았습니다.',
              code: 'PERMISSION_DENIED'
            };
            console.error('❌ 앱에서 웹으로 권한 오류 전달:', errorData);

            if (window.onLocationError) {
              window.onLocationError(errorData);
            } else {
              console.warn('⚠️ onLocationError 콜백이 설정되지 않음');
            }
          })();
          true;
        `;

        console.log('💉 권한 오류 JavaScript 주입:', permissionErrorScript);
        webViewRef.current?.injectJavaScript(permissionErrorScript);
        return;
      }

      // 현재 위치 가져오기 (구글 위치 서비스 사용)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
        maximumAge: 180000, // 3분간 캐시 사용
      });

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
        source: 'google-location-services'
      };

      console.log('✅ 앱에서 위치 정보 획득:', locationData);

      // Alert로 앱에서 획득한 위치 정보 표시
    
      // 웹으로 위치 정보 전달 - JavaScript 함수 직접 실행 방식 사용
      const locationScript = `
        (function() {
          const locationData = ${JSON.stringify(locationData)};
          console.log('📍 앱에서 웹으로 위치 정보 전달:', locationData);

          if (window.onLocationReceived) {
            window.onLocationReceived(locationData);
          } else {
            console.warn('⚠️ onLocationReceived 콜백이 설정되지 않음');
          }
        })();
        true;
      `;

      console.log('💉 위치 정보 JavaScript 주입:', locationScript);
      webViewRef.current?.injectJavaScript(locationScript);

    } catch (error) {
      console.error('❌ 앱에서 위치 정보 가져오기 실패:', error);

      // 웹으로 위치 오류 전달 - JavaScript 함수 직접 실행 방식 사용
      const errorScript = `
        (function() {
          const errorData = {
            message: '${error.message || '위치 정보를 가져올 수 없습니다.'}',
            code: 'LOCATION_ERROR'
          };
          console.error('❌ 앱에서 웹으로 위치 오류 전달:', errorData);

          if (window.onLocationError) {
            window.onLocationError(errorData);
          } else {
            console.warn('⚠️ onLocationError 콜백이 설정되지 않음');
          }
        })();
        true;
      `;

      console.log('💉 위치 오류 JavaScript 주입:', errorScript);
      webViewRef.current?.injectJavaScript(errorScript);
    }
  };

  const getInjectedJavaScript = async () => {
    return `
      // 쿠키 관리 함수들
      function getCookie(name) {
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

      function setCookie(name, value, options = {}) {
        let cookieString = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        if (options.expires) {
          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + options.expires * 24 * 60 * 60 * 1000);
          cookieString += '; expires=' + expirationDate.toUTCString();
        }
        if (options.path) {
          cookieString += '; path=' + options.path;
        }
        document.cookie = cookieString;
      }

      // 웹에서 앱으로 메시지를 보내는 함수 추가
      window.postMessageToApp = function(data) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
      };

      // WebView에서는 웹의 쿠키에서만 토큰 가져오기
      const cookieToken = getCookie('myapp_access_token');
      window.APP_ACCESS_TOKEN = cookieToken || '';


      // URL 파라미터에서 clearCookies 확인
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('clearCookies') === 'true') {

        window.clearWebCookies();
      }

      // 🔧 React Native WebView 메시지 수신을 위한 전역 함수 설정
      window.handleWebViewMessage = function(messageData) {
        console.log('📱 WebView 메시지 수신:', messageData);

        if (messageData.type === 'TOKEN_REFRESH_SUCCESS' || messageData.type === 'TOKEN_REFRESH_FAILED') {
          window.handleTokenRefreshResponse(messageData);
        } else if (messageData.type === 'CLEAR_WEB_COOKIES') {
          window.clearWebCookies();
        } else if (messageData.type === 'LOCATION_SUCCESS') {
          console.log('✅ 위치 정보 수신:', messageData.location);
          if (window.onLocationReceived) {
            window.onLocationReceived(messageData.location);
          }
        } else if (messageData.type === 'LOCATION_ERROR') {
          console.error('❌ 위치 정보 오류:', messageData.error);
          if (window.onLocationError) {
            window.onLocationError(messageData.error);
          }
        }
      };

      // 앱으로부터 토큰 갱신 응답 처리
      window.handleTokenRefreshResponse = function(response) {
        if (response.type === 'TOKEN_REFRESH_SUCCESS') {
          console.log('✅ Received new token from app');
          // 새 토큰을 쿠키에 저장
          setCookie('myapp_access_token', response.accessToken, { expires: 7, path: '/' });
          window.APP_ACCESS_TOKEN = response.accessToken;

          // 토큰 갱신 성공 이벤트 발생
          if (window.onTokenRefreshed) {
            window.onTokenRefreshed(response.accessToken);
          }
        } else if (response.type === 'TOKEN_REFRESH_FAILED') {
          console.log('❌ Token refresh failed, clearing cookies');
          // 쿠키 정리
          window.clearWebCookies();

          // 로그인 페이지로 리다이렉트
          if (window.onTokenRefreshFailed) {
            window.onTokenRefreshFailed();
          } else {
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          }
        }
      };

      // 🔧 웹 쿠키 정리 함수 - 서버 사이드 API 사용으로 더 안전하게 처리
      window.clearWebCookies = async function() {
        console.log('🗑️ Clearing all web cookies');
        
        try {
          // 1. 서버 사이드 쿠키 정리 API 호출 시도
          const response = await fetch('/api/clear-cookies', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (response.ok) {
            console.log('✅ Server-side cookie clearing successful');
          } else {
            console.log('⚠️ Server-side clearing failed, using client-side fallback');
            throw new Error('Server clearing failed');
          }
        } catch (serverError) {
          console.log('Server cookie clearing error:', serverError);
          
          // 2. 클라이언트 사이드 폴백 처리
          try {
            // 개별 쿠키 삭제
            setCookie('myapp_access_token', '', { expires: -1, path: '/' });
            setCookie('myapp_refresh_token', '', { expires: -1, path: '/' });
            setCookie('myapp_user_info', '', { expires: -1, path: '/' });
            
            // 모든 쿠키 삭제 (추가 안전 장치)
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            
            console.log('✅ Client-side cookie clearing completed');
          } catch (clientError) {
            console.log('Client cookie clearing error:', clientError);
          }
        }
        
        // 3. 로컬 스토리지도 정리
        if (typeof(Storage) !== "undefined") {
          try {
            localStorage.clear();
            sessionStorage.clear();
            console.log('✅ Storage clearing completed');
          } catch (storageError) {
            console.log('Storage clearing error:', storageError);
          }
        }
        
        window.APP_ACCESS_TOKEN = '';
        
        // 4. 페이지 새로고침으로 세션 초기화
        setTimeout(() => {
          window.location.reload();
        }, 100);
      };

      // 앱에서 위치 정보를 가져오는 함수 추가
      window.getAppLocation = async function() {
        console.log('📱 앱에서 위치 정보 요청');

        return new Promise((resolve, reject) => {
          // 앱에 위치 정보 요청
          window.postMessageToApp({
            type: 'GET_LOCATION_REQUEST'
          });

          // 응답 처리 함수 설정
          window.onLocationReceived = function(locationData) {
            console.log('✅ 앱에서 위치 정보 수신:', locationData);
            resolve(locationData);
          };

          window.onLocationError = function(error) {
            console.error('❌ 앱에서 위치 정보 가져오기 실패:', error);
            reject(error);
          };

          // 10초 타임아웃
          setTimeout(() => {
            console.warn('⏰ 앱 위치 정보 요청 타임아웃');
            reject(new Error('Location request timeout'));
          }, 10000);
        });
      };

      // 📱 React Native WebView에서 오는 메시지를 처리하기 위해 document에 이벤트 리스너 추가
      // (일반 window.addEventListener('message')로는 React Native postMessage를 받을 수 없음)
      document.addEventListener('message', function(event) {
        try {
          console.log('📨 Document message received:', event);
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          window.handleWebViewMessage(data);
        } catch (error) {
          console.log('Document message parsing error:', error);
        }
      });

      // 추가로 window 이벤트도 시도 (안전장치)
      window.addEventListener('message', function(event) {
        try {
          console.log('📨 Window message received:', event);
          const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
          window.handleWebViewMessage(data);
        } catch (error) {
          console.log('Window message parsing error:', error);
        }
      });

      // 웹 페이지에서 API 호출시 사용할 토큰 제공 함수 (쿠키에서, 만료시 자동 갱신)
      window.getAppToken = async function() {
        const cookieToken = getCookie('myapp_access_token');
        console.log('🍪 getAppToken called, cookie token:', cookieToken ? 'found' : 'not found');

        if (!cookieToken) {
          console.log('🔄 No token in cookie, requesting refresh from app');
          // 앱에 토큰 갱신 요청
          window.postMessageToApp({
            type: 'TOKEN_REFRESH_REQUEST'
          });

          // 토큰 갱신 응답을 기다림 (Promise로 처리)
          return new Promise((resolve) => {
            window.onTokenRefreshed = function(newToken) {
              resolve(newToken);
            };
            window.onTokenRefreshFailed = function() {
              resolve(null);
            };

            // 5초 타임아웃
            setTimeout(() => {
              resolve(null);
            }, 5000);
          });
        }

        return cookieToken;
      };

      // 로그인 성공시 호출될 함수 (웹 쿠키에만 저장)
      window.onLoginSuccess = function(accessToken, refreshToken, user) {
        window.APP_ACCESS_TOKEN = accessToken;

        // 웹 쿠키에 저장
        setCookie('myapp_access_token', accessToken, { expires: 7, path: '/' });
        setCookie('myapp_refresh_token', refreshToken, { expires: 7, path: '/' });
        setCookie('myapp_user_info', JSON.stringify(user), { expires: 7, path: '/' });

        console.log('🍪 Tokens saved to web cookies after login');

        // 앱으로는 정보만 전달 (앱이 자체 storage에 저장하도록)
        window.postMessageToApp({
          type: 'LOGIN_SUCCESS',
          accessToken: accessToken,
          refreshToken: refreshToken,
          user: user
        });
      };

      true;
    `;
  };

  useEffect(() => {
    const loadInjectedJS = async () => {
      const js = await getInjectedJavaScript();
      setInjectedJS(js);
    };
    loadInjectedJS();
  }, []);

  if (!webViewUrl || !injectedJS) {
    console.log('WebView not ready:', { webViewUrl: !!webViewUrl, injectedJS: !!injectedJS });
    return <View style={[styles.container, style]} />;
  }

  // WebView source 결정 (GET 방식 URL만 사용)
  const source = { uri: webViewUrl };

  return (
    <View style={[styles.container, style]}>
      <WebView
        key={`webview-${routePath}-${Date.now()}`}
        ref={webViewRef}
        source={source}
        onMessage={handleMessage}
        injectedJavaScript={injectedJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        bounces={false}
        bouncesZoom={false}
        minimumZoomScale={1.0}
        maximumZoomScale={1.0}
        zoomScale={1.0}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // 🔧 쿠키 및 권한 관련 설정 추가
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        allowsProtectedMedia={true}
        allowsFullscreenVideo={true}
        allowsLinkPreview={false}
        cacheEnabled={true}
        incognito={false}
        // 🔧 Android 전용 설정
        mixedContentMode="compatibility"
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        // 🔧 iOS 전용 설정
        allowsBackForwardNavigationGestures={false}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});