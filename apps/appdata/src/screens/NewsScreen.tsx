import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NewsItem } from '@myapp/shared';

interface NewsScreenProps {
  navigation: any;
}

export default function NewsScreen({ navigation }: NewsScreenProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 더미 데이터 - 실제로는 API에서 가져올 데이터
  const dummyNews: NewsItem[] = [
    {
      id: '1',
      title: '새로운 기능 업데이트 출시',
      content: '사용자 경험을 향상시키는 새로운 기능들이 추가되었습니다.',
      summary: '새로운 기능 업데이트가 출시되었습니다.',
      publishedAt: '2024-01-15T10:00:00Z',
      imageUrl: 'https://via.placeholder.com/300x200',
      category: 'update',
      isImportant: true,
      author: 'MyApp 팀'
    },
    {
      id: '2',
      title: '설날 특별 이벤트 안내',
      content: '설날을 맞아 특별한 이벤트를 진행합니다.',
      summary: '설날 특별 이벤트가 시작됩니다.',
      publishedAt: '2024-01-14T09:30:00Z',
      imageUrl: 'https://via.placeholder.com/300x200',
      category: 'event',
      isImportant: false,
      author: '마케팅팀'
    },
    {
      id: '3',
      title: '서비스 정기 점검 안내',
      content: '더 나은 서비스 제공을 위해 정기 점검을 실시합니다.',
      summary: '1월 20일 새벽 정기 점검이 예정되어 있습니다.',
      publishedAt: '2024-01-13T14:00:00Z',
      category: 'announcement',
      isImportant: true,
      author: '개발팀'
    },
    {
      id: '4',
      title: '고객 만족도 조사 결과 발표',
      content: '지난 분기 고객 만족도 조사 결과를 공유드립니다.',
      summary: '2023년 4분기 고객 만족도 조사 결과입니다.',
      publishedAt: '2024-01-12T16:20:00Z',
      category: 'general',
      isImportant: false,
      author: 'CS팀'
    }
  ];

  const loadNews = async () => {
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNews(dummyNews);
    } catch (error) {
      console.error('뉴스 로딩 오류:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNews();
  };

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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return '오늘';
    } else if (days === 1) {
      return '어제';
    } else if (days < 7) {
      return `${days}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleNewsPress = (newsItem: NewsItem) => {
    // 상세 화면으로 네비게이션 (추후 구현)
    console.log('뉴스 선택:', newsItem.title);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>새로운 소식을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>새로운 소식</Text>
      </View>

      {/* 카테고리 필터 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        {[
          { key: 'all', label: '전체' },
          { key: 'announcement', label: '공지사항' },
          { key: 'update', label: '업데이트' },
          { key: 'event', label: '이벤트' },
          { key: 'general', label: '일반' }
        ].map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryButton,
              selectedCategory === category.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category.key && styles.categoryButtonTextActive
              ]}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 뉴스 리스트 */}
      <ScrollView
        style={styles.newsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNews.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.newsItem}
            onPress={() => handleNewsPress(item)}
          >
            <View style={styles.newsContent}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
              )}

              <View style={styles.newsInfo}>
                <View style={styles.newsHeader}>
                  <View style={styles.newsLabels}>
                    <View
                      style={[
                        styles.categoryLabel,
                        { backgroundColor: getCategoryColor(item.category) }
                      ]}
                    >
                      <Text style={styles.categoryLabelText}>
                        {getCategoryText(item.category)}
                      </Text>
                    </View>
                    {item.isImportant && (
                      <View style={styles.importantLabel}>
                        <Text style={styles.importantLabelText}>중요</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.newsDate}>{formatDate(item.publishedAt)}</Text>
                </View>

                <Text style={styles.newsTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <Text style={styles.newsSummary} numberOfLines={2}>
                  {item.summary}
                </Text>

                <View style={styles.newsFooter}>
                  <Text style={styles.newsAuthor}>작성자: {item.author}</Text>
                  <Text style={styles.readMore}>자세히 보기 →</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredNews.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              선택한 카테고리에 해당하는 소식이 없습니다.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoryContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: 'white',
  },
  categoryButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#333',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  newsList: {
    flex: 1,
    padding: 15,
  },
  newsItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsContent: {
    padding: 15,
  },
  newsImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  newsInfo: {
    flex: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  newsLabels: {
    flexDirection: 'row',
  },
  categoryLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  importantLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#dc3545',
  },
  importantLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newsDate: {
    fontSize: 12,
    color: '#666',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsAuthor: {
    fontSize: 12,
    color: '#999',
  },
  readMore: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});