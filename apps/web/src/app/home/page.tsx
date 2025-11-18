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
        .feature-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
        }
        .quick-action:hover {
          background-color: #f8f9fa;
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
        <div style={styles.welcomeSection}>
          <h1 style={styles.welcomeTitle}>안녕하세요</h1>
          <p style={styles.welcomeSubtitle}>오늘은 무엇을 도와드릴까요?</p>
        </div>

        <div style={styles.featuresSection}>
          <div
            className="feature-card"
            style={styles.featureCard}
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
            <div style={styles.featureIcon}>✨</div>
            <div style={styles.featureContent}>
              <h3 style={styles.featureTitle}>추천 상품</h3>
              <p style={styles.featureDesc}>엄선된 상품을 만나보세요</p>
            </div>
          </div>

          <div
            className="feature-card"
            style={styles.featureCard}
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
            <div style={styles.featureIcon}>📢</div>
            <div style={styles.featureContent}>
              <h3 style={styles.featureTitle}>새로운 소식</h3>
              <p style={styles.featureDesc}>최신 이벤트와 공지사항</p>
            </div>
          </div>

          <div
            className="feature-card"
            style={styles.featureCard}
            onClick={() => {
              if (typeof window !== 'undefined') {
                if ((window as any).ReactNativeWebView) {
                  window.location.href = '/contract'
                } else {
                  window.open('/contract', '_blank')
                }
              }
            }}
          >
            <div style={styles.featureIcon}>📝</div>
            <div style={styles.featureContent}>
              <h3 style={styles.featureTitle}>근로계약서</h3>
              <p style={styles.featureDesc}>근로계약서 작성 및 서명</p>
            </div>
          </div>
        </div>

        <div style={styles.quickSection}>
          <h2 style={styles.sectionTitle}>빠른 메뉴</h2>
          <div style={styles.quickGrid}>
            <div
              className="quick-action"
              style={styles.quickAction}
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
              <div style={styles.quickIcon}>🛒</div>
              <span style={styles.quickLabel}>장바구니</span>
            </div>

            <div className="quick-action" style={styles.quickAction}>
              <div style={styles.quickIcon}>❤️</div>
              <span style={styles.quickLabel}>찜목록</span>
            </div>

            <div className="quick-action" style={styles.quickAction}>
              <div style={styles.quickIcon}>🎟️</div>
              <span style={styles.quickLabel}>쿠폰</span>
            </div>

            <div className="quick-action" style={styles.quickAction}>
              <div style={styles.quickIcon}>💬</div>
              <span style={styles.quickLabel}>고객센터</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 20px',
    flex: 1,
  },
  welcomeSection: {
    marginBottom: '40px',
  },
  welcomeTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#6c757d',
    fontWeight: '400',
    margin: 0,
  },
  featuresSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '48px',
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    cursor: 'pointer',
    border: '1px solid #e9ecef',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    fontSize: '40px',
    flexShrink: 0,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#212529',
    margin: '0 0 6px 0',
  },
  featureDesc: {
    fontSize: '14px',
    color: '#6c757d',
    margin: 0,
    lineHeight: '1.4',
  },
  quickSection: {
    marginTop: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#495057',
    marginBottom: '20px',
    letterSpacing: '-0.3px',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  },
  quickAction: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    border: '1px solid #e9ecef',
    transition: 'all 0.2s ease',
  },
  quickIcon: {
    fontSize: '28px',
  },
  quickLabel: {
    fontSize: '13px',
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center' as const,
  },
}