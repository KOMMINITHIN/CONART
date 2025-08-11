# 🎨 ConArt - Complete Image & PDF Toolkit

A comprehensive, privacy-focused web application for image and PDF processing. All operations happen in your browser - no uploads, no tracking, completely private.

![ConArt Banner](https://img.shields.io/badge/ConArt-Image%20%26%20PDF%20Toolkit-blue?style=for-the-badge)

## ✨ Features

### 🖼️ Image Tools
- **Compress Images** - Reduce file size while maintaining quality
- **Resize Images** - Change dimensions with preset sizes or custom values
- **Crop Images** - Crop with aspect ratios or freeform selection
- **Convert Images** - Convert between formats (JPG, PNG, WebP, etc.)
- **Watermark Images** - Add text watermarks with customizable styling
- **Background Remover** - AI-powered background removal
- **Passport Photo** - Create passport-sized photos with guidelines
- **Change DPI** - Modify image resolution for printing

### 📄 PDF Tools
- **Images to PDF** - Convert multiple images into a single PDF
- **PDF to Images** - Extract images from PDF files
- **Compress PDF** - Reduce PDF file size
- **Merge PDF** - Combine multiple PDF files

### 🔧 Utility Tools
- **QR Code Generator** - Create QR codes with customization options
- **Signature Maker** - Create digital signatures

### 🔒 Privacy & Security
- **100% Client-Side Processing** - All operations happen in your browser
- **No File Uploads** - Files never leave your device
- **No Data Collection** - No tracking, analytics, or data storage
- **No Registration Required** - Use all features without creating an account
- **Open Source** - Transparent and auditable code

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd conart
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom Components
- **Icons**: Lucide React
- **Image Processing**: Canvas API, File API
- **PDF Processing**: PDF-lib, jsPDF
- **QR Codes**: qrcode library

## 📁 Project Structure

```
conart/
├── app/                    # Next.js App Router pages
│   ├── compress-image/     # Image compression tool
│   ├── resize-image/       # Image resizing tool
│   ├── crop-image/         # Image cropping tool
│   ├── convert-image/      # Image format conversion
│   ├── watermark-image/    # Image watermarking
│   ├── background-remover/ # AI background removal
│   ├── passport-photo/     # Passport photo creator
│   ├── change-dpi/         # DPI modification
│   ├── images-to-pdf/      # Images to PDF converter
│   ├── pdf-to-images/      # PDF to images extractor
│   ├── compress-pdf/       # PDF compression
│   ├── merge-pdf/          # PDF merging
│   ├── qr-generator/       # QR code generator
│   ├── signature-maker/    # Digital signature tool
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage
├── components/             # Reusable components
│   ├── ui/                 # UI primitives
│   ├── ProfessionalNavigation.tsx
│   ├── UniversalHelpDialog.tsx
│   └── BatchProcessor.tsx
├── lib/                    # Utility functions
│   └── utils.ts
├── types/                  # TypeScript definitions
└── public/                 # Static assets
```

## 📖 How to Use

### Basic Usage
1. **Select a Tool** - Choose from image or PDF tools in the navigation
2. **Upload Files** - Drag & drop or click to select files
3. **Configure Settings** - Adjust quality, size, or other options
4. **Process** - Click the process button
5. **Download** - Get your optimized files

### Advanced Features
- **Batch Processing** - Process multiple files at once
- **Custom Settings** - Fine-tune compression and quality
- **Format Conversion** - Convert between different file formats
- **Help System** - Built-in help for every tool
- **Keyboard Shortcuts** - Efficient workflow for power users

## 🌐 Deployment

### Vercel (Recommended - Free)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify (Free Tier)
1. Build the project: `npm run build`
2. Upload `.next` folder to Netlify

### GitHub Pages (Free)
1. Add `output: 'export'` to `next.config.ts`
2. Build and export: `npm run build`
3. Deploy to GitHub Pages

## 📊 Performance

- **Bundle Size**: 471KB shared, 2-4KB per page
- **Build Time**: ~30 seconds
- **Static Generation**: All pages pre-rendered
- **Lighthouse Score**: 95+ on all metrics

## 🐛 Bug Fixes & Improvements

### Recent Fixes
- ✅ Fixed duplicate React key warnings
- ✅ Resolved hydration mismatches
- ✅ Enhanced quality slider visibility
- ✅ Added route prefetching for faster navigation
- ✅ Cleaned up console errors for production
- ✅ Added comprehensive help system
- ✅ Optimized glassmorphism usage
- ✅ Improved range input styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Lucide](https://lucide.dev/) - Beautiful icons

## 📞 Support

If you encounter any issues or have questions:
1. Check the help dialog in each tool
2. Review this README
3. Open an issue on GitHub

---

**Made with ❤️ for privacy-conscious users**
