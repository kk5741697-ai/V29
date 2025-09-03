"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const vueExamples = [
  {
    name: "Vue 3 Component",
    content: `<template><div class="user-profile"><h1>{{user.name}}</h1><p>{{user.email}}</p><button @click="updateProfile"v-if="canEdit">Edit Profile</button><ul><li v-for="skill in user.skills":key="skill">{{skill}}</li></ul></div></template><script setup lang="ts">import{ref,computed,onMounted}from'vue';interface User{id:number;name:string;email:string;skills:string[];}const user=ref<User>({id:1,name:'John Doe',email:'john@example.com',skills:['Vue.js','TypeScript','Node.js']});const canEdit=computed(()=>user.value.id>0);const updateProfile=()=>{console.log('Updating profile...');};onMounted(()=>{console.log('Component mounted');});</script><style scoped>.user-profile{padding:20px;border:1px solid #ccc;border-radius:8px;}.user-profile h1{color:#2c3e50;margin-bottom:10px;}.user-profile button{background:#42b883;color:white;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;}</style>`,
  },
  {
    name: "Vue 2 Component",
    content: `<template><div class="todo-app"><h2>Todo List</h2><form @submit.prevent="addTodo"><input v-model="newTodo"placeholder="Add new todo"required><button type="submit">Add</button></form><ul><li v-for="todo in filteredTodos":key="todo.id":class="{completed:todo.completed}"><input type="checkbox"v-model="todo.completed"><span>{{todo.text}}</span><button @click="removeTodo(todo.id)">Delete</button></li></ul><div class="filters"><button @click="filter='all'":class="{active:filter==='all'}">All</button><button @click="filter='active'":class="{active:filter==='active'}">Active</button><button @click="filter='completed'":class="{active:filter==='completed'}">Completed</button></div></div></template><script>export default{name:'TodoApp',data(){return{newTodo:'',filter:'all',todos:[{id:1,text:'Learn Vue.js',completed:false},{id:2,text:'Build an app',completed:true}]};},computed:{filteredTodos(){switch(this.filter){case'active':return this.todos.filter(todo=>!todo.completed);case'completed':return this.todos.filter(todo=>todo.completed);default:return this.todos;}}},methods:{addTodo(){if(this.newTodo.trim()){this.todos.push({id:Date.now(),text:this.newTodo.trim(),completed:false});this.newTodo='';}},removeTodo(id){this.todos=this.todos.filter(todo=>todo.id!==id);}}};</script>`,
  },
]

const vueOptions = [
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
    key: "formatTemplate",
    label: "Format Template",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "formatScript",
    label: "Format Script",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "formatStyle",
    label: "Format Style",
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

function processVue(input: string, options: any = {}) {
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
      // Beautify Vue SFC
      output = beautifyVue(output, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Components": `${(input.match(/<template>/g) || []).length}`,
      "Scripts": `${(input.match(/<script/g) || []).length}`,
      "Styles": `${(input.match(/<style/g) || []).length}`,
      "Directives": `${(input.match(/v-\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Vue formatting failed",
    }
  }
}

function beautifyVue(code: string, options: any): string {
  const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
  
  // Split into sections
  const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/i)
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  
  let result = ""
  
  // Format template section
  if (templateMatch && options.formatTemplate) {
    const templateContent = templateMatch[1]
    const formattedTemplate = formatHTMLContent(templateContent, indentStr)
    result += `<template>\n${formattedTemplate}\n</template>\n\n`
  } else if (templateMatch) {
    result += templateMatch[0] + "\n\n"
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

function formatHTMLContent(html: string, indent: string): string {
  const lines = html.split('\n').map(line => line.trim()).filter(line => line)
  const result: string[] = []
  let level = 0
  
  lines.forEach(line => {
    if (line.startsWith('</')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level + 1) + line)
    
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
    
    result.push(indent.repeat(level + 1) + line)
    
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
    
    result.push(indent.repeat(level + 1) + line)
    
    if (line.includes('{')) {
      level++
    }
  })
  
  return result.join('\n')
}

function validateVue(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Vue SFC validation
  const hasTemplate = input.includes('<template>')
  const hasScript = input.includes('<script>')
  
  if (!hasTemplate && !hasScript) {
    return { isValid: false, error: "Vue component must have at least a template or script section" }
  }
  
  return { isValid: true }
}

export default function VueFormatterPage() {
  return (
    <TextToolLayout
      title="Vue.js Formatter"
      description="Format and beautify Vue.js Single File Components (SFC) with template, script, and style sections."
      icon={FileCode}
      placeholder="Paste your Vue.js component here..."
      outputPlaceholder="Formatted Vue.js will appear here..."
      processFunction={processVue}
      validateFunction={validateVue}
      options={vueOptions}
      examples={vueExamples}
      fileExtensions={[".vue"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}