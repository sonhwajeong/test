'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function SSOPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleSSO = async () => {
      try {
        const token = searchParams.get('token')
        const route = searchParams.get('route') || '/home'
        const platform = searchParams.get('platform')

        if (!token) {
          setStatus('error')
          return
        }

        // 토큰 검증
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://172.16.2.84:8080'}/auth/check`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accessToken: token,
            deviceId: 'web-device'
          })
        })

        if (response.ok) {
          const data = await response.json()

          if (data.success && data.data.valid) {
            setStatus('success')

            // 모바일 앱에 성공 알림 (토큰 저장 없이)
            if (platform === 'mobile' && window.parent) {
              window.parent.postMessage({
                type: 'SSO_SUCCESS',
                token: token
              }, '*')
            }
            
            // 요청된 라우트로 리다이렉트
            setTimeout(() => {
              router.push(route)
            }, 1000)
          } else {
            setStatus('error')
          }
        } else {
          setStatus('error')
        }
      } catch (error) {
        console.error('SSO error:', error)
        setStatus('error')
      }
    }

    handleSSO()
  }, [searchParams, router])

  return (
    <div style={styles.container}>
      {status === 'loading' && (
        <div style={styles.content}>
          <div style={styles.spinner}></div>
          <p>로그인 처리 중...</p>
        </div>
      )}
      
      {status === 'success' && (
        <div style={styles.content}>
          <div style={styles.success}>✓</div>
          <p>로그인 성공! 페이지로 이동합니다...</p>
        </div>
      )}
      
      {status === 'error' && (
        <div style={styles.content}>
          <div style={styles.error}>✗</div>
          <p>로그인에 실패했습니다.</p>
          <button 
            onClick={() => router.push('/login')}
            style={styles.button}
          >
            로그인 페이지로 이동
          </button>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  content: {
    textAlign: 'center' as const,
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  success: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#28a745',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    margin: '0 auto 20px',
  },
  error: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#dc3545',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    margin: '0 auto 20px',
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}