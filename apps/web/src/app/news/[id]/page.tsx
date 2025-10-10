'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsItem } from '@myapp/shared';
import { Header } from '../../../components/Header';

interface NewsDetailPageProps {
  params: {
    id: string;
  };
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  // 더미 데이터 - 실제로는 API에서 가져올 데이터
  const dummyNewsData: Record<string, NewsItem> = {
    '1': {
      id: '1',
      title: '새로운 기능 업데이트 출시',
      content: `
        <h3>주요 업데이트 내용</h3>
        <p>사용자 경험을 향상시키는 새로운 기능들이 추가되었습니다.</p>

        <h4>1. 향상된 사용자 인터페이스</h4>
        <ul>
          <li>더욱 직관적인 메뉴 구성</li>
          <li>모바일 최적화 개선</li>
          <li>다크 모드 지원</li>
        </ul>

        <h4>2. 새로운 기능</h4>
        <ul>
          <li>알림 기능 개선</li>
          <li>검색 기능 강화</li>
          <li>데이터 동기화 속도 향상</li>
        </ul>

        <h4>3. 버그 수정</h4>
        <ul>
          <li>로그인 오류 해결</li>
          <li>페이지 로딩 속도 개선</li>
          <li>메모리 사용량 최적화</li>
        </ul>

        <p>더욱 편리한 서비스를 이용해보시고, 궁금한 점이 있으시면 언제든 문의해주세요.</p>
      `,
      summary: '새로운 기능 업데이트가 출시되었습니다.',
      publishedAt: '2024-01-15T10:00:00Z',
      imageUrl: 'https://via.placeholder.com/800x400',
      category: 'update',
      isImportant: true,
      author: 'MyApp 팀'
    },
    '2': {
      id: '2',
      title: '설날 특별 이벤트 안내',
      content: `
        <h3>설날 특별 이벤트</h3>
        <p>새해를 맞이하여 특별한 이벤트를 준비했습니다!</p>

        <h4>이벤트 기간</h4>
        <p>2024년 1월 20일 ~ 2월 10일</p>

        <h4>참여 방법</h4>
        <ol>
          <li>앱 로그인</li>
          <li>이벤트 페이지 방문</li>
          <li>미션 완료</li>
          <li>리워드 획득!</li>
        </ol>

        <h4>혜택</h4>
        <ul>
          <li>1등: 100만원 상당의 상품권</li>
          <li>2등: 50만원 상당의 상품권</li>
          <li>3등: 10만원 상당의 상품권</li>
          <li>참가상: 모든 참여자에게 쿠폰 증정</li>
        </ul>

        <p>많은 참여 부탁드립니다!</p>
      `,
      summary: '설날 특별 이벤트가 시작됩니다.',
      publishedAt: '2024-01-14T09:30:00Z',
      imageUrl: 'https://via.placeholder.com/800x400',
      category: 'event',
      isImportant: false,
      author: '마케팅팀'
    },
    '3': {
      id: '3',
      title: '서비스 정기 점검 안내',
      content: `
        <h3>정기 점검 안내</h3>
        <p>더 나은 서비스 제공을 위해 정기 점검을 실시합니다.</p>

        <h4>점검 일시</h4>
        <p>2024년 1월 20일 (토) 새벽 2시 ~ 6시 (4시간)</p>

        <h4>점검 내용</h4>
        <ul>
          <li>서버 시스템 업그레이드</li>
          <li>보안 패치 적용</li>
          <li>데이터베이스 최적화</li>
          <li>성능 개선</li>
        </ul>

        <h4>주의사항</h4>
        <ul>
          <li>점검 시간 동안 서비스 이용이 불가합니다</li>
          <li>점검 완료 후 재로그인이 필요할 수 있습니다</li>
          <li>점검 시간은 상황에 따라 연장될 수 있습니다</li>
        </ul>

        <p>불편을 드려 죄송하며, 더 나은 서비스로 찾아뵙겠습니다.</p>
      `,
      summary: '1월 20일 새벽 정기 점검이 예정되어 있습니다.',
      publishedAt: '2024-01-13T14:00:00Z',
      category: 'announcement',
      isImportant: true,
      author: '개발팀'
    }
  };

  useEffect(() => {
    // 실제로는 API 호출
    setTimeout(() => {
      const newsData = dummyNewsData[params.id];
      setNews(newsData || null);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'general': return '일반';
      case 'update': return '업데이트';
      case 'event': return '이벤트';
      case 'announcement': return '공지사항';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'update': return '#007bff';
      case 'event': return '#28a745';
      case 'announcement': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!news) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>소식을 찾을 수 없습니다</h2>
        <Link href="/news" style={{ color: '#007bff', textDecoration: 'none' }}>
          새로운 소식 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Header showBackButton={true} backUrl="/news" />

      <div style={{ padding: '20px' }}>
        <article style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
        <header style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: getCategoryColor(news.category),
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px',
                marginRight: '15px'
              }}
            >
              {getCategoryText(news.category)}
            </span>
            {news.isImportant && (
              <span style={{
                display: 'inline-block',
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                borderRadius: '4px',
                fontSize: '14px'
              }}>
                중요
              </span>
            )}
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: '0 0 15px 0',
            lineHeight: '1.3'
          }}>
            {news.title}
          </h1>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px 0',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            color: '#666',
            fontSize: '14px'
          }}>
            <span>작성자: {news.author}</span>
            <span>{formatDate(news.publishedAt)}</span>
          </div>
        </header>

        {news.imageUrl && (
          <div style={{ marginBottom: '30px' }}>
            <img
              src={news.imageUrl}
              alt={news.title}
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px'
              }}
            />
          </div>
        )}

        <div
          style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#333'
          }}
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        <footer style={{
          marginTop: '40px',
          padding: '20px 0',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <Link
            href="/news"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            목록으로 돌아가기
          </Link>
        </footer>
        </article>
      </div>
    </div>
  );
}