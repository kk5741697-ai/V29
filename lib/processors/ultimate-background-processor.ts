// Ultimate Background Processor - Production-ready with crash prevention
export interface UltimateBackgroundOptions {
  primaryModel?: "auto" | "portrait" | "object" | "animal" | "product" | "general"
  secondaryModel?: "edge-detection" | "color-clustering" | "gradient-analysis"
  hybridMode?: boolean
  enableObjectDetection?: boolean
  sensitivity?: number
  edgeFeathering?: number
  detailPreservation?: number
  smoothingLevel?: number
  memoryOptimized?: boolean
  multiPass?: boolean
  chunkProcessing?: boolean
  maxDimensions?: { width: number; height: number }
  outputFormat?: "png" | "webp"
  quality?: number
  progressCallback?: (progress: number, stage: string) => void
  debugMode?: boolean
}

export interface ProcessingResult {
  processedBlob: Blob
  confidence: number
  processingTime: number
  algorithmsUsed: string[]
  qualityMetrics: {
    edgeQuality: number
    backgroundRemoval: number
    detailPreservation: number
  }
}

export class UltimateBackgroundProcessor {
  private static readonly MAX_SAFE_PIXELS = 1024 * 1024 // 1MP for stability
  private static readonly MAX_DIMENSION = 1536
  private static readonly CHUNK_SIZE = 256 * 256

