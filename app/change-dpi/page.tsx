"use client"

import React, { useState, useCallback } from 'react'
import {
  Settings,
  Download,
  Upload,
  Zap,
  HelpCircle
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { validateImageFile, downloadFile } from '@/lib/utils'

export default function ChangeDPIPage() {
  const [files, setFiles] = useState<File[]>([])
  const [processedImages, setProcessedImages] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [targetDPI, setTargetDPI] = useState(300)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    setFiles(validFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: true
  })

  const changeDPI = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      img.onload = () => {
        // Calculate new dimensions based on DPI
        const currentDPI = 72 // Default web DPI
        const scaleFactor = targetDPI / currentDPI
        
        const newWidth = Math.round(img.width * scaleFactor)
        const newHeight = Math.round(img.height * scaleFactor)

        canvas.width = newWidth
        canvas.height = newHeight

        // Draw image with new dimensions
        ctx.drawImage(img, 0, 0, newWidth, newHeight)

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
      img.src = URL.createObjectURL(file)
    })
  }

  const handleProcess = async () => {
    if (files.length === 0) return

    setIsProcessing(true)
    const processed: { [key: string]: string } = {}

    try {
      for (const file of files) {
        const processedUrl = await changeDPI(file)
        processed[file.name] = processedUrl
      }
      setProcessedImages(processed)
    } catch (error) {
      alert('Failed to process images. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async (fileName: string, url: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const originalName = fileName.split('.').slice(0, -1).join('.')
      const newFileName = `${originalName}_${targetDPI}dpi.jpg`
      downloadFile(blob, newFileName)
    } catch (error) {
      alert('Failed to download file. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-4 shadow-lg">
              <Settings className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Change Image DPI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Adjust the DPI (Dots Per Inch) of your images for print or web use. Perfect for preparing images for professional printing.
          </p>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop images here' : 'Upload Images'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop images or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supports: JPEG, PNG, GIF, BMP, WebP
            </p>
          </div>
        </div>

        {/* DPI Settings */}
        {files.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              DPI Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target DPI
                </label>
                <select
                  value={targetDPI}
                  onChange={(e) => setTargetDPI(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value={72}>72 DPI (Web)</option>
                  <option value={150}>150 DPI (Draft Print)</option>
                  <option value={300}>300 DPI (High Quality Print)</option>
                  <option value={600}>600 DPI (Professional Print)</option>
                  <option value={1200}>1200 DPI (Ultra High Quality)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom DPI
                </label>
                <input
                  type="number"
                  min="72"
                  max="2400"
                  value={targetDPI}
                  onChange={(e) => setTargetDPI(parseInt(e.target.value) || 300)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter custom DPI"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">DPI Guidelines:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>72 DPI:</strong> Web images, social media</li>
                <li>• <strong>150 DPI:</strong> Draft printing, newsletters</li>
                <li>• <strong>300 DPI:</strong> High-quality printing, brochures</li>
                <li>• <strong>600+ DPI:</strong> Professional printing, large formats</li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="btn-primary w-full text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Zap className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Change DPI to {targetDPI}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {Object.keys(processedImages).length > 0 && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Processed Images ({targetDPI} DPI)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(processedImages).map(([fileName, url]) => (
                <div key={fileName} className="border border-gray-200 rounded-lg p-4 hover-lift">
                  <img
                    src={url}
                    alt={fileName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <p className="text-sm font-medium text-gray-900 mb-2 truncate">
                    {fileName.split('.').slice(0, -1).join('')}_{targetDPI}dpi.jpg
                  </p>
                  <button
                    onClick={() => handleDownload(fileName, url)}
                    className="btn-primary w-full py-2 text-sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card mt-8 bg-green-50">
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-green-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-green-900 mb-2">About DPI</h4>
              <p className="text-green-800 text-sm">
                DPI (Dots Per Inch) determines image resolution for printing. Higher DPI means better print quality but larger file sizes. 
                Web images typically use 72 DPI, while print materials need 300 DPI or higher for professional results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
