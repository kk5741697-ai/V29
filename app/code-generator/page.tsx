"use client"

import { TextToolLayout } from "@/components/text-tool-layout"
import { Zap } from "lucide-react"

const codeGeneratorExamples = [
  {
    name: "REST API Endpoint",
    content: `Create a REST API endpoint for user management with CRUD operations`,
  },
  {
    name: "Database Model",
    content: `Generate a User model with fields: id, name, email, created_at, updated_at`,
  },
  {
    name: "React Component",
    content: `Create a React component for a user profile card with props: user, onEdit, onDelete`,
  },
]

const codeGeneratorOptions = [
  {
    key: "targetLanguage",
    label: "Target Language",
    type: "select" as const,
    defaultValue: "javascript",
    selectOptions: [
      { value: "javascript", label: "JavaScript" },
      { value: "typescript", label: "TypeScript" },
      { value: "python", label: "Python" },
      { value: "java", label: "Java" },
      { value: "csharp", label: "C#" },
      { value: "go", label: "Go" },
      { value: "rust", label: "Rust" },
    ],
  },
  {
    key: "framework",
    label: "Framework/Library",
    type: "select" as const,
    defaultValue: "none",
    selectOptions: [
      { value: "none", label: "None (Vanilla)" },
      { value: "react", label: "React" },
      { value: "vue", label: "Vue.js" },
      { value: "angular", label: "Angular" },
      { value: "express", label: "Express.js" },
      { value: "fastapi", label: "FastAPI" },
      { value: "spring", label: "Spring Boot" },
    ],
  },
  {
    key: "codeStyle",
    label: "Code Style",
    type: "select" as const,
    defaultValue: "modern",
    selectOptions: [
      { value: "modern", label: "Modern (ES6+, Latest features)" },
      { value: "classic", label: "Classic (Traditional syntax)" },
      { value: "functional", label: "Functional Programming" },
      { value: "oop", label: "Object-Oriented" },
    ],
  },
  {
    key: "includeTests",
    label: "Include Unit Tests",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeDocumentation",
    label: "Include Documentation",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeErrorHandling",
    label: "Include Error Handling",
    type: "checkbox" as const,
    defaultValue: true,
  },
  {
    key: "includeValidation",
    label: "Include Input Validation",
    type: "checkbox" as const,
    defaultValue: true,
  },
]

function processCodeGenerator(input: string, options: any = {}) {
  try {
    const description = input.trim()
    if (!description) {
      return { output: "", error: "Please provide a description of what code to generate" }
    }
    
    const generatedCode = generateCode(description, options)
    
    const stats = {
      "Target Language": options.targetLanguage.toUpperCase(),
      "Framework": options.framework || "None",
      "Code Style": options.codeStyle,
      "Generated Lines": generatedCode.split('\n').length,
      "Includes Tests": options.includeTests ? "Yes" : "No",
      "Includes Docs": options.includeDocumentation ? "Yes" : "No",
    }

    return { output: generatedCode, stats }
  } catch (error) {
    return {
      output: "",
      error: "Code generation failed",
    }
  }
}

function generateCode(description: string, options: any): string {
  const { targetLanguage, framework, codeStyle } = options
  
  // Analyze description to determine what to generate
  const codeType = analyzeDescription(description)
  
  let generatedCode = ""
  
  // Add file header
  if (options.includeDocumentation) {
    generatedCode += generateFileHeader(description, options)
  }
  
  // Generate main code based on type
  switch (codeType) {
    case "api":
      generatedCode += generateAPICode(description, options)
      break
    case "model":
      generatedCode += generateModelCode(description, options)
      break
    case "component":
      generatedCode += generateComponentCode(description, options)
      break
    case "function":
      generatedCode += generateFunctionCode(description, options)
      break
    case "class":
      generatedCode += generateClassCode(description, options)
      break
    default:
      generatedCode += generateGenericCode(description, options)
  }
  
  // Add tests if requested
  if (options.includeTests) {
    generatedCode += "\n\n" + generateTestCode(description, options)
  }
  
  return generatedCode
}

