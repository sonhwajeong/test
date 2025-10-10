'use client'

import { useEffect, useState } from 'react'
import { getCurrentAccessToken } from '../../utils/auth'
import { Header } from '../../components/Header'

// CSS를 위한 스타일 태그 추가
const addHoverStyles = () => {
  if (typeof document !== 'undefined') {
    const styleId = 'home-page-styles'
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style')
      style.id = styleId
      style.textContent = `
        .clickable-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 8px 25px rgba(0,123,255,0.3);
        }
        .clickable-card:active {
          transform: translateY(-2px) scale(1.01);
        }
        .hero-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          animation: gradientShift 8s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          50% { background: linear-gradient(135deg, #764ba2 0%, #667eea 100%); }
        }
        .feature-icon {
          font-size: 48px;
          margin-bottom: 15px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
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

      {/* Hero Section */}
      <div className="hero-gradient" style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            특별한 혜택이 기다려요! 🎁
          </h1>
          <p style={styles.heroSubtitle}>
            매일 새로운 할인과 이벤트로 가득한 쇼핑몰에 오신 것을 환영합니다
          </p>
          <div className="shimmer" style={styles.heroStats}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>1,000+</div>
              <div style={styles.statLabel}>상품</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>99%</div>
              <div style={styles.statLabel}>만족도</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>서비스</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>🚀 인기 서비스</h2>

        <div style={styles.featuresGrid}>
          <div
            className="clickable-card"
            style={{...styles.card, ...styles.clickableCard, ...styles.primaryCard}}
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
            <div className="feature-icon">🌟</div>
            <h3 style={styles.cardTitle}>추천 상품</h3>
            <p style={styles.cardDescription}>AI가 선별한 오늘의 인기 상품을 확인해보세요!</p>
            <div style={styles.cardAction}>
              <span style={{...styles.actionText, color: '#007bff'}}>상품 보러가기 →</span>
            </div>
          </div>

          <div
            className="clickable-card"
            style={{...styles.card, ...styles.clickableCard, ...styles.secondaryCard}}
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
            <div className="feature-icon">📰</div>
            <h3 style={styles.cardTitle}>새로운 소식</h3>
            <p style={styles.cardDescription}>최신 업데이트와 특별 이벤트 정보를 놓치지 마세요</p>
            <div style={styles.cardAction}>
              <span style={{...styles.actionText, color: '#28a745'}}>소식 보러가기 →</span>
            </div>
          </div>

          <div
            className="clickable-card"
            style={{...styles.card, ...styles.clickableCard, ...styles.accentCard}}
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
            <div className="feature-icon">⚡</div>
            <h3 style={styles.cardTitle}>특별 할인</h3>
            <p style={styles.cardDescription}>한정 시간 특가 상품들을 만나보세요</p>
            <div style={styles.cardAction}>
              <span style={{...styles.actionText, color: '#dc3545'}}>할인 상품 보기 →</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h3 style={styles.quickTitle}>⚡ 빠른 접근</h3>
          <div style={styles.quickGrid}>
            <div className="clickable-card" style={styles.quickCard} onClick={() => {
              if (typeof window !== 'undefined') {
                if ((window as any).ReactNativeWebView) {
                  window.location.href = '/cart'
                } else {
                  window.open('/cart', '_blank')
                }
              }
            }}>
              <div style={styles.quickIcon}>🛒</div>
              <span style={styles.quickLabel}>장바구니</span>
            </div>
            <div className="clickable-card" style={styles.quickCard}>
              <div style={styles.quickIcon}>❤️</div>
              <span style={styles.quickLabel}>찜목록</span>
            </div>
            <div className="clickable-card" style={styles.quickCard}>
              <div style={styles.quickIcon}>🎁</div>
              <span style={styles.quickLabel}>쿠폰함</span>
            </div>
            <div className="clickable-card" style={styles.quickCard}>
              <div style={styles.quickIcon}>📞</div>
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
    height: '100vh',
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  heroSection: {
    padding: '60px 20px',
    textAlign: 'center' as const,
    color: 'white',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  heroSubtitle: {
    fontSize: '20px',
    margin: '0 0 40px 0',
    opacity: 0.9,
    lineHeight: '1.5',
  },
  heroStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '40px',
    padding: '20px',
    borderRadius: '15px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
  statItem: {
    textAlign: 'center' as const,
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.8,
  },
  content: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 20px',
    flex: 1,
    overflowY: 'auto' as const,
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: '#333',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '30px',
    marginBottom: '60px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    border: '1px solid #e9ecef',
  },
  clickableCard: {
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  primaryCard: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  },
  secondaryCard: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
  },
  accentCard: {
    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    color: 'white',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  cardDescription: {
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '20px',
    opacity: 0.9,
  },
  cardAction: {
    marginTop: '20px',
    padding: '12px 0',
  },
  actionText: {
    fontWeight: 'bold',
    fontSize: '16px',
    textDecoration: 'underline',
  },
  quickActions: {
    textAlign: 'center' as const,
  },
  quickTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '30px',
    color: '#333',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  quickCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
  },
  quickIcon: {
    fontSize: '32px',
  },
  quickLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
}