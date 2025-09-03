"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const reactExamples = [
  {
    name: "Functional Component",
    content: `import React,{useState,useEffect,useCallback}from'react';import{Button}from'./Button';interface Props{title:string;items:string[];onItemSelect:(item:string)=>void;}const ItemSelector:React.FC<Props>=({title,items,onItemSelect})=>{const[selectedItem,setSelectedItem]=useState<string|null>(null);const[searchTerm,setSearchTerm]=useState('');const filteredItems=items.filter(item=>item.toLowerCase().includes(searchTerm.toLowerCase()));const handleSelect=useCallback((item:string)=>{setSelectedItem(item);onItemSelect(item);},[onItemSelect]);useEffect(()=>{if(filteredItems.length===1){handleSelect(filteredItems[0]);}},[filteredItems,handleSelect]);return(<div className="item-selector"><h2>{title}</h2><input type="text"value={searchTerm}onChange={(e)=>setSearchTerm(e.target.value)}placeholder="Search items..."/><ul>{filteredItems.map((item,index)=>(<li key={index}className={selectedItem===item?'selected':''}onClick={()=>handleSelect(item)}>{item}</li>))}</ul><Button onClick={()=>setSelectedItem(null)}disabled={!selectedItem}>Clear Selection</Button></div>);};export default ItemSelector;`,
  },
  {
    name: "Class Component",
    content: `import React,{Component}from'react';interface State{count:number;isLoading:boolean;error:string|null;}interface Props{initialCount?:number;onCountChange?(count:number):void;}class Counter extends Component<Props,State>{constructor(props:Props){super(props);this.state={count:props.initialCount||0,isLoading:false,error:null};}componentDidMount(){console.log('Counter mounted');}componentDidUpdate(prevProps:Props,prevState:State){if(prevState.count!==this.state.count){this.props.onCountChange?.(this.state.count);}}increment=async()=>{this.setState({isLoading:true});try{await new Promise(resolve=>setTimeout(resolve,500));this.setState(prevState=>({count:prevState.count+1,isLoading:false}));}catch(error){this.setState({error:'Failed to increment',isLoading:false});}};decrement=()=>{this.setState(prevState=>({count:Math.max(0,prevState.count-1)}));};render(){const{count,isLoading,error}=this.state;return(<div className="counter"><h2>Count: {count}</h2>{error&&<p className="error">{error}</p>}<button onClick={this.increment}disabled={isLoading}>+</button><button onClick={this.decrement}disabled={isLoading||count===0}>-</button>{isLoading&&<span>Loading...</span>}</div>);}}export default Counter;`,
  },
  {
    name: "Hooks Example",
    content: `import React,{useState,useEffect,useReducer,useContext,useMemo,useCallback}from'react';import{UserContext}from'./UserContext';interface Todo{id:number;text:string;completed:boolean;}type TodoAction={type:'ADD_TODO';text:string;}|{type:'TOGGLE_TODO';id:number;}|{type:'DELETE_TODO';id:number;};const todoReducer=(state:Todo[],action:TodoAction):Todo[]=>{switch(action.type){case'ADD_TODO':return[...state,{id:Date.now(),text:action.text,completed:false}];case'TOGGLE_TODO':return state.map(todo=>todo.id===action.id?{...todo,completed:!todo.completed}:todo);case'DELETE_TODO':return state.filter(todo=>todo.id!==action.id);default:return state;}};const TodoApp:React.FC=()=>{const[todos,dispatch]=useReducer(todoReducer,[]);const[newTodo,setNewTodo]=useState('');const user=useContext(UserContext);const completedCount=useMemo(()=>todos.filter(todo=>todo.completed).length,[todos]);const addTodo=useCallback(()=>{if(newTodo.trim()){dispatch({type:'ADD_TODO',text:newTodo.trim()});setNewTodo('');}},[newTodo]);useEffect(()=>{const savedTodos=localStorage.getItem('todos');if(savedTodos){try{const parsed=JSON.parse(savedTodos);parsed.forEach((todo:Todo)=>dispatch({type:'ADD_TODO',text:todo.text}));}catch(error){console.error('Failed to load todos:',error);}}},[]);useEffect(()=>{localStorage.setItem('todos',JSON.stringify(todos));},[todos]);return(<div><h1>Welcome, {user?.name||'Guest'}</h1><p>Completed: {completedCount}/{todos.length}</p><div><input value={newTodo}onChange={(e)=>setNewTodo(e.target.value)}onKeyPress={(e)=>e.key==='Enter'&&addTodo()}placeholder="Add new todo"/><button onClick={addTodo}>Add</button></div><ul>{todos.map(todo=>(<li key={todo.id}><input type="checkbox"checked={todo.completed}onChange={()=>dispatch({type:'TOGGLE_TODO',id:todo.id})}/><span style={{textDecoration:todo.completed?'line-through':'none'}}>{todo.text}</span><button onClick={()=>dispatch({type:'DELETE_TODO',id:todo.id})}>Delete</button></li>))}</ul></div>);};export default TodoApp;`,
  },
]

