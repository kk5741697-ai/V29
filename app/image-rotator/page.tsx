"use client"

import { ImageToolsLayout } from "@/components/image-tools-layout"
import { RotateCw } from "lucide-react"
import { ImageProcessor } from "@/lib/processors/image-processor"

const rotateOptions = [
  {
    key: "rotation",
    label: "Quick Rotation",
    type: "select" as const,
    defaultValue: "",
    selectOptions: [
      { value: "", label: "Custom Angle" },
      { value: "90", label: "90° Clockwise" },
      { value: "180", label: "180° Flip" },
      { value: "270", label: "270° Clockwise" },
    ],
  },
  {
    key: "customAngle",
    label: "Custom Angle (degrees)",
    type: "slider" as const,
    defaultValue: 0,
    min: -180,
    max: 180,
    step: 1,
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
  },
  {
    key: "quality",
    label: "Quality",
    type: "slider" as const,
    defaultValue: 95,
    min: 10,
    max: 100,
    step: 5,
  },
]

async function rotateImages(files: any[], options: any) {
  try {
    if (files.length === 0) {
      return {
        success: false,
        error: "No files to process",
      }
    }

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const angle = options.rotation ? parseInt(options.rotation) : (options.customAngle || 0)
        
        const processedBlob = await ImageProcessor.rotateImage(file.originalFile || file.file, {
          customRotation: angle,
          outputFormat: options.outputFormat || "png",
          quality: options.quality || 95,
          backgroundColor: "#ffffff"
        })

        const processedUrl = URL.createObjectURL(processedBlob)
        
        const baseName = file.name.split(".")[0]
        const newName = `${baseName}_rotated.${options.outputFormat || "png"}`
        
        // Calculate new dimensions for 90° and 270° rotations
        const shouldSwapDimensions = Math.abs(angle) === 90 || Math.abs(angle) === 270
        const newDimensions = shouldSwapDimensions
          ? { width: file.dimensions.height, height: file.dimensions.width }
          : file.dimensions
        return {
          ...file,
          processed: true,
          processedPreview: processedUrl,
          name: newName,
          processedSize: processedBlob.size,
          blob: processedBlob,
          dimensions: newDimensions,
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
      error: error instanceof Error ? error.message : "Failed to rotate images",
    }
  }
}

export default function ImageRotatorPage() {
  return (
    <ImageToolsLayout
      title="Image Rotator"
      description="Rotate images by 90°, 180°, 270°, or any custom angle. Perfect for fixing orientation and creating artistic effects."
      icon={RotateCw}
      toolType="rotate"
      processFunction={rotateImages}
      options={rotateOptions}
      maxFiles={10}
      allowBatchProcessing={true}
      supportedFormats={["image/jpeg", "image/png", "image/webp"]}
      outputFormats={["jpeg", "png", "webp"]}
    />
  )
}
