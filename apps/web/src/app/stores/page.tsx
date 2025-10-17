'use client'

import { useEffect, useState, useRef } from 'react'
import { getCurrentAccessToken } from '../../utils/auth'
import { Header } from '../../components/Header'

declare global {
  interface Window {
    kakao: any
  }
}

interface Store {
  id: number
  name: string
  address: string
  phone: string
  latitude: number
  longitude: number
  openTime: string
  closeTime: string
  description?: string
}

export default function StoresPage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null)
  const [nearbyStores, setNearbyStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [mapLoading, setMapLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [isMyLocationSelected, setIsMyLocationSelected] = useState(false)
  const mapContainer = useRef<HTMLDivElement>(null)


  // 샘플 매장 데이터 (실제 서비스에서는 API로 받아올 데이터)
  const sampleStores: Store[] = [
    {
      id: 1,
      name: 'MyApp 강남점',
      address: '서울특별시 강남구 테헤란로 152',
      phone: '02-1234-5678',
      latitude: 37.5012767,
      longitude: 127.0396597,
      openTime: '09:00',
      closeTime: '22:00',
      description: '강남역 근처 대형 매장'
    },
    {
      id: 2,
      name: 'MyApp 홍대점',
      address: '서울특별시 마포구 양화로 160',
      phone: '02-2345-6789',
      latitude: 37.5563558,
      longitude: 126.9229878,
      openTime: '10:00',
      closeTime: '23:00',
      description: '홍대입구역 도보 5분'
    },
    {
      id: 3,
      name: 'MyApp 잠실점',
      address: '서울특별시 송파구 올림픽로 300',
      phone: '02-3456-7890',
      latitude: 37.5130625,
      longitude: 127.1025896,
      openTime: '09:30',
      closeTime: '22:30',
      description: '롯데월드타워 근처'
    }
  ]


  // 📍 내 위치 버튼 클릭 시 위치 가져오기
  const handleMyLocationClick = async () => {
    if (!map) {
      alert('지도가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsLocationLoading(true)

    const hasReactNativeWebView = !!(window as any).ReactNativeWebView
    const hasGetAppLocation = !!(window as any).getAppLocation
    const isCurrentlyInApp = hasReactNativeWebView || hasGetAppLocation

    if (isCurrentlyInApp && (window as any).getAppLocation) {
      try {

        // Promise with timeout
        const locationPromise = (window as any).getAppLocation()
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('30초 타임아웃')), 30000)
        })

        const appLocation = await Promise.race([locationPromise, timeoutPromise])

        // Alert로 원본 데이터 먼저 표시
        //alert(`📱 앱에서 받은 데이터:\n\n${JSON.stringify(appLocation, null, 2)}`)

        // 🎯 검증을 매우 관대하게 처리
        let lat = null
        let lng = null

        // 다양한 형태의 데이터 구조 지원
        try {
          if (appLocation) {
            // 경우 1: {latitude: 37.123, longitude: 127.123}
            if (appLocation.latitude && appLocation.longitude) {
              lat = Number(appLocation.latitude)
              lng = Number(appLocation.longitude)
            }
            // 경우 2: {lat: 37.123, lng: 127.123}
            else if (appLocation.lat && appLocation.lng) {
              lat = Number(appLocation.lat)
              lng = Number(appLocation.lng)
            }
            // 경우 3: {coords: {latitude: 37.123, longitude: 127.123}}
            else if (appLocation.coords && appLocation.coords.latitude && appLocation.coords.longitude) {
              lat = Number(appLocation.coords.latitude)
              lng = Number(appLocation.coords.longitude)
            }
            // 경우 4: 문자열로 온 경우 파싱
            else if (typeof appLocation === 'string') {
              const parsed = JSON.parse(appLocation)
              lat = Number(parsed.latitude || parsed.lat)
              lng = Number(parsed.longitude || parsed.lng)
            }
          }


          // 좌표가 유효한 숫자인지만 확인
          if (lat && lng && !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            const locPosition = new window.kakao.maps.LatLng(lat, lng)

            setCurrentLocation({ lat, lng })

            // 매장 선택 해제하고 내 위치 선택 상태로 변경
            setSelectedStore(null)
            setIsMyLocationSelected(true)

            // 매장 선택하는 것처럼 지도 중심을 내 위치로 이동
            map.setCenter(locPosition)
            map.setLevel(4) // 매장과 동일한 확대 레벨

            // 내 위치 마커 생성
            const marker = new window.kakao.maps.Marker({
              position: locPosition,
              title: '📍 내 현재 위치'
            })
            marker.setMap(map)

            // 내 위치 정보창
            const infoWindow = new window.kakao.maps.InfoWindow({
              content: `
                <div style="padding:12px;font-size:12px;text-align:center;min-width:200px;">
                  <div style="font-weight:bold;margin-bottom:5px;color:red;">📍 내 현재 위치</div>
                  <div style="color:#007bff;font-family:monospace;">
                    위도: ${lat.toFixed(6)}<br/>
                    경도: ${lng.toFixed(6)}
                  </div>
                  <div style="color:#666;font-size:10px;">소스: 앱</div>
                </div>
              `
            })
            infoWindow.open(map, marker)
           // alert(`📍 내 위치로 이동!\n\n위도: ${lat.toFixed(6)}\n경도: ${lng.toFixed(6)}`)

          } else {
            alert(`❌ 좌표를 추출할 수 없습니다.\n\nlat=${lat}, lng=${lng}\n\n원본: ${JSON.stringify(appLocation)}`)
          }

        } catch (parseError) {
          alert(`❌ 데이터 파싱 실패: ${parseError}`)
        }

      } catch (error) {
        alert(`❌ 위치 정보를 가져올 수 없습니다.\n\n에러: ${error}\n\n앱에서 위치 권한을 확인해주세요.`)
      }
    } else {
      alert('❌ 앱에서만 위치 서비스를 사용할 수 있습니다.')
    }

    setIsLocationLoading(false)
  }

  useEffect(() => {
    // 쿠키와 WebView 컨텍스트 확인
    if (typeof window !== 'undefined') {
      const hasReactNativeWebView = !!(window as any).ReactNativeWebView
      const hasGetAppToken = !!(window as any).getAppToken
      const hasGetAppLocation = !!(window as any).getAppLocation

      setIsAppContext(hasReactNativeWebView || hasGetAppToken || hasGetAppLocation)

      // 쿠키에서 토큰 가져오기
      const cookieToken = getCurrentAccessToken()
      if (cookieToken) {
        setToken(cookieToken)
      } else if ((window as any).getAppToken) {
        // WebView 환경에서 토큰이 없으면 앱에서 가져오기 시도
        const loadToken = async () => {
          try {
            const appToken = await (window as any).getAppToken()
            if (appToken) {
              setToken(appToken)
            }
          } catch (error) {
            console.error('Failed to get token from app:', error)
          }
        }
        loadToken()
      }

      // 항상 카카오 지도 로드를 시도하도록 변경
      loadKakaoMapScript()
    }
  }, [])

  const loadKakaoMapScript = () => {
    // 이미 카카오 지도가 로드되어 있는지 확인
    if (window.kakao && window.kakao.maps) {
      initializeKakaoMap()
      return
    }

    // 기존 스크립트 제거
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existingScript) {
      existingScript.remove()
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    // JavaScript 키 사용 및 autoload=false 설정
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=0b4d7ca853d21021a6fee701aab68d7a&autoload=false`

    script.onload = () => {
      // autoload=false이므로 수동으로 load 호출
      window.kakao.maps.load(() => {
        initializeKakaoMap()
      })
    }

    script.onerror = (error) => {
      console.error('카카오 지도 로드 실패:', error)
      setMapError('카카오 지도를 로드할 수 없습니다. 네트워크 연결 및 API 키를 확인해주세요.')
      setMapLoading(false)
    }

    document.head.appendChild(script)
  }


  const initializeKakaoMap = async () => {
    if (!mapContainer.current) {
      setMapError('지도 컨테이너 오류')
      setMapLoading(false)
      return
    }

    if (!window.kakao || !window.kakao.maps) {
      setMapError('카카오 지도 라이브러리 로드 실패')
      setMapLoading(false)
      return
    }

    try {
      // 항상 서울시청 중심으로 지도 생성
      const initialCenter = new window.kakao.maps.LatLng(37.5665, 126.9780); // 서울시청
      const initialLevel = 8;

      const mapOption = {
        center: initialCenter,
        level: initialLevel
      }

      const kakaoMap = new window.kakao.maps.Map(mapContainer.current, mapOption)
      setMap(kakaoMap)

      // 지도 크기 재조정
      setTimeout(() => {
        kakaoMap.relayout()
      }, 100)

      setTimeout(() => {
        kakaoMap.relayout()
      }, 500)

      // 매장 마커 표시
      displayStores(kakaoMap, sampleStores)
      setNearbyStores(sampleStores)

      setMapLoading(false)

    } catch (error) {
      console.error('지도 초기화 오류:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      setMapError(`지도 초기화 실패: ${errorMessage}`)
      setMapLoading(false)
    }
  }


  const displayStores = (kakaoMap: any, stores: Store[]) => {
    stores.forEach(store => {
      const markerPosition = new window.kakao.maps.LatLng(store.latitude, store.longitude)

      const marker = new window.kakao.maps.Marker({
        position: markerPosition,
        title: store.name
      })
      marker.setMap(kakaoMap)

      // 매장 정보창
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px;font-size:12px;">
            <div style="font-weight:bold;margin-bottom:5px;">${store.name}</div>
            <div style="margin-bottom:3px;">${store.address}</div>
            <div style="margin-bottom:3px;">📞 ${store.phone}</div>
            <div style="color:#666;">🕐 ${store.openTime} - ${store.closeTime}</div>
            <button onclick="selectStore(${store.id})" style="margin-top:8px;padding:5px 10px;background:#007bff;color:white;border:none;border-radius:3px;cursor:pointer;font-size:11px;">
              매장 선택
            </button>
          </div>
        `
      })

      // 마커 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(kakaoMap, marker)
      })
    })
  }

  // 전역 함수로 매장 선택 처리
  useEffect(() => {
    (window as any).selectStore = (storeId: number) => {
      const store = sampleStores.find(s => s.id === storeId)
      if (store) {
        setSelectedStore(store)
      }
    }

    return () => {
      delete (window as any).selectStore
    }
  }, [])

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const getStoresWithDistance = () => {
    if (!currentLocation) return nearbyStores

    return nearbyStores
      .map(store => ({
        ...store,
        distance: calculateDistance(
          currentLocation.lat, currentLocation.lng,
          store.latitude, store.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
  }

  const formatDistance = (distance: number) => {
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
  }

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/home" />

      <div style={styles.content}>
        <div style={styles.mapSection}>
          {mapLoading && (
            <div style={styles.mapPlaceholder}>
              <div style={styles.loadingText}>지도를 불러오는 중...</div>
            </div>
          )}
          {mapError && (
            <div style={styles.mapPlaceholder}>
              <div style={styles.errorText}>{mapError}</div>
              <button
                onClick={() => {
                  setMapError(null)
                  setMapLoading(true)
                  loadKakaoMapScript()
                }}
                style={styles.retryButton}
              >
                다시 시도
              </button>
            </div>
          )}
          {/* 카카오 지도 컨테이너 */}
          <div
            ref={mapContainer}
            style={{
              ...styles.map,
              display: mapLoading || mapError ? 'none' : 'block'
            }}
          ></div>
        </div>

        <div style={styles.storeList}>
          <div style={styles.listHeader}>
            <h3 style={styles.listTitle}>
              {currentLocation ? '가까운 매장' : '매장 목록'}
            </h3>

            {/* 내 위치 버튼 */}
            <button
              style={{
                ...styles.myLocationButton,
                ...(isLocationLoading ? styles.myLocationButtonLoading : {})
              }}
              onClick={handleMyLocationClick}
              disabled={isLocationLoading || mapLoading}
            >
              {isLocationLoading ? '⏳' : '📍'} 내 위치
            </button>
          </div>

          {getStoresWithDistance().map((store) => (
            <div
              key={store.id}
              style={{
                ...styles.storeCard,
                ...(selectedStore?.id === store.id ? styles.selectedStore : {})
              }}
              onClick={() => {
                setSelectedStore(store)
                setIsMyLocationSelected(false) // 매장 선택 시 내 위치 선택 해제
                if (map && window.kakao && window.kakao.maps) {
                  const position = new window.kakao.maps.LatLng(store.latitude, store.longitude)
                  map.setCenter(position)
                  map.setLevel(4)
                }
              }}
            >
              <div style={styles.storeHeader}>
                <h4 style={styles.storeName}>{store.name}</h4>
                {'distance' in store && (
                  <span style={styles.distance}>{formatDistance(store.distance)}</span>
                )}
              </div>
              <p style={styles.storeAddress}>{store.address}</p>
              <div style={styles.storeInfo}>
                <span style={styles.phone}>📞 {store.phone}</span>
                <span style={styles.hours}>🕐 {store.openTime} - {store.closeTime}</span>
              </div>
              {store.description && (
                <p style={styles.description}>{store.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>


      {selectedStore && (
        <div style={styles.selectedStoreInfo}>
          <div style={styles.selectedStoreContent}>
            <h4 style={styles.selectedStoreName}>선택된 매장: {selectedStore.name}</h4>
            <div style={styles.actionButtons}>
              <button
                style={styles.callButton}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = `tel:${selectedStore.phone}`
                  }
                }}
              >
                전화걸기
              </button>
              <button
                style={styles.directionsButton}
                onClick={() => {
                  const query = encodeURIComponent(`${selectedStore.name} ${selectedStore.address}`)
                  const url = `https://map.kakao.com/link/search/${query}`
                  window.open(url, '_blank')
                }}
              >
                길찾기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 내 위치 선택 시 정보 표시 */}
      {isMyLocationSelected && currentLocation && (
        <div style={styles.selectedLocationInfo}>
          <div style={styles.selectedStoreContent}>
            <h4 style={styles.selectedStoreName}>📍 내 현재 위치</h4>
            <div style={styles.locationDetails}>

            </div>
            <div style={styles.actionButtons}>
              <button
                style={styles.directionsButton}
                onClick={() => {
                  const url = `https://map.kakao.com/link/map/내위치,${currentLocation.lat},${currentLocation.lng}`
                  window.open(url, '_blank')
                }}
              >
                카카오맵에서 보기
              </button>
              <button
                style={styles.callButton}
                onClick={() => setIsMyLocationSelected(false)}
              >
                선택 해제
              </button>
            </div>
          </div>
        </div>
      )}
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
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  mapSection: {
    flex: 2,
    minHeight: '50vh',
    height: '50vh',
    position: 'relative' as const,
  },
  map: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
  },
  storeList: {
    flex: 1,
    minHeight: '200px',
    maxHeight: '40vh',
    overflowY: 'auto' as const,
    backgroundColor: 'white',
    borderTop: '1px solid #ddd',
    padding: '15px',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  listTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0',
  },
  myLocationButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  myLocationButtonLoading: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  storeCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white',
  },
  selectedStore: {
    border: '2px solid #007bff',
    backgroundColor: '#f0f7ff',
  },
  storeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  storeName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
  },
  distance: {
    fontSize: '12px',
    color: '#007bff',
    fontWeight: 'bold',
    backgroundColor: '#e7f3ff',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  storeAddress: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 8px 0',
  },
  storeInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#555',
  },
  phone: {
    color: '#28a745',
  },
  hours: {
    color: '#666',
  },
  description: {
    fontSize: '12px',
    color: '#888',
    margin: '8px 0 0 0',
    fontStyle: 'italic',
  },
  selectedStoreInfo: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '15px',
    borderTop: '1px solid #0056b3',
  },
  selectedLocationInfo: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '15px',
    borderTop: '1px solid #1e7e34',
  },
  locationDetails: {
    marginBottom: '10px',
  },
  locationCoords: {
    fontSize: '12px',
    fontFamily: 'monospace',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '4px 8px',
    borderRadius: '4px',
    display: 'inline-block',
  },
  selectedStoreContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStoreName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: 0,
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
  },
  callButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  directionsButton: {
    backgroundColor: 'white',
    color: '#007bff',
    border: '1px solid white',
    padding: '8px 15px',
    borderRadius: '5px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  mapPlaceholder: {
    width: '100%',
    height: '100%',
    minHeight: '300px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
  },
  loadingText: {
    fontSize: '16px',
    color: '#666',
  },
  errorText: {
    fontSize: '16px',
    color: '#dc3545',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
}