function analyzeDescription(description: string): string {
  const desc = description.toLowerCase()
  
  if (desc.includes('api') || desc.includes('endpoint') || desc.includes('route')) {
    return "api"
  }
  if (desc.includes('model') || desc.includes('schema') || desc.includes('database')) {
    return "model"
  }
  if (desc.includes('component') || desc.includes('react') || desc.includes('vue')) {
    return "component"
  }
  if (desc.includes('function') || desc.includes('method')) {
    return "function"
  }
  if (desc.includes('class') || desc.includes('object')) {
    return "class"
  }
  
  return "generic"
}

function generateFileHeader(description: string, options: any): string {
  const timestamp = new Date().toISOString()
  
  if (options.targetLanguage === "javascript" || options.targetLanguage === "typescript") {
    return `/**
 * Generated Code
 * 
 * Description: ${description}
 * Language: ${options.targetLanguage.toUpperCase()}
 * Framework: ${options.framework || 'None'}
 * Generated: ${timestamp}
 * 
 * @author PixoraTools Code Generator
 */

`
  } else if (options.targetLanguage === "python") {
    return `"""
Generated Code

Description: ${description}
Language: ${options.targetLanguage.toUpperCase()}
Framework: ${options.framework || 'None'}
Generated: ${timestamp}

@author PixoraTools Code Generator
"""

`
  }
  
  return `// Generated Code
// Description: ${description}
// Language: ${options.targetLanguage.toUpperCase()}
// Generated: ${timestamp}

`
}

function generateAPICode(description: string, options: any): string {
  if (options.targetLanguage === "javascript" && options.framework === "express") {
    return `const express = require('express');
const router = express.Router();

/**
 * User Management API
 */

// GET /users - Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /users/:id - Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /users - Create new user
router.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Validation
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and email are required' 
      });
    }
    
    const user = await User.create({ name, email });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /users/:id - Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;`
  }
  
  return generateGenericCode(description, options)
}

function generateModelCode(description: string, options: any): string {
  if (options.targetLanguage === "javascript") {
    return `/**
 * User Model
 */
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
  
  /**
   * Validate user data
   * @returns {boolean} True if valid
   */
  isValid() {
    return this.name.length > 0 && 
           this.email.includes('@') && 
           this.email.length > 5;
  }
  
  /**
   * Convert to JSON
   * @returns {Object} User data as plain object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  /**
   * Update user data
   * @param {Object} updates - Fields to update
   */
  update(updates) {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }
  
  /**
   * Create user from JSON
   * @param {Object} data - User data
   * @returns {User} New user instance
   */
  static fromJSON(data) {
    return new User(data);
  }
}

module.exports = User;`
  }
  
  return generateGenericCode(description, options)
}

function generateComponentCode(description: string, options: any): string {
  if (options.framework === "react") {
    return `import React, { useState, useEffect } from 'react';

/**
 * UserProfile Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User data
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 */
const UserProfile = ({ user, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleSave = () => {
    onEdit(userData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setUserData(user);
    setIsEditing(false);
  };

  return (
    <div className="user-profile">
      <div className="user-avatar">
        <img 
          src={userData.avatar || '/default-avatar.png'} 
          alt={userData.name}
          className="avatar-image"
        />
      </div>
      
      <div className="user-info">
        {isEditing ? (
          <div className="edit-form">
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              placeholder="Name"
            />
            <input
              type="email"
              value={userData.email}
              onChange={(e) => setUserData({...userData, email: e.target.value})}
              placeholder="Email"
            />
            <div className="form-actions">
              <button onClick={handleSave} className="btn-save">
                Save
              </button>
              <button onClick={handleCancel} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="user-details">
            <h3 className="user-name">{userData.name}</h3>
            <p className="user-email">{userData.email}</p>
            <p className="user-joined">
              Joined: {new Date(userData.createdAt).toLocaleDateString()}
            </p>
            
            <div className="user-actions">
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn-edit"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(userData.id)} 
                className="btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;`
  }
  
  return generateGenericCode(description, options)
}

