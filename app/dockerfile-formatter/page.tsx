"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const dockerfileExamples = [
  {
    name: "Node.js Dockerfile",
    content: `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production&&npm cache clean --force
COPY . .
RUN npm run build
FROM node:18-alpine AS runtime
RUN addgroup -g 1001 -S nodejs&&adduser -S nextjs -u 1001
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD curl -f http://localhost:3000/health || exit 1
CMD ["npm","start"]`,
  },
  {
    name: "Multi-stage Python",
    content: `FROM python:3.11-slim AS base
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PIP_NO_CACHE_DIR=1 PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /app
FROM base AS dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
FROM base AS development
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin
COPY . .
RUN useradd --create-home --shell /bin/bash app&&chown -R app:app /app
USER app
EXPOSE 8000
CMD ["python","manage.py","runserver","0.0.0.0:8000"]
FROM base AS production
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=dependencies /usr/local/bin /usr/local/bin
COPY . .
RUN useradd --create-home --shell /bin/bash app&&chown -R app:app /app&&python manage.py collectstatic --noinput
USER app
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:8000/health/ || exit 1
CMD ["gunicorn","--bind","0.0.0.0:8000","myproject.wsgi:application"]`,
  },
]

const dockerfileOptions = [
  {
    key: "format",
    label: "Format",
    type: "select" as const,
    defaultValue: "beautify",
    selectOptions: [
      { value: "beautify", label: "Beautify" },
      { value: "minify", label: "Minify" },
    ],
  },
  {
    key: "indent",
    label: "Indentation",
    type: "select" as const,
    defaultValue: 2,
    selectOptions: [
      { value: 2, label: "2 Spaces" },
      { value: 4, label: "4 Spaces" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "groupInstructions",
    label: "Group Related Instructions",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "sortArgs",
    label: "Sort ARG Instructions",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processDockerfile(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/#.*$/gm, "")
    }

    if (options.format === "minify") {
      output = output
        .replace(/\\\s*\n\s*/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim()
    } else {
      // Beautify Dockerfile
      output = beautifyDockerfile(output, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Instructions": `${(input.match(/^[A-Z]+\s/gm) || []).length}`,
      "Stages": `${(input.match(/^FROM\s/gm) || []).length}`,
      "Layers": `${(input.match(/^(RUN|COPY|ADD)\s/gm) || []).length}`,
      "Exposed Ports": `${(input.match(/^EXPOSE\s/gm) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Dockerfile formatting failed",
    }
  }
}

function beautifyDockerfile(code: string, options: any): string {
  const lines = code.split('\n')
  const result: string[] = []
  const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 2)
  
  let currentStage = ""
  let lastInstruction = ""
  
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    
    if (trimmed === '' || trimmed.startsWith('#')) {
      result.push(line)
      return
    }
    
    const instruction = trimmed.split(' ')[0].toUpperCase()
    
    // Add spacing between stages
    if (instruction === 'FROM' && index > 0) {
      result.push('')
      currentStage = trimmed
    }
    
    // Group related instructions
    if (options.groupInstructions) {
      const shouldAddSpace = shouldAddSpaceBetween(lastInstruction, instruction)
      if (shouldAddSpace && result.length > 0 && result[result.length - 1] !== '') {
        result.push('')
      }
    }
    
    // Handle line continuations
    if (trimmed.endsWith('\\')) {
      result.push(trimmed)
      // Next lines should be indented
      let nextIndex = index + 1
      while (nextIndex < lines.length) {
        const nextLine = lines[nextIndex].trim()
        if (nextLine === '') {
          nextIndex++
          continue
        }
        
        if (nextLine.endsWith('\\')) {
          result.push(indentStr + nextLine)
        } else {
          result.push(indentStr + nextLine)
          break
        }
        nextIndex++
      }
    } else if (!lines[index - 1]?.trim().endsWith('\\')) {
      result.push(trimmed)
    }
    
    lastInstruction = instruction
  })
  
  return result.join('\n')
}

function shouldAddSpaceBetween(lastInstruction: string, currentInstruction: string): boolean {
  const groups = {
    setup: ['FROM', 'ARG'],
    environment: ['ENV', 'WORKDIR'],
    dependencies: ['COPY', 'ADD', 'RUN'],
    configuration: ['EXPOSE', 'VOLUME', 'USER'],
    execution: ['CMD', 'ENTRYPOINT', 'HEALTHCHECK']
  }
  
  const getGroup = (instruction: string) => {
    for (const [group, instructions] of Object.entries(groups)) {
      if (instructions.includes(instruction)) {
        return group
      }
    }
    return 'other'
  }
  
  const lastGroup = getGroup(lastInstruction)
  const currentGroup = getGroup(currentInstruction)
  
  return lastGroup !== currentGroup && lastInstruction !== ''
}

function validateDockerfile(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Dockerfile validation
  if (!input.toUpperCase().includes('FROM ')) {
    return { isValid: false, error: "Dockerfile must contain at least one FROM instruction" }
  }
  
  // Check for common issues
  const lines = input.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  
  if (lines.length > 0 && !lines[0].toUpperCase().startsWith('FROM')) {
    return { isValid: false, error: "Dockerfile must start with FROM instruction" }
  }
  
  return { isValid: true }
}

export default function DockerfileFormatterPage() {
  return (
    <TextToolLayout
      title="Dockerfile Formatter"
      description="Format and optimize Dockerfiles with instruction grouping and best practices."
      icon={FileCode}
      placeholder="Paste your Dockerfile here..."
      outputPlaceholder="Formatted Dockerfile will appear here..."
      processFunction={processDockerfile}
      validateFunction={validateDockerfile}
      options={dockerfileOptions}
      examples={dockerfileExamples}
      fileExtensions={[".dockerfile", "Dockerfile"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}