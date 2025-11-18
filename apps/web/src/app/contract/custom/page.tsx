'use client'

import { useState, useRef, useEffect } from 'react'
import { Header } from '../../../components/Header'
import { SignatureModal } from '../../../components/SignatureModal'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface InputField {
  id: string
  type: 'text' | 'signature'
  x: number
  y: number
  width: number
  height: number
  value: string
  label: string
  page: number  // 어느 페이지의 필드인지
  fontSize?: number  // 텍스트 필드의 글자 크기
}

export default function CustomContractPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfPages, setPdfPages] = useState<string[]>([])
  const [pdfDimensions, setPdfDimensions] = useState({ width: 595, height: 842 })  // 원본 PDF 크기
  const [currentPage, setCurrentPage] = useState(0)
  const [inputFields, setInputFields] = useState<InputField[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [draggedField, setDraggedField] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false)
  const [currentSignatureField, setCurrentSignatureField] = useState<string | null>(null)
  const [pdfjsLib, setPdfjsLib] = useState<any>(null)
  const [zoom, setZoom] = useState(1)  // 줌 레벨 (1 = 100%)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)  // PDF 생성 중 여부
  const canvasRef = useRef<HTMLDivElement>(null)

  // PDF.js 동적 로드 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('pdfjs-dist/legacy/build/pdf').then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`
        setPdfjsLib(pdfjs)
      }).catch((error) => {
        console.error('PDF.js 로드 실패:', error)
        alert('PDF 라이브러리를 로드하는데 실패했습니다.')
      })
    }
  }, [])

  // PDF 파일 업로드 처리
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      alert('파일을 선택해주세요.')
      return
    }

    // 파일 타입과 확장자 모두 체크
    const isPdfType = file.type === 'application/pdf'
    const isPdfExtension = file.name.toLowerCase().endsWith('.pdf')

    console.log('파일 정보:', {
      name: file.name,
      type: file.type,
      size: file.size,
      isPdfType,
      isPdfExtension
    })

    if (!isPdfType && !isPdfExtension) {
      alert('PDF 파일만 업로드 가능합니다.')
      return
    }

    if (!pdfjsLib) {
      alert('PDF 라이브러리가 아직 로드 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setPdfFile(file)
    await convertPDFToImages(file)
  }

  // PDF를 이미지로 변환
  const convertPDFToImages = async (file: File) => {
    if (!pdfjsLib) {
      alert('PDF 라이브러리가 로드되지 않았습니다.')
      return
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pages: string[] = []

      // 첫 페이지의 원본 크기 가져오기
      const firstPage = await pdf.getPage(1)
      const originalViewport = firstPage.getViewport({ scale: 1 })

      // 원본 PDF 크기 저장 (픽셀 단위)
      setPdfDimensions({
        width: originalViewport.width,
        height: originalViewport.height
      })

      console.log('원본 PDF 크기:', originalViewport.width, 'x', originalViewport.height)

      // 모든 페이지를 원본 크기로 렌더링 (scale: 1)
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale: 1 })  // 1배 (원본 크기)

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise

          pages.push(canvas.toDataURL('image/png'))
        }
      }

      setPdfPages(pages)
      setCurrentPage(0)
    } catch (error) {
      console.error('PDF 변환 오류:', error)
      alert('PDF 파일을 읽는 데 실패했습니다.')
    }
  }

  // 입력 필드 추가
  const addInputField = (type: 'text' | 'signature') => {
    const newField: InputField = {
      id: `field-${Date.now()}`,
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 40 : 80,  // 원래 크기로 복원 (핸들이 밖에 있음)
      value: '',
      label: type === 'text' ? '텍스트 필드' : '서명',
      page: currentPage,  // 현재 페이지에 추가
      fontSize: 11,  // 기본 글자 크기
    }
    setInputFields([...inputFields, newField])
  }

  // 글자 크기 변경
  const handleFontSizeChange = (fieldId: string, delta: number) => {
    setInputFields(fields =>
      fields.map(field =>
        field.id === fieldId && field.type === 'text'
          ? { ...field, fontSize: Math.max(8, Math.min(24, (field.fontSize || 11) + delta)) }
          : field
      )
    )
  }

  // 필드 삭제
  const handleDeleteField = (fieldId: string) => {
    setInputFields(fields => fields.filter(field => field.id !== fieldId))
  }

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent, fieldId: string) => {
    const target = e.target as HTMLElement

    // INPUT이나 서명 영역을 직접 클릭한 경우 드래그 방지
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      return
    }

    // 서명 클릭 영역을 클릭한 경우 드래그 방지
    if (target.closest('.signature-click-area')) {
      return
    }

    // 드래그 핸들을 클릭한 경우에만 드래그 시작
    const isDragHandle = target.classList.contains('drag-handle') ||
                         target.closest('.drag-handle')

    if (!isDragHandle) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const field = inputFields.find(f => f.id === fieldId)
    if (!field) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setDraggedField(fieldId)
    setIsDragging(true)
  }

  // 드래그 중
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedField || !canvasRef.current) return

    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - canvasRect.left - dragOffset.x
    const y = e.clientY - canvasRect.top - dragOffset.y

    setInputFields(fields =>
      fields.map(field =>
        field.id === draggedField
          ? { ...field, x: Math.max(0, x), y: Math.max(0, y) }
          : field
      )
    )
  }

  // 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false)
    setDraggedField(null)
  }

  // 터치 이벤트 핸들러 (모바일용)
  const handleTouchStart = (e: React.TouchEvent, fieldId: string) => {
    const target = e.target as HTMLElement

    // INPUT이나 버튼, 서명 영역을 직접 터치한 경우 드래그 방지
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      return
    }

    // 서명 클릭 영역을 터치한 경우 드래그 방지
    if (target.closest('.signature-click-area')) {
      return
    }

    // 드래그 핸들을 터치한 경우에만 드래그 시작
    const isDragHandle = target.classList.contains('drag-handle') ||
                         target.closest('.drag-handle')

    if (!isDragHandle) {
      return
    }

    e.preventDefault()
    e.stopPropagation()

    const field = inputFields.find(f => f.id === fieldId)
    if (!field) return

    const touch = e.touches[0]
    const fieldElement = (e.currentTarget as HTMLElement)
    const rect = fieldElement.getBoundingClientRect()

    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    })
    setDraggedField(fieldId)
    setIsDragging(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !draggedField || !canvasRef.current) return

    e.preventDefault()
    const touch = e.touches[0]
    const canvasRect = canvasRef.current.getBoundingClientRect()
    const x = touch.clientX - canvasRect.left - dragOffset.x
    const y = touch.clientY - canvasRect.top - dragOffset.y

    setInputFields(fields =>
      fields.map(field =>
        field.id === draggedField
          ? { ...field, x: Math.max(0, x), y: Math.max(0, y) }
          : field
      )
    )
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setDraggedField(null)
  }

  // 입력 값 변경
  const handleInputChange = (fieldId: string, value: string) => {
    setInputFields(fields =>
      fields.map(field =>
        field.id === fieldId ? { ...field, value } : field
      )
    )
  }

  // 서명 처리
  const handleSignatureClick = (fieldId: string) => {
    setCurrentSignatureField(fieldId)
    setIsSignatureModalOpen(true)
  }

  const handleSignatureSave = (signature: string) => {
    if (currentSignatureField) {
      handleInputChange(currentSignatureField, signature)
    }
    setCurrentSignatureField(null)
  }

  // PDF 생성
  const handleGeneratePDF = async () => {
    if (pdfPages.length === 0 || !canvasRef.current) return

    try {
      console.log('PDF 생성 시작')
      setIsGeneratingPDF(true)

      // 원래 zoom 레벨 저장
      const originalZoom = zoom
      const originalPage = currentPage

      // zoom을 1로 설정 (100%)
      setZoom(1)
      await new Promise(resolve => setTimeout(resolve, 100))

      // 원본 PDF 크기 사용
      const pdfWidth = pdfDimensions.width
      const pdfHeight = pdfDimensions.height

      console.log('PDF 생성 크기:', pdfWidth, 'x', pdfHeight)

      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'pt',
        format: [pdfWidth, pdfHeight],
      })

      // 각 페이지별로 처리
      for (let i = 0; i < pdfPages.length; i++) {
        console.log(`페이지 ${i + 1}/${pdfPages.length} 처리 중...`)

        // 해당 페이지로 전환
        setCurrentPage(i)

        // 페이지 렌더링 대기 (폰트 로드 포함)
        await new Promise(resolve => setTimeout(resolve, 500))

        if (i > 0) pdf.addPage()

        // canvasRef를 html2canvas로 캡처 (1:1 매핑을 위해 scale: 1 사용)
        const canvas = await html2canvas(canvasRef.current, {
          scale: 1,  // 1:1 크기 (원본 크기 그대로)
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
          width: pdfWidth,  // 원본 PDF 크기로 고정
          height: pdfHeight,
          // 폰트가 완전히 로드될 때까지 대기
          onclone: (clonedDoc) => {
            const clonedCanvas = clonedDoc.querySelector('[ref="canvas"]') as HTMLElement
            if (clonedCanvas) {
              // 모든 폰트가 로드될 때까지 대기
              return (document as any).fonts?.ready || Promise.resolve()
            }
          }
        })

        const imgData = canvas.toDataURL('image/png')

        // 이미지를 PDF에 1:1로 추가
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

        console.log(`페이지 ${i + 1} 완료`)
      }

      // 원래 상태로 복원
      setCurrentPage(originalPage)
      setZoom(originalZoom)
      setIsGeneratingPDF(false)

      // WebView 환경 감지
      const isWebView = !!(window as any).ReactNativeWebView

      if (isWebView) {
        const pdfBase64 = pdf.output('datauristring')
        ;(window as any).ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PDF_DOWNLOAD',
          fileName: '커스텀_근로계약서.pdf',
          pdfData: pdfBase64,
          timestamp: Date.now()
        }))
        alert('PDF가 생성되었습니다! 앱의 다운로드 폴더에 저장됩니다.')
      } else {
        pdf.save('커스텀_근로계약서.pdf')
        alert('PDF 다운로드가 완료되었습니다!')
      }
    } catch (error) {
      console.error('PDF 생성 오류:', error)
      alert('PDF 생성에 실패했습니다.')
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div style={styles.container}>
      <Header showBackButton={true} backUrl="/contract" />

      <div style={styles.content}>
        <h1 style={styles.title}>커스텀 근로계약서</h1>

        {!pdfFile ? (
          <div style={styles.uploadSection}>
            <div style={styles.uploadBox}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePDFUpload}
                style={styles.fileInput}
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" style={styles.uploadLabel}>
                <div style={styles.uploadIcon}>📁</div>
                <p style={styles.uploadText}>PDF 파일을 선택하세요</p>
                <p style={styles.uploadSubtext}>근로계약서 PDF를 업로드하세요</p>
              </label>
            </div>
          </div>
        ) : (
          <>
            <div style={styles.toolbar}>
              <div style={styles.toolbarSection}>
                <button
                  onClick={() => addInputField('text')}
                  style={styles.toolButton}
                >
                  ➕ 텍스트 필드 추가
                </button>
                <button
                  onClick={() => addInputField('signature')}
                  style={styles.toolButton}
                >
                  ✍️ 서명 필드 추가
                </button>
                {pdfPages.length > 1 && (
                  <span style={styles.pageIndicator}>
                    (현재 페이지: {currentPage + 1})
                  </span>
                )}
              </div>
              <div style={styles.toolbarSection}>
                <button
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  style={styles.zoomButton}
                  disabled={zoom <= 0.5}
                >
                  🔍-
                </button>
                <span style={styles.zoomIndicator}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
                  style={styles.zoomButton}
                  disabled={zoom >= 2}
                >
                  🔍+
                </button>
                <button
                  onClick={handleGeneratePDF}
                  style={{...styles.toolButton, ...styles.generateButton}}
                  disabled={isGeneratingPDF}
                >
                  {isGeneratingPDF ? '⏳ 생성 중...' : '📄 PDF 생성'}
                </button>
              </div>
            </div>

            {pdfPages.length > 1 && (
              <div style={styles.pageNavigation}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  style={{
                    ...styles.pageButton,
                    opacity: currentPage === 0 ? 0.5 : 1,
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ◀ 이전
                </button>
                <span style={styles.pageInfo}>
                  {currentPage + 1} / {pdfPages.length}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pdfPages.length - 1, prev + 1))}
                  disabled={currentPage === pdfPages.length - 1}
                  style={{
                    ...styles.pageButton,
                    opacity: currentPage === pdfPages.length - 1 ? 0.5 : 1,
                    cursor: currentPage === pdfPages.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  다음 ▶
                </button>
              </div>
            )}

            <div style={styles.canvasContainer}>
              <div
                ref={canvasRef}
                style={{
                  ...styles.canvas,
                  width: `${pdfDimensions.width}px`,  // 원본 PDF 크기
                  height: `${pdfDimensions.height}px`,  // 원본 PDF 크기
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
              {pdfPages[currentPage] && (
                <img
                  src={pdfPages[currentPage]}
                  alt={`Page ${currentPage + 1}`}
                  style={styles.pdfImage}
                />
              )}

              {inputFields
                .filter(field => field.page === currentPage)  // 현재 페이지의 필드만 표시
                .map(field => (
                  <div
                    key={field.id}
                    style={{
                      ...styles.inputField,
                      left: field.x,
                      top: field.y,
                      width: field.width,
                      height: field.height,
                      // PDF 생성 중에는 UI 요소 제거
                      border: isGeneratingPDF ? 'none' : '2px dashed #007bff',
                      backgroundColor: isGeneratingPDF ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, field.id)}
                    onTouchStart={(e) => handleTouchStart(e, field.id)}
                  >
                    {/* 삭제 버튼 - PDF 생성 중에는 숨김 */}
                    {!isGeneratingPDF && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteField(field.id)
                        }}
                        style={styles.deleteButton}
                        title="필드 삭제"
                      >
                        ✕
                      </button>
                    )}

                    {/* 드래그 핸들 - PDF 생성 중에는 숨김 */}
                    {!isGeneratingPDF && (
                      <div
                        className="drag-handle"
                        style={{
                          ...styles.dragHandle,
                          cursor: isDragging && draggedField === field.id ? 'grabbing' : 'grab',
                        }}
                      >
                        ⋮⋮
                      </div>
                    )}

                    {/* 글자 크기 조절 버튼 (텍스트 필드만) - PDF 생성 중에는 숨김 */}
                    {!isGeneratingPDF && field.type === 'text' && (
                      <div style={styles.fontSizeControls}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFontSizeChange(field.id, -1)
                          }}
                          style={styles.fontSizeButton}
                        >
                          A-
                        </button>
                        <span style={styles.fontSizeLabel}>
                          {field.fontSize || 11}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFontSizeChange(field.id, 1)
                          }}
                          style={styles.fontSizeButton}
                        >
                          A+
                        </button>
                      </div>
                    )}

                    {/* 필드 내용 */}
                    <div style={styles.fieldContent}>
                      {field.type === 'text' ? (
                        isGeneratingPDF ? (
                          // PDF 생성 중에는 텍스트만 표시
                          <div
                            style={{
                              ...styles.textDisplay,
                              fontSize: `${field.fontSize || 11}px`,
                            }}
                          >
                            {field.value}
                          </div>
                        ) : (
                          // 편집 모드에서는 입력창 표시
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.label}
                            style={{
                              ...styles.textInput,
                              fontSize: `${field.fontSize || 11}px`,
                            }}
                          />
                        )
                      ) : (
                        <div
                          className="signature-click-area"
                          onClick={() => !isGeneratingPDF && handleSignatureClick(field.id)}
                          style={{
                            ...styles.signatureBox,
                            cursor: isGeneratingPDF ? 'default' : 'pointer',
                          }}
                        >
                          {field.value ? (
                            <img src={field.value} alt="서명" style={styles.signatureImage} />
                          ) : (
                            !isGeneratingPDF && <span style={styles.signaturePlaceholder}>서명하기</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <SignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSignatureSave={handleSignatureSave}
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
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '20px',
    color: '#333',
  },
  uploadSection: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  uploadBox: {
    width: '100%',
    maxWidth: '500px',
  },
  fileInput: {
    display: 'none',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '60px',
    border: '2px dashed #007bff',
    borderRadius: '12px',
    cursor: 'pointer',
    backgroundColor: 'white',
    transition: 'background-color 0.2s',
  },
  uploadIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  uploadText: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  uploadSubtext: {
    fontSize: '14px',
    color: '#666',
  },
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toolbarSection: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  pageIndicator: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold',
  },
  toolButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  generateButton: {
    backgroundColor: '#28a745',
  },
  pageNavigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  pageInfo: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    minWidth: '80px',
    textAlign: 'center' as const,
  },
  zoomButton: {
    padding: '8px 12px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  zoomIndicator: {
    fontSize: '14px',
    color: '#333',
    fontWeight: 'bold',
    minWidth: '50px',
    textAlign: 'center' as const,
  },
  canvasContainer: {
    width: '100%',
    maxHeight: 'calc(100vh - 250px)',  // 화면 높이에 맞춰 스크롤
    overflow: 'auto',
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
    minHeight: '500px',
  },
  canvas: {
    position: 'relative' as const,
    margin: '0 auto',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'visible',  // 입력 필드가 잘리지 않도록
    touchAction: 'none' as const,  // 모바일 스크롤 방지하여 드래그 가능
  },
  pdfImage: {
    width: '100%',  // 캔버스 크기에 맞춤
    height: 'auto',  // 비율 유지
    display: 'block',
  },
  inputField: {
    position: 'absolute' as const,
    border: '2px dashed #007bff',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    boxSizing: 'border-box' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'visible',  // 드래그 핸들이 밖으로 나갈 수 있도록
  },
  deleteButton: {
    position: 'absolute' as const,
    top: '-18px',
    left: '5px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '2px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '4px 4px 0 0',
    zIndex: 11,
    boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
    lineHeight: '1',
  },
  dragHandle: {
    position: 'absolute' as const,
    top: '-18px',  // 필드 밖으로 배치
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '2px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '4px 4px 0 0',
    cursor: 'grab',
    userSelect: 'none' as const,
    zIndex: 10,
    touchAction: 'none' as const,
    boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
  },
  fontSizeControls: {
    position: 'absolute' as const,
    top: '-18px',
    right: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#28a745',
    padding: '2px 6px',
    borderRadius: '4px 4px 0 0',
    zIndex: 10,
    boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
  },
  fontSizeButton: {
    backgroundColor: 'white',
    color: '#28a745',
    border: 'none',
    padding: '2px 6px',
    fontSize: '10px',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '3px',
    minWidth: '24px',
  },
  fontSizeLabel: {
    color: 'white',
    fontSize: '10px',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center' as const,
  },
  fieldContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    width: '100%',
    height: '100%',
  },
  textInput: {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    fontSize: '11px',  // 모바일에서 보기 좋은 크기로 축소
    padding: '6px',
    backgroundColor: 'transparent',
    cursor: 'text',
    pointerEvents: 'auto' as const,
    touchAction: 'auto' as const,  // 모바일에서 텍스트 입력 허용
    boxSizing: 'border-box' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", "Noto Sans KR", sans-serif',  // 한글 폰트 명시
    color: '#000000',  // 텍스트 색상 명시
  },
  textDisplay: {
    width: '100%',
    height: '100%',
    padding: '6px',
    boxSizing: 'border-box' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Malgun Gothic", "맑은 고딕", "Noto Sans KR", sans-serif',  // 한글 폰트 명시
    color: '#000000',  // 텍스트 색상 명시
    display: 'flex',
    alignItems: 'center',  // 세로 중앙 정렬
    whiteSpace: 'pre-wrap' as const,  // 줄바꿈 유지
    wordBreak: 'break-word' as const,  // 긴 단어 줄바꿈
  },
  signatureBox: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    touchAction: 'auto' as const,  // 모바일에서 터치 허용
    boxSizing: 'border-box' as const,
    padding: '5px',
  },
  signatureImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
  },
  signaturePlaceholder: {
    fontSize: '12px',
    color: '#999',
  },
}
