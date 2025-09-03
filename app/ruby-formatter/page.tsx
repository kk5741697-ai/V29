"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { FileCode } from "lucide-react"

const rubyExamples = [
  {
    name: "Ruby Class and Module",
    content: `require 'json';require 'net/http';require 'uri';module UserValidation;def self.valid_email?(email);email.to_s.match?(/\A[\w+\-.]+@[a-z\d\-]+(\.[a-z\d\-]+)*\.[a-z]+\z/i);end;def self.valid_name?(name);name.to_s.strip.length>=2;end;end;class User;attr_accessor :id,:name,:email,:created_at,:roles;def initialize(name:,email:);@id=SecureRandom.uuid;@name=name.strip;@email=email.downcase.strip;@created_at=Time.now;@roles=['user'];validate!;end;def valid?;UserValidation.valid_name?(@name)&&UserValidation.valid_email?(@email);end;def add_role(role);@roles<<role.to_s.downcase unless @roles.include?(role.to_s.downcase);end;def has_role?(role);@roles.include?(role.to_s.downcase);end;def to_json(*args);{id:@id,name:@name,email:@email,created_at:@created_at.iso8601,roles:@roles}.to_json(*args);end;def self.from_json(json_str);data=JSON.parse(json_str);user=new(name:data['name'],email:data['email']);user.id=data['id'];user.created_at=Time.parse(data['created_at']);user.roles=data['roles']||['user'];user;end;private;def validate!;raise ArgumentError,'Invalid name'unless valid_name?;raise ArgumentError,'Invalid email'unless valid_email?;end;def valid_name?;UserValidation.valid_name?(@name);end;def valid_email?;UserValidation.valid_email?(@email);end;end;class UserRepository;def initialize;@users={};end;def save(user);@users[user.id]=user;user;end;def find_by_id(id);@users[id];end;def find_all;@users.values;end;def find_by_email(email);@users.values.find{|user|user.email==email.downcase.strip};end;def delete(id);@users.delete(id);end;def count;@users.size;end;end`,
  },
  {
    name: "Ruby Rails Controller",
    content: `class UsersController<ApplicationController;before_action :authenticate_user!;before_action :set_user,only:[:show,:edit,:update,:destroy];def index;@users=User.includes(:roles).page(params[:page]).per(10);@users=@users.where('name ILIKE ?',"%#{params[:search]}%")if params[:search].present?;respond_to do |format|;format.html;format.json{render json:@users};end;end;def show;respond_to do |format|;format.html;format.json{render json:@user};end;end;def new;@user=User.new;end;def create;@user=User.new(user_params);if @user.save;UserMailer.welcome_email(@user).deliver_later;redirect_to @user,notice:'User was successfully created.';else;render :new,status: :unprocessable_entity;end;end;def edit;end;def update;if @user.update(user_params);redirect_to @user,notice:'User was successfully updated.';else;render :edit,status: :unprocessable_entity;end;end;def destroy;@user.destroy;redirect_to users_url,notice:'User was successfully deleted.';end;private;def set_user;@user=User.find(params[:id]);rescue ActiveRecord::RecordNotFound;redirect_to users_path,alert:'User not found.';end;def user_params;params.require(:user).permit(:name,:email,:role_ids=>[]);end;def authenticate_user!;redirect_to login_path unless current_user;end;end`,
  },
]

