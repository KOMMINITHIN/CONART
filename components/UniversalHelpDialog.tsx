"use client"

import React from 'react'
import { X, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HelpContent {
  title: string
  steps: string[]
  tips: string[]
  additionalInfo?: string
}

interface UniversalHelpDialogProps {
  isOpen: boolean
  onClose: () => void
  content: HelpContent
}

export function UniversalHelpDialog({ isOpen, onClose, content }: UniversalHelpDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold">{content.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* How to use */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">How to use:</h3>
            <ol className="list-decimal list-inside space-y-2">
              {content.steps.map((step, index) => (
                <li key={`help-step-${index}`} className="text-sm leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h3 className="font-semibold mb-3 text-lg">Tips:</h3>
            <ul className="list-disc list-inside space-y-2">
              {content.tips.map((tip, index) => (
                <li key={`help-tip-${index}`} className="text-sm leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>

          {/* Additional Info */}
          {content.additionalInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">{content.additionalInfo}</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Privacy & Security</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• All processing happens in your browser - files never leave your device</li>
              <li>• No registration or account required</li>
              <li>• No data is stored on our servers</li>
              <li>• Completely private and secure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Predefined help content for different tools
export const helpContent = {
  imagesToPdf: {
    title: "Images to PDF - Help",
    steps: [
      "Upload multiple images using drag & drop or click to browse",
      "Arrange images in the desired order using drag handles",
      "Choose page size (A4, Letter, etc.) and orientation",
      "Adjust margins and image quality settings",
      "Click 'Generate PDF' to create your document",
      "Download the generated PDF file"
    ],
    tips: [
      "Higher quality settings result in larger PDF files",
      "Portrait orientation works best for most images",
      "Adjust margins to control spacing around images",
      "You can reorder images by dragging them"
    ]
  },
  
  resizeImage: {
    title: "Resize Image - Help",
    steps: [
      "Upload one or more images using drag & drop or click to browse",
      "Choose from preset sizes or enter custom dimensions",
      "Select whether to maintain aspect ratio",
      "Adjust quality settings if needed",
      "Click 'Resize Images' to process",
      "Download individual images or all at once"
    ],
    tips: [
      "Maintaining aspect ratio prevents image distortion",
      "Use preset sizes for common social media platforms",
      "Higher quality settings preserve more detail",
      "Batch processing saves time with multiple images"
    ]
  },

  compressImage: {
    title: "Compress Image - Help",
    steps: [
      "Upload images using drag & drop or click to browse",
      "Choose compression preset or adjust quality manually",
      "Select target file size if using size-based compression",
      "Click 'Compress Images' to start processing",
      "Preview compressed images and compare file sizes",
      "Download individual images or all at once"
    ],
    tips: [
      "80-90% quality is usually perfect for web use",
      "Higher quality = larger file size, better image quality",
      "Lower quality = smaller file size, some quality loss",
      "Use size-based compression for specific file size requirements"
    ]
  },

  qrGenerator: {
    title: "QR Code Generator - Help",
    steps: [
      "Enter the text, URL, or data you want to encode",
      "Choose QR code size and error correction level",
      "Select colors for foreground and background",
      "Click 'Generate QR Code' to create",
      "Preview the generated QR code",
      "Download as PNG or SVG format"
    ],
    tips: [
      "Higher error correction allows scanning even if partially damaged",
      "Larger sizes are easier to scan from distance",
      "Ensure good contrast between foreground and background colors",
      "Test your QR code with different scanning apps"
    ]
  },

  watermarkImage: {
    title: "Watermark Image - Help",
    steps: [
      "Upload images you want to watermark",
      "Enter your watermark text",
      "Choose position, size, and opacity",
      "Select text color and font style",
      "Preview the watermark on your images",
      "Download watermarked images"
    ],
    tips: [
      "Lower opacity makes watermarks less intrusive",
      "Corner positions are commonly used for watermarks",
      "Choose colors that contrast well with your images",
      "Test different sizes to find the right balance"
    ]
  },

  cropImage: {
    title: "Crop Image - Help",
    steps: [
      "Upload an image to crop",
      "Choose aspect ratio or select freeform cropping",
      "Drag the crop area to desired position",
      "Resize the crop area by dragging corners",
      "Adjust quality settings if needed",
      "Click 'Crop Image' and download result"
    ],
    tips: [
      "Use preset aspect ratios for specific purposes",
      "Freeform cropping gives you complete control",
      "Preview shows exactly what will be cropped",
      "Higher quality preserves more image detail"
    ]
  }
}
