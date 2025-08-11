"use client"

import React from 'react'
import { 
  HelpCircle, 
  X, 
  Lightbulb, 
  Target, 
  Shield, 
  Zap,
  Image as ImageIcon,
  Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Help & Guide</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Quick Start */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Quick Start Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
                <h4 className="font-medium mb-2">Upload Images</h4>
                <p className="text-sm text-gray-600">Drag & drop or click to select your images</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
                <h4 className="font-medium mb-2">Choose Settings</h4>
                <p className="text-sm text-gray-600">Select compression preset or customize settings</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
                <h4 className="font-medium mb-2">Download Results</h4>
                <p className="text-sm text-gray-600">Get your compressed images instantly</p>
              </div>
            </div>
          </section>

          {/* Compression Modes */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-green-500" />
              Compression Modes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Quality Based
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Control the visual quality of your images. Higher quality means larger file sizes.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• 90-100%: Excellent quality, minimal compression</li>
                  <li>• 70-90%: Good quality, balanced compression</li>
                  <li>• 50-70%: Moderate quality, significant compression</li>
                  <li>• 10-50%: Lower quality, maximum compression</li>
                </ul>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Target Size
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Specify exact file size. The app automatically adjusts quality to meet your target.
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Perfect for email attachments</li>
                  <li>• Website upload limits</li>
                  <li>• Social media requirements</li>
                  <li>• Storage optimization</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Presets */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
              Compression Presets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Web Optimized</h4>
                  <p className="text-sm text-gray-600">Perfect for websites and social media. Balances quality and file size.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">Email Friendly</h4>
                  <p className="text-sm text-gray-600">Smaller files ideal for email attachments and messaging.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-medium">Print Quality</h4>
                  <p className="text-sm text-gray-600">High quality compression for printing and professional use.</p>
                </div>
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-medium">Thumbnail</h4>
                  <p className="text-sm text-gray-600">Small thumbnails and previews with maximum compression.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Best Practices */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-red-500" />
              Best Practices
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 text-green-600">✓ Do</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use JPEG for photos with many colors</li>
                    <li>• Use PNG for graphics with transparency</li>
                    <li>• Try WebP for modern browsers</li>
                    <li>• Keep originals as backup</li>
                    <li>• Test different quality settings</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-red-600">✗ Don't</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Compress already compressed images</li>
                    <li>• Use very low quality for important images</li>
                    <li>• Forget to check the result quality</li>
                    <li>• Ignore file format recommendations</li>
                    <li>• Over-compress professional photos</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & Security */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Privacy & Security
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>All processing happens in your browser - your images never leave your device</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No registration or account required</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>No data is stored on our servers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Works completely offline after initial load</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-xl font-semibold mb-4">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Upload files</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl + O</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Compress all</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl + Enter</kbd>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Clear all</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl + Delete</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Download all</span>
                  <kbd className="bg-gray-100 px-2 py-1 rounded">Ctrl + D</kbd>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Need more help? Check our documentation or contact support.
            </p>
            <Button onClick={onClose}>
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
