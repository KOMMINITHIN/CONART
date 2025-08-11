"use client"

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { 
  Droplets, 
  Download, 
  Upload,
  Settings,
  HelpCircle,
  Type,
  Image as ImageIcon,
  Palette,
  RotateCw,
  Move,
  Square,
  Circle,
  Triangle,
  Layers,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
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
import { validateImageFile, downloadFile } from '@/lib/utils'
// Note: Fabric.js integration will be added in future update

interface WatermarkElement {
  id: string
  type: 'text' | 'shape' | 'image'
  visible: boolean
  locked: boolean
  data: any
}

interface TextElement extends WatermarkElement {
  type: 'text'
  data: {
    text: string
    fontFamily: string
    fontSize: number
    fontWeight: 'normal' | 'bold'
    fontStyle: 'normal' | 'italic'
    textDecoration: 'none' | 'underline'
    textAlign: 'left' | 'center' | 'right'
    color: string
    backgroundColor: string
    opacity: number
    rotation: number
    x: number
    y: number
    width: number
    height: number
    shadow: {
      enabled: boolean
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
    stroke: {
      enabled: boolean
      color: string
      width: number
    }
  }
}

interface ShapeElement extends WatermarkElement {
  type: 'shape'
  data: {
    shape: 'rectangle' | 'circle' | 'triangle'
    fill: string
    stroke: string
    strokeWidth: number
    opacity: number
    rotation: number
    x: number
    y: number
    width: number
    height: number
    radius?: number
  }
}

export default function AdvancedWatermarkPage() {
  const [files, setFiles] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [watermarkedImages, setWatermarkedImages] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [elements, setElements] = useState<WatermarkElement[]>([])
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<HTMLCanvasElement>(null)

  // Font families available
  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Palatino'
  ]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const validation = validateImageFile(file)
      return validation.isValid
    })
    setFiles(validFiles)
    if (validFiles.length > 0) {
      setCurrentFile(validFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true
  })

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (fabricCanvasRef.current && !canvas) {
      const fabricCanvas = new fabric.Canvas(fabricCanvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f9fa'
      })
      
      fabricCanvas.on('selection:created', (e) => {
        if (e.selected && e.selected[0]) {
          setSelectedElement(e.selected[0].id || null)
        }
      })
      
      fabricCanvas.on('selection:cleared', () => {
        setSelectedElement(null)
      })
      
      setCanvas(fabricCanvas)
      
      return () => {
        fabricCanvas.dispose()
      }
    }
  }, [canvas])

  // Load image into canvas
  useEffect(() => {
    if (currentFile && canvas) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imgUrl = e.target?.result as string
        fabric.Image.fromURL(imgUrl, (img) => {
          // Scale image to fit canvas
          const scale = Math.min(
            canvas.width! / img.width!,
            canvas.height! / img.height!
          )
          img.scale(scale)
          img.set({
            left: (canvas.width! - img.width! * scale) / 2,
            top: (canvas.height! - img.height! * scale) / 2,
            selectable: false,
            evented: false
          })
          canvas.clear()
          canvas.add(img)
          canvas.sendToBack(img)
          canvas.renderAll()
        })
      }
      reader.readAsDataURL(currentFile)
    }
  }, [currentFile, canvas])

  // Add text element
  const addTextElement = useCallback(() => {
    if (!canvas) return
    
    const text = new fabric.Text('Your Text Here', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 40,
      fill: '#000000',
      id: `text-${Date.now()}`
    })
    
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
    
    const newElement: TextElement = {
      id: text.id!,
      type: 'text',
      visible: true,
      locked: false,
      data: {
        text: 'Your Text Here',
        fontFamily: 'Arial',
        fontSize: 40,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        opacity: 1,
        rotation: 0,
        x: 100,
        y: 100,
        width: text.width!,
        height: text.height!,
        shadow: {
          enabled: false,
          color: '#000000',
          blur: 5,
          offsetX: 2,
          offsetY: 2
        },
        stroke: {
          enabled: false,
          color: '#000000',
          width: 1
        }
      }
    }
    
    setElements(prev => [...prev, newElement])
    setSelectedElement(text.id!)
  }, [canvas])

  // Add shape element
  const addShapeElement = useCallback((shapeType: 'rectangle' | 'circle' | 'triangle') => {
    if (!canvas) return
    
    let shape: fabric.Object
    const id = `shape-${Date.now()}`
    
    switch (shapeType) {
      case 'rectangle':
        shape = new fabric.Rect({
          left: 150,
          top: 150,
          width: 100,
          height: 100,
          fill: '#ff0000',
          id
        })
        break
      case 'circle':
        shape = new fabric.Circle({
          left: 150,
          top: 150,
          radius: 50,
          fill: '#00ff00',
          id
        })
        break
      case 'triangle':
        shape = new fabric.Triangle({
          left: 150,
          top: 150,
          width: 100,
          height: 100,
          fill: '#0000ff',
          id
        })
        break
    }
    
    canvas.add(shape)
    canvas.setActiveObject(shape)
    canvas.renderAll()
    
    const newElement: ShapeElement = {
      id,
      type: 'shape',
      visible: true,
      locked: false,
      data: {
        shape: shapeType,
        fill: shape.fill as string,
        stroke: shape.stroke as string || '#000000',
        strokeWidth: shape.strokeWidth || 0,
        opacity: shape.opacity || 1,
        rotation: shape.angle || 0,
        x: shape.left || 0,
        y: shape.top || 0,
        width: shape.width || 100,
        height: shape.height || 100,
        radius: shapeType === 'circle' ? (shape as fabric.Circle).radius : undefined
      }
    }
    
    setElements(prev => [...prev, newElement])
    setSelectedElement(id)
  }, [canvas])

  // Update text properties
  const updateTextProperty = useCallback((property: string, value: any) => {
    if (!canvas || !selectedElement) return
    
    const activeObject = canvas.getActiveObject() as fabric.Text
    if (!activeObject || activeObject.type !== 'text') return
    
    switch (property) {
      case 'text':
        activeObject.set('text', value)
        break
      case 'fontFamily':
        activeObject.set('fontFamily', value)
        break
      case 'fontSize':
        activeObject.set('fontSize', value)
        break
      case 'color':
        activeObject.set('fill', value)
        break
      case 'fontWeight':
        activeObject.set('fontWeight', value)
        break
      case 'fontStyle':
        activeObject.set('fontStyle', value)
        break
      case 'textAlign':
        activeObject.set('textAlign', value)
        break
      case 'opacity':
        activeObject.set('opacity', value / 100)
        break
    }
    
    canvas.renderAll()
    
    // Update element data
    setElements(prev => prev.map(el => 
      el.id === selectedElement 
        ? { ...el, data: { ...el.data, [property]: value } }
        : el
    ))
  }, [canvas, selectedElement])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden canvas for final processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-2">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Advanced Watermark Designer
                </h1>
                <p className="text-sm text-gray-600">
                  Create professional watermarks with advanced design tools
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {previewMode ? 'Edit Mode' : 'Preview'}
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-4">
            {/* File Upload */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Upload Image</h3>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  isDragActive ? 'border-cyan-400 bg-cyan-50' : 'border-gray-300'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                {isDragActive ? (
                  <p className="text-cyan-600 text-sm">Drop images here...</p>
                ) : (
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Drop images or click
                    </p>
                    <p className="text-xs text-gray-500">
                      JPEG, PNG, WebP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Add Elements */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Add Elements</h3>
              <div className="space-y-2">
                <Button
                  onClick={addTextElement}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Type className="h-4 w-4 mr-2" />
                  Add Text
                </Button>
                <Button
                  onClick={() => addShapeElement('rectangle')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Rectangle
                </Button>
                <Button
                  onClick={() => addShapeElement('circle')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Circle className="h-4 w-4 mr-2" />
                  Circle
                </Button>
                <Button
                  onClick={() => addShapeElement('triangle')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Triangle className="h-4 w-4 mr-2" />
                  Triangle
                </Button>
              </div>
            </div>

            {/* Layers Panel */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Layers className="h-5 w-5 mr-2" />
                Layers
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {elements.map((element) => (
                  <div
                    key={element.id}
                    className={`flex items-center justify-between p-2 rounded border ${
                      selectedElement === element.id ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {element.type === 'text' ? (
                        <Type className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Square className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm font-medium">
                        {element.type === 'text'
                          ? (element as TextElement).data.text.substring(0, 15) + '...'
                          : `${(element as ShapeElement).data.shape}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Toggle visibility
                        }}
                      >
                        {element.visible ? (
                          <Eye className="h-3 w-3" />
                        ) : (
                          <EyeOff className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          // Delete element
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Design Canvas</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <canvas
                  ref={fabricCanvasRef}
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Properties */}
          <div className="lg:col-span-1 space-y-4">
            {selectedElement && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Properties</h3>

                {/* Text Properties */}
                {elements.find(el => el.id === selectedElement)?.type === 'text' && (
                  <div className="space-y-4">
                    {/* Text Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Text
                      </label>
                      <textarea
                        value={(elements.find(el => el.id === selectedElement) as TextElement)?.data.text || ''}
                        onChange={(e) => updateTextProperty('text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Family
                      </label>
                      <Select
                        value={(elements.find(el => el.id === selectedElement) as TextElement)?.data.fontFamily || 'Arial'}
                        onValueChange={(value) => updateTextProperty('fontFamily', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontFamilies.map(font => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Size: {(elements.find(el => el.id === selectedElement) as TextElement)?.data.fontSize || 40}px
                      </label>
                      <Slider
                        value={[(elements.find(el => el.id === selectedElement) as TextElement)?.data.fontSize || 40]}
                        onValueChange={(value) => updateTextProperty('fontSize', value[0])}
                        min={8}
                        max={200}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Text Style Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Style
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={(elements.find(el => el.id === selectedElement) as TextElement)?.data.fontWeight === 'bold' ? 'default' : 'outline'}
                          onClick={() => updateTextProperty('fontWeight',
                            (elements.find(el => el.id === selectedElement) as TextElement)?.data.fontWeight === 'bold' ? 'normal' : 'bold'
                          )}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={(elements.find(el => el.id === selectedElement) as TextElement)?.data.fontStyle === 'italic' ? 'default' : 'outline'}
                          onClick={() => updateTextProperty('fontStyle',
                            (elements.find(el => el.id === selectedElement) as TextElement)?.data.fontStyle === 'italic' ? 'normal' : 'italic'
                          )}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={(elements.find(el => el.id === selectedElement) as TextElement)?.data.textDecoration === 'underline' ? 'default' : 'outline'}
                          onClick={() => updateTextProperty('textDecoration',
                            (elements.find(el => el.id === selectedElement) as TextElement)?.data.textDecoration === 'underline' ? 'none' : 'underline'
                          )}
                        >
                          <Underline className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Text Alignment */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alignment
                      </label>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={(elements.find(el => el.id === selectedElement) as TextElement)?.data.textAlign === 'left' ? 'default' : 'outline'}
                          onClick={() => updateTextProperty('textAlign', 'left')}
                        >
                          <AlignLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={(elements.find(el => el.id === selectedElement) as TextElement)?.data.textAlign === 'center' ? 'default' : 'outline'}
                          onClick={() => updateTextProperty('textAlign', 'center')}
                        >
                          <AlignCenter className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant={(elements.find(el => el.id === selectedElement) as TextElement)?.data.textAlign === 'right' ? 'default' : 'outline'}
                          onClick={() => updateTextProperty('textAlign', 'right')}
                        >
                          <AlignRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={(elements.find(el => el.id === selectedElement) as TextElement)?.data.color || '#000000'}
                          onChange={(e) => updateTextProperty('color', e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(elements.find(el => el.id === selectedElement) as TextElement)?.data.color || '#000000'}
                          onChange={(e) => updateTextProperty('color', e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Opacity */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Opacity: {Math.round(((elements.find(el => el.id === selectedElement) as TextElement)?.data.opacity || 1) * 100)}%
                      </label>
                      <Slider
                        value={[((elements.find(el => el.id === selectedElement) as TextElement)?.data.opacity || 1) * 100]}
                        onValueChange={(value) => updateTextProperty('opacity', value[0])}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
