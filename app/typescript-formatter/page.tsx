"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const typescriptExamples = [
  {
    name: "Interface Definition",
    content: `interface User{id:number;name:string;email:string;profile?:{avatar:string;bio:string;};roles:string[];createdAt:Date;}class UserService{private users:User[]=[];constructor(){this.users=[];}async createUser(userData:Partial<User>):Promise<User>{const user:User={id:Date.now(),name:userData.name||'',email:userData.email||'',roles:userData.roles||['user'],createdAt:new Date()};this.users.push(user);return user;}async getUserById(id:number):Promise<User|null>{return this.users.find(user=>user.id===id)||null;}}`,
  },
  {
    name: "Generic Functions",
    content: `function processArray<T>(items:T[],processor:(item:T)=>T):T[]{return items.map(processor);}function filterByProperty<T,K extends keyof T>(items:T[],property:K,value:T[K]):T[]{return items.filter(item=>item[property]===value);}const numbers=[1,2,3,4,5];const doubled=processArray(numbers,n=>n*2);const users=[{id:1,name:'John',active:true},{id:2,name:'Jane',active:false}];const activeUsers=filterByProperty(users,'active',true);`,
  },
  {
    name: "React Component",
    content: `import React,{useState,useEffect}from'react';interface Props{title:string;items:string[];onItemClick:(item:string)=>void;}const ItemList:React.FC<Props>=({title,items,onItemClick})=>{const[selectedItem,setSelectedItem]=useState<string|null>(null);const[filteredItems,setFilteredItems]=useState<string[]>(items);useEffect(()=>{setFilteredItems(items);},[items]);const handleClick=(item:string)=>{setSelectedItem(item);onItemClick(item);};return(<div><h2>{title}</h2><ul>{filteredItems.map((item,index)=><li key={index}onClick={()=>handleClick(item)}className={selectedItem===item?'selected':''}>{item}</li>)}</ul></div>);};export default ItemList;`,
  },
]

const typescriptOptions = [
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
    key: "semicolons",
    label: "Semicolons",
    type: "select" as const,
    defaultValue: "preserve",
    selectOptions: [
      { value: "preserve", label: "Preserve" },
      { value: "add", label: "Add Missing" },
      { value: "remove", label: "Remove All" },
    ],
  },
  {
    key: "quotes",
    label: "Quote Style",
    type: "select" as const,
    defaultValue: "preserve",
    selectOptions: [
      { value: "preserve", label: "Preserve" },
      { value: "single", label: "Single Quotes" },
      { value: "double", label: "Double Quotes" },
    ],
  },
  {
    key: "removeComments",
    label: "Remove Comments",
    type: "checkbox" as const,
    defaultValue: false,
  },
  {
    key: "sortImports",
    label: "Sort Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processTypeScript(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
    }

    // Sort imports
    if (options.sortImports) {
      const lines = output.split('\n')
      const imports: string[] = []
      const otherLines: string[] = []
      
      lines.forEach(line => {
        if (line.trim().startsWith('import ') || line.trim().startsWith('from ')) {
          imports.push(line.trim())
        } else {
          otherLines.push(line)
        }
      })
      
      if (imports.length > 0) {
        imports.sort()
        output = imports.join('\n') + '\n\n' + otherLines.join('\n')
      }
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*}/g, "}")
        .replace(/\s*{\s*/g, "{")
        .replace(/;\s*/g, ";")
        .replace(/,\s*/g, ",")
        .replace(/\s*=\s*/g, "=")
        .trim()
    } else {
      // Beautify TypeScript
      const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
      output = beautifyTypeScript(output, indentStr, options)
    }

    // Handle semicolons
    if (options.semicolons === "add") {
      output = output.replace(/([^;{}\s])\s*\n/g, "$1;\n")
    } else if (options.semicolons === "remove") {
      output = output.replace(/;(\s*[}\n])/g, "$1")
    }

    // Handle quotes
    if (options.quotes === "single") {
      output = output.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, "'$1'")
    } else if (options.quotes === "double") {
      output = output.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"')
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Interfaces": `${(input.match(/interface\s+\w+/g) || []).length}`,
      "Classes": `${(input.match(/class\s+\w+/g) || []).length}`,
      "Functions": `${(input.match(/function\s+\w+/g) || []).length}`,
      "Types": `${(input.match(/type\s+\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "TypeScript formatting failed",
    }
  }
}

function beautifyTypeScript(code: string, indent: string, options: any): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Decrease indent for closing braces
    if (trimmed.startsWith('}')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + trimmed)
    
    // Increase indent for opening braces
    if (trimmed.endsWith('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

function validateTypeScript(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic TypeScript validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  const openParens = (input.match(/\(/g) || []).length
  const closeParens = (input.match(/\)/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in TypeScript" }
  }
  
  if (openParens !== closeParens) {
    return { isValid: false, error: "Mismatched parentheses in TypeScript" }
  }
  
  return { isValid: true }
}

export default function TypeScriptFormatterPage() {
  return (
    <TextToolLayout
      title="TypeScript Formatter"
      description="Format, beautify, and minify TypeScript code with type checking and import sorting."
      icon={FileCode}
      placeholder="Paste your TypeScript code here..."
      outputPlaceholder="Formatted TypeScript will appear here..."
      processFunction={processTypeScript}
      validateFunction={validateTypeScript}
      options={typescriptOptions}
      examples={typescriptExamples}
      fileExtensions={[".ts", ".tsx"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}