"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
  QrCode, 
  Download, 
  Settings,
  HelpCircle,
  Type,
  Link as LinkIcon,
  Wifi,
  Mail,
  Phone
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

interface QROptions {
  text: string
  size: number
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H'
  type: 'text' | 'url' | 'email' | 'phone' | 'wifi'
  foregroundColor: string
  backgroundColor: string
}

export default function QRGeneratorPage() {
  const [qrOptions, setQROptions] = useState<QROptions>({
    text: '',
    size: 256,
    errorCorrectionLevel: 'M',
    type: 'text',
    foregroundColor: '#000000',
    backgroundColor: '#ffffff'
  })
  
  const [qrDataURL, setQrDataURL] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simple QR Code generation using Canvas (basic implementation)
  const generateQRCode = useCallback(() => {
    if (!qrOptions.text.trim()) {
      setQrDataURL('')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = qrOptions.size
    canvas.height = qrOptions.size

    // Clear canvas
    ctx.fillStyle = qrOptions.backgroundColor
    ctx.fillRect(0, 0, qrOptions.size, qrOptions.size)

    // Simple QR-like pattern (placeholder - in real app would use qrcode library)
    const moduleSize = qrOptions.size / 25 // 25x25 grid
    ctx.fillStyle = qrOptions.foregroundColor

    // Create a simple pattern that looks like QR code
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Create pattern based on text hash and position
        const hash = qrOptions.text.split('').reduce((a, b) => {
          a = ((a << 5) - a) + b.charCodeAt(0)
          return a & a
        }, 0)
        
        const shouldFill = (hash + row * col + row + col) % 3 === 0
        
        // Add finder patterns (corners)
        const isFinderPattern = 
          (row < 7 && col < 7) || 
          (row < 7 && col > 17) || 
          (row > 17 && col < 7)
        
        if (isFinderPattern) {
          const isOuterBorder = row === 0 || row === 6 || col === 0 || col === 6 ||
                               (row > 17 && (row === 18 || row === 24)) ||
                               (col > 17 && (col === 18 || col === 24))
          const isInnerSquare = (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
                               (row >= 2 && row <= 4 && col >= 20 && col <= 22) ||
                               (row >= 20 && row <= 22 && col >= 2 && col <= 4)
          
          if (isOuterBorder || isInnerSquare) {
            ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
          }
        } else if (shouldFill) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png')
    setQrDataURL(dataURL)
  }, [qrOptions])

  // Generate QR code when options change
  useEffect(() => {
    generateQRCode()
  }, [generateQRCode])

  const handleDownload = useCallback(() => {
    if (qrDataURL) {
      // Convert data URL to blob
      fetch(qrDataURL)
        .then(response => response.blob())
        .then(blob => {
          downloadFile(blob, `qr-code-${Date.now()}.png`)
        })
        .catch(error => console.error('Download failed:', error))
    }
  }, [qrDataURL])

  const formatText = useCallback((type: string, text: string) => {
    switch (type) {
      case 'url':
        return text.startsWith('http') ? text : `https://${text}`
      case 'email':
        return `mailto:${text}`
      case 'phone':
        return `tel:${text}`
      case 'wifi':
        return `WIFI:T:WPA;S:${text};P:password;;`
      default:
        return text
    }
  }, [])

  const handleTextChange = useCallback((value: string) => {
    const formattedText = formatText(qrOptions.type, value)
    setQROptions(prev => ({ ...prev, text: formattedText }))
  }, [qrOptions.type, formatText])

  const presetSizes = [
    { name: 'Small (128px)', value: 128 },
    { name: 'Medium (256px)', value: 256 },
    { name: 'Large (512px)', value: 512 },
    { name: 'Extra Large (1024px)', value: 1024 },
  ]

  const qrTypes = [
    { name: 'Plain Text', value: 'text', icon: Type },
    { name: 'Website URL', value: 'url', icon: LinkIcon },
    { name: 'Email Address', value: 'email', icon: Mail },
    { name: 'Phone Number', value: 'phone', icon: Phone },
    { name: 'WiFi Network', value: 'wifi', icon: Wifi },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden canvas for QR generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-500 rounded-lg p-2">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  QR Code Generator
                </h1>
                <p className="text-sm text-gray-600">
                  Create QR codes for text, URLs, emails, and more
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold flex items-center text-gray-900 mb-6">
                <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                QR Code Settings
              </h3>

              {/* QR Type */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">QR Code Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {qrTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setQROptions(prev => ({ ...prev, type: type.value as any, text: '' }))}
                      className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                        qrOptions.type === type.value
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className="h-4 w-4 mr-3" />
                      <span className="font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  {qrOptions.type === 'text' && 'Text Content'}
                  {qrOptions.type === 'url' && 'Website URL'}
                  {qrOptions.type === 'email' && 'Email Address'}
                  {qrOptions.type === 'phone' && 'Phone Number'}
                  {qrOptions.type === 'wifi' && 'WiFi Network Name'}
                </label>
                <textarea
                  value={qrOptions.text.replace(/^(https?:\/\/|mailto:|tel:|WIFI:T:WPA;S:|;P:password;;)/, '')}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md text-gray-900 min-h-[100px]"
                  placeholder={
                    qrOptions.type === 'text' ? 'Enter your text here...' :
                    qrOptions.type === 'url' ? 'example.com' :
                    qrOptions.type === 'email' ? 'user@example.com' :
                    qrOptions.type === 'phone' ? '+1234567890' :
                    'MyWiFiNetwork'
                  }
                />
              </div>

              {/* Size */}
              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium text-gray-700">Size</label>
                <Select
                  value={qrOptions.size.toString()}
                  onValueChange={(value) => setQROptions(prev => ({
                    ...prev,
                    size: parseInt(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {presetSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value.toString()}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Foreground Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={qrOptions.foregroundColor}
                      onChange={(e) => setQROptions(prev => ({
                        ...prev,
                        foregroundColor: e.target.value
                      }))}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">{qrOptions.foregroundColor}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Background Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={qrOptions.backgroundColor}
                      onChange={(e) => setQROptions(prev => ({
                        ...prev,
                        backgroundColor: e.target.value
                      }))}
                      className="w-12 h-10 border rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">{qrOptions.backgroundColor}</span>
                  </div>
                </div>
              </div>

              {/* Error Correction */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Error Correction Level</label>
                <Select
                  value={qrOptions.errorCorrectionLevel}
                  onValueChange={(value: any) => setQROptions(prev => ({
                    ...prev,
                    errorCorrectionLevel: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-white border rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">QR Code Preview</h3>
                <Button
                  onClick={handleDownload}
                  disabled={!qrDataURL}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PNG
                </Button>
              </div>
              
              <div className="flex justify-center">
                {qrDataURL ? (
                  <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
                    <img
                      src={qrDataURL}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                      style={{ imageRendering: 'pixelated' }}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Enter text to generate QR code</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h4 className="text-sm font-medium text-indigo-800 mb-3">💡 QR Code Tips</h4>
              <ul className="text-sm text-indigo-700 space-y-2">
                <li>• Higher error correction allows for more damage tolerance</li>
                <li>• Keep URLs short for better scanning reliability</li>
                <li>• Use high contrast colors for better readability</li>
                <li>• Test your QR codes with multiple scanner apps</li>
                <li>• Larger sizes work better for printing</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
