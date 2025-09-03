# PixoraTools - Professional Online Tools Platform

A comprehensive web tools platform with 300+ professional utilities for PDF, image, QR code, text, and SEO operations. All tools are fully functional with real processing capabilities.

## Features

- **PDF Tools**: Real PDF processing with merge, split, compress, convert, and protect functionality
- **Image Tools**: Actual image processing with resize, compress, convert, crop, rotate, and filter capabilities
- **QR & Barcode Tools**: Functional QR code generation and scanning with multiple data types
- **Text & Code Tools**: Real formatting, validation, and conversion for JSON, HTML, CSS, JavaScript
- **SEO Tools**: Working meta tag generation, sitemap creation, and SEO analysis
- **Utilities**: Functional password generator, converters, calculators, and more

## Real Processing Capabilities

### Image Processing
- **Compression**: Actual file size reduction with quality control
- **Resizing**: Real dimension changes with aspect ratio preservation
- **Format Conversion**: True format conversion between JPEG, PNG, WebP
- **Cropping**: Precise pixel-level cropping with visual editor
- **Filters**: Real CSS filter application with live preview
- **Watermarking**: Text and image watermarks with positioning

### PDF Processing
- **Merging**: Real PDF combination using PDF-lib
- **Splitting**: Actual page extraction and separation
- **Compression**: True file size reduction with quality options
- **Conversion**: Real PDF to image conversion with DPI control
- **Protection**: Password protection and permission controls
- **Watermarking**: Text watermarks with positioning and styling

### QR Code Generation
- **Multiple Types**: URL, text, email, phone, SMS, WiFi, vCard, events, locations
- **Customization**: Colors, sizes, error correction levels
- **Logo Integration**: Real logo embedding with file upload
- **Styling**: Scannable styling options (rounded, dots)
- **Bulk Generation**: CSV import and batch processing

## Configuration

### Ads System

The ads system is **enabled by default** with proper AdSense integration:

#### AdSense Features:
- **SPA Compatibility**: Ads work with Next.js client-side navigation
- **Responsive Design**: Ads adapt to mobile and desktop layouts
- **Strategic Placement**: Ads in canvas areas, sidebars, and content sections
- **GDPR Compliant**: Proper consent management and privacy controls
- **Performance Optimized**: Lazy loading and non-blocking ad initialization

#### Ad Placements:
- Homepage feature section
- Tool canvas areas (overlay and bottom)
- Tool sidebars (desktop)
- Mobile bottom banners
- Upload areas (mobile)
- Footer sections

#### Configuration:
The AdSense publisher ID is set in `lib/config.ts`. Auto ads are disabled for better control over ad placement and user experience.

#### AdSense Setup Instructions:
1. **Publisher ID**: Already configured with `ca-pub-4755003409431265`
2. **Ad Slots**: Default slot IDs are set (you can customize these in each component)
3. **Approval Process**: Once you get AdSense approval, ads will automatically start showing
4. **No Additional Setup**: The ad code is already integrated - just wait for approval
5. **Custom Slots**: After approval, you can create specific ad units in AdSense dashboard and update slot IDs

#### Current Ad Slot Configuration:
- All ad slots use default ID `1234567890` (placeholder)
- After AdSense approval, you can:
  - Keep default slots (ads will show automatically)
  - Create custom ad units in AdSense dashboard
  - Update slot IDs in components for better tracking

#### Development vs Production:
- **Development**: Shows placeholder ad spaces with slot information
- **Production**: Will display actual AdSense ads after approval
- **Testing**: Use `data-adtest="on"` attribute for testing (already configured)
### Search Functionality

- Global search across all tools
- Keyboard shortcut: `Cmd/Ctrl + K`
- Real-time filtering and categorization
- Works on all domains and pages

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Domain Structure

- `pixoratools.com` - Main platform with all tools
- `pixorapdf.com` - PDF-focused tools
- `pixoraimg.com` - Image editing tools  
- `pixoraqrcode.com` - QR and barcode tools
- `pixoracode.com` - Code and development tools
- `pixoraseo.com` - SEO and marketing tools

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **PDF Processing**: PDF-lib for client-side PDF manipulation
- **Image Processing**: Canvas API for client-side image editing
- **QR Codes**: qrcode library for generation
- **File Handling**: JSZip for bulk downloads

## License

MIT License - see LICENSE file for details