'use client'

import { useEffect, useState } from 'react'
import { getCurrentAccessToken } from '../../utils/auth'
import { addToCart, getCartItemQuantity, CartData } from '../../utils/cart'
import { Header } from '../../components/Header'

interface Product {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string
  originalPrice?: number
  discount?: number
}

// 더미 데이터 - 실제로는 API에서 가져올 데이터
const recommendedProducts: Product[] = [
  {
    id: 1,
    name: '무선 블루투스 이어폰',
    description: '고음질 무선 이어폰으로 편리한 음악 감상이 가능합니다.',
    price: 89000,
    originalPrice: 120000,
    discount: 26,
    imageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/A337a8b282d584134bc60ced699e7b471B.jpg_640x640q75.jpg_.avif'
  },
  {
    id: 2,
    name: '스마트워치',
    description: '건강 관리와 스마트 기능이 탑재된 차세대 워치입니다.',
    price: 149000,
    originalPrice: 199000,
    discount: 25,
    imageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/S103a103134a8419b8499c3550b780aa7k.jpg_640x640q75.jpg_.avif'
  },
  {
    id: 3,
    name: '휴대용 충전기',
    description: '대용량 10000mAh 고속충전 휴대용 배터리입니다.',
    price: 35000,
    originalPrice: 45000,
    discount: 22,
    imageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/Scf257f064feb4107bb58bf8a85439906N.jpg_960x960q75.jpg_.avif'
  },
  {
    id: 4,
    name: '무선 충전 패드',
    description: '간편한 무선 충전으로 선 없는 충전 환경을 제공합니다.',
    price: 25000,
    originalPrice: 35000,
    discount: 29,
    imageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/Aec2f4136780441f1956decb868975de8P.jpg_960x960q75.jpg_.avif'
  },
  {
    id: 5,
    name: '블루투스 스피커',
    description: '강력한 저음과 선명한 고음의 고음질 블루투스 스피커입니다.',
    price: 65000,
    originalPrice: 85000,
    discount: 24,
    imageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/Aef07f064645e4c71bfc31bf6ff0089ceW.jpg_960x960q75.jpg_.avif'
  },
  {
    id: 6,
    name: '스마트폰 케이스',
    description: '방전과 낙하 충격으로부터 보호하는 프리미엄 케이스입니다.',
    price: 18000,
    originalPrice: 25000,
    discount: 28,
    imageUrl: 'https://ae-pic-a1.aliexpress-media.com/kf/S14166f1b87264d65a54dd7fb24f37afaa.png_960x960.png_.avif'
  }
]

