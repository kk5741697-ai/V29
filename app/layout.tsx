import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { APP_CONFIG } from "@/lib/config"
import { SecurityBanner } from "@/components/security-banner"
import Script from "next/script"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: {
    template: "%s - PixoraTools",
    default: "PixoraTools - Free Online Tools for PDF, Image, QR Code & More"
  },
  description:
    "Free online tools for PDF editing, image processing, QR code generation, and text formatting. Compress, resize, crop, convert files instantly in your browser. No registration required.",
  generator: "PixoraTools",
  keywords: "free online tools, PDF editor, image compressor, QR code generator, photo editor, file converter, web tools, image resizer, PDF merger, text formatter, online utilities, browser tools",
  robots: "index, follow",
  openGraph: {
    title: "PixoraTools - Free Online Tools for Everyone",
    description: "Free online tools for PDF editing, image processing, QR codes, and more. Process files securely in your browser without registration.",
    type: "website",
    locale: "en_US",
    siteName: "PixoraTools",
    url: "https://pixoratools.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixoraTools - Free Online Tools",
    description: "Free online tools for PDF editing, image processing, QR codes, and more. No registration required.",
    site: "@pixoratools",
  },
  verification: {
    google: "google6adf6312a96691f1",
  },
  alternates: {
    canonical: "https://pixoratools.com",
  },
  category: "Technology",
  classification: "Online Tools",
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#3b82f6',
  }
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-4755003409431265" />
        <meta name="google-site-verification" content="google6adf6312a96691f1" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4755003409431265"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-CMZ40J80GE" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CMZ40J80GE');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${poppins.variable} antialiased`} suppressHydrationWarning>
        <SecurityBanner />
        {children}
        <Toaster />
        
        <Script id="adsense-init" strategy="afterInteractive">
          {`
            (function() {
              // Enhanced bounce protection for AdSense policy compliance
              let sessionStartTime = parseInt(sessionStorage.getItem('sessionStartTime') || '0');
              let pageViews = parseInt(sessionStorage.getItem('pageViews') || '0');
              let toolUsage = parseInt(sessionStorage.getItem('toolUsage') || '0');
              
              if (!sessionStartTime) {
                sessionStartTime = Date.now();
                sessionStorage.setItem('sessionStartTime', sessionStartTime.toString());
              }
              
              // Track tool usage
              document.addEventListener('click', function(e) {
                const target = e.target;
                if (target && (target.closest('[data-tool-action]') || target.closest('button'))) {
                  toolUsage++;
                  sessionStorage.setItem('toolUsage', toolUsage.toString());
                }
              });
              
              // Enhanced error handling for image processing
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('out of memory')) {
                  console.warn('Memory error detected, cleaning up...');
                  // Clean up blob URLs
                  const images = document.querySelectorAll('img[src^="blob:"]');
                  images.forEach(img => {
                    if (img.src) URL.revokeObjectURL(img.src);
                  });
                  
                  // Force garbage collection if available
                  if ('gc' in window && typeof window.gc === 'function') {
                    window.gc();
                  }
                }
              });
              
              // Enhanced file processing error handling
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message && e.reason.message.includes('Canvas')) {
                  console.warn('Canvas error detected, cleaning up...');
                  // Clean up canvases
                  const canvases = document.querySelectorAll('canvas');
                  canvases.forEach(canvas => {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                  });
                }
              });
              
              // Prevent navigation during processing
              let isProcessing = false;
              document.addEventListener('click', function(e) {
                const target = e.target;
                if (target && target.textContent && 
                    (target.textContent.includes('Process') || target.textContent.includes('Generate'))) {
                  isProcessing = true;
                  setTimeout(() => { isProcessing = false; }, 30000); // Reset after 30s
                }
              });
              
              // Warn before navigation during processing
              window.addEventListener('beforeunload', function(e) {
                if (isProcessing) {
                  e.preventDefault();
                  e.returnValue = 'Processing in progress. Are you sure you want to leave?';
                  return e.returnValue;
                }
              });
              
              // Handle SPA navigation for AdSense
              let currentPath = window.location.pathname;
              
              function initAdsense() {
                const sessionDuration = Date.now() - sessionStartTime;
                const shouldShowAds = sessionDuration > 15000 || pageViews > 2 || toolUsage > 0;
                
                if (!shouldShowAds) {
                  return; // Don't initialize ads for bouncy users
                }
                
                try {
                  // Initialize AdSense for SPA
                  window.adsbygoogle = window.adsbygoogle || [];
                  
                  // Push existing ads on page
                  const ads = document.querySelectorAll('.adsbygoogle:not([data-adsbygoogle-status])');
                  ads.forEach(() => {
                    try {
                      window.adsbygoogle.push({});
                    } catch (e) {
                      console.warn('AdSense push failed:', e);
                    }
                  });
                  
                  // Disable auto ads to prevent policy violations
                } catch (e) {
                  console.warn('AdSense initialization failed:', e);
                }
              }
              
              // Handle route changes for SPA
              function handleRouteChange() {
                pageViews++;
                sessionStorage.setItem('pageViews', pageViews.toString());
                
                if (window.location.pathname !== currentPath) {
                  currentPath = window.location.pathname;
                  setTimeout(initAdsense, 2000); // Longer delay for better user experience
                }
              }
              
              // Listen for navigation changes
              window.addEventListener('popstate', handleRouteChange);
              
              // Override pushState and replaceState for programmatic navigation
              const originalPushState = history.pushState;
              const originalReplaceState = history.replaceState;
              
              history.pushState = function(...args) {
                originalPushState.apply(history, args);
                handleRouteChange();
              };
              
              history.replaceState = function(...args) {
                originalReplaceState.apply(history, args);
                handleRouteChange();
              };
              
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initAdsense);
              } else {
                initAdsense();
              }
            })();
          `}
        </Script>
      </body>
    </html>
  )
}