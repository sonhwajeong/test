'use client'

import { useState, useRef } from 'react'
import { Header } from '../../../components/Header'
import { SignatureModal } from '../../../components/SignatureModal'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface ContractFormData {
  employer: string // 갑 (사업주)
  employee: string // 을 (근로자)
  contractStartYear: string
  contractStartMonth: string
  contractStartDay: string
  contractEndYear: string
  contractEndMonth: string
  contractEndDay: string
  workplace: string
  workContent: string
  workStartHour: string
  workStartMinute: string
  workEndHour: string
  workEndMinute: string
  restStartHour: string
  restStartMinute: string
  restEndHour: string
  restEndMinute: string
  workDays: string
  restDay: string
  wageAmount: string
  bonusYes: string
  bonusNo: string
  allowanceYes: string
  allowanceNo: string
  additionalWage1: string
  additionalWage2: string
  paymentCycle: string
  paymentDay: string
  paymentMethodBank: string
  paymentMethodAccount: string
  signYear: string
  signMonth: string
  signDay: string
  employerCompany: string
  employerAddress: string
  employerName: string
  employerPhone: string
  employeeAddress: string
  employeePhone: string
  employeeName: string
}

export default function ContractPage() {
  const contractRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<ContractFormData>({
    employer: '',
    employee: '',
    contractStartYear: '',
    contractStartMonth: '',
    contractStartDay: '',
    contractEndYear: '',
    contractEndMonth: '',
    contractEndDay: '',
    workplace: '',
    workContent: '',
    workStartHour: '',
    workStartMinute: '',
    workEndHour: '',
    workEndMinute: '',
    restStartHour: '',
    restStartMinute: '',
    restEndHour: '',
    restEndMinute: '',
    workDays: '',
    restDay: '',
    wageAmount: '',
    bonusYes: '',
    bonusNo: '',
    allowanceYes: '',
    allowanceNo: '',
    additionalWage1: '',
    additionalWage2: '',
    paymentCycle: '',
    paymentDay: '',
    paymentMethodBank: '',
    paymentMethodAccount: '',
    signYear: '',
    signMonth: '',
    signDay: '',
    employerCompany: '',
    employerAddress: '',
    employerName: '',
    employerPhone: '',
    employeeAddress: '',
    employeePhone: '',
    employeeName: '',
  })

  const [employerSignature, setEmployerSignature] = useState<string>('')
  const [employeeSignature, setEmployeeSignature] = useState<string>('')
  const [isEmployerSignatureModalOpen, setIsEmployerSignatureModalOpen] = useState(false)
  const [isEmployeeSignatureModalOpen, setIsEmployeeSignatureModalOpen] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleInputChange = (field: keyof ContractFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmployerSignatureSave = (signature: string) => {
    setEmployerSignature(signature)
  }

  const handleEmployeeSignatureSave = (signature: string) => {
    setEmployeeSignature(signature)
  }

  const handleGeneratePDF = async () => {
    console.log('PDF 생성 시작')

    if (!contractRef.current) {
      console.error('contractRef가 없습니다')
      alert('계약서 요소를 찾을 수 없습니다.')
      return
    }

    setIsGeneratingPDF(true)

    try {
      const originalElement = contractRef.current

      // 보이지 않는 복사본 생성
      const cloneElement = originalElement.cloneNode(true) as HTMLElement
      cloneElement.style.position = 'fixed'
      cloneElement.style.left = '-9999px'
      cloneElement.style.top = '0'
      cloneElement.style.width = '210mm'
      cloneElement.style.minHeight = '297mm'
      cloneElement.style.padding = '20mm'
      cloneElement.style.boxSizing = 'border-box'
      cloneElement.style.backgroundColor = '#ffffff'

      // 복사본의 모든 버튼 숨기기
      const buttons = cloneElement.querySelectorAll('button')
      buttons.forEach(btn => {
        (btn as HTMLElement).style.display = 'none'
      })

      // 복사본의 모든 input 테두리 제거 (값만 표시)
      const inputs = cloneElement.querySelectorAll('input')
      inputs.forEach(input => {
        const inputEl = input as HTMLInputElement
        inputEl.style.border = 'none'
        inputEl.style.outline = 'none'
        inputEl.style.padding = '0'
        inputEl.style.backgroundColor = 'transparent'
        // input을 읽기 전용 텍스트처럼 보이게
        inputEl.style.pointerEvents = 'none'
      })

      // 복사본을 DOM에 추가
      document.body.appendChild(cloneElement)

      // 약간의 지연으로 렌더링 대기
      await new Promise(resolve => setTimeout(resolve, 100))

      console.log('html2canvas 시작 (복사본)')

      // A4 크기로 캡처 (300 DPI)
      const canvas = await html2canvas(cloneElement, {
        scale: 3, // 고해상도로 캡처
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      })

      // 복사본 제거
      document.body.removeChild(cloneElement)

      console.log('Canvas 생성 완료:', canvas.width, 'x', canvas.height)

      const imgData = canvas.toDataURL('image/png')
      console.log('이미지 데이터 생성 완료')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pdfWidth = 210 // A4 width in mm
      const pdfHeight = 297 // A4 height in mm
      const imgWidth = canvas.width
      const imgHeight = canvas.height

      // A4 비율로 계산
      const ratio = pdfWidth / imgWidth
      const scaledHeight = imgHeight * ratio

      // 여러 페이지로 분할
      let heightLeft = scaledHeight
      let position = 0
      let page = 0

      while (heightLeft > 0) {
        if (page > 0) {
          pdf.addPage()
        }

        // 현재 페이지에 넣을 이미지의 소스 영역 계산
        const sourceY = (page * pdfHeight) / ratio
        const sourceHeight = Math.min((pdfHeight / ratio), imgHeight - sourceY)

        // 임시 캔버스 생성
        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = imgWidth
        pageCanvas.height = sourceHeight
        const ctx = pageCanvas.getContext('2d')

        if (ctx) {
          ctx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight)
          const pageImgData = pageCanvas.toDataURL('image/png')
          const pageHeight = sourceHeight * ratio
          pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pageHeight)
        }

        heightLeft -= pdfHeight
        page++
      }

      console.log(`총 ${page}페이지 생성 완료`)

      console.log('PDF 저장 시작')

      // WebView 환경 감지
      const isWebView = !!(window as any).ReactNativeWebView
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      console.log('WebView 환경:', isWebView, '모바일:', isMobile)

      if (isWebView) {
        // React Native WebView 내부: 앱으로 PDF 데이터 전송
        console.log('WebView에서 앱으로 PDF 전송')
        const pdfBase64 = pdf.output('datauristring') // Base64 data URI 생성

        // 앱으로 메시지 전송
        ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PDF_DOWNLOAD',
          fileName: '근로계약서.pdf',
          pdfData: pdfBase64,
          timestamp: Date.now()
        }))

        alert('PDF가 생성되었습니다! 앱의 다운로드 폴더에 저장됩니다.')
        console.log('PDF 데이터 전송 완료')
      } else if (isMobile) {
        // 모바일 브라우저: 다운로드 링크 생성 방식
        const pdfBlob = pdf.output('blob')
        const blobUrl = URL.createObjectURL(pdfBlob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = '근로계약서.pdf'
        link.style.display = 'none'
        document.body.appendChild(link)

        // iOS Safari를 위한 특별 처리
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          const newWindow = window.open(blobUrl, '_blank')
          if (newWindow) {
            alert('PDF가 생성되었습니다! 우측 상단의 공유 버튼을 눌러 저장하세요.')
          } else {
            alert('팝업 차단을 해제해주세요.')
          }
        } else {
          // Android 브라우저
          link.click()
          setTimeout(() => {
            alert('PDF 다운로드가 시작되었습니다! 다운로드 폴더를 확인하세요.')
          }, 100)
        }

        document.body.removeChild(link)
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
      } else {
        // 데스크톱 브라우저: 기존 방식
        pdf.save('근로계약서.pdf')
        alert('PDF 다운로드가 완료되었습니다!')
      }

      console.log('PDF 저장 완료')

    } catch (error) {
      console.error('PDF 생성 중 오류 발생:', error)
      alert(`PDF 생성 중 오류가 발생했습니다: ${error}`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/contract" />

      <div style={styles.content}>
        <div style={styles.contractWrapper} ref={contractRef}>
          <h1 style={styles.title}>표준근로계약서</h1>

          <div style={styles.section}>
            <div style={styles.row}>
              <input
                type="text"
                placeholder="사업주명"
                value={formData.employer}
                onChange={(e) => handleInputChange('employer', e.target.value)}
                style={styles.inlineInput}
              />
              <span style={styles.text}>(이하 "갑"이라 함)과</span>
              <input
                type="text"
                placeholder="근로자명"
                value={formData.employee}
                onChange={(e) => handleInputChange('employee', e.target.value)}
                style={styles.inlineInput}
              />
              <span style={styles.text}>(이하 "을"이라 함)은</span>
            </div>
            <div style={styles.text}>다음과 같이 근로계약을 체결한다.</div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>1. 근로계약기간 :</h3>
            <div style={styles.row}>
              <input
                type="text"
                placeholder="년"
                value={formData.contractStartYear}
                onChange={(e) => handleInputChange('contractStartYear', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>년</span>
              <input
                type="text"
                placeholder="월"
                value={formData.contractStartMonth}
                onChange={(e) => handleInputChange('contractStartMonth', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>월</span>
              <input
                type="text"
                placeholder="일"
                value={formData.contractStartDay}
                onChange={(e) => handleInputChange('contractStartDay', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>일부터</span>
              <input
                type="text"
                placeholder="년"
                value={formData.contractEndYear}
                onChange={(e) => handleInputChange('contractEndYear', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>년</span>
              <input
                type="text"
                placeholder="월"
                value={formData.contractEndMonth}
                onChange={(e) => handleInputChange('contractEndMonth', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>월</span>
              <input
                type="text"
                placeholder="일"
                value={formData.contractEndDay}
                onChange={(e) => handleInputChange('contractEndDay', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>일까지</span>
            </div>
            <div style={styles.note}>※ 근로계약기간을 정하지 않는 경우에는 "근로개시일"만 기재</div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>2. 근 무 장 소 :</h3>
            <input
              type="text"
              placeholder="근무 장소를 입력하세요"
              value={formData.workplace}
              onChange={(e) => handleInputChange('workplace', e.target.value)}
              style={styles.fullInput}
            />
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>3. 업무의 내용 :</h3>
            <input
              type="text"
              placeholder="업무 내용을 입력하세요"
              value={formData.workContent}
              onChange={(e) => handleInputChange('workContent', e.target.value)}
              style={styles.fullInput}
            />
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>4. 소정근로시간 :</h3>
            <div style={styles.row}>
              <span style={styles.text}>시</span>
              <input
                type="text"
                placeholder="시"
                value={formData.workStartHour}
                onChange={(e) => handleInputChange('workStartHour', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>분</span>
              <input
                type="text"
                placeholder="분"
                value={formData.workStartMinute}
                onChange={(e) => handleInputChange('workStartMinute', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>부터 시</span>
              <input
                type="text"
                placeholder="시"
                value={formData.workEndHour}
                onChange={(e) => handleInputChange('workEndHour', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>분</span>
              <input
                type="text"
                placeholder="분"
                value={formData.workEndMinute}
                onChange={(e) => handleInputChange('workEndMinute', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>까지 (휴게시간: 시</span>
              <input
                type="text"
                placeholder="시"
                value={formData.restStartHour}
                onChange={(e) => handleInputChange('restStartHour', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>분</span>
              <input
                type="text"
                placeholder="분"
                value={formData.restStartMinute}
                onChange={(e) => handleInputChange('restStartMinute', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>~ 시</span>
              <input
                type="text"
                placeholder="시"
                value={formData.restEndHour}
                onChange={(e) => handleInputChange('restEndHour', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>분</span>
              <input
                type="text"
                placeholder="분"
                value={formData.restEndMinute}
                onChange={(e) => handleInputChange('restEndMinute', e.target.value)}
                style={styles.verySmallInput}
              />
              <span style={styles.text}>)</span>
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>5. 근무일/휴일 :</h3>
            <div style={styles.row}>
              <span style={styles.text}>매주</span>
              <input
                type="text"
                placeholder="일(또는 매일단위)"
                value={formData.workDays}
                onChange={(e) => handleInputChange('workDays', e.target.value)}
                style={styles.mediumInput}
              />
              <span style={styles.text}>근무, 주휴일 매주</span>
              <input
                type="text"
                placeholder="요일"
                value={formData.restDay}
                onChange={(e) => handleInputChange('restDay', e.target.value)}
                style={styles.smallInput}
              />
            </div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>6. 임 금</h3>
            <ul style={styles.list}>
              <li>
                <div style={styles.row}>
                  <span style={styles.text}>- 월(일, 시간)급 :</span>
                  <input
                    type="text"
                    placeholder="금액"
                    value={formData.wageAmount}
                    onChange={(e) => handleInputChange('wageAmount', e.target.value)}
                    style={styles.mediumInput}
                  />
                  <span style={styles.text}>원</span>
                </div>
              </li>
              <li>
                <div style={styles.row}>
                  <span style={styles.text}>- 상여금 : 있을 (</span>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.bonusYes}
                    onChange={(e) => handleInputChange('bonusYes', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>), 없을 (</span>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.bonusNo}
                    onChange={(e) => handleInputChange('bonusNo', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>)</span>
                </div>
              </li>
              <li>
                <div style={styles.row}>
                  <span style={styles.text}>- 기타급여(제수당 등) : 있을 (</span>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.allowanceYes}
                    onChange={(e) => handleInputChange('allowanceYes', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>), 없을 (</span>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.allowanceNo}
                    onChange={(e) => handleInputChange('allowanceNo', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>)</span>
                </div>
              </li>
              <li>
                <div style={styles.row}>
                  <input
                    type="text"
                    placeholder="원"
                    value={formData.additionalWage1}
                    onChange={(e) => handleInputChange('additionalWage1', e.target.value)}
                    style={styles.mediumInput}
                  />
                  <span style={styles.text}>원,</span>
                  <input
                    type="text"
                    placeholder="원"
                    value={formData.additionalWage2}
                    onChange={(e) => handleInputChange('additionalWage2', e.target.value)}
                    style={styles.mediumInput}
                  />
                  <span style={styles.text}>원</span>
                </div>
              </li>
              <li>
                <div style={styles.row}>
                  <span style={styles.text}>- 임금지급일 : 매주(매주 또는 매월)</span>
                  <input
                    type="text"
                    placeholder="일"
                    value={formData.paymentDay}
                    onChange={(e) => handleInputChange('paymentDay', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>일(주말과 경우는 전월 지급)</span>
                </div>
              </li>
              <li>
                <div style={styles.row}>
                  <span style={styles.text}>- 지급방법 : 은행계좌 직접송금(</span>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.paymentMethodBank}
                    onChange={(e) => handleInputChange('paymentMethodBank', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>), 예금통장 입금(</span>
                  <input
                    type="text"
                    placeholder=""
                    value={formData.paymentMethodAccount}
                    onChange={(e) => handleInputChange('paymentMethodAccount', e.target.value)}
                    style={styles.smallInput}
                  />
                  <span style={styles.text}>)</span>
                </div>
              </li>
            </ul>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>7. 연차유급휴가</h3>
            <div style={styles.text}>- 연차유급휴가는 근로기준법에서 정하는 바에 따라 부여함</div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>8. 근로계약서 교부</h3>
            <div style={styles.text}>- "갑"은 근로계약을 체결함과 동시에 본 계약서를 사본하여 "을"에게 교부함</div>
            <div style={styles.text}>  부요함은 근로계약이 "을"에게 교부할(근로기준법 제17조 이행)</div>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>9. 기 타</h3>
            <div style={styles.text}>- 이 계약에 정함이 없는 사항은 근로기준법령에 의함</div>
          </div>

          <div style={styles.signatureSection}>
            <div style={styles.signatureDate}>
              <input
                type="text"
                placeholder="년"
                value={formData.signYear}
                onChange={(e) => handleInputChange('signYear', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>년</span>
              <input
                type="text"
                placeholder="월"
                value={formData.signMonth}
                onChange={(e) => handleInputChange('signMonth', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>월</span>
              <input
                type="text"
                placeholder="일"
                value={formData.signDay}
                onChange={(e) => handleInputChange('signDay', e.target.value)}
                style={styles.smallInput}
              />
              <span style={styles.text}>일</span>
            </div>

            <div style={styles.signatureRow}>
              <div style={styles.signatureBlock}>
                <div style={styles.signatureLabel}>(갑) 사업체명 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employerCompany}
                  onChange={(e) => handleInputChange('employerCompany', e.target.value)}
                  style={styles.fullWidthInput}
                />
                <div style={styles.signatureLabel}>주 소 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employerAddress}
                  onChange={(e) => handleInputChange('employerAddress', e.target.value)}
                  style={styles.fullWidthInput}
                />
                <div style={styles.signatureLabel}>대 표 자 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employerName}
                  onChange={(e) => handleInputChange('employerName', e.target.value)}
                  style={styles.fullWidthInput}
                />
              </div>

              <div style={styles.signatureBlock}>
                <div style={styles.signatureLabel}>(전화 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employerPhone}
                  onChange={(e) => handleInputChange('employerPhone', e.target.value)}
                  style={styles.fullWidthInput}
                />
                <div style={styles.signatureLabel}>)</div>
                <div style={employerSignature ? styles.signatureImageContainerWithSign : styles.signatureImageContainer}>
                  {employerSignature && (
                    <img src={employerSignature} alt="갑 서명" style={styles.signatureImage} />
                  )}
                  {!employerSignature && (
                    <button
                      onClick={() => setIsEmployerSignatureModalOpen(true)}
                      style={styles.signatureButton}
                    >
                      서명하기
                    </button>
                  )}
                </div>
                <div style={styles.signatureLabel}>(서명)</div>
              </div>
            </div>

            <div style={styles.signatureRow}>
              <div style={styles.signatureBlock}>
                <div style={styles.signatureLabel}>(을) 주 소 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employeeAddress}
                  onChange={(e) => handleInputChange('employeeAddress', e.target.value)}
                  style={styles.fullWidthInput}
                />
                <div style={styles.signatureLabel}>연 락 처 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employeePhone}
                  onChange={(e) => handleInputChange('employeePhone', e.target.value)}
                  style={styles.fullWidthInput}
                />
                <div style={styles.signatureLabel}>성 명 :</div>
                <input
                  type="text"
                  placeholder=""
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  style={styles.fullWidthInput}
                />
              </div>

              <div style={styles.signatureBlock}>
                <div style={employeeSignature ? styles.signatureImageContainerWithSign : styles.signatureImageContainer}>
                  {employeeSignature && (
                    <img src={employeeSignature} alt="을 서명" style={styles.signatureImage} />
                  )}
                  {!employeeSignature && (
                    <button
                      onClick={() => setIsEmployeeSignatureModalOpen(true)}
                      style={styles.signatureButton}
                    >
                      서명하기
                    </button>
                  )}
                </div>
                <div style={styles.signatureLabel}>(서명)</div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.pdfButtonContainer}>
          <button
            onClick={handleGeneratePDF}
            disabled={isGeneratingPDF}
            style={{
              ...styles.pdfButton,
              ...(isGeneratingPDF ? styles.pdfButtonDisabled : {})
            }}
          >
            {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF로 다운로드'}
          </button>
        </div>
      </div>

      <SignatureModal
        isOpen={isEmployerSignatureModalOpen}
        onClose={() => setIsEmployerSignatureModalOpen(false)}
        onSignatureSave={handleEmployerSignatureSave}
      />

      <SignatureModal
        isOpen={isEmployeeSignatureModalOpen}
        onClose={() => setIsEmployeeSignatureModalOpen(false)}
        onSignatureSave={handleEmployeeSignatureSave}
      />
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
    padding: '20px',
    overflowY: 'auto' as const,
  },
  contractWrapper: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '20px',
    border: '2px solid #333',
    padding: '10px',
  },
  section: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginBottom: '6px',
  },
  text: {
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6',
  },
  note: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px',
  },
  list: {
    listStyleType: 'none',
    paddingLeft: '0',
    margin: '5px 0',
  },
  inlineInput: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '0',
    minWidth: '100px',
    backgroundColor: 'white',
  },
  smallInput: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '0',
    width: '50px',
    textAlign: 'center' as const,
    backgroundColor: 'white',
  },
  verySmallInput: {
    padding: '4px 6px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '0',
    width: '40px',
    textAlign: 'center' as const,
    backgroundColor: 'white',
  },
  mediumInput: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '0',
    width: '120px',
    backgroundColor: 'white',
  },
  fullInput: {
    padding: '4px 8px',
    fontSize: '14px',
    border: '1px solid #333',
    borderRadius: '0',
    width: '100%',
    marginBottom: '8px',
    backgroundColor: 'white',
  },
  fullWidthInput: {
    padding: '4px 8px',
    fontSize: '13px',
    border: '1px solid #333',
    borderRadius: '0',
    width: '100%',
    marginBottom: '5px',
    backgroundColor: 'white',
  },
  signatureSection: {
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '1px solid #333',
  },
  signatureDate: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  signatureRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '30px',
  },
  signatureBlock: {
    flex: 1,
  },
  signatureLabel: {
    fontSize: '13px',
    fontWeight: 'normal',
    marginBottom: '3px',
    color: '#333',
  },
  signatureImageContainer: {
    position: 'relative' as const,
    minHeight: '80px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5px',
    marginBottom: '5px',
    backgroundColor: '#ffffff',
  },
  signatureImageContainerWithSign: {
    position: 'relative' as const,
    minHeight: '80px',
    border: 'none',
    padding: '8px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '5px',
    marginBottom: '5px',
    backgroundColor: 'transparent',
  },
  signatureImage: {
    maxWidth: '100%',
    maxHeight: '70px',
    objectFit: 'contain' as const,
  },
  signatureButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'normal',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  pdfButtonContainer: {
    maxWidth: '800px',
    margin: '20px auto',
    textAlign: 'center' as const,
  },
  pdfButton: {
    padding: '15px 40px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
  },
  pdfButtonDisabled: {
    backgroundColor: '#6c757d',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
}
