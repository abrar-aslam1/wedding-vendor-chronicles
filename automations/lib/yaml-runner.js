#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { StepExecutor } from './step-executor.js'

// Load environment variables from .env file
import { config } from 'dotenv'
config()

class YamlRunner {
  constructor() {
    this.executor = new StepExecutor()
    this.context = {}
    this.config = {}
  }

  async run(yamlFilePath, options = {}) {
    try {
      console.log(`🚀 Starting YAML playbook: ${path.basename(yamlFilePath)}`)
      console.log(`📂 Working directory: ${process.cwd()}`)
      
      const yamlContent = await fs.readFile(yamlFilePath, 'utf8')
      const playbook = yaml.load(yamlContent)

      if (!playbook || typeof playbook !== 'object') {
        throw new Error('Invalid YAML playbook format')
      }

      // Load configuration from environment and playbook
      this.config = {
        ...playbook.config || {},
        ...options
      }

      // Initialize context with environment variables and config
      this.context = {
        env: process.env,
        config: this.config,
        vars: {},
        collections: {},
        results: {}
      }

      console.log(`📋 Playbook: ${playbook.name || 'Unnamed'}`)
      if (playbook.description) {
        console.log(`📝 Description: ${playbook.description}`)
      }

      // Execute steps in sequence
      if (playbook.steps && Array.isArray(playbook.steps)) {
        await this.executeSteps(playbook.steps)
      } else {
        console.warn('⚠️  No steps found in playbook')
      }

      console.log('✅ Playbook completed successfully')
      return this.context.results

    } catch (error) {
      console.error('❌ Playbook execution failed:', error.message)
      if (process.env.DEBUG) {
        console.error('Stack trace:', error.stack)
      }
      throw error
    }
  }

  async executeSteps(steps) {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const stepNumber = i + 1

      if (!step.name || !step.action) {
        console.warn(`⚠️  Step ${stepNumber}: Missing name or action, skipping`)
        continue
      }

      console.log(`\n🔄 Step ${stepNumber}: ${step.name}`)
      
      try {
        // Check if condition
        if (step.when && !this.evaluateCondition(step.when)) {
          console.log(`⏭️  Step ${stepNumber}: Condition not met, skipping`)
          continue
        }

        // Execute the step
        const result = await this.executor.execute(step, this.context)
        
        // Store result if specified
        if (step.register) {
          this.context.vars[step.register] = result
          console.log(`📝 Registered result as: ${step.register}`)
        }

        // Store in results if this is a significant step
        if (step.track_result) {
          this.context.results[step.name] = result
        }

        console.log(`✅ Step ${stepNumber}: Completed`)

      } catch (stepError) {
        console.error(`❌ Step ${stepNumber}: Failed -`, stepError.message)
        
        // Check if we should continue on failure
        if (step.ignore_errors) {
          console.log(`⚠️  Step ${stepNumber}: Ignoring error and continuing`)
          continue
        }

        // Stop execution on failure unless explicitly told to continue
        throw new Error(`Step "${step.name}" failed: ${stepError.message}`)
      }
    }
  }

  evaluateCondition(condition) {
    try {
      if (typeof condition === 'string') {
        // Handle complex expressions
        if (condition.includes(' && ')) {
          const parts = condition.split(' && ')
          return parts.every(part => this.evaluateCondition(part.trim()))
        }
        
        if (condition.includes(' || ')) {
          const parts = condition.split(' || ')
          return parts.some(part => this.evaluateCondition(part.trim()))
        }

        // Handle length checks
        if (condition.includes('.length')) {
          const match = condition.match(/^(.+)\.length\s*([><=!]+)\s*(\d+)$/)
          if (match) {
            const [, varPath, operator, value] = match
            const varValue = this.resolveVariable(varPath)
            const length = Array.isArray(varValue) ? varValue.length : 0
            const targetValue = parseInt(value)
            
            switch (operator) {
              case '>': return length > targetValue
              case '>=': return length >= targetValue
              case '<': return length < targetValue
              case '<=': return length <= targetValue
              case '===': case '==': return length === targetValue
              case '!==': case '!=': return length !== targetValue
              default: return false
            }
          }
        }

        // Handle existence checks
        if (condition.startsWith('!')) {
          return !this.evaluateCondition(condition.slice(1))
        }

        // Check if it's a simple variable existence check
        const varValue = this.resolveVariable(condition)
        return Boolean(varValue)
      }

      return true
    } catch (error) {
      console.warn(`⚠️  Condition evaluation failed for: ${condition}`, error.message)
      return false
    }
  }

  resolveVariable(varPath) {
    try {
      // Handle environment variables
      if (varPath.startsWith('env.')) {
        const envVar = varPath.replace('env.', '')
        return process.env[envVar]
      }
      
      // Handle context variables
      if (varPath.startsWith('vars.')) {
        const path = varPath.replace('vars.', '').split('.')
        let value = this.context.vars
        
        for (const key of path) {
          if (value && typeof value === 'object') {
            value = value[key]
          } else {
            return undefined
          }
        }
        
        return value
      }

      // Handle collections
      if (varPath.startsWith('collections.')) {
        const path = varPath.replace('collections.', '').split('.')
        let value = this.context.collections
        
        for (const key of path) {
          if (value && typeof value === 'object') {
            value = value[key]
          } else {
            return undefined
          }
        }
        
        return value
      }

      return undefined
    } catch {
      return undefined
    }
  }
}

// CLI runner
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage: node yaml-runner.js <playbook.yml>')
    process.exit(1)
  }

  const yamlFile = args[0]
  const runner = new YamlRunner()

  try {
    await runner.run(yamlFile)
  } catch (error) {
    console.error('Execution failed:', error.message)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { YamlRunner }
