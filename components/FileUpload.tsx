"use client"

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, FileImage, AlertCircle } from 'lucide-react'
import { cn, validateImageFile } from '@/lib/utils'

interface FileUploadProps {
  onFilesAdded: (files: File[]) => void
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function FileUpload({ 
  onFilesAdded, 
  maxFiles = 10, 
  disabled = false,
  className 
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Validate files
    const validFiles: File[] = []
    const errors: string[] = []

    acceptedFiles.forEach(file => {
      const validation = validateImageFile(file)
      if (validation.isValid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    })

    rejectedFiles.forEach(({ file, errors: fileErrors }) => {
      const errorMessages = fileErrors.map((e: any) => e.message).join(', ')
      errors.push(`${file.name}: ${errorMessages}`)
    })

    if (errors.length > 0) {
      // File validation errors handled silently in production
      // You could show these errors in a toast or alert
    }

    if (validFiles.length > 0) {
      onFilesAdded(validFiles)
    }
  }, [onFilesAdded])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    open
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    disabled,
    noClick: false,
    noKeyboard: false
  })

  const dropzoneClassName = cn(
    "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer",
    "hover:border-primary/50 hover:bg-primary/5",
    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
    {
      "border-primary bg-primary/10": isDragAccept,
      "border-destructive bg-destructive/10": isDragReject,
      "border-primary/30 bg-primary/5": isDragActive && !isDragReject,
      "border-gray-300": !isDragActive,
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  )

  return (
    <div {...getRootProps()} className={dropzoneClassName}>
      <input {...getInputProps()} />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        {isDragActive ? (
          isDragReject ? (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive font-medium">
                Some files are not supported
              </p>
              <p className="text-sm text-muted-foreground">
                Please drop only image files (JPEG, PNG, WebP, GIF)
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-primary animate-bounce" />
              <p className="text-primary font-medium">
                Drop your images here
              </p>
            </>
          )
        ) : (
          <>
            <div className="flex items-center justify-center space-x-2">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <FileImage className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drag & drop images here
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse files
              </p>
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Supports: JPEG, PNG, WebP, GIF</p>
              <p>Max file size: 50MB</p>
              <p>Max files: {maxFiles}</p>
            </div>
          </>
        )}
      </div>
      
      {!isDragActive && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-primary/5 rounded-lg">
          <div className="bg-white/90 backdrop-blur-sm rounded-md px-4 py-2 shadow-lg">
            <p className="text-sm font-medium text-primary">
              Click or drag to upload
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