export default function RecommendedPage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({})
  const [addingToCart, setAddingToCart] = useState<{[key: number]: boolean}>({})
  const [cartData, setCartData] = useState<CartData>({ items: [], totalCount: 0, totalPrice: 0 })
  const [showCartModal, setShowCartModal] = useState(false)
  const [addedProduct, setAddedProduct] = useState<Product | null>(null)

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

      console.log('🛍️ Recommended page loaded:', {
        isWebView: hasReactNativeWebView,
        hasCookieToken: !!cookieToken,
        hasAppTokenFunction: hasGetAppToken
      });

      // 초기 장바구니 데이터 로드
      loadCartItems();

      // 장바구니 업데이트 이벤트 리스너 등록
      const handleCartUpdate = () => {
        loadCartItems();
      };
      window.addEventListener('cartUpdated', handleCartUpdate);

      return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
      };
    }

  }, [])

  const loadCartItems = () => {
    const items: {[key: number]: number} = {};
    recommendedProducts.forEach(product => {
      const quantity = getCartItemQuantity(product.id);
      if (quantity > 0) {
        items[product.id] = quantity;
      }
    });
    setCartItems(items);
  }

  const handleAddToCart = async (product: Product) => {
    setAddingToCart(prev => ({...prev, [product.id]: true}))

    try {
      // 로딩 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))

      // 장바구니에 상품 추가
      const updatedCart = addToCart({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        originalPrice: product.originalPrice,
        discount: product.discount
      });

      // 로컬 상태 업데이트
      setCartItems(prev => ({
        ...prev,
        [product.id]: getCartItemQuantity(product.id)
      }));

      // 성공 알림 및 이동 선택 - 모든 환경에서 모달 표시
      setAddedProduct(product);
      setShowCartModal(true);

      // WebView 환경에서 추가로 메시지 전송
      if (typeof window !== 'undefined' && (window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ADD_TO_CART_SUCCESS',
          productName: product.name,
          quantity: getCartItemQuantity(product.id)
        }))
      }
    } catch (error) {
      alert('장바구니 추가에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setAddingToCart(prev => ({...prev, [product.id]: false}))
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price)
  }

  const handleGoToCart = () => {
    setShowCartModal(false);
    if (typeof window !== 'undefined') {
      if ((window as any).ReactNativeWebView) {
        window.location.href = '/cart';
      } else {
        window.location.href = '/cart';
      }
    }
  }

  const handleContinueShopping = () => {
    setShowCartModal(false);
    setAddedProduct(null);
  }

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/home" />

      <div style={styles.productsGrid}>
        {recommendedProducts.map((product) => (
          <div key={product.id} style={styles.productCard}>
            <div style={styles.imageContainer}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={styles.productImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300/cccccc/666666?text=이미지+없음'
                }}
              />
              {product.discount && (
                <div style={styles.discountBadge}>
                  {product.discount}% 할인
                </div>
              )}
            </div>

            <div style={styles.productInfo}>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.productDescription}>{product.description}</p>

              <div style={styles.priceContainer}>
                {product.originalPrice && (
                  <span style={styles.originalPrice}>
                    ₩{formatPrice(product.originalPrice)}
                  </span>
                )}
                <span style={styles.price}>₩{formatPrice(product.price)}</span>
              </div>

              <button
                style={{
                  ...styles.addToCartBtn,
                  ...(addingToCart[product.id] ? styles.addToCartBtnLoading : {})
                }}
                onClick={() => handleAddToCart(product)}
                disabled={addingToCart[product.id]}
              >
                <span suppressHydrationWarning={true}>
                  {addingToCart[product.id] ? '담는 중...' :
                   cartItems[product.id] ? `장바구니에 ${cartItems[product.id]}개` : '장바구니 담기'}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 장바구니 추가 성공 모달 */}
      <div suppressHydrationWarning={true}>
        {showCartModal && addedProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>장바구니에 추가되었습니다!</h3>
            </div>
            <div style={styles.modalContent}>
              <p style={styles.modalText}>
                <strong>{addedProduct.name}</strong>이(가) 장바구니에 추가되었습니다.
              </p>
            </div>
            <div style={styles.modalButtons}>
              <button
                onClick={handleContinueShopping}
                style={styles.continueBtn}
              >
                계속 쇼핑하기
              </button>
              <button
                onClick={handleGoToCart}
                style={styles.goToCartBtn}
              >
                장바구니로 이동
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  imageContainer: {
    position: 'relative' as const,
    height: '200px',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  discountBadge: {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '5px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  productInfo: {
    padding: '20px',
  },
  productName: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  productDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '15px',
    lineHeight: '1.4',
  },
  priceContainer: {
    marginBottom: '15px',
  },
  originalPrice: {
    fontSize: '14px',
    color: '#999',
    textDecoration: 'line-through',
    marginRight: '8px',
  },
  price: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  addToCartBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  addToCartBtnLoading: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    width: '90%',
    margin: '20px',
  },
  modalHeader: {
    padding: '20px 20px 10px 20px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    color: '#333',
    textAlign: 'center' as const,
  },
  modalContent: {
    padding: '20px',
  },
  modalText: {
    fontSize: '14px',
    color: '#666',
    textAlign: 'center' as const,
    lineHeight: '1.5',
    margin: 0,
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    padding: '10px 20px 20px 20px',
  },
  continueBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  goToCartBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
}