'use client'

import { useEffect, useState } from 'react'
import { getCurrentAccessToken } from '../../utils/auth'
import { Header } from '../../components/Header'

const addHoverStyles = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'home-page-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .menu-item:hover {
          background-color: #f5f5f5;
        }
      `
      document.head.appendChild(style)
    }
  }
}

export default function HomePage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)

  useEffect(() => {
    // 호버 스타일 추가
    addHoverStyles()

    // 쿠키와 WebView 컨텍스트 확인
    if (typeof window !== 'undefined') {
      const hasReactNativeWebView = !!(window as any).ReactNativeWebView;
      const hasGetAppToken = !!(window as any).getAppToken;

      setIsAppContext(hasReactNativeWebView || hasGetAppToken);

      // 쿠키에서 토큰 가져오기
      const cookieToken = getCurrentAccessToken();
      if (cookieToken) {
        setToken(cookieToken);
      } else if ((window as any).getAppToken) {
        // WebView 환경에서 토큰이 없으면 앱에서 가져오기 시도
        const loadToken = async () => {
          try {
            const appToken = await (window as any).getAppToken();
            if (appToken) {
              setToken(appToken);
            }
          } catch (error) {
            console.error('Failed to get token from app:', error);
          }
        };
        loadToken();
      }

      console.log('🏠 Home page loaded:', {
        isWebView: hasReactNativeWebView,
        hasCookieToken: !!cookieToken,
        hasAppTokenFunction: hasGetAppToken
      });
    }

  }, [])

  return (
    <div style={styles.container}>
      <Header />

      <div style={styles.content}>
        <h1 style={styles.title}>홈</h1>

        <div style={styles.menuList}>
          <div
            className="menu-item"
            style={styles.menuItem}
            onClick={() => {
              if (typeof window !== 'undefined') {
                if ((window as any).ReactNativeWebView) {
                  window.location.href = '/recommended'
                } else {
                  window.open('/recommended', '_blank')
                }
              }
            }}
          >
            <span style={styles.menuText}>추천 상품</span>
          </div>

          <div
            className="menu-item"
            style={styles.menuItem}
            onClick={() => {
              if (typeof window !== 'undefined') {
                if ((window as any).ReactNativeWebView) {
                  window.location.href = '/news'
                } else {
                  window.open('/news', '_blank')
                }
              }
            }}
          >
            <span style={styles.menuText}>새로운 소식</span>
          </div>

          <div
            className="menu-item"
            style={styles.menuItem}
            onClick={() => {
              if (typeof window !== 'undefined') {
                if ((window as any).ReactNativeWebView) {
                  window.location.href = '/cart'
                } else {
                  window.open('/cart', '_blank')
                }
              }
            }}
          >
            <span style={styles.menuText}>장바구니</span>
          </div>

          <div className="menu-item" style={styles.menuItem}>
            <span style={styles.menuText}>찜목록</span>
          </div>

          <div className="menu-item" style={styles.menuItem}>
            <span style={styles.menuText}>쿠폰</span>
          </div>

          <div className="menu-item" style={styles.menuItem}>
            <span style={styles.menuText}>고객센터</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 16px',
    flex: 1,
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid #e5e5e5',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1px',
    backgroundColor: '#e5e5e5',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  menuText: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '400',
  },
}