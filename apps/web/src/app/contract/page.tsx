'use client'

import { useRouter } from 'next/navigation'
import { Header } from '../../components/Header'

export default function ContractSelectPage() {
  const router = useRouter()

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/home" />

      <div style={styles.content}>
        <h1 style={styles.title}>근로계약서 유형 선택</h1>
        <p style={styles.description}>작성할 근로계약서 유형을 선택해주세요</p>

        <div style={styles.cardContainer}>
          <div
            style={styles.card}
            onClick={() => router.push('/contract/standard')}
          >
            <div style={styles.cardIcon}>📄</div>
            <h2 style={styles.cardTitle}>기본 근로계약서</h2>
            <p style={styles.cardDescription}>
              표준 근로계약서 양식으로 작성합니다.
              <br />
              미리 정의된 필드에 정보를 입력합니다.
            </p>
            <button style={styles.cardButton}>선택하기</button>
          </div>

          <div
            style={styles.card}
            onClick={() => router.push('/contract/custom')}
          >
            <div style={styles.cardIcon}>📋</div>
            <h2 style={styles.cardTitle}>커스텀 근로계약서</h2>
            <p style={styles.cardDescription}>
              PDF 파일을 업로드하여 작성합니다.
              <br />
              원하는 위치에 입력 필드를 배치할 수 있습니다.
            </p>
            <button style={styles.cardButton}>선택하기</button>
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
    flex: 1,
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '10px',
    color: '#333',
  },
  description: {
    fontSize: '16px',
    textAlign: 'center' as const,
    marginBottom: '40px',
    color: '#666',
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px 30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    textAlign: 'center' as const,
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    },
  },
  cardIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
  },
  cardDescription: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#666',
    marginBottom: '25px',
    minHeight: '60px',
  },
  cardButton: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}
