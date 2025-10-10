'use client';

import React, { useState } from 'react';

interface HeaderProps {
  showBackButton?: boolean;
  backUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  showBackButton = false,
  backUrl = '/home'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색 로직 구현 (추후 확장 가능)
      console.log('검색어:', searchQuery);
      alert(`"${searchQuery}" 검색 기능은 준비중입니다.`);
    }
  };

  const handleBackClick = () => {
    if (typeof window !== 'undefined') {
      if ((window as any).ReactNativeWebView) {
        // 앱 내에서는 페이지 이동
        window.location.href = backUrl;
      } else {
        // 웹에서는 새 창으로 열기
        window.open(backUrl, '_blank');
      }
    }
  };

  return (
    <header style={styles.header} suppressHydrationWarning={true}>
      <div style={styles.headerContent}>
        {/* 좌측: 뒤로가기 버튼 (조건부) */}
        {showBackButton && (
          <div style={styles.leftSection}>
            <button
              onClick={handleBackClick}
              style={styles.backButton}
              suppressHydrationWarning={true}
            >
              {isMobile ? '←' : '← 홈으로'}
            </button>
          </div>
        )}

        {/* 검색 영역 */}
        <div style={showBackButton ? styles.centerSection : styles.centerSectionFull}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div
              style={{
                ...styles.searchContainer,
                ...(isSearchFocused || searchQuery ? {
                  boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.5), 0 4px 8px rgba(0,0,0,0.15)'
                } : {})
              }}
            >
              <input
                type="text"
                placeholder="상품, 소식을 검색해보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                style={styles.searchInput}
              />
              <button
                type="submit"
                style={{
                  ...styles.searchButton,
                  ...(searchQuery ? { color: '#007bff', fontWeight: 'bold' } : {})
                }}
              >
                🔍
              </button>
            </div>
          </form>
        </div>

      </div>
    </header>
  );
};

const styles = {
  header: {
    backgroundColor: '#007bff',
    paddingTop: '40px',
    paddingBottom: '12px',
    paddingLeft: '0',
    paddingRight: '0',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '15px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  leftSection: {
    flexShrink: 0,
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '8px 12px',
    borderRadius: '20px',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  centerSection: {
    flex: 1,
    minWidth: 0,
    marginLeft: '5px',
    maxWidth: '300px',
  },
  centerSectionFull: {
    flex: 1,
    minWidth: 0,
    margin: '0 20px',
    maxWidth: '400px',
  },
  searchForm: {
    width: '100%',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '20px',
    border: 'none',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
    height: '36px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '0 18px',
    fontSize: '14px',
    backgroundColor: 'transparent',
    color: '#333',
    height: '100%',
    minWidth: 0,
  },
  searchButton: {
    border: 'none',
    background: 'none',
    padding: '10px 15px',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#666',
    transition: 'color 0.2s',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
};