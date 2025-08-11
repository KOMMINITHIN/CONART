"use client"

import React from 'react'
import Link from 'next/link'
import {
  Zap,
  Shield,
  Globe,
  Users,
  CheckCircle,
  Heart,
  Maximize,
  QrCode,
  Minimize2,
  Image as ImageIcon,
  Settings,
  RotateCcw,
  Crop,
  Droplets,
  Layers,
  FileText,
  PenTool,
  FileImage
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">{/* Clean white background */}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-mono uppercase tracking-wider">
              CONART
            </span>
          </h1>

          <p className="text-2xl text-gray-700 mb-4 max-w-4xl mx-auto">
            Professional Online Tools for Content Creation & Processing
          </p>

          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform, edit, and create with our comprehensive suite of browser-based tools.
            No downloads, no registration, no limits.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">15+</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Tools Available</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">100%</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Browser-Based</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300">0</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Registration</div>
            </div>
            <div className="text-center group hover:scale-110 transition-transform duration-300 cursor-default">
              <div className="text-3xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300">∞</div>
              <div className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">Usage Limit</div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default hover:bg-white">
              <span className="text-sm font-medium text-gray-700">✨ 100% Free</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default hover:bg-white">
              <span className="text-sm font-medium text-gray-700">🔒 Secure</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default hover:bg-white">
              <span className="text-sm font-medium text-gray-700">⚡ Fast</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default hover:bg-white">
              <span className="text-sm font-medium text-gray-700">🌐 No Install</span>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="relative py-16 bg-gradient-to-r from-gray-50 via-white to-gray-100 overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/30 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/30 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-green-400/30 rounded-full animate-bounce delay-500"></div>
          <div className="absolute bottom-40 right-1/3 w-5 h-5 bg-pink-400/30 rounded-full animate-bounce delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Try It Now - No Sign Up Required
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the power of our tools instantly. Just drag, drop, and process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/compress-image" prefetch={true} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform-gpu">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 group-hover:bg-blue-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Minimize2 className="h-8 w-8 text-blue-600 mx-auto transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors duration-300">Compress Images</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">Reduce file sizes by up to 90% without quality loss</p>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 group-hover:bg-blue-50 transition-all duration-300 group-hover:scale-105">
                  <div className="flex justify-between mb-2">
                    <span className="transition-all duration-300 group-hover:font-semibold">Original: 2.5 MB</span>
                    <span className="transition-transform duration-300 group-hover:scale-125">→</span>
                    <span className="text-green-600 font-semibold transition-all duration-300 group-hover:text-green-700">250 KB</span>
                  </div>
                  <div className="text-green-600 text-xs transition-all duration-300 group-hover:text-green-700 group-hover:font-semibold">90% size reduction</div>
                </div>
              </div>
            </Link>

            <Link href="/resize-image" prefetch={true} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform-gpu">
              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                  <Maximize className="h-8 w-8 text-purple-600 mx-auto transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors duration-300">Resize Images</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">Perfect dimensions for any platform or use case</p>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 group-hover:bg-purple-50 transition-all duration-300 group-hover:scale-105">
                  <div className="flex justify-between mb-2">
                    <span className="transition-all duration-300 group-hover:font-semibold">1920×1080</span>
                    <span className="transition-transform duration-300 group-hover:scale-125">→</span>
                    <span className="text-purple-600 font-semibold transition-all duration-300 group-hover:text-purple-700">300×300</span>
                  </div>
                  <div className="text-purple-600 text-xs transition-all duration-300 group-hover:text-purple-700 group-hover:font-semibold">Maintain aspect ratio</div>
                </div>
              </div>
            </Link>

            <Link href="/qr-generator" prefetch={true} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-105 transform-gpu">
              <div className="text-center">
                <div className="bg-green-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 group-hover:bg-green-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <QrCode className="h-8 w-8 text-green-600 mx-auto transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors duration-300">Generate QR Codes</h3>
                <p className="text-gray-600 mb-4 group-hover:text-gray-700 transition-colors duration-300">Create custom QR codes for any text or URL</p>
                <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 group-hover:bg-green-50 transition-all duration-300 group-hover:scale-105">
                  <div className="flex justify-center mb-2">
                    <div className="w-16 h-16 bg-black rounded grid grid-cols-4 gap-px transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1">
                      {[0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0].map((pattern, i) => (
                        <div key={`qr-${i}`} className={`${pattern ? 'bg-white' : 'bg-black'} rounded-sm transition-all duration-300`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="text-green-600 text-xs transition-all duration-300 group-hover:text-green-700 group-hover:font-semibold">Instant generation</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Professional Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for image editing, PDF processing, and document creation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image Tools */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 rounded-xl p-3 mr-4">
                  <ImageIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Image Tools</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Professional image processing tools for compression, resizing, and editing.
              </p>
              <div className="space-y-3">
                <Link href="/compress-image" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <Minimize2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 block">Compress Image</span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">Reduce file size</span>
                  </div>
                </Link>
                <Link href="/resize-image" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <Maximize className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 block">Resize Image</span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">Change dimensions</span>
                  </div>
                </Link>
                <Link href="/convert-image" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <RotateCcw className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 block">Convert Format</span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">Change file type</span>
                  </div>
                </Link>
                <Link href="/crop-image" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <Crop className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 block">Crop Image</span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">Trim & adjust</span>
                  </div>
                </Link>
                <Link href="/watermark-image" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <Droplets className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 block">Add Watermark</span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">Protect images</span>
                  </div>
                </Link>
                <Link href="/background-remover" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group border border-transparent hover:border-blue-200 hover:shadow-md">
                  <div className="bg-blue-100 rounded-lg p-2 mr-3 group-hover:bg-blue-200 transition-colors">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700 block">Remove Background</span>
                    <span className="text-sm text-gray-500 group-hover:text-blue-600">AI-powered</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* PDF Tools */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-red-100 rounded-xl p-3 mr-4">
                  <FileText className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">PDF Tools</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Complete PDF processing suite for all your document needs.
              </p>
              <div className="space-y-3">
                <Link href="/compress-pdf" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group border border-transparent hover:border-red-200 hover:shadow-md">
                  <div className="bg-red-100 rounded-lg p-2 mr-3 group-hover:bg-red-200 transition-colors">
                    <Minimize2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-red-700 block">Compress PDF</span>
                    <span className="text-sm text-gray-500 group-hover:text-red-600">Reduce file size</span>
                  </div>
                </Link>
                <Link href="/merge-pdf" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group border border-transparent hover:border-red-200 hover:shadow-md">
                  <div className="bg-red-100 rounded-lg p-2 mr-3 group-hover:bg-red-200 transition-colors">
                    <Layers className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-red-700 block">Merge PDFs</span>
                    <span className="text-sm text-gray-500 group-hover:text-red-600">Combine files</span>
                  </div>
                </Link>
                <Link href="/images-to-pdf" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group border border-transparent hover:border-red-200 hover:shadow-md">
                  <div className="bg-red-100 rounded-lg p-2 mr-3 group-hover:bg-red-200 transition-colors">
                    <FileImage className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-red-700 block">Images to PDF</span>
                    <span className="text-sm text-gray-500 group-hover:text-red-600">Create PDF</span>
                  </div>
                </Link>
                <Link href="/pdf-to-images" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group border border-transparent hover:border-red-200 hover:shadow-md">
                  <div className="bg-red-100 rounded-lg p-2 mr-3 group-hover:bg-red-200 transition-colors">
                    <ImageIcon className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-red-700 block">PDF to Images</span>
                    <span className="text-sm text-gray-500 group-hover:text-red-600">Extract pages</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Document Tools */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="bg-green-100 rounded-xl p-3 mr-4">
                  <Settings className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Document Tools</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Essential utilities for creating and managing documents.
              </p>
              <div className="space-y-3">
                <Link href="/qr-generator" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 group border border-transparent hover:border-green-200 hover:shadow-md">
                  <div className="bg-green-100 rounded-lg p-2 mr-3 group-hover:bg-green-200 transition-colors">
                    <QrCode className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-green-700 block">QR Generator</span>
                    <span className="text-sm text-gray-500 group-hover:text-green-600">Create QR codes</span>
                  </div>
                </Link>
                <Link href="/signature-maker" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 group border border-transparent hover:border-green-200 hover:shadow-md">
                  <div className="bg-green-100 rounded-lg p-2 mr-3 group-hover:bg-green-200 transition-colors">
                    <PenTool className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-green-700 block">Digital Signature</span>
                    <span className="text-sm text-gray-500 group-hover:text-green-600">Sign documents</span>
                  </div>
                </Link>
                <Link href="/passport-photo" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 group border border-transparent hover:border-green-200 hover:shadow-md">
                  <div className="bg-green-100 rounded-lg p-2 mr-3 group-hover:bg-green-200 transition-colors">
                    <ImageIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-green-700 block">Passport Photo</span>
                    <span className="text-sm text-gray-500 group-hover:text-green-600">ID photos</span>
                  </div>
                </Link>
                <Link href="/change-dpi" className="flex items-center p-4 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 group border border-transparent hover:border-green-200 hover:shadow-md">
                  <div className="bg-green-100 rounded-lg p-2 mr-3 group-hover:bg-green-200 transition-colors">
                    <Settings className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 group-hover:text-green-700 block">Change DPI</span>
                    <span className="text-sm text-gray-500 group-hover:text-green-600">Adjust resolution</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ConArt?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technology for professionals who value privacy, security, and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized for speed with modern web technologies and efficient algorithms.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">100% Secure</h3>
              <p className="text-gray-600">
                All processing happens in your browser. Your files never leave your device.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Works Everywhere</h3>
              <p className="text-gray-600">
                Compatible with all modern browsers and devices. No installation required.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="bg-pink-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">User Friendly</h3>
              <p className="text-gray-600">
                Intuitive interface designed for both beginners and professionals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="text-4xl font-bold text-blue-600 mb-2">14+</div>
              <div className="text-gray-700 font-medium">Professional Tools</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-700 font-medium">Free Forever</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
              <div className="text-4xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-700 font-medium">Data Collection</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-8">
              <div className="text-4xl font-bold text-pink-600 mb-2">∞</div>
              <div className="text-gray-700 font-medium">Usage Limit</div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">
                <span className="bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent font-mono uppercase tracking-wider">
                  CONART
                </span>
              </h3>
              <p className="text-gray-600 mb-4 max-w-md">
                Professional online tools for content creation and processing.
                Free, secure, and powerful - all in your browser.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Shield className="h-4 w-4" />
                <span>100% Privacy Protected</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Popular Tools</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/compress-image" className="text-gray-600 hover:text-gray-900 transition-colors">Image Compressor</Link></li>
                <li><Link href="/resize-image" className="text-gray-600 hover:text-gray-900 transition-colors">Image Resizer</Link></li>
                <li><Link href="/qr-generator" className="text-gray-600 hover:text-gray-900 transition-colors">QR Generator</Link></li>
                <li><Link href="/compress-pdf" className="text-gray-600 hover:text-gray-900 transition-colors">PDF Compressor</Link></li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>No Registration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Browser-Based</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Unlimited Usage</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Secure Processing</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500" />
                <span>by Nithin Kommi</span>
              </div>
              <div className="text-sm text-gray-500">
                © 2024 ConArt. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
