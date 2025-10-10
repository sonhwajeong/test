export interface CartProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  originalPrice?: number;
  discount?: number;
  quantity: number;
}

export interface CartData {
  items: CartProduct[];
  totalCount: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'myapp_cart';

// 장바구니 데이터 가져오기
export const getCartData = (): CartData => {
  if (typeof window === 'undefined') {
    return { items: [], totalCount: 0, totalPrice: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: parsed.items || [],
        totalCount: parsed.totalCount || 0,
        totalPrice: parsed.totalPrice || 0
      };
    }
  } catch (error) {
    console.error('장바구니 데이터 로드 실패:', error);
  }

  return { items: [], totalCount: 0, totalPrice: 0 };
};

// 장바구니 데이터 저장하기
export const saveCartData = (cartData: CartData): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));

    // 커스텀 이벤트 발생시켜 다른 페이지에서 감지할 수 있도록
    window.dispatchEvent(new CustomEvent('cartUpdated', {
      detail: cartData
    }));
  } catch (error) {
    console.error('장바구니 데이터 저장 실패:', error);
  }
};

// 장바구니 총계 계산
const calculateTotals = (items: CartProduct[]) => {
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalCount, totalPrice };
};

// 장바구니에 상품 추가
export const addToCart = (product: Omit<CartProduct, 'quantity'>): CartData => {
  const cartData = getCartData();
  const existingItemIndex = cartData.items.findIndex(item => item.id === product.id);

  if (existingItemIndex >= 0) {
    // 이미 있는 상품이면 수량 증가
    cartData.items[existingItemIndex].quantity += 1;
  } else {
    // 새로운 상품이면 추가
    cartData.items.push({ ...product, quantity: 1 });
  }

  const totals = calculateTotals(cartData.items);
  const updatedCart = {
    items: cartData.items,
    ...totals
  };

  saveCartData(updatedCart);
  return updatedCart;
};

// 장바구니에서 상품 제거
export const removeFromCart = (productId: number): CartData => {
  const cartData = getCartData();
  cartData.items = cartData.items.filter(item => item.id !== productId);

  const totals = calculateTotals(cartData.items);
  const updatedCart = {
    items: cartData.items,
    ...totals
  };

  saveCartData(updatedCart);
  return updatedCart;
};

// 장바구니 상품 수량 업데이트
export const updateCartItemQuantity = (productId: number, quantity: number): CartData => {
  const cartData = getCartData();
  const itemIndex = cartData.items.findIndex(item => item.id === productId);

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // 수량이 0 이하면 상품 제거
      cartData.items.splice(itemIndex, 1);
    } else {
      // 수량 업데이트
      cartData.items[itemIndex].quantity = quantity;
    }
  }

  const totals = calculateTotals(cartData.items);
  const updatedCart = {
    items: cartData.items,
    ...totals
  };

  saveCartData(updatedCart);
  return updatedCart;
};

// 장바구니 비우기
export const clearCart = (): CartData => {
  const emptyCart = { items: [], totalCount: 0, totalPrice: 0 };
  saveCartData(emptyCart);
  return emptyCart;
};

// 특정 상품의 장바구니 수량 가져오기
export const getCartItemQuantity = (productId: number): number => {
  const cartData = getCartData();
  const item = cartData.items.find(item => item.id === productId);
  return item ? item.quantity : 0;
};