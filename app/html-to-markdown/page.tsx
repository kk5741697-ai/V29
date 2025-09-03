"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileText } from "lucide-react"

const htmlToMarkdownExamples = [
  {
    name: "Basic HTML",
    content: `<h1>Main Title</h1>
<h2>Subtitle</h2>
<p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>
<a href="https://example.com">Visit Example</a>`,
  },
  {
    name: "Article Content",
    content: `<article>
  <h1>How to Learn Programming</h1>
  <p>Programming is a valuable skill in today's digital world. Here are some tips:</p>
  <ol>
    <li>Start with the basics</li>
    <li>Practice regularly</li>
    <li>Build projects</li>
  </ol>
  <blockquote>
    <p>"The best way to learn programming is by doing it." - Anonymous</p>
  </blockquote>
  <p>For more information, visit <a href="https://codecademy.com">Codecademy</a>.</p>
</article>`,
  },
]

const htmlToMarkdownOptions = [
  {
    key: "preserveLinks",
    label: "Preserve Links",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "preserveImages",
    label: "Preserve Images",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "convertTables",
    label: "Convert Tables",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeAttributes",
    label: "Remove HTML Attributes",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processHtmlToMarkdown(input: string, options: any = {}) {
  try {
    if (!input.trim()) {
      return { output: "", error: "Input cannot be empty" }
    }

    let html = input
    let markdown = ""

    // Remove HTML attributes if requested
    if (options.removeAttributes) {
      html = html.replace(/<(\w+)[^>]*>/g, '<$1>')
    }

    // Convert headers
    markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')

    // Convert text formatting
    markdown = markdown
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')

    // Convert links
    if (options.preserveLinks) {
      markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    } else {
      markdown = markdown.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
    }

    // Convert images
    if (options.preserveImages) {
      markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
      markdown = markdown.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    } else {
      markdown = markdown.replace(/<img[^>]*>/gi, '[Image]')
    }

    // Convert lists
    markdown = markdown
      .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n') + '\n'
      })
      .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
        let counter = 1
        return content.replace(/<li[^>]*>(.*?)<\/li>/gi, () => `${counter++}. $1\n`) + '\n'
      })

    // Convert blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (match, content) => {
      return content.replace(/^/gm, '> ') + '\n\n'
    })

    // Convert paragraphs
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')

    // Convert line breaks
    markdown = markdown.replace(/<br[^>]*>/gi, '\n')

    // Convert horizontal rules
    markdown = markdown.replace(/<hr[^>]*>/gi, '\n---\n\n')

    // Convert tables if requested
    if (options.convertTables) {
      markdown = convertTablesToMarkdown(markdown)
    }

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '')

    // Clean up extra whitespace
    markdown = markdown
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim()

    const stats = {
      "Input Size": `${input.length} chars`,
      "Output Size": `${markdown.length} chars`,
      "HTML Tags Removed": (input.match(/<[^>]+>/g) || []).length,
      "Markdown Elements": countMarkdownElements(markdown),
    }

    return { output: markdown, stats }
  } catch (error) {
    return {
      output: "",
      error: "HTML to Markdown conversion failed",
    }
  }
}

function convertTablesToMarkdown(html: string): string {
  return html.replace(/<table[^>]*>(.*?)<\/table>/gis, (match, tableContent) => {
    let markdown = ""
    
    // Extract headers
    const headerMatch = tableContent.match(/<thead[^>]*>(.*?)<\/thead>/is)
    if (headerMatch) {
      const headers = headerMatch[1].match(/<th[^>]*>(.*?)<\/th>/gi) || []
      const headerRow = headers.map((h: string) => h.replace(/<[^>]*>/g, '').trim()).join(' | ')
      const separator = headers.map(() => '---').join(' | ')
      markdown += `| ${headerRow} |\n| ${separator} |\n`
    }
    
    // Extract body rows
    const bodyMatch = tableContent.match(/<tbody[^>]*>(.*?)<\/tbody>/is) || [null, tableContent]
    if (bodyMatch[1]) {
      const rows = bodyMatch[1].match(/<tr[^>]*>(.*?)<\/tr>/gi) || []
      rows.forEach((row: string) => {
        const cells = row.match(/<td[^>]*>(.*?)<\/td>/gi) || []
        const cellData = cells.map((c: string) => c.replace(/<[^>]*>/g, '').trim()).join(' | ')
        if (cellData) {
          markdown += `| ${cellData} |\n`
        }
      })
    }
    
    return markdown + '\n'
  })
}

function countMarkdownElements(markdown: string): number {
  const elements = [
    /^#{1,6}\s/gm, // Headers
    /\*\*.*?\*\*/g, // Bold
    /\*.*?\*/g, // Italic
    /`.*?`/g, // Code
    /\[.*?\]\(.*?\)/g, // Links
    /!\[.*?\]\(.*?\)/g, // Images
    /^>\s/gm, // Blockquotes
    /^[-*+]\s/gm, // Unordered lists
    /^\d+\.\s/gm, // Ordered lists
  ]
  
  return elements.reduce((count, regex) => count + (markdown.match(regex) || []).length, 0)
}

export default function HtmlToMarkdownPage() {
  return (
    <TextToolLayout
      title="HTML to Markdown Converter"
      description="Convert HTML markup to clean Markdown format with support for tables, links, and formatting."
      icon={FileText}
      placeholder="Paste your HTML here..."
      outputPlaceholder="Markdown will appear here..."
      processFunction={processHtmlToMarkdown}
      options={htmlToMarkdownOptions}
      examples={htmlToMarkdownExamples}
      fileExtensions={[".md", ".markdown"]}
    />
  )
}