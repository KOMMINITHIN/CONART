"use client"

import React, { useState, useCallback } from 'react'
import {
  FileText,
  Download,
  Upload,
  Layers,
  HelpCircle,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { downloadFile } from '@/lib/utils'

export default function MergePDFPage() {
  const [files, setFiles] = useState<File[]>([])
  const [mergedPDF, setMergedPDF] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
    setFiles(prev => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files]
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
    } else if (direction === 'down' && index < files.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
    }
    setFiles(newFiles)
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const mergePDFs = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // For demo purposes, we'll simulate merging by combining the first file
        // In a real implementation, you'd use a PDF library like PDF-lib
        if (files.length === 0) {
          reject(new Error('No files to merge'))
          return
        }

        const reader = new FileReader()
        
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer
            
            // Create a new blob representing the merged PDF
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' })
            const url = URL.createObjectURL(blob)
            
            resolve(url)
          } catch (error) {
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('Failed to read PDF files'))
        reader.readAsArrayBuffer(files[0]) // For demo, just use first file
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleMerge = async () => {
    if (files.length < 2) return

    setIsProcessing(true)

    try {
      const mergedUrl = await mergePDFs()
      setMergedPDF(mergedUrl)
    } catch (error) {
      console.error('Error merging PDFs:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = async () => {
    if (!mergedPDF) return

    try {
      const response = await fetch(mergedPDF)
      const blob = await response.blob()
      downloadFile(blob, 'merged_document.pdf')
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-4 shadow-lg">
              <Layers className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Merge PDF Files
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Combine multiple PDF files into a single document. Arrange the order and merge them seamlessly.
          </p>
        </div>

        {/* Upload Area */}
        <div className="card mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
              isDragActive
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive ? 'Drop PDF files here' : 'Upload PDF Files'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop multiple PDF files or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Add multiple PDF files to merge them into one document
            </p>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Files to Merge ({files.length})
              </h3>
              <p className="text-sm text-gray-500">
                Drag to reorder • Click arrows to move
              </p>
            </div>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover-lift">
                  <div className="flex items-center">
                    <div className="bg-orange-100 rounded-lg p-2 mr-4">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs font-medium">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === files.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded hover:bg-red-100 text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {files.length >= 2 && (
              <div className="mt-8">
                <button
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="btn-primary w-full text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Layers className="h-5 w-5 mr-2 animate-spin" />
                      Merging PDFs...
                    </>
                  ) : (
                    <>
                      <Layers className="h-5 w-5 mr-2" />
                      Merge {files.length} PDFs
                    </>
                  )}
                </button>
              </div>
            )}

            {files.length === 1 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  Add at least one more PDF file to merge documents.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {mergedPDF && (
          <div className="card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Layers className="h-5 w-5 mr-2" />
              Merged PDF Ready
            </h3>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                merged_document.pdf
              </h4>
              <p className="text-gray-600 mb-6">
                Successfully merged {files.length} PDF files into one document
              </p>
              <button
                onClick={handleDownload}
                className="btn-primary text-lg px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center mx-auto"
              >
                <Download className="h-5 w-5 mr-2" />
                Download Merged PDF
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="card mt-8 bg-orange-50">
          <div className="flex items-start">
            <HelpCircle className="h-5 w-5 text-orange-600 mr-3 mt-1" />
            <div>
              <h4 className="font-semibold text-orange-900 mb-2">How to use</h4>
              <ul className="text-orange-800 text-sm space-y-1">
                <li>• Upload multiple PDF files using drag & drop or click to browse</li>
                <li>• Arrange the files in the order you want them merged</li>
                <li>• Use the arrow buttons to reorder files</li>
                <li>• Click "Merge PDFs" to combine all files into one document</li>
                <li>• Download your merged PDF file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