function generateFunctionCode(description: string, options: any): string {
  if (options.targetLanguage === "javascript") {
    return `/**
 * Generated function based on description
 * @param {any} input - Function input
 * @returns {any} Function output
 */
function generatedFunction(input) {
  // Input validation
  if (!input) {
    throw new Error('Input is required');
  }
  
  try {
    // Main logic here
    const result = processInput(input);
    
    // Return processed result
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Function execution failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Helper function to process input
 * @param {any} input - Input to process
 * @returns {any} Processed input
 */
function processInput(input) {
  // Add your processing logic here
  return input;
}

module.exports = { generatedFunction };`
  }
  
  return generateGenericCode(description, options)
}

function generateClassCode(description: string, options: any): string {
  if (options.targetLanguage === "javascript") {
    return `/**
 * Generated Class
 */
class GeneratedClass {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = options;
    this.data = new Map();
    this.initialized = false;
    
    this.init();
  }
  
  /**
   * Initialize the class
   */
  init() {
    try {
      // Initialization logic here
      this.initialized = true;
      console.log('Class initialized successfully');
    } catch (error) {
      console.error('Initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * Add data to the class
   * @param {string} key - Data key
   * @param {any} value - Data value
   */
  addData(key, value) {
    if (!this.initialized) {
      throw new Error('Class not initialized');
    }
    
    this.data.set(key, value);
  }
  
  /**
   * Get data from the class
   * @param {string} key - Data key
   * @returns {any} Data value
   */
  getData(key) {
    return this.data.get(key);
  }
  
  /**
   * Get all data
   * @returns {Object} All data as object
   */
  getAllData() {
    return Object.fromEntries(this.data);
  }
  
  /**
   * Clear all data
   */
  clear() {
    this.data.clear();
  }
  
  /**
   * Destroy the class instance
   */
  destroy() {
    this.clear();
    this.initialized = false;
  }
}

module.exports = GeneratedClass;`
  }
  
  return generateGenericCode(description, options)
}

function generateGenericCode(description: string, options: any): string {
  const { targetLanguage } = options
  
  let code = ""
  
  if (options.includeDocumentation) {
    code += `// Generated code based on: ${description}\n`
    code += `// Language: ${targetLanguage.toUpperCase()}\n`
    code += `// Generated: ${new Date().toISOString()}\n\n`
  }
  
  if (targetLanguage === "javascript") {
    code += `// Main function
function main() {
  console.log('Generated code is ready!');
  
  // Add your implementation here
  const result = {
    message: 'Code generated successfully',
    timestamp: new Date().toISOString(),
    description: '${description}'
  };
  
  return result;
}

// Execute main function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { main };
} else {
  main();
}`
  } else if (targetLanguage === "python") {
    code += `def main():
    """Main function"""
    print('Generated code is ready!')
    
    # Add your implementation here
    result = {
        'message': 'Code generated successfully',
        'timestamp': datetime.now().isoformat(),
        'description': '${description}'
    }
    
    return result

if __name__ == '__main__':
    main()`
  }
  
  return code
}

function generateTestCode(description: string, options: any): string {
  if (options.targetLanguage === "javascript") {
    return `// Test file
const { generatedFunction } = require('./generated-code');

describe('Generated Function Tests', () => {
  test('should execute successfully', () => {
    const result = generatedFunction('test input');
    expect(result.success).toBe(true);
  });
  
  test('should handle invalid input', () => {
    expect(() => generatedFunction(null)).toThrow();
  });
  
  test('should return expected format', () => {
    const result = generatedFunction('test');
    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('timestamp');
  });
});`
  }
  
  return `// Tests would be generated here for ${options.targetLanguage}`
}

export default function CodeGeneratorPage() {
  return (
    <TextToolLayout
      title="Code Generator"
      description="Generate code from natural language descriptions with support for multiple languages and frameworks."
      icon={Zap}
      placeholder="Describe what code you want to generate (e.g., 'Create a REST API for user management')..."
      outputPlaceholder="Generated code will appear here..."
      processFunction={processCodeGenerator}
      options={codeGeneratorOptions}
      examples={codeGeneratorExamples}
      fileExtensions={[".js", ".py", ".java", ".cs", ".go", ".rs"]}
      supportFileUpload={false}
      supportUrlInput={false}
    />
  )
}