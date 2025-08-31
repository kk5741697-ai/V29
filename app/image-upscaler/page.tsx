"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { ZoomIn } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const upscaleOptions = [
  {
    key: "scaleFactor",
    label: "Scale Factor",
    type: "select" as const,
    defaultValue: "2",
    selectOptions: [
      { value: "1.5", label: "1.5x (150%)" },
      { value: "2", label: "2x (200%)" },
      { value: "3", label: "3x (300%)" },
      { value: "4", label: "4x (400%)" },
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
      { value: "nearest", label: "Nearest Neighbor (Pixel Art)" },
    ],
    section: "Algorithm",
  },
  {
    key: "enhanceDetails",
    label: "Enhance Details",
    type: "checkbox" as const,
    defaultValue: true,
    section: "Enhancement",
  },
  {
    key: "reduceNoise",
    label: "Reduce Noise",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Enhancement",
  },
  {
    key: "sharpen",
    label: "Sharpening",
    type: "slider" as const,
    defaultValue: 25,
    min: 0,
    max: 100,
    step: 5,
    section: "Enhancement",
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
        const scaleFactor = parseFloat(options.scaleFactor || "2")
        
        const processedBlob = await ImageProcessor.resizeImage(file.originalFile || file.file, {
          width: Math.floor((file.dimensions?.width || 800) * scaleFactor),
          height: Math.floor((file.dimensions?.height || 600) * scaleFactor),
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
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["png", "jpeg", "webp"]}
    />
  )
}