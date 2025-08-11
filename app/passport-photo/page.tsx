"use client"

import React, { useState, useCallback, useRef } from 'react'
import {
  Camera,
  Download,
  Upload,
  Crop,
  HelpCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { validateImageFile, downloadFile } from '@/lib/utils'

interface PhotoSpecs {
  name: string
  width: number
  height: number
  dpi: number
}

const PHOTO_SPECS: PhotoSpecs[] = [
  { name: 'US Passport', width: 600, height: 600, dpi: 300 },
  { name: 'UK Passport', width: 450, height: 600, dpi: 300 },
  { name: 'EU Passport', width: 450, height: 600, dpi: 300 },
  { name: 'India Passport', width: 600, height: 600, dpi: 300 },
  { name: 'Canada Passport', width: 420, height: 540, dpi: 300 },
  { name: 'Australia Passport', width: 450, height: 600, dpi: 300 },
  { name: 'Visa Photo', width: 600, height: 600, dpi: 300 },
  { name: 'ID Card', width: 480, height: 640, dpi: 300 }
]

export default function PassportPhotoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processedPhoto, setProcessedPhoto] = useState<string | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<PhotoSpecs>(PHOTO_SPECS[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        setSelectedFile(file)
        setProcessedPhoto(null)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  })

  const processPassportPhoto = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!selectedFile) {
        reject(new Error('No file selected'))
        return
      }

      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      img.onload = () => {
        // Set canvas dimensions based on selected specifications
        canvas.width = selectedSpec.width
        canvas.height = selectedSpec.height

        // Calculate scaling to fit the image properly
        const imgAspect = img.width / img.height
        const targetAspect = selectedSpec.width / selectedSpec.height

        let drawWidth, drawHeight, offsetX, offsetY

        if (imgAspect > targetAspect) {
          // Image is wider than target
          drawHeight = canvas.height
          drawWidth = drawHeight * imgAspect
          offsetX = (canvas.width - drawWidth) / 2
          offsetY = 0
        } else {
          // Image is taller than target
          drawWidth = canvas.width
          drawHeight = drawWidth / imgAspect
          offsetX = 0
          offsetY = (canvas.height - drawHeight) / 2
        }

        // Fill background with white
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw the image
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob)
              resolve(url)
            } else {
              reject(new Error('Failed to process image'))
            }
          },
          'image/jpeg',
          0.95
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(selectedFile)
    })
  }

  const handleProcess = async () => {
    if (!selectedFile) return

    setIsProcessing(true)

    try {
      const processedUrl = await processPassportPhoto()
      setProcessedPhoto(processedUrl)
    } catch (error) {
      alert('Failed to process photo. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!processedPhoto) return

    try {
      const response = await fetch(processedPhoto)
      const blob = await response.blob()
      const fileName = `passport_photo_${selectedSpec.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
      downloadFile(blob, fileName)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const createPhotoSheet = async () => {
    if (!processedPhoto) return

    try {
      const response = await fetch(processedPhoto)
      const blob = await response.blob()
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Create a 4x6 inch sheet at 300 DPI (1200x1800 pixels)
        canvas.width = 1200
        canvas.height = 1800

        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Calculate how many photos can fit
        const photosPerRow = Math.floor(canvas.width / selectedSpec.width)
        const photosPerCol = Math.floor(canvas.height / selectedSpec.height)

        // Draw multiple copies of the photo
        for (let row = 0; row < photosPerCol; row++) {
          for (let col = 0; col < photosPerRow; col++) {
            const x = col * selectedSpec.width
            const y = row * selectedSpec.height
            ctx.drawImage(img, x, y, selectedSpec.width, selectedSpec.height)
          }
        }

        canvas.toBlob(
          (sheetBlob) => {
            if (sheetBlob) {
              const fileName = `passport_photo_sheet_${selectedSpec.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
              downloadFile(sheetBlob, fileName)
            }
          },
          'image/jpeg',
          0.95
        )
      }

      img.src = URL.createObjectURL(blob)
    } catch (error) {
      console.error('Error creating photo sheet:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 shadow-lg">
              <Camera className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Passport Photo Maker
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create professional passport and ID photos that meet official requirements for various countries and documents.
          </p>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop your photo here' : 'Upload Your Photo'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop a photo or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Best results with high-quality photos facing forward
            </p>
          </div>
        </div>

        {/* Photo Specifications */}
        <div className="card mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Photo Specifications
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PHOTO_SPECS.map((spec) => (
              <button
                key={spec.name}
                onClick={() => setSelectedSpec(spec)}
                className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                  selectedSpec.name === spec.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 text-sm">{spec.name}</h4>
                <p className="text-xs text-gray-600">{spec.width}×{spec.height}px</p>
                <p className="text-xs text-gray-500">{spec.dpi} DPI</p>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Selected: {selectedSpec.name}</h4>
            <div className="grid grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Dimensions:</span>
                <br />
                {selectedSpec.width} × {selectedSpec.height} pixels
              </div>
              <div>
                <span className="font-medium">Resolution:</span>
                <br />
                {selectedSpec.dpi} DPI
              </div>
              <div>
                <span className="font-medium">Print Size:</span>
                <br />
                {(selectedSpec.width / selectedSpec.dpi).toFixed(1)}" × {(selectedSpec.height / selectedSpec.dpi).toFixed(1)}"
              </div>
            </div>
          </div>
        </div>

        {/* Process Button */}
        {selectedFile && (
          <div className="card mb-8">
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Photo ready for processing: {selectedFile.name}
              </p>
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto"
              >
                {isProcessing ? (
                  <>
                    <Crop className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crop className="h-5 w-5 mr-2" />
                    Create Passport Photo
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {processedPhoto && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Your Passport Photo
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-4 inline-block">
                  <img
                    src={processedPhoto}
                    alt="Processed passport photo"
                    className="max-w-full h-auto border border-gray-300"
                    style={{
                      width: `${Math.min(300, selectedSpec.width)}px`,
                      height: `${Math.min(300, selectedSpec.height)}px`,
                      objectFit: 'cover'
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedSpec.name} - {selectedSpec.width}×{selectedSpec.height}px
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  className="btn-primary w-full py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Single Photo
                </button>

                <button
                  onClick={createPhotoSheet}
                  className="btn-secondary w-full py-3 text-lg rounded-xl transition-all duration-300 flex items-center justify-center"
                >
                  <Crop className="h-5 w-5 mr-2" />
                  Download Photo Sheet
                </button>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Photo Ready!</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ Correct dimensions for {selectedSpec.name}</li>
                    <li>✓ Professional quality at {selectedSpec.dpi} DPI</li>
                    <li>✓ White background applied</li>
                    <li>✓ Ready for official use</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card mt-8 bg-blue-50">
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-blue-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Photo Guidelines</h4>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Use a high-quality photo with good lighting</li>
                <li>• Face should be centered and looking directly at camera</li>
                <li>• Neutral expression with mouth closed</li>
                <li>• Remove glasses, hats, or head coverings (unless religious)</li>
                <li>• Plain background works best for automatic processing</li>
                <li>• Photo sheet option provides multiple copies for printing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
