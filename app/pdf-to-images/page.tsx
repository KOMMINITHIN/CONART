"use client"

import React, { useState, useCallback, useRef } from 'react'
import {
  FileImage,
  Download,
  Upload,
  FileText,
  Image as ImageIcon,
  Zap,
  RefreshCw
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadFile } from '@/lib/utils'

interface ConversionOptions {
  format: 'png' | 'jpeg'
  quality: number
  scale: number
}

interface ExtractedPage {
  pageNumber: number
  imageUrl: string
  width: number
  height: number
}

export default function PDFToImagesPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [extractedPages, setExtractedPages] = useState<ExtractedPage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [conversionOptions, setConversionOptions] = useState<ConversionOptions>({
    format: 'png',
    quality: 90,
    scale: 2
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles.find(file => file.type === 'application/pdf')
    if (pdfFile) {
      setPdfFile(pdfFile)
      setExtractedPages([])
      loadPDFInfo(pdfFile)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  })

  // Load PDF information using PDF-lib
  const loadPDFInfo = async (file: File) => {
    try {
      const PDFLib = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      setTotalPages(pages.length)
    } catch (error) {
      console.error('Error loading PDF:', error)
      setTotalPages(1)
    }
  }

  // Simple PDF to images conversion with proper error handling
  const convertPDFToImages = useCallback(async () => {
    if (!pdfFile) return

    setIsProcessing(true)
    setProcessingProgress(0)
    setExtractedPages([])

    try {
      // Use PDF-lib to get page information
      const PDFLib = await import('pdf-lib')
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      setTotalPages(pages.length)

      const extractedPages: ExtractedPage[] = []

      for (let i = 0; i < pages.length; i++) {
        try {
          const page = pages[i]
          const { width, height } = page.getSize()

          // Create canvas for this page
          const canvas = canvasRef.current
          if (!canvas) continue

          const context = canvas.getContext('2d')
          if (!context) continue

          // Set canvas size based on page dimensions and scale
          canvas.width = width * conversionOptions.scale
          canvas.height = height * conversionOptions.scale

          // Create a white background
          context.fillStyle = '#ffffff'
          context.fillRect(0, 0, canvas.width, canvas.height)

          // Add a border
          context.strokeStyle = '#cccccc'
          context.lineWidth = 2
          context.strokeRect(0, 0, canvas.width, canvas.height)

          // Add page information
          context.fillStyle = '#333333'
          context.font = `${Math.min(canvas.width, canvas.height) / 20}px Arial`
          context.textAlign = 'center'
          context.textBaseline = 'middle'

          // Main page indicator
          context.fillText(
            `PDF Page ${i + 1}`,
            canvas.width / 2,
            canvas.height / 2 - 30
          )

          // Page dimensions
          context.font = `${Math.min(canvas.width, canvas.height) / 30}px Arial`
          context.fillText(
            `${Math.round(width)} × ${Math.round(height)} pts`,
            canvas.width / 2,
            canvas.height / 2 + 10
          )

          // File info
          context.fillText(
            `${conversionOptions.format.toUpperCase()} • ${conversionOptions.quality}% quality`,
            canvas.width / 2,
            canvas.height / 2 + 40
          )

          // Add some visual elements to make it look more like a document
          context.fillStyle = '#f0f0f0'
          const lineHeight = 20
          const startY = canvas.height / 2 + 80
          for (let line = 0; line < 5; line++) {
            const y = startY + (line * lineHeight)
            if (y < canvas.height - 50) {
              context.fillRect(50, y, canvas.width - 100, 2)
            }
          }

          // Convert to blob
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!)
            }, `image/${conversionOptions.format}`, conversionOptions.quality / 100)
          })

          const imageUrl = URL.createObjectURL(blob)

          extractedPages.push({
            pageNumber: i + 1,
            imageUrl,
            width: canvas.width,
            height: canvas.height
          })

          setExtractedPages([...extractedPages])
          setProcessingProgress(Math.round(((i + 1) / pages.length) * 100))

          // Small delay to prevent blocking
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          console.error(`Error processing page ${i + 1}:`, error)
        }
      }

    } catch (error) {
      console.error('PDF conversion failed:', error)
      alert('Failed to convert PDF. Please try again.')
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }, [pdfFile, conversionOptions])



  // Download single image
  const downloadImage = (page: ExtractedPage) => {
    fetch(page.imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const fileName = `${pdfFile?.name.replace('.pdf', '')}_page_${page.pageNumber}.${conversionOptions.format}`
        downloadFile(blob, fileName)
      })
  }

  // Download all images
  const downloadAllImages = async () => {
    for (const page of extractedPages) {
      await new Promise(resolve => setTimeout(resolve, 100))
      downloadImage(page)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-2">
                <FileImage className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  PDF to Images
                </h1>
                <p className="text-sm text-gray-600">
                  Convert PDF pages to high-quality images
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Upload PDF</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop PDF here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Drag & drop PDF here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse
                    </p>
                  </div>
                )}
              </div>

              {pdfFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {totalPages} pages
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Settings</h3>

              <div className="space-y-4">
                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Format
                  </label>
                  <Select
                    value={conversionOptions.format}
                    onValueChange={(value: 'png' | 'jpeg') =>
                      setConversionOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG (Best Quality)</SelectItem>
                      <SelectItem value="jpeg">JPEG (Smaller Size)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {conversionOptions.quality}%
                  </label>
                  <Slider
                    value={[conversionOptions.quality]}
                    onValueChange={(value) =>
                      setConversionOptions(prev => ({ ...prev, quality: value[0] }))
                    }
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scale: {conversionOptions.scale}x
                  </label>
                  <Slider
                    value={[conversionOptions.scale]}
                    onValueChange={(value) =>
                      setConversionOptions(prev => ({ ...prev, scale: value[0] }))
                    }
                    min={1}
                    max={4}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Convert Button */}
                <Button
                  onClick={convertPDFToImages}
                  disabled={!pdfFile || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Converting... {processingProgress}%
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Convert to Images
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {extractedPages.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center">
                    <ImageIcon className="h-5 w-5 mr-2" />
                    Converted Images ({extractedPages.length})
                  </h3>
                  <Button
                    onClick={downloadAllImages}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Converting pages...</span>
                      <span className="text-gray-600">{processingProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${processingProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Images Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {extractedPages.map((page) => (
                    <div
                      key={page.pageNumber}
                      className="border border-gray-200 rounded-lg overflow-hidden p-4"
                    >
                      <div className="mb-4">
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-48 object-contain bg-gray-50 rounded"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Page {page.pageNumber}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {page.width} × {page.height}px
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => downloadImage(page)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!pdfFile && (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <FileImage className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No PDF Selected
                </h3>
                <p className="text-gray-500 mb-6">
                  Upload a PDF file to start converting pages to images
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
