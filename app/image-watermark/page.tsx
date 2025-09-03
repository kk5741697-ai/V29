"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { Droplets } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const watermarkOptions = [
  {
    key: "watermarkText",
    label: "Watermark Text",
    type: "text" as const,
    defaultValue: "© Your Brand",
    section: "Watermark Content",
  },
  {
    key: "useImageWatermark",
    label: "Use Image Watermark",
    type: "checkbox" as const,
    defaultValue: false,
    section: "Watermark Content",
  },
  {
    key: "watermarkImage",
    label: "Watermark Image File",
    type: "file" as const,
    defaultValue: null,
    condition: (options) => options.useImageWatermark,
    section: "Watermark Content",
  },
  {
    key: "fontSize",
    label: "Font Size",
    type: "slider" as const,
    defaultValue: 48,
    min: 12,
    max: 120,
    step: 5,
    condition: (options) => !options.useImageWatermark,
    section: "Text Settings",
  },
  {
    key: "opacity",
    label: "Opacity",
    type: "slider" as const,
    defaultValue: 50,
    min: 10,
    max: 100,
    step: 5,
    section: "Appearance",
  },
  {
    key: "position",
    label: "Position",
    type: "select" as const,
    defaultValue: "center",
    selectOptions: [
      { value: "center", label: "Center" },
      { value: "top-left", label: "Top Left" },
      { value: "top-right", label: "Top Right" },
      { value: "bottom-left", label: "Bottom Left" },
      { value: "bottom-right", label: "Bottom Right" },
      { value: "diagonal", label: "Diagonal" },
    ],
    section: "Appearance",
  },
  {
    key: "textColor",
    label: "Text Color",
    type: "color" as const,
    defaultValue: "#ffffff",
    condition: (options) => !options.useImageWatermark,
    section: "Text Settings",
  },
  {
    key: "outputFormat",
    label: "Output Format",
    type: "select" as const,
    defaultValue: "png",
    selectOptions: [
      { value: "jpeg", label: "JPEG" },
      { value: "png", label: "PNG" },
      { value: "webp", label: "WebP" },
    ],
    section: "Output",
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 95,
    min: 10,
    max: 100,
    step: 5,
    section: "Output",
  },
]

async function addWatermarkToImages(files: any[], options: any) {
  try {
    if (!options.useImageWatermark && (!options.watermarkText || options.watermarkText.trim() === "")) {
      return {
        success: false,
        error: "Please provide watermark text or image",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const processedBlob = await ImageProcessor.addWatermark(
          file.originalFile || file.file, 
          options.watermarkText, 
          {
            watermarkOpacity: options.opacity / 100,
            outputFormat: options.outputFormat || "png",
            position: options.position,
            textColor: options.textColor,
            fontSize: options.fontSize,
            watermarkImage: options.useImageWatermark ? options.watermarkImage : undefined,
            quality: options.quality || 95,
            backgroundColor: "#ffffff"
          }
        )

        const processedUrl = URL.createObjectURL(processedBlob)
        
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_watermarked.${options.outputFormat || "png"}`

        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob
        }
      }),
    )

    return {
      success: true,
      processedFiles,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add watermark",
    }
  }
}

export default function ImageWatermarkPage() {
  return (
    <ImageToolsLayout
      title="Image Watermark"
      description="Add text watermarks to your images for copyright protection and branding. Customize opacity, position, size, and color."
      icon={Droplets}
      toolType="watermark"
      processFunction={addWatermarkToImages}
      options={watermarkOptions}
      maxFiles={10}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}
