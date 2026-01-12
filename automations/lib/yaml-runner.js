#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'
import yaml from 'js-yaml'
import { StepExecutorEnhanced } from './step-executor-enhanced.js'

// Load environment variables from .env file
import { config } from 'dotenv'
config()

class YamlRunner {
  constructor(options = {}) {
    this.executor = new StepExecutorEnhanced()
    this.context = {}
    this.config = {}
    this.chunkSize = options.chunkSize || 50
    this.enableGC = options.enableGC !== false
    this.startTime = Date.now()
  }

  async run(yamlFilePath, options = {}) {
    try {
      console.log(`🚀 Starting YAML playbook: ${path.basename(yamlFilePath)}`)
      console.log(`📂 Working directory: ${process.cwd()}`)
      console.log(`⚙️  Chunk size: ${this.chunkSize} | GC enabled: ${this.enableGC}`)
      
      // Log initial memory
      this.executor.logMemoryUsage('Startup')
      
      const yamlContent = await fs.readFile(yamlFilePath, 'utf8')
      const playbook = yaml.load(yamlContent)

      if (!playbook || typeof playbook !== 'object') {
        throw new Error('Invalid YAML playbook format')
      }

      // Load configuration from environment and playbook
      const rawConfig = {
        ...playbook.config || {},
        ...options,
        chunk_size: this.chunkSize
      }

      // Resolve config values that may contain environment variable references
      this.config = {}
      for (const [key, value] of Object.entries(rawConfig)) {
        this.config[key] = this.resolveConfigValue(value)
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

      // Final cleanup
      this.executor.cleanup()
      
      const elapsed = Date.now() - this.startTime
      console.log(`✅ Playbook completed successfully in ${Math.round(elapsed / 1000)}s`)
      
      return this.context.results

    } catch (error) {
      console.error('❌ Playbook execution failed:', error.message)
      if (process.env.DEBUG) {
        console.error('Stack trace:', error.stack)
      }
      
      // Cleanup on error
      this.executor.cleanup()
      
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

      console.log(`\n🔄 Step ${stepNumber}/${steps.length}: ${step.name}`)
      
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

        // Save progress periodically
        if (stepNumber % 5 === 0) {
          await this.executor.saveProgress({
            step: stepNumber,
            total: steps.length,
            name: step.name
          })
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
      
      // Force garbage collection after each step if enabled
      if (this.enableGC && global.gc) {
        this.executor.forceGarbageCollection()
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

  resolveConfigValue(value) {
    if (typeof value !== 'string') {
      return value
    }

    // Handle ${env.VAR || 'default'} syntax
    const match = value.match(/^\$\{(.+)\}$/)
    if (match) {
      const expression = match[1]
      
      // Handle OR expressions
      if (expression.includes('||')) {
        const parts = expression.split('||').map(p => p.trim())
        for (const part of parts) {
          // Handle string literals
          if ((part.startsWith("'") && part.endsWith("'")) || 
              (part.startsWith('"') && part.endsWith('"'))) {
            return part.slice(1, -1)
          }
          // Handle env variables
          if (part.startsWith('env.')) {
            const envVar = part.replace('env.', '')
            const envValue = process.env[envVar]
            if (envValue) {
              return envValue
            }
          }
        }
      }
      
      // Handle simple env variable
      if (expression.startsWith('env.')) {
        const envVar = expression.replace('env.', '')
        return process.env[envVar] || ''
      }
    }

    return value
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