const rubyOptions = [
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
      { value: 2, label: "2 Spaces (Ruby Standard)" },
      { value: 4, label: "4 Spaces" },
      { value: "tab", label: "Tabs" },
    ],
  },
  {
    key: "sortRequires",
    label: "Sort Require Statements",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "groupRequires",
    label: "Group Require Statements",
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

function processRuby(input: string, options: any = {}) {
  try {
    let output = input

    // Remove comments if requested
    if (options.removeComments) {
      output = output.replace(/#.*$/gm, "")
      output = output.replace(/=begin[\s\S]*?=end/g, "")
    }

    // Sort and group require statements
    if (options.sortRequires || options.groupRequires) {
      output = formatRubyRequires(output, options)
    }

    if (options.format === "minify") {
      output = output
        .replace(/\s+/g, " ")
        .replace(/;\s*end/g, ";end")
        .replace(/\s*do\s*/g, " do ")
        .trim()
    } else {
      // Beautify Ruby
      const indentStr = options.indent === "tab" ? "\t" : " ".repeat(options.indent || 2)
      output = beautifyRuby(output, indentStr)
    }

    const stats = {
      "Original Size": `${input.length} chars`,
      "Formatted Size": `${output.length} chars`,
      "Classes": `${(input.match(/class\s+\w+/g) || []).length}`,
      "Modules": `${(input.match(/module\s+\w+/g) || []).length}`,
      "Methods": `${(input.match(/def\s+\w+/g) || []).length}`,
      "Blocks": `${(input.match(/do\s*\|/g) || []).length + (input.match(/{[\s\S]*?}/g) || []).length}`,
    }

    return { output, stats }
  } catch (error) {
    return {
      output: "",
      error: "Ruby formatting failed",
    }
  }
}

function formatRubyRequires(code: string, options: any): string {
  const lines = code.split('\n')
  const stdRequires: string[] = []
  const gemRequires: string[] = []
  const localRequires: string[] = []
  const otherLines: string[] = []
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed.startsWith('require ')) {
      const requirePath = trimmed.replace('require ', '').replace(/['"]/g, '')
      
      if (requirePath.includes('/') && !requirePath.startsWith('.')) {
        stdRequires.push(trimmed)
      } else if (requirePath.startsWith('.')) {
        localRequires.push(trimmed)
      } else {
        gemRequires.push(trimmed)
      }
    } else {
      otherLines.push(line)
    }
  })
  
  if (options.sortRequires) {
    stdRequires.sort()
    gemRequires.sort()
    localRequires.sort()
  }
  
  let result = ""
  
  // Add requires with grouping
  if (options.groupRequires) {
    if (stdRequires.length > 0) {
      result += stdRequires.join('\n') + '\n\n'
    }
    if (gemRequires.length > 0) {
      result += gemRequires.join('\n') + '\n\n'
    }
    if (localRequires.length > 0) {
      result += localRequires.join('\n') + '\n\n'
    }
  } else {
    const allRequires = stdRequires.concat(gemRequires, localRequires)
    if (allRequires.length > 0) {
      result += allRequires.join('\n') + '\n\n'
    }
  }
  
  // Add remaining code
  result += otherLines.join('\n')
  
  return result
}

function beautifyRuby(code: string, indent: string): string {
  const lines = code.split('\n')
  const result: string[] = []
  let level = 0
  
  const indentKeywords = ['class', 'module', 'def', 'if', 'unless', 'case', 'when', 'while', 'until', 'for', 'begin', 'do']
  const dedentKeywords = ['end', 'else', 'elsif', 'when', 'rescue', 'ensure']
  
  lines.forEach(line => {
    const trimmed = line.trim()
    
    if (trimmed === '') {
      result.push('')
      return
    }
    
    // Decrease indent for dedent keywords
    if (dedentKeywords.some(keyword => trimmed.startsWith(keyword))) {
      level = Math.max(0, level - 1)
    }
    
    result.push(indent.repeat(level) + trimmed)
    
    // Increase indent for indent keywords
    if (indentKeywords.some(keyword => trimmed.startsWith(keyword))) {
      level++
    }
  })
  
  return result.join('\n')
}

function validateRuby(input: string) {
  if (!input.trim()) {
    return { isValid: false, error: "Input cannot be empty" }
  }
  
  // Basic Ruby validation
  const beginCount = (input.match(/\b(class|module|def|if|unless|case|while|until|for|begin|do)\b/g) || []).length
  const endCount = (input.match(/\bend\b/g) || []).length
  
  if (beginCount !== endCount) {
    return { isValid: false, error: "Mismatched begin/end keywords in Ruby code" }
  }
  
  return { isValid: true }
}

export default function RubyFormatterPage() {
  return (
    <TextToolLayout
      title="Ruby Formatter"
      description="Format and beautify Ruby code following Ruby style guide with require statement organization."
      icon={FileCode}
      placeholder="Paste your Ruby code here..."
      outputPlaceholder="Formatted Ruby will appear here..."
      processFunction={processRuby}
      validateFunction={validateRuby}
      options={rubyOptions}
      examples={rubyExamples}
      fileExtensions={[".rb"]}
      supportFileUpload={true}
      supportUrlInput={true}
    />
  )
}