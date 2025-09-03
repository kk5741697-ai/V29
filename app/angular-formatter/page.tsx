"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const angularExamples = [
  {
    name: "Angular Component",
    content: `import{Component,OnInit,Input,Output,EventEmitter}from'@angular/core';import{FormBuilder,FormGroup,Validators}from'@angular/forms';@Component({selector:'app-user-form',template:\`<form [formGroup]="userForm"(ngSubmit)="onSubmit()"><div class="form-group"><label for="name">Name:</label><input id="name"formControlName="name"type="text"class="form-control"><div *ngIf="userForm.get('name')?.invalid && userForm.get('name')?.touched"class="error">Name is required</div></div><div class="form-group"><label for="email">Email:</label><input id="email"formControlName="email"type="email"class="form-control"><div *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched"class="error">Valid email is required</div></div><button type="submit"[disabled]="userForm.invalid||isSubmitting">{{isSubmitting?'Saving...':'Save User'}}</button></form>\`,styleUrls:['./user-form.component.css']})export class UserFormComponent implements OnInit{@Input()initialData:any;@Output()userSaved=new EventEmitter<any>();userForm:FormGroup;isSubmitting=false;constructor(private fb:FormBuilder){}ngOnInit(){this.userForm=this.fb.group({name:[this.initialData?.name||'',Validators.required],email:[this.initialData?.email||'',[Validators.required,Validators.email]]});}async onSubmit(){if(this.userForm.valid){this.isSubmitting=true;try{const userData=this.userForm.value;await this.saveUser(userData);this.userSaved.emit(userData);this.userForm.reset();}catch(error){console.error('Save failed:',error);}finally{this.isSubmitting=false;}}}private async saveUser(userData:any):Promise<void>{return new Promise((resolve)=>setTimeout(resolve,1000));}}`,
  },
  {
    name: "Angular Service",
    content: `import{Injectable}from'@angular/core';import{HttpClient,HttpHeaders}from'@angular/common/http';import{Observable,BehaviorSubject,throwError}from'rxjs';import{catchError,map,tap}from'rxjs/operators';interface User{id:number;name:string;email:string;createdAt:Date;}@Injectable({providedIn:'root'})export class UserService{private apiUrl='https://api.example.com/users';private usersSubject=new BehaviorSubject<User[]>([]);public users$=this.usersSubject.asObservable();constructor(private http:HttpClient){}getUsers():Observable<User[]>{return this.http.get<User[]>(this.apiUrl).pipe(tap(users=>this.usersSubject.next(users)),catchError(this.handleError));}getUserById(id:number):Observable<User>{return this.http.get<User>(\`\${this.apiUrl}/\${id}\`).pipe(catchError(this.handleError));}createUser(userData:Partial<User>):Observable<User>{const headers=new HttpHeaders({'Content-Type':'application/json'});return this.http.post<User>(this.apiUrl,userData,{headers}).pipe(tap(user=>{const currentUsers=this.usersSubject.value;this.usersSubject.next([...currentUsers,user]);}),catchError(this.handleError));}updateUser(id:number,userData:Partial<User>):Observable<User>{const headers=new HttpHeaders({'Content-Type':'application/json'});return this.http.put<User>(\`\${this.apiUrl}/\${id}\`,userData,{headers}).pipe(tap(updatedUser=>{const currentUsers=this.usersSubject.value;const index=currentUsers.findIndex(user=>user.id===id);if(index!==-1){currentUsers[index]=updatedUser;this.usersSubject.next([...currentUsers]);}}),catchError(this.handleError));}deleteUser(id:number):Observable<void>{return this.http.delete<void>(\`\${this.apiUrl}/\${id}\`).pipe(tap(()=>{const currentUsers=this.usersSubject.value;this.usersSubject.next(currentUsers.filter(user=>user.id!==id));}),catchError(this.handleError));}private handleError(error:any):Observable<never>{console.error('API Error:',error);return throwError(()=>new Error('Something went wrong. Please try again.'));}}`,
  },
]

const angularOptions = [
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
    key: "sortImports",
    label: "Sort Imports",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "formatDecorators",
    label: "Format Decorators",
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

function processAngular(input: string, options: any = {}) {
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
      // Beautify Angular
      const indentStr = typeof options.indent === "number" ? " ".repeat(options.indent) : "\t"
      output = beautifyAngular(output, indentStr, options)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Components": `${(input.match(/@Component/g) || []).length}`,
      "Services": `${(input.match(/@Injectable/g) || []).length}`,
      "Decorators": `${(input.match(/@\w+/g) || []).length}`,
      "Directives": `${(input.match(/\*ng\w+/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Angular formatting failed",
    }
  }
}

function beautifyAngular(code: string, indent: string, options: any): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  let inTemplate = false
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Detect template strings
    if (trimmed.includes('template:') && trimmed.includes('`')) {
      inTemplate = true
    }
    
    if (inTemplate && trimmed.includes('`') && !trimmed.startsWith('template:')) {
      inTemplate = false
    }
    
    // Handle decorators
    if (options.formatDecorators && trimmed.startsWith('@')) {
      result.push(indent.repeat(level) + trimmed)
      return
    }
    
    // Decrease indent for closing braces
    if (trimmed.startsWith('}') || trimmed.startsWith('</')) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + trimmed)
    
    // Increase indent for opening braces
    if (trimmed.endsWith('{') || (inTemplate && trimmed.startsWith('<') && !trimmed.startsWith('</'))) {
      level++
    }
  })
  
  return result.join('\n')
}

function validateAngular(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Angular validation
  const openBraces = (input.match(/{/g) || []).length
  const closeBraces = (input.match(/}/g) || []).length
  
  if (openBraces !== closeBraces) {
    return { isValid: false, error: "Mismatched braces in Angular code" }
  }
  
  return { isValid: true }
}

export default function AngularFormatterPage() {
  return (
    <TextToolLayout
      title="Angular Formatter"
      description="Format and beautify Angular TypeScript code with component templates and decorators."
      icon={FileCode}
      placeholder="Paste your Angular code here..."
      outputPlaceholder="Formatted Angular will appear here..."
      processFunction={processAngular}
      validateFunction={validateAngular}
      options={angularOptions}
      examples={angularExamples}
      fileExtensions={[".ts", ".component.ts"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}