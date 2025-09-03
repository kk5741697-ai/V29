"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { ZoomIn } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const upscaleOptions = [
  {
    key: "scaleFactor",
    label: "Scale Factor",
    type: "select" as const,
    defaultValue: "1.5",
    selectOptions: [
      { value: "1.25", label: "1.25x (125%)" },
      { value: "1.5", label: "1.5x (150%)" },
      { value: "2", label: "2x (200%) - Basic" },
    ],
    section: "Scale",
  },
  {
    key: "algorithm",
    label: "Upscaling Algorithm",
    type: "select" as const,
    defaultValue: "lanczos",
    selectOptions: [
      { value: "lanczos", label: "Lanczos (High Quality)" },
      { value: "bicubic", label: "Bicubic (Balanced)" },
      { value: "bilinear", label: "Bilinear (Fast)" },
    ],
    section: "Algorithm",
  },
]

async function upscaleImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const scaleFactor = parseFloat(options.scaleFactor || "1.5")
        
        // Use basic browser-based upscaling
        const processedBlob = await this.basicUpscale(file.originalFile || file.file, {
          scaleFactor,
          algorithm: options.algorithm,
          maintainAspectRatio: true,
          outputFormat: "png",
          quality: 95,
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_upscaled_${scaleFactor}x.png`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
          dimensions: {
            width: Math.floor((file.dimensions?.width || 800) * scaleFactor),
            height: Math.floor((file.dimensions?.height || 600) * scaleFactor)
          }
        }
      })
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upscale images",
    }
  }
}
}

// Basic upscaling function
async function basicUpscale(file: File, options: any): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      reject(new Error("Canvas not supported"))
      return
    }
export default function ImageUpscalerPage() {
  return (
    <ImageToolsLayout
      title="Image Upscaler"
      description="Enlarge images with AI-enhanced quality. Increase resolution while preserving details using advanced upscaling algorithms."
      icon={ZoomIn}
      toolType="upscale"
      processFunction={upscaleImages}
      options={upscaleOptions}
      maxFiles={5}
    const img = new Image()
    img.onload = () => {
      try {
        const scaleFactor = options.scaleFactor || 1.5
        const targetWidth = Math.floor(img.naturalWidth * scaleFactor)
        const targetHeight = Math.floor(img.naturalHeight * scaleFactor)
      allowBatchProcessing={true}
        canvas.width = targetWidth
        canvas.height = targetHeight
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
        // Apply algorithm-specific settings
        switch (options.algorithm) {
          case "bicubic":
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
            break
          case "bilinear":
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "medium"
            break
          default: // lanczos
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = "high"
        }
      outputFormats={["png", "jpeg", "webp"]}
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
    />
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to create blob"))
            }
          },
          "image/png",
          0.95
        )
      } catch (error) {
        reject(error)
      }
    }
  )
    img.onerror = () => reject(new Error("Failed to load image"))
    img.crossOrigin = "anonymous"
    img.src = URL.createObjectURL(file)
  })
}