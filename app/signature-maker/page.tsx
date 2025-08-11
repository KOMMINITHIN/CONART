"use client"

import React, { useState, useRef, useCallback } from 'react'
import { 
  PenTool, 
  Download, 
  RotateCcw,
  Type,
  Settings,
  HelpCircle,
  Palette
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { downloadFile } from '@/lib/utils'

interface SignatureOptions {
  backgroundColor: string
  strokeColor: string
  strokeWidth: number
  format: 'png' | 'jpeg' | 'svg'
  size: 'small' | 'medium' | 'large'
}

export default function SignatureMakerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureMode, setSignatureMode] = useState<'draw' | 'type'>('draw')
  const [typedSignature, setTypedSignature] = useState('')
  const [selectedFont, setSelectedFont] = useState('Dancing Script')
  const [signatureOptions, setSignatureOptions] = useState<SignatureOptions>({
    backgroundColor: 'transparent',
    strokeColor: '#000000',
    strokeWidth: 3,
    format: 'png',
    size: 'medium'
  })

  const getSizeConfig = (size: string) => {
    switch (size) {
      case 'small': return { width: 300, height: 150 }
      case 'large': return { width: 600, height: 300 }
      default: return { width: 400, height: 200 } // medium
    }
  }

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (signatureOptions.backgroundColor !== 'transparent') {
          ctx.fillStyle = signatureOptions.backgroundColor
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }
    }
  }, [signatureOptions.backgroundColor])

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (signatureMode !== 'draw') return
    
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    }
  }, [signatureMode])

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signatureMode !== 'draw') return
    
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.lineTo(x, y)
        ctx.strokeStyle = signatureOptions.strokeColor
        ctx.lineWidth = signatureOptions.strokeWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.stroke()
      }
    }
  }, [isDrawing, signatureMode, signatureOptions.strokeColor, signatureOptions.strokeWidth])

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const generateTypedSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas && typedSignature) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Clear canvas
        clearCanvas()
        
        // Set font
        const fontSize = signatureOptions.size === 'small' ? 24 : signatureOptions.size === 'large' ? 48 : 36
        ctx.font = `${fontSize}px "${selectedFont}", cursive`
        ctx.fillStyle = signatureOptions.strokeColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        
        // Draw text
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2)
      }
    }
  }, [typedSignature, selectedFont, signatureOptions, clearCanvas])

  const downloadSignature = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas) {
      if (signatureOptions.format === 'svg') {
        // For SVG, we'll create a simple SVG with the canvas content
        const svgContent = `
          <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
            <foreignObject width="100%" height="100%">
              <div xmlns="http://www.w3.org/1999/xhtml">
                <canvas width="${canvas.width}" height="${canvas.height}"></canvas>
              </div>
            </foreignObject>
          </svg>
        `
        const blob = new Blob([svgContent], { type: 'image/svg+xml' })
        downloadFile(blob, `signature.${signatureOptions.format}`)
      } else {
        canvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `signature.${signatureOptions.format}`)
          }
        }, `image/${signatureOptions.format}`, 0.9)
      }
    }
  }, [signatureOptions.format])

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const { width, height } = getSizeConfig(signatureOptions.size)
      canvas.width = width
      canvas.height = height
      clearCanvas()
    }
  }, [signatureOptions.size, clearCanvas])

  // Generate typed signature when text changes
  React.useEffect(() => {
    if (signatureMode === 'type') {
      generateTypedSignature()
    }
  }, [signatureMode, generateTypedSignature])

  const fonts = [
    'Dancing Script',
    'Great Vibes',
    'Allura',
    'Alex Brush',
    'Satisfy',
    'Pacifico',
    'Kaushan Script',
    'Lobster'
  ]

  const colors = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#0066cc' },
    { name: 'Red', value: '#cc0000' },
    { name: 'Green', value: '#006600' },
    { name: 'Purple', value: '#6600cc' },
    { name: 'Brown', value: '#8B4513' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500 rounded-lg p-2">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Signature Maker
                </h1>
                <p className="text-sm text-gray-600">
                  Create digital signatures for documents and forms
                </p>
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Canvas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selection */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Signature Mode</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={signatureMode === 'draw' ? 'default' : 'outline'}
                  onClick={() => setSignatureMode('draw')}
                  className="justify-start"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  Draw Signature
                </Button>
                <Button
                  variant={signatureMode === 'type' ? 'default' : 'outline'}
                  onClick={() => setSignatureMode('type')}
                  className="justify-start"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Type Signature
                </Button>
              </div>
            </div>

            {/* Typed Signature Input */}
            {signatureMode === 'type' && (
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Type Your Signature</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full px-4 py-2 border rounded-lg text-lg"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Font Style</label>
                      <Select value={selectedFont} onValueChange={setSelectedFont}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map((font) => (
                            <SelectItem key={font} value={font}>
                              <span style={{ fontFamily: font }}>{font}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Canvas */}
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Signature Canvas</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={clearCanvas}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button onClick={downloadSignature}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded cursor-crosshair"
                  style={{ 
                    backgroundColor: signatureOptions.backgroundColor === 'transparent' ? 'white' : signatureOptions.backgroundColor 
                  }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              
              {signatureMode === 'draw' && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Click and drag to draw your signature
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-6 space-y-6 shadow-lg">
              <h3 className="text-lg font-semibold flex items-center text-gray-900">
                <Settings className="h-5 w-5 mr-2 text-purple-600" />
                Signature Settings
              </h3>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Canvas Size</label>
                <Select
                  value={signatureOptions.size}
                  onValueChange={(value: any) => setSignatureOptions(prev => ({
                    ...prev,
                    size: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (300×150)</SelectItem>
                    <SelectItem value="medium">Medium (400×200)</SelectItem>
                    <SelectItem value="large">Large (600×300)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stroke Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Signature Color</label>
                <div className="grid grid-cols-3 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSignatureOptions(prev => ({
                        ...prev,
                        strokeColor: color.value
                      }))}
                      className={`w-full h-10 rounded border-2 ${
                        signatureOptions.strokeColor === color.value 
                          ? 'border-gray-400' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Stroke Width (for drawing mode) */}
              {signatureMode === 'draw' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Pen Width: {signatureOptions.strokeWidth}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={signatureOptions.strokeWidth}
                    onChange={(e) => setSignatureOptions(prev => ({
                      ...prev,
                      strokeWidth: parseInt(e.target.value)
                    }))}
                    className="w-full"
                  />
                </div>
              )}

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Background</label>
                <Select
                  value={signatureOptions.backgroundColor}
                  onValueChange={(value) => setSignatureOptions(prev => ({
                    ...prev,
                    backgroundColor: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transparent">Transparent</SelectItem>
                    <SelectItem value="#ffffff">White</SelectItem>
                    <SelectItem value="#f8f9fa">Light Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Download Format</label>
                <Select
                  value={signatureOptions.format}
                  onValueChange={(value: any) => setSignatureOptions(prev => ({
                    ...prev,
                    format: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Recommended)</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="svg">SVG</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tips */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-purple-800 mb-2">💡 Tips</h4>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Use PNG format for transparent backgrounds</li>
                  <li>• Draw slowly for smoother lines</li>
                  <li>• Try different fonts for typed signatures</li>
                  <li>• Use dark colors for better visibility</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