const reactOptions = [
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
    key: "jsxBrackets",
    label: "JSX Bracket Style",
    type: "select" as const,
    defaultValue: "same-line",
    selectOptions: [
      { value: "same-line", label: "Same Line" },
      { value: "new-line", label: "New Line" },
    ],
  },
  {
    key: "sortImports",
    label: "Sort Imports",
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

function processReact(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/\/\/.*$/gm, "")
      output = output.replace(/\/\*[\s\S]*?\*\//g, "")
      output = output.replace(/{\/\*[\s\S]*?\*\/}/g, "")
    }

    // Sort imports
    if (options.sortImports) {
      const lines = output.split('\n')
      const imports: string[] = []
      const otherLines: string[] = []
      
      lines.forEach(line => {
        if (line.trim().startsWith('import ')) {
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
        .replace(/>\s+</g, "><")
        .trim()
    } else {
      // Beautify React/JSX
      const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
      output = beautifyReact(output, indentStr, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Components": `${(input.match(/(?:function|const|class)\s+[A-Z]\w*/g) || []).length}`,
      "Hooks": `${(input.match(/use[A-Z]\w*/g) || []).length}`,
      "JSX Elements": `${(input.match(/<[A-Z]\w*/g) || []).length}`,
      "Props": `${(input.match(/\w+=/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "React formatting failed",
    }
  }
}

function beautifyReact(code: string, indent: string, options: any): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  let inJSX = false
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Detect JSX
    if (trimmed.includes('return (') || trimmed.includes('return(')) {
      inJSX = true
    }
    
    // Handle closing braces/tags
    if (trimmed.startsWith('}') || trimmed.startsWith('</')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + trimmed)
    
    // Handle opening braces/tags
    if (trimmed.endsWith('{') || (inJSX && trimmed.startsWith('<') && !trimmed.startsWith('</'))) {
      level++
    }
    
    // JSX bracket handling
    if (inJSX && options.jsxBrackets === "new-line" && trimmed.endsWith('>') && !trimmed.startsWith('<')) {
      // Move closing bracket to new line
      const lastLine = result[result.length - 1]
      if (lastLine.endsWith('>')) {
        result[result.length - 1] = lastLine.substring(0, lastLine.length - 1)
        result.push(indent.repeat(level - 1) + '>')
      }
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

function validateReact(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic React/JSX validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  const openTags = (input.match(/<[^\/][^>]*>/g) || []).length
  const closeTags = (input.match(/<\/[^>]*>/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in React code" }
  }
  
  // Allow self-closing tags
  const selfClosingTags = (input.match(/<[^>]*\/>/g) || []).length
  if (openTags - selfClosingTags !== closeTags) {
    return { isValid: false, error: "Mismatched JSX tags" }
  }
  
  return { isValid: true }
}

export default function ReactFormatterPage() {
  return (
    <TextToolLayout
      title="React Formatter"
      description="Format and beautify React/JSX code with TypeScript support and component optimization."
      icon={FileCode}
      placeholder="Paste your React code here..."
      outputPlaceholder="Formatted React will appear here..."
      processFunction={processReact}
      validateFunction={validateReact}
      options={reactOptions}
      examples={reactExamples}
      fileExtensions={[".jsx", ".tsx"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}