  static async removeBackground(
    imageFile: File,
    options: UltimateBackgroundOptions = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      // Enhanced safety checks
      if (imageFile.size > 15 * 1024 * 1024) {
        throw new Error("File too large. Please use an image smaller than 15MB.")
      }

      if (!imageFile.type.startsWith('image/')) {
        throw new Error("Invalid file type. Please upload an image file.")
      }

      options.progressCallback?.(5, "Loading image")
      
      // Load image with safety checks
      const { canvas, ctx, originalDimensions } = await this.loadImageSafely(imageFile, options)
      
      options.progressCallback?.(15, "Analyzing image content")
      
      // Analyze image for optimal processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const analysis = this.analyzeImageContent(imageData)
      
      options.progressCallback?.(25, "Selecting optimal algorithm")
      
      // Select optimal algorithm based on content
      const selectedAlgorithm = this.selectOptimalAlgorithm(analysis, options.primaryModel)
      
      options.progressCallback?.(35, "Processing background removal")
      
      // Apply background removal
      await this.applyBackgroundRemoval(imageData, analysis, selectedAlgorithm, options)
      
      options.progressCallback?.(75, "Refining edges")
      
      // Apply post-processing
      if (options.edgeFeathering && options.edgeFeathering > 0) {
        this.applyEdgeFeathering(imageData, options.edgeFeathering)
      }
      
      if (options.smoothingLevel && options.smoothingLevel > 0) {
        this.applySmoothing(imageData, options.smoothingLevel)
      }
      
      options.progressCallback?.(90, "Creating output")
      
      ctx.putImageData(imageData, 0, 0)
      
      // Create output blob
      const processedBlob = await this.createOutputBlob(canvas, options)
      
      options.progressCallback?.(100, "Complete")
      
      // Calculate quality metrics
      const qualityMetrics = this.calculateQualityMetrics(imageData, analysis)
      
      // Cleanup
      this.cleanupMemory([canvas])
      
      return {
        processedBlob,
        confidence: analysis.confidence,
        processingTime: Date.now() - startTime,
        algorithmsUsed: [selectedAlgorithm],
        qualityMetrics
      }
    } catch (error) {
      options.progressCallback?.(0, "Error occurred")
      console.error("Background removal failed:", error)
      throw new Error(error instanceof Error ? error.message : "Background removal failed")
    }
  }

  private static async loadImageSafely(
    file: File,
    options: UltimateBackgroundOptions
  ): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; originalDimensions: { width: number; height: number } }> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const originalDimensions = { width: img.naturalWidth, height: img.naturalHeight }
          
          // Calculate safe processing dimensions
          let workingWidth = img.naturalWidth
          let workingHeight = img.naturalHeight
          
          // Apply max dimensions
          const maxDim = Math.min(options.maxDimensions?.width || this.MAX_DIMENSION, this.MAX_DIMENSION)
          if (workingWidth > maxDim || workingHeight > maxDim) {
            const scale = maxDim / Math.max(workingWidth, workingHeight)
            workingWidth = Math.floor(workingWidth * scale)
            workingHeight = Math.floor(workingHeight * scale)
          }
          
          // Check pixel count
          if (workingWidth * workingHeight > this.MAX_SAFE_PIXELS) {
            const scale = Math.sqrt(this.MAX_SAFE_PIXELS / (workingWidth * workingHeight))
            workingWidth = Math.floor(workingWidth * scale)
            workingHeight = Math.floor(workingHeight * scale)
          }
          
          // Create canvas
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d", {
            alpha: true,
            willReadFrequently: true
          })
          
          if (!ctx) {
            reject(new Error("Canvas not supported"))
            return
          }
          
          canvas.width = Math.max(1, workingWidth)
          canvas.height = Math.max(1, workingHeight)
          
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          
          resolve({ canvas, ctx, originalDimensions })
        } catch (error) {
          reject(new Error("Failed to process image"))
        }
      }
      
      img.onerror = () => reject(new Error("Failed to load image"))
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    })
  }

  private static analyzeImageContent(imageData: ImageData): {
    hasPortrait: boolean
    hasObject: boolean
    backgroundComplexity: number
    dominantColors: Array<{ r: number; g: number; b: number; frequency: number }>
    confidence: number
  } {
    const { data, width, height } = imageData
    let skinTonePixels = 0
    let totalPixels = 0
    let edgePixels = 0
    const colorFrequency = new Map<string, number>()
    
    // Sample every 4th pixel for performance
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = (y * width + x) * 4
        const r = data[idx]
        const g = data[idx + 1]
        const b = data[idx + 2]
        
        totalPixels++
        
        // Detect skin tones
        if (this.isSkinTone(r, g, b)) {
          skinTonePixels++
        }
        
        // Track color frequency
        const colorKey = `${Math.floor(r/32)}-${Math.floor(g/32)}-${Math.floor(b/32)}`
        colorFrequency.set(colorKey, (colorFrequency.get(colorKey) || 0) + 1)
        
        // Detect edges
        if (this.isEdgePixel(data, x, y, width, height)) {
          edgePixels++
        }
      }
    }
    
    // Get dominant colors
    const dominantColors = Array.from(colorFrequency.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([colorKey, frequency]) => {
        const [r, g, b] = colorKey.split('-').map(n => parseInt(n) * 32)
        return { r, g, b, frequency: frequency / totalPixels }
      })
    
    const hasPortrait = skinTonePixels / totalPixels > 0.02
    const hasObject = edgePixels / totalPixels > 0.1
    const backgroundComplexity = edgePixels / totalPixels
    
    return {
      hasPortrait,
      hasObject,
      backgroundComplexity,
      dominantColors,
      confidence: Math.min(0.9, 0.3 + (hasPortrait ? 0.3 : 0) + (hasObject ? 0.3 : 0))
    }
  }

  private static isSkinTone(r: number, g: number, b: number): boolean {
    // Enhanced skin tone detection
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    
    return (r > 95 && g > 40 && b > 20 && 
            max - min > 15 && 
            Math.abs(r - g) > 15 && 
            r > g && r > b) ||
           (r > 60 && g > 30 && b > 15 &&
            r >= g && g >= b &&
            r - b > 10)
  }

  private static isEdgePixel(
    data: Uint8ClampedArray,
    x: number,
    y: number,
    width: number,
    height: number
  ): boolean {
    if (x <= 0 || x >= width - 1 || y <= 0 || y >= height - 1) return false
    
    const centerIdx = (y * width + x) * 4
    let maxGradient = 0
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue
        
        const nIdx = ((y + dy) * width + (x + dx)) * 4
        const gradient = Math.abs(data[centerIdx] - data[nIdx]) +
                        Math.abs(data[centerIdx + 1] - data[nIdx + 1]) +
                        Math.abs(data[centerIdx + 2] - data[nIdx + 2])
        maxGradient = Math.max(maxGradient, gradient)
      }
    }
    
    return maxGradient > 30
  }

  private static selectOptimalAlgorithm(analysis: any, primaryModel?: string): string {
    if (primaryModel && primaryModel !== "auto") {
      return primaryModel
    }
    
    if (analysis.hasPortrait) {
      return "portrait"
    } else if (analysis.hasObject && analysis.backgroundComplexity < 0.3) {
      return "object"
    } else if (analysis.backgroundComplexity > 0.4) {
      return "edge-detection"
    } else {
      return "color-clustering"
    }
  }

  private static async applyBackgroundRemoval(
    imageData: ImageData,
    analysis: any,
    algorithm: string,
    options: UltimateBackgroundOptions
  ): Promise<void> {
    const { data, width, height } = imageData
    
    switch (algorithm) {
      case "portrait":
        this.portraitBackgroundRemoval(data, width, height, options)
        break
      case "object":
        this.objectBackgroundRemoval(data, width, height, options)
        break
      case "edge-detection":
        this.edgeBasedRemoval(data, width, height, options)
        break
      case "color-clustering":
        this.colorClusteringRemoval(data, width, height, options)
        break
      default:
        this.generalBackgroundRemoval(data, width, height, options)
    }
  }

  private static portraitBackgroundRemoval(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options: UltimateBackgroundOptions
  ): void {
    const sensitivity = options.sensitivity || 25
    const threshold = sensitivity * 3
    
    // Focus on skin tone preservation
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      // Check if pixel is skin tone or likely foreground
      const isSkin = this.isSkinTone(r, g, b)
      const pixelIdx = Math.floor(i / 4)
      const x = pixelIdx % width
      const y = Math.floor(pixelIdx / width)
      
      // Check distance from center (portraits usually centered)
      const centerDistance = Math.sqrt(
        Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2)
      )
      const maxDistance = Math.sqrt(Math.pow(width/2, 2) + Math.pow(height/2, 2))
      const centerWeight = 1 - (centerDistance / maxDistance)
      
      // Sample background colors from edges
      const isLikelyBackground = this.isLikelyBackgroundColor(r, g, b, data, width, height, threshold)
      
      if (isLikelyBackground && !isSkin && centerWeight < 0.6) {
        data[i + 3] = 0 // Make transparent
      }
    }
  }

  private static objectBackgroundRemoval(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options: UltimateBackgroundOptions
  ): void {
    const sensitivity = options.sensitivity || 25
    
    // Use edge detection for clean object separation
    const edges = this.detectEdges(data, width, height)
    const backgroundMask = this.createBackgroundMask(data, edges, width, height, sensitivity)
    
    // Apply mask
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = Math.floor(i / 4)
      if (backgroundMask[pixelIdx] > 128) {
        data[i + 3] = 0
      }
    }
  }

  private static edgeBasedRemoval(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options: UltimateBackgroundOptions
  ): void {
    const edges = this.detectEdges(data, width, height)
    const backgroundMask = this.createBackgroundMask(data, edges, width, height, options.sensitivity || 25)
    
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = Math.floor(i / 4)
      if (backgroundMask[pixelIdx] > 128) {
        data[i + 3] = 0
      }
    }
  }

  private static colorClusteringRemoval(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options: UltimateBackgroundOptions
  ): void {
    const clusters = this.performKMeansClustering(data, width, height, 5)
    const backgroundCluster = this.identifyBackgroundCluster(clusters, data, width, height)
    const threshold = (options.sensitivity || 25) * 3
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      const distance = Math.sqrt(
        Math.pow(r - backgroundCluster.r, 2) +
        Math.pow(g - backgroundCluster.g, 2) +
        Math.pow(b - backgroundCluster.b, 2)
      )
      
      if (distance < threshold) {
        data[i + 3] = 0
      }
    }
  }

  private static generalBackgroundRemoval(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options: UltimateBackgroundOptions
  ): void {
    // Hybrid approach combining multiple techniques
    const sensitivity = options.sensitivity || 25
    const threshold = sensitivity * 3
    
    // Sample background colors from edges
    const backgroundColors = this.sampleEdgeColors(data, width, height)
    const dominantBgColor = this.findDominantColor(backgroundColors)
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      
      const colorDistance = Math.sqrt(
        Math.pow(r - dominantBgColor[0], 2) +
        Math.pow(g - dominantBgColor[1], 2) +
        Math.pow(b - dominantBgColor[2], 2)
      )
      
      if (colorDistance < threshold) {
        data[i + 3] = 0
      }
    }
  }

  private static isLikelyBackgroundColor(
    r: number, g: number, b: number,
    data: Uint8ClampedArray,
    width: number,
    height: number,
    threshold: number
  ): boolean {
    // Sample edge colors to determine background
    const edgeColors = this.sampleEdgeColors(data, width, height)
    
    return edgeColors.some(([er, eg, eb]) => {
      const distance = Math.sqrt(
        Math.pow(r - er, 2) + Math.pow(g - eg, 2) + Math.pow(b - eb, 2)
      )
      return distance < threshold
    })
  }

  private static sampleEdgeColors(data: Uint8ClampedArray, width: number, height: number): number[][] {
    const samples: number[][] = []
    
    // Sample from all edges
    for (let x = 0; x < width; x += 10) {
      // Top and bottom edges
      for (const y of [0, height - 1]) {
        const idx = (y * width + x) * 4
        samples.push([data[idx], data[idx + 1], data[idx + 2]])
      }
    }
    
    for (let y = 0; y < height; y += 10) {
      // Left and right edges
      for (const x of [0, width - 1]) {
        const idx = (y * width + x) * 4
        samples.push([data[idx], data[idx + 1], data[idx + 2]])
      }
    }
    
    return samples
  }

  private static findDominantColor(colors: number[][]): number[] {
    const colorCounts = new Map<string, { color: number[], count: number }>()
    
    colors.forEach(color => {
      const key = `${Math.floor(color[0] / 16)}-${Math.floor(color[1] / 16)}-${Math.floor(color[2] / 16)}`
      if (colorCounts.has(key)) {
        colorCounts.get(key)!.count++
      } else {
        colorCounts.set(key, { color, count: 1 })
      }
    })
    
    let maxCount = 0
    let dominantColor = colors[0] || [255, 255, 255]
    
    colorCounts.forEach(({ color, count }) => {
      if (count > maxCount) {
        maxCount = count
        dominantColor = color
      }
    })
    
    return dominantColor
  }

  private static detectEdges(data: Uint8ClampedArray, width: number, height: number): Uint8Array {
    const edges = new Uint8Array(width * height)
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const pixelIdx = idx * 4
        
        let gx = 0, gy = 0
        
        // Sobel operator
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1]
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1]
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nIdx = ((y + dy) * width + (x + dx)) * 4
            const intensity = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3
            const kernelIdx = (dy + 1) * 3 + (dx + 1)
            
            gx += intensity * sobelX[kernelIdx]
            gy += intensity * sobelY[kernelIdx]
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy)
        edges[idx] = magnitude > 30 ? 255 : 0
      }
    }
    
    return edges
  }

  private static createBackgroundMask(
    data: Uint8ClampedArray,
    edges: Uint8Array,
    width: number,
    height: number,
    sensitivity: number
  ): Uint8Array {
    const mask = new Uint8Array(width * height)
    
    // Flood fill from edges
    const queue: Array<[number, number]> = []
    const visited = new Uint8Array(width * height)
    
    // Start from corners
    const startPoints = [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]]
    startPoints.forEach(([x, y]) => queue.push([x, y]))
    
    while (queue.length > 0) {
      const [x, y] = queue.shift()!
      const idx = y * width + x
      
      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || edges[idx] > 128) {
        continue
      }
      
      visited[idx] = 1
      mask[idx] = 255
      
      // Add neighbors
      queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }
    
    return mask
  }

  private static performKMeansClustering(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    k: number
  ): Array<{ r: number; g: number; b: number; count: number }> {
    const pixels: Array<[number, number, number]> = []
    
    // Sample pixels
    for (let y = 0; y < height; y += 3) {
      for (let x = 0; x < width; x += 3) {
        const idx = (y * width + x) * 4
        pixels.push([data[idx], data[idx + 1], data[idx + 2]])
      }
    }
    
    // Initialize centroids
    const centroids: Array<{ r: number; g: number; b: number; count: number }> = []
    for (let i = 0; i < k; i++) {
      const pixel = pixels[Math.floor(Math.random() * pixels.length)]
      centroids.push({ r: pixel[0], g: pixel[1], b: pixel[2], count: 0 })
    }
    
    // K-means iterations
    for (let iter = 0; iter < 10; iter++) {
      // Reset counts
      centroids.forEach(c => c.count = 0)
      
      // Assign pixels
      const assignments = pixels.map(pixel => {
        let minDistance = Infinity
        let assignment = 0
        
        centroids.forEach((centroid, index) => {
          const distance = Math.sqrt(
            Math.pow(pixel[0] - centroid.r, 2) +
            Math.pow(pixel[1] - centroid.g, 2) +
            Math.pow(pixel[2] - centroid.b, 2)
          )
          
          if (distance < minDistance) {
            minDistance = distance
            assignment = index
          }
        })
        
        centroids[assignment].count++
        return assignment
      })
      
      // Update centroids
      const newCentroids = centroids.map(() => ({ r: 0, g: 0, b: 0, count: 0 }))
      
      pixels.forEach((pixel, index) => {
        const cluster = assignments[index]
        newCentroids[cluster].r += pixel[0]
        newCentroids[cluster].g += pixel[1]
        newCentroids[cluster].b += pixel[2]
        newCentroids[cluster].count++
      })
      
      newCentroids.forEach((centroid, index) => {
        if (centroid.count > 0) {
          centroids[index].r = centroid.r / centroid.count
          centroids[index].g = centroid.g / centroid.count
          centroids[index].b = centroid.b / centroid.count
          centroids[index].count = centroid.count
        }
      })
    }
    
    return centroids
  }

  private static identifyBackgroundCluster(
    clusters: Array<{ r: number; g: number; b: number; count: number }>,
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): { r: number; g: number; b: number } {
    let bestScore = 0
    let backgroundCluster = clusters[0]
    
    clusters.forEach(cluster => {
      const edgePresence = this.calculateEdgePresence(cluster, data, width, height)
      const frequency = cluster.count / (width * height)
      
      const score = edgePresence * 0.7 + frequency * 0.3
      
      if (score > bestScore) {
        bestScore = score
        backgroundCluster = cluster
      }
    })
    
    return backgroundCluster
  }

  private static calculateEdgePresence(
    cluster: { r: number; g: number; b: number },
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): number {
    let matches = 0
    let total = 0
    const threshold = 40
    
    // Check edge pixels
    for (let x = 0; x < width; x += 5) {
      for (const y of [0, height - 1]) {
        const idx = (y * width + x) * 4
        const distance = Math.sqrt(
          Math.pow(data[idx] - cluster.r, 2) +
          Math.pow(data[idx + 1] - cluster.g, 2) +
          Math.pow(data[idx + 2] - cluster.b, 2)
        )
        
        if (distance < threshold) matches++
        total++
      }
    }
    
    return matches / total
  }

  private static applyEdgeFeathering(imageData: ImageData, featherAmount: number): void {
    const { data, width, height } = imageData
    const radius = Math.floor(featherAmount / 10)
    
    const alphaData = new Uint8Array(width * height)
    
    // Extract alpha channel
    for (let i = 0; i < data.length; i += 4) {
      alphaData[Math.floor(i / 4)] = data[i + 3]
    }
    
    // Apply distance transform for smooth edges
    const distanceMap = this.calculateDistanceTransform(alphaData, width, height)
    
    // Apply feathering
    for (let i = 0; i < data.length; i += 4) {
      const pixelIdx = Math.floor(i / 4)
      const distance = distanceMap[pixelIdx]
      
      if (distance < radius) {
        const alpha = Math.max(0, Math.min(255, (distance / radius) * 255))
        data[i + 3] = Math.min(data[i + 3], alpha)
      }
    }
  }

  private static calculateDistanceTransform(mask: Uint8Array, width: number, height: number): Uint8Array {
    const distance = new Uint8Array(width * height)
    
    // Initialize
    for (let i = 0; i < mask.length; i++) {
      distance[i] = mask[i] > 128 ? 0 : 255
    }
    
    // Forward pass
    for (let y = 1; y < height; y++) {
      for (let x = 1; x < width; x++) {
        const idx = y * width + x
        if (distance[idx] > 0) {
          const neighbors = [
            distance[(y-1) * width + (x-1)] + 1.4,
            distance[(y-1) * width + x] + 1,
            distance[(y-1) * width + (x+1)] + 1.4,
            distance[y * width + (x-1)] + 1
          ]
          distance[idx] = Math.min(distance[idx], ...neighbors)
        }
      }
    }
    
    // Backward pass
    for (let y = height - 2; y >= 0; y--) {
      for (let x = width - 2; x >= 0; x--) {
        const idx = y * width + x
        if (distance[idx] > 0) {
          const neighbors = [
            distance[(y+1) * width + (x+1)] + 1.4,
            distance[(y+1) * width + x] + 1,
            distance[(y+1) * width + (x-1)] + 1.4,
            distance[y * width + (x+1)] + 1
          ]
          distance[idx] = Math.min(distance[idx], ...neighbors)
        }
      }
    }
    
    return distance
  }

  private static applySmoothing(imageData: ImageData, smoothingLevel: number): void {
    const { data, width, height } = imageData
    const radius = Math.floor(smoothingLevel / 20)
    
    const smoothedAlpha = new Uint8ClampedArray(width * height)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        let alphaSum = 0
        let weightSum = 0
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx
            const ny = y + dy
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx
              const distance = Math.sqrt(dx * dx + dy * dy)
              const weight = Math.exp(-distance / radius)
              
              alphaSum += data[nIdx * 4 + 3] * weight
              weightSum += weight
            }
          }
        }
        
        smoothedAlpha[idx] = Math.round(alphaSum / weightSum)
      }
    }
    
    // Apply smoothed alpha
    for (let i = 0; i < width * height; i++) {
      data[i * 4 + 3] = smoothedAlpha[i]
    }
  }

  private static async createOutputBlob(
    canvas: HTMLCanvasElement,
    options: UltimateBackgroundOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const quality = (options.quality || 95) / 100
      const mimeType = `image/${options.outputFormat || "png"}`
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error("Failed to create output blob"))
          }
        },
        mimeType,
        quality
      )
    })
  }

  private static calculateQualityMetrics(imageData: ImageData, analysis: any): {
    edgeQuality: number
    backgroundRemoval: number
    detailPreservation: number
  } {
    const { data, width, height } = imageData
    
    let transparentPixels = 0
    let edgePixels = 0
    let totalPixels = 0
    
    for (let i = 0; i < data.length; i += 4) {
      totalPixels++
      
      if (data[i + 3] === 0) {
        transparentPixels++
      }
      
      const pixelIdx = Math.floor(i / 4)
      const x = pixelIdx % width
      const y = Math.floor(pixelIdx / width)
      
      if (this.isEdgePixel(data, x, y, width, height)) {
        edgePixels++
      }
    }
    
    return {
      edgeQuality: Math.min(100, (edgePixels / totalPixels) * 500),
      backgroundRemoval: Math.min(100, (transparentPixels / totalPixels) * 200),
      detailPreservation: Math.max(0, 100 - (transparentPixels / totalPixels) * 100)
    }
  }

  private static cleanupMemory(canvases: HTMLCanvasElement[]): void {
    canvases.forEach(canvas => {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      canvas.width = 1
      canvas.height = 1
    })
    
    // Force garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      setTimeout(() => {
        (window as any).gc()
      }, 100)
    }
  }
}