"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const svelteExamples = [
  {
    name: "Svelte Component",
    content: `<script>import{onMount,createEventDispatcher}from'svelte';export let title='Default Title';export let items=[];let selectedItem=null;let searchTerm='';const dispatch=createEventDispatcher();$:filteredItems=items.filter(item=>item.toLowerCase().includes(searchTerm.toLowerCase()));function selectItem(item){selectedItem=item;dispatch('itemSelected',{item});}onMount(()=>{console.log('Component mounted');});</script><main><h1>{title}</h1><input bind:value={searchTerm}placeholder="Search items..."/>{#if filteredItems.length>0}<ul>{#each filteredItems as item,index}<li class:selected={selectedItem===item}on:click={()=>selectItem(item)}>{item}</li>{/each}</ul>{:else}<p>No items found</p>{/if}<button on:click={()=>selectedItem=null}disabled={!selectedItem}>Clear Selection</button></main><style>main{padding:20px;font-family:Arial,sans-serif;}h1{color:#ff3e00;margin-bottom:20px;}input{width:100%;padding:8px;margin-bottom:16px;border:1px solid #ccc;border-radius:4px;}ul{list-style:none;padding:0;}li{padding:8px;cursor:pointer;border-radius:4px;}li:hover{background-color:#f0f0f0;}li.selected{background-color:#ff3e00;color:white;}button{background:#ff3e00;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;}button:disabled{opacity:0.5;cursor:not-allowed;}</style>`,
  },
  {
    name: "Svelte Store",
    content: `<script>import{writable,derived,readable}from'svelte/store';import{onMount}from'svelte';const count=writable(0);const doubled=derived(count,$count=>$count*2);const time=readable(new Date(),function start(set){const interval=setInterval(()=>{set(new Date());},1000);return function stop(){clearInterval(interval);};});let countValue;let doubledValue;let timeValue;count.subscribe(value=>{countValue=value;});doubled.subscribe(value=>{doubledValue=value;});time.subscribe(value=>{timeValue=value;});function increment(){count.update(n=>n+1);}function decrement(){count.update(n=>Math.max(0,n-1));}function reset(){count.set(0);}onMount(()=>{console.log('Store component mounted');});</script><div class="counter"><h2>Svelte Store Example</h2><p>Count: {countValue}</p><p>Doubled: {doubledValue}</p><p>Time: {timeValue?.toLocaleTimeString()}</p><div class="buttons"><button on:click={increment}>+</button><button on:click={decrement}>-</button><button on:click={reset}>Reset</button></div></div><style>.counter{max-width:400px;margin:0 auto;padding:20px;text-align:center;}.buttons{display:flex;gap:10px;justify-content:center;margin-top:20px;}.buttons button{padding:8px 16px;border:none;border-radius:4px;background:#ff3e00;color:white;cursor:pointer;}.buttons button:hover{background:#e63900;}</style>`,
  },
]

const svelteOptions = [
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
    key: "formatScript",
    label: "Format Script Section",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "formatTemplate",
    label: "Format Template Section",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "formatStyle",
    label: "Format Style Section",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
]

function processSvelte(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/<!--[\s\S]*?-->/g, "")
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    if (options.format === "minify") {
      output = output
        .replace(/>\s+</g, "><")
        .replace(/\s+/g, " ")
        .trim()
    } else {
      // Beautify Svelte
      output = beautifySvelte(output, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Script Blocks": `${(input.match(/<script[^>]*>/g) || []).length}`,
      "Style Blocks": `${(input.match(/<style[^>]*>/g) || []).length}`,
      "Svelte Directives": `${(input.match(/\w+:/g) || []).length}`,
      "Reactive Statements": `${(input.match(/\$:/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Svelte formatting failed",
    }
  }
}

function beautifySvelte(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  
  // Split into sections
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  
  let result = ""
  let templateContent = code
  
  // Remove script and style from template
  if (scriptMatch) {
    templateContent = templateContent.replace(scriptMatch[0], "")
  }
  if (styleMatch) {
    templateContent = templateContent.replace(styleMatch[0], "")
  }
  
  // Format script section
  if (scriptMatch && options.formatScript) {
    const scriptContent = scriptMatch[1]
    const formattedScript = formatJavaScriptContent(scriptContent, indentStr)
    const scriptTag = scriptMatch[0].match(/<script[^>]*>/i)?.[0] || "<script>"
    result += `${scriptTag}\n${formattedScript}\n</script>\n\n`
  } else if (scriptMatch) {
    result += scriptMatch[0] + "\n\n"
  }
  
  // Format template section
  if (options.formatTemplate) {
    const formattedTemplate = formatSvelteTemplate(templateContent.trim(), indentStr)
    if (formattedTemplate) {
      result += formattedTemplate + "\n\n"
    }
  } else if (templateContent.trim()) {
    result += templateContent.trim() + "\n\n"
  }
  
  // Format style section
  if (styleMatch && options.formatStyle) {
    const styleContent = styleMatch[1]
    const formattedStyle = formatCSSContent(styleContent, indentStr)
    const styleTag = styleMatch[0].match(/<style[^>]*>/i)?.[0] || "<style>"
    result += `${styleTag}\n${formattedStyle}\n</style>`
  } else if (styleMatch) {
    result += styleMatch[0]
  }
  
  return result.trim()
}

function formatSvelteTemplate(html: string, indent: string): string {
  if (!html) return ""
  
  const lines = html.split('\n').map(line => line.trim()).filter(line => line)
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    // Handle Svelte blocks
    if (line.startsWith('{#') || line.startsWith('{:else}') || line.startsWith('{:then}') || line.startsWith('{:catch}')) {
      result.push(indent.repeat(level) + line)
      if (!line.includes('{/')) {
        level++
      }
      return
    }
    
    if (line.startsWith('{/')) {
      level = Math.max(0, level - 1)
      result.push(indent.repeat(level) + line)
      return
    }
    
    if (line.startsWith('{:else')) {
      result.push(indent.repeat(level - 1) + line)
      return
    }
    
    // Handle HTML tags
    if (line.startsWith('</')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + line)
    
    if (line.startsWith('<') && !line.startsWith('</') && !line.endsWith('/>')) {
      level++
    }
  })
  
  return result.join('\n')
}

function formatJavaScriptContent(js: string, indent: string): string {
  const lines = js.split('\n').map(line => line.trim()).filter(line => line)
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    if (line.includes('}')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + line)
    
    if (line.includes('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

function formatCSSContent(css: string, indent: string): string {
  const lines = css.split('\n').map(line => line.trim()).filter(line => line)
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    if (line.includes('}')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + line)
    
    if (line.includes('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

function validateSvelte(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Svelte validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Svelte code" }
  }
  
  return { isValid: true }
}

export default function SvelteFormatterPage() {
  return (
    <TextToolLayout
      title="Svelte Formatter"
      description="Format and beautify Svelte components with script, template, and style sections."
      icon={FileCode}
      placeholder="Paste your Svelte code here..."
      outputPlaceholder="Formatted Svelte will appear here..."
      processFunction={processSvelte}
      validateFunction={validateSvelte}
      options={svelteOptions}
      examples={svelteExamples}
      fileExtensions={[".svelte"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}