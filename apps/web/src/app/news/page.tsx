'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsItem } from '@myapp/shared';
import { Header } from '../../components/Header';

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 더미 데이터 - 실제로는 API에서 가져올 데이터
  const dummyNews: NewsItem[] = [
    {
      id: '1',
      title: '새로운 기능 업데이트 출시',
      content: '사용자 경험을 향상시키는 새로운 기능들이 추가되었습니다. 더욱 편리한 서비스를 이용해보세요.',
      summary: '새로운 기능 업데이트가 출시되었습니다.',
      publishedAt: '2024-01-15T10:00:00Z',
      imageUrl: 'https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbwgtWb%2FbtsPIdbvSmv%2FAAAAAAAAAAAAAAAAAAAAAFbGbr1jKNaInSxpqisMOJh2qgyQpFwAXyG_Nqu3-0pS%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1759244399%26allow_ip%3D%26allow_referer%3D%26signature%3DCdWll1nNuwEKPHO%252B7KQfXXdlp6w%253D',
      category: 'update',
      isImportant: true,
      author: 'MyApp 팀'
    },
    {
      id: '2',
      title: '설날 특별 이벤트 안내',
      content: '설날을 맞아 특별한 이벤트를 진행합니다. 많은 참여 부탁드립니다.',
      summary: '설날 특별 이벤트가 시작됩니다.',
      publishedAt: '2024-01-14T09:30:00Z',
      imageUrl: 'https://cdn.imweb.me/upload/S20191121352905b2bd341/43dd0cbccf970.jpg',
      category: 'event',
      isImportant: false,
      author: '마케팅팀'
    },
    {
      id: '3',
      title: '서비스 정기 점검 안내',
      content: '더 나은 서비스 제공을 위해 정기 점검을 실시합니다. 점검 시간 동안 서비스 이용이 제한될 수 있습니다.',
      summary: '1월 20일 새벽 정기 점검이 예정되어 있습니다.',
      publishedAt: '2024-01-13T14:00:00Z',
      category: 'announcement',
      isImportant: true,
      author: '개발팀'
    },
    {
      id: '4',
      title: '고객 만족도 조사 결과 발표',
      content: '지난 분기 고객 만족도 조사 결과를 공유드립니다. 소중한 의견을 보내주신 모든 분들께 감사드립니다.',
      summary: '2023년 4분기 고객 만족도 조사 결과입니다.',
      publishedAt: '2024-01-12T16:20:00Z',
      category: 'general',
      isImportant: false,
      author: 'CS팀'
    }
  ];

  useEffect(() => {
    // 실제로는 API 호출
    setTimeout(() => {
      setNews(dummyNews);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNews = news.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'general': return '일반';
      case 'update': return '업데이트';
      case 'event': return '이벤트';
      case 'announcement': return '공지사항';
      default: return '전체';
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
      day: 'numeric'
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

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Header showBackButton={true} backUrl="/home" />

      <div style={{ padding: '20px' }}>

        {/* 카테고리 필터 */}
        <div style={{ marginBottom: '30px' }}>
          {['all', 'announcement', 'update', 'event', 'general'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '8px 16px',
                marginRight: '10px',
                border: selectedCategory === category ? '2px solid #007bff' : '1px solid #ddd',
                backgroundColor: selectedCategory === category ? '#007bff' : 'white',
                color: selectedCategory === category ? 'white' : '#333',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {getCategoryText(category)}
            </button>
          ))}
        </div>
      </div>

      {/* 뉴스 리스트 */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {filteredNews.map(item => (
          <div
            key={item.id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            {item.isImportant && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: '#dc3545',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                중요
              </div>
            )}

            <div>
              {/* 카테고리와 날짜 - 맨 위에 배치 */}
              <div style={{ marginBottom: '15px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: getCategoryColor(item.category),
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginRight: '10px'
                  }}
                >
                  {getCategoryText(item.category)}
                </span>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  {formatDate(item.publishedAt)}
                </span>
              </div>

              {/* 제목 */}
              <h3 style={{
                margin: '0 0 15px 0',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                {item.title}
              </h3>

              {/* 이미지와 텍스트 */}
              <div style={{ display: 'flex', gap: '20px' }}>
                {item.imageUrl && (
                  <div style={{ flexShrink: 0 }}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      style={{
                        width: '180px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: '0 0 15px 0',
                    color: '#666',
                    lineHeight: '1.6',
                    fontSize: '14px'
                  }}>
                    {item.summary}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#999'
                  }}>
                    <span>작성자: {item.author}</span>
                    <Link
                      href={`/news/${item.id}`}
                      style={{
                        color: '#007bff',
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      자세히 보기 →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#666'
        }}>
          선택한 카테고리에 해당하는 소식이 없습니다.
        </div>
      )}
    </div>
  );
}