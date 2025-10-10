import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { useNavigation } from '@react-navigation/native';

interface CartData {
  items: any[];
  totalCount: number;
  totalPrice: number;
}

interface SignatureScreenProps {
  route: {
    params: {
      cartData: CartData;
    };
  };
}

export const SignatureScreen: React.FC<SignatureScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const signatureRef = useRef<any>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const { cartData } = route.params;

  // 서명이 그려지기 시작할 때
  const handleBegin = () => {
    setHasSignature(true);
  };

  // 서명이 완료될 때
  const handleSignature = (signature: string) => {
    console.log('서명 완료:', signature);

    // 서명 완료 처리
    Alert.alert(
      '서명 완료',
      '서명이 완료되었습니다. 결제를 진행하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '결제하기',
          onPress: () => {
            processPayment(signature);
          },
        },
      ]
    );
  };

  // 결제 처리
  const processPayment = async (signature: string) => {
    try {
      console.log('결제 처리 시작:', {
        signature: signature.substring(0, 50) + '...',
        cartData,
      });

      // 실제 결제 API 호출이 여기에 들어갑니다
      // await paymentAPI.processPayment({ signature, cartData });

      Alert.alert(
        '결제 완료',
        '결제가 성공적으로 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 장바구니를 비우고 WebView에 알림
              clearCartAndNotifyWeb();
              // 메인 화면으로 돌아가기
              navigation.navigate('Main' as never);
            },
          },
        ]
      );
    } catch (error) {
      console.error('결제 처리 중 오류:', error);
      Alert.alert('결제 실패', '결제 처리 중 오류가 발생했습니다.');
    }
  };

  // 장바구니 비우기 및 웹에 알림
  const clearCartAndNotifyWeb = () => {
    // WebView에 장바구니 비우기 메시지 전송
    // 이는 WebEmbed에서 JavaScript를 주입하여 처리됩니다
    console.log('장바구니 비우기 및 웹 새로고침 요청');
  };

  // 서명 초기화
  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  // 빈 서명 처리
  const handleEmpty = () => {
    setHasSignature(false);
  };

  // 뒤로 가기
  const handleBack = () => {
    Alert.alert(
      '서명 취소',
      '서명을 취소하고 돌아가시겠습니까?',
      [
        {
          text: '계속하기',
          style: 'cancel',
        },
        {
          text: '돌아가기',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>서명 입력</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 주문 정보 */}
      <View style={styles.orderInfo}>
        <Text style={styles.orderTitle}>주문 요약</Text>
        <View style={styles.orderDetails}>
          <Text style={styles.orderText}>상품 개수: {cartData.totalCount}개</Text>
          <Text style={styles.orderText}>총 금액: ₩{formatPrice(cartData.totalPrice)}</Text>
        </View>
      </View>

      {/* 서명 안내 */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>서명을 입력해주세요</Text>
        <Text style={styles.instructionText}>
          아래 영역에 손가락으로 서명을 그려주세요
        </Text>
      </View>

      {/* 서명 캔버스 */}
      <View style={styles.signatureContainer}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={handleSignature}
          onEmpty={handleEmpty}
          onBegin={handleBegin}
          descriptionText=""
          clearText="초기화"
          confirmText="완료"
          trimWhitespace={true}
          rotateClockwise={false}
          imageType="image/png"
          webStyle={`
            .m-signature-pad {
              box-shadow: none;
              border: 2px solid #ddd;
              border-radius: 8px;
              position: relative;
              touch-action: none;
            }
            .m-signature-pad--body {
              border: none;
              position: relative;
            }
            .m-signature-pad--body canvas {
              position: relative;
              left: 0;
              top: 0;
              width: 100% !important;
              height: 100% !important;
              touch-action: none;
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            .m-signature-pad--footer {
              display: none;
            }
            body, html {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              overflow: hidden;
              position: relative;
              -webkit-user-select: none;
              -webkit-touch-callout: none;
            }
            * {
              box-sizing: border-box;
              -webkit-tap-highlight-color: transparent;
            }
          `}
          backgroundColor="white"
          penColor="black"
          autoClear={false}
        />
      </View>

      {/* 버튼 그룹 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>다시 그리기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !hasSignature && styles.confirmButtonDisabled,
          ]}
          onPress={() => signatureRef.current?.readSignature()}
          disabled={!hasSignature}
        >
          <Text style={styles.confirmButtonText}>서명 완료</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  orderInfo: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  orderDetails: {
    gap: 4,
  },
  orderText: {
    fontSize: 14,
    color: '#666',
  },
  instructionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  signatureContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    overflow: 'hidden',
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    flex: 1,
    padding: 16,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});