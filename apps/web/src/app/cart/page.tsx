'use client'

import { useEffect, useState } from 'react'
import { getCurrentAccessToken } from '../../utils/auth'
import { getCartData, removeFromCart, updateCartItemQuantity, CartData, CartProduct } from '../../utils/cart'
import { Header } from '../../components/Header'
import { SignatureModal } from '../../components/SignatureModal'

export default function CartPage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)
  const [cartData, setCartData] = useState<CartData>({ items: [], totalCount: 0, totalPrice: 0 })
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [signatureData, setSignatureData] = useState<string>('')

  useEffect(() => {
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

      console.log('🛒 Cart page loaded:', {
        isWebView: hasReactNativeWebView,
        hasCookieToken: !!cookieToken,
        hasAppTokenFunction: hasGetAppToken
      });

      // 장바구니 데이터 로드
      loadCartData();

      // 장바구니 업데이트 이벤트 리스너 등록
      const handleCartUpdate = () => {
        loadCartData();
      };
      window.addEventListener('cartUpdated', handleCartUpdate);

      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
      };
    }

  }, [])

  const loadCartData = () => {
    const data = getCartData();
    setCartData(data);
  }

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const updatedCart = updateCartItemQuantity(productId, newQuantity);
    setCartData(updatedCart);
  }

  const handleRemoveItem = (productId: number) => {
    const updatedCart = removeFromCart(productId);
    setCartData(updatedCart);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  }

  const handleCheckout = () => {
    if (cartData.items.length === 0) {
      alert('장바구니에 상품이 없습니다.')
      return
    }

    // 앱 환경에서는 네이티브 서명 화면으로 이동
    if (isAppContext && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({
        type: 'CHECKOUT_REQUEST',
        cartData: cartData
      }));
    } else {
      // 웹 환경에서는 기존 서명 모달 사용
      setShowSignatureModal(true)
    }
  }

  const handleSignatureSave = async (signature: string) => {
    setSignatureData(signature)

    // 서명 이미지를 서버에 전송하거나 로컬에 저장하는 로직
    try {
      console.log('서명 데이터:', signature)

      // 앱 환경에서는 React Native WebView로 메시지 전송
      if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SIGNATURE_COMPLETED',
          signature: signature,
          cartData: cartData
        }))
      }

      // 결제 완료 처리
      alert('서명이 완료되었습니다. 결제가 진행됩니다.')

      // 장바구니 비우기 (실제 서비스에서는 결제 완료 후 처리)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cart')
        window.dispatchEvent(new Event('cartUpdated'))
        loadCartData()
      }

    } catch (error) {
      console.error('서명 처리 중 오류:', error)
      alert('서명 처리 중 오류가 발생했습니다.')
    }
  }

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/home" />

      {cartData.items.length === 0 ? (
        <div style={styles.emptyCart}>
          <h3>장바구니가 비어있습니다</h3>
          <p>추천 상품을 확인해보세요!</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                if ((window as any).ReactNativeWebView) {
                  window.location.href = '/recommended'
                } else {
                  window.open('/recommended', '_blank')
                }
              }
            }}
            style={styles.shopMoreBtn}
          >
            상품 보러가기
          </button>
        </div>
      ) : (
        <div style={styles.content}>
          <div style={styles.cartHeader}>
            <h3>장바구니 목록</h3>
            <span style={styles.itemCount}>{cartData.totalCount}개 상품</span>
          </div>

          <div style={styles.cartItems}>
            {cartData.items.map((item) => (
              <div key={item.id} style={styles.cartItem}>
                <div style={styles.topSection}>
                  <div style={styles.itemImageContainer}>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={styles.itemImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80/cccccc/666666?text=이미지'
                      }}
                    />
                  </div>

                  <div style={styles.itemInfo}>
                    <h4 style={styles.itemName}>{item.name}</h4>
                    <p style={styles.itemDescription}>{item.description}</p>
                    <div style={styles.priceInfo}>
                      {item.originalPrice && (
                        <span style={styles.originalPrice}>₩{formatPrice(item.originalPrice)}</span>
                      )}
                      <span style={styles.currentPrice}>₩{formatPrice(item.price)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    style={styles.removeBtn}
                    title="상품 삭제"
                  >
                    🗑️
                  </button>
                </div>

                <div style={styles.bottomSection}>
                  <div style={styles.quantitySection}>
                    <div style={styles.quantityLabel}>수량</div>
                    <div style={styles.quantityControls}>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        style={styles.quantityBtn}
                      >
                        −
                      </button>
                      <span style={styles.quantity}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        style={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={styles.priceSection}>
                    <div style={styles.priceLabel}>합계</div>
                    <div style={styles.itemTotal}>
                      <strong>₩{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.total}>
            <h3>총 합계: ₩{formatPrice(cartData.totalPrice)}</h3>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    if ((window as any).ReactNativeWebView) {
                      window.location.href = '/recommended'
                    } else {
                      window.open('/recommended', '_blank')
                    }
                  }
                }}
                style={styles.shopMoreBtn}
              >
                더 쇼핑하기
              </button>
              <button onClick={handleCheckout} style={styles.checkoutBtn}>결제하기</button>
            </div>
          </div>
        </div>
      )}

      <SignatureModal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        onSignatureSave={handleSignatureSave}
      />
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
  emptyCart: {
    textAlign: 'center' as const,
    padding: '50px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    margin: '20px',
  },
  content: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px',
    flex: 1,
    overflowY: 'auto' as const,
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e0e0e0',
  },
  itemCount: {
    color: '#666',
    fontSize: '14px',
  },
  cartItems: {
    marginBottom: '20px',
  },
  cartItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '15px',
    marginBottom: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    gap: '15px',
  },
  itemImageContainer: {
    flexShrink: 0,
  },
  itemImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover' as const,
    borderRadius: '6px',
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#333',
    wordBreak: 'break-word' as const,
    lineHeight: '1.3',
  },
  itemDescription: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 10px 0',
    lineHeight: '1.4',
    wordBreak: 'break-word' as const,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical' as const,
    WebkitLineClamp: 2,
  },
  priceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  originalPrice: {
    fontSize: '14px',
    color: '#999',
    textDecoration: 'line-through',
  },
  currentPrice: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  topSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '15px',
  },
  bottomSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    paddingTop: '10px',
    borderTop: '1px solid #f0f0f0',
    alignItems: 'center',
  },
  quantitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-start',
  },
  quantityLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: 'bold',
    whiteSpace: 'nowrap' as const,
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '6px',
    overflow: 'hidden',
    backgroundColor: 'white',
    height: '32px',
  },
  quantityBtn: {
    padding: '6px 10px',
    border: 'none',
    backgroundColor: '#f8f9fa',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    minWidth: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    minWidth: '40px',
    textAlign: 'center' as const,
    backgroundColor: 'white',
    color: '#333',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'flex-end',
  },
  priceLabel: {
    fontSize: '13px',
    color: '#666',
    fontWeight: 'bold',
    whiteSpace: 'nowrap' as const,
  },
  itemTotal: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100px',
  },
  removeBtn: {
    padding: '8px 10px',
    border: '1px solid #dc3545',
    backgroundColor: '#fff5f5',
    cursor: 'pointer',
    fontSize: '16px',
    borderRadius: '6px',
    transition: 'all 0.2s',
    color: '#dc3545',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: '36px',
  },
  total: {
    textAlign: 'center' as const,
    paddingTop: '20px',
    borderTop: '2px solid #007bff',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginTop: '15px',
  },
  shopMoreBtn: {
    padding: '12px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  checkoutBtn: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}