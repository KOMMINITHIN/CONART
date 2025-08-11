"use client"

import React from 'react'

interface ToolLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export function ToolLayout({ children, sidebar }: ToolLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      {sidebar ? (
        <div className="tool-layout">
          <div className="tool-main">
            {children}
          </div>
          <div className="tool-sidebar">
            {sidebar}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      )}
    </div>
  )
}
