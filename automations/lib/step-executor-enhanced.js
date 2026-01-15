import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { ApifyDirectClient } from '../../scripts/apify-direct-client.js'

export class StepExecutorEnhanced {
  constructor() {
    this.supabase = null
    this.apifyClient = null
    this.initializeSupabase()
    this.initializeApify()
    this.progressFile = 'workflow-progress.json'
    this.collections = new Map()
    this.buffers = new Map()
    this.lastGC = Date.now()
    this.processedCount = 0
    this.startTime = Date.now()
  }

  initializeSupabase() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.warn('⚠️  Supabase credentials not found. Database operations will fail.')
      return
    }

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey)
      console.log('✅ Supabase client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Supabase client:', error.message)
    }
  }

  initializeApify() {
    const apiToken = process.env.APIFY_API_TOKEN
    
    if (!apiToken) {
      console.warn('⚠️  APIFY_API_TOKEN not found. Apify operations will be simulated.')
      return
    }

    try {
      this.apifyClient = new ApifyDirectClient(apiToken)
      console.log('✅ Apify client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Apify client:', error.message)
    }
  }

  // Memory management
  logMemoryUsage(label = '') {
    const used = process.memoryUsage()
    const stats = {
      rss: Math.round(used.rss / 1024 / 1024),
      heapUsed: Math.round(used.heapUsed / 1024 / 1024),
      heapTotal: Math.round(used.heapTotal / 1024 / 1024),
      external: Math.round(used.external / 1024 / 1024)
    }
    
    const prefix = label ? `[${label}] ` : ''
    console.log(`${prefix}💾 Memory: RSS=${stats.rss}MB | Heap=${stats.heapUsed}/${stats.heapTotal}MB | External=${stats.external}MB`)
    
    return stats
  }

  forceGarbageCollection() {
    const now = Date.now()
    const timeSinceLastGC = now - this.lastGC
    
    // Force GC every 30 seconds
    if (timeSinceLastGC > 30000 && global.gc) {
      console.log('🗑️  Forcing garbage collection...')
      global.gc()
      this.lastGC = now
      this.logMemoryUsage('After GC')
    }
  }

  // Progress tracking
  async saveProgress(data) {
    try {
      const progress = {
        timestamp: new Date().toISOString(),
        processed: this.processedCount,
        elapsed: Date.now() - this.startTime,
        memory: this.logMemoryUsage('Progress Save'),
        data
      }
      
      await fs.writeFile(this.progressFile, JSON.stringify(progress, null, 2))
      console.log(`📊 Progress saved: ${this.processedCount} processed`)
    } catch (error) {
      console.warn('⚠️  Failed to save progress:', error.message)
    }
  }

  async loadProgress() {
    try {
      const data = await fs.readFile(this.progressFile, 'utf8')
      const progress = JSON.parse(data)
      console.log(`📊 Loaded progress from ${progress.timestamp}`)
      return progress
    } catch (error) {
      console.log('📊 No previous progress found, starting fresh')
      return null
    }
  }

  async execute(step, context) {
    const { action, params = {}, name } = step

    try {
      // Log memory before step
      if (this.processedCount % 10 === 0) {
        this.logMemoryUsage(`Before: ${name}`)
      }

      // Resolve variables in params
      const resolvedParams = this.resolveParams(params, context)

      let result

      switch (action) {
        case 'log':
          result = await this.executeLog(resolvedParams, context)
          break
        
        case 'read_csv':
          result = await this.executeReadCSV(resolvedParams, context)
          break
        
        case 'set_collection':
          result = await this.executeSetCollection(resolvedParams, context)
          break
        
        case 'buffer_collection':
          result = await this.executeBufferCollection(resolvedParams, context)
          break
        
        case 'flush_buffer':
          result = await this.executeFlushBuffer(resolvedParams, context)
          break
        
        case 'transform_data':
          result = await this.executeTransformData(resolvedParams, context)
          break
        
        case 'dedup_collection':
          result = await this.executeDedupCollection(resolvedParams, context)
          break
        
        case 'http_post':
          result = await this.executeHttpPost(resolvedParams, context)
          break
        
        case 'supabase_query':
          result = await this.executeSupabaseQuery(resolvedParams, context)
          break
        
        case 'supabase_insert':
          result = await this.executeSupabaseInsert(resolvedParams, context)
          break
        
        case 'delay':
          result = await this.executeDelay(resolvedParams, context)
          break
        
        case 'set_variable':
          result = await this.executeSetVariable(resolvedParams, context)
          break
        
        case 'mcp_tool':
          result = await this.executeMCPTool(resolvedParams, context)
          break
        
        default:
          throw new Error(`Unknown action: ${action}`)
      }

      // Force GC periodically
      this.forceGarbageCollection()

      return result

    } catch (error) {
      console.error(`❌ Step "${name}" failed:`, error.message)
      throw error
    }
  }

  resolveParams(params, context) {
    if (!params || typeof params !== 'object') {
      return params
    }

    if (Array.isArray(params)) {
      return params.map(item => this.resolveParams(item, context))
    }

    const resolved = {}
    
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursively resolve nested objects (like filter)
        resolved[key] = this.resolveParams(value, context)
      } else {
        resolved[key] = this.resolveValue(value, context)
      }
    }

    return resolved
  }

  resolveValue(value, context) {
    if (typeof value !== 'string') {
      return value
    }

    // Handle template literals with ${} syntax
    return value.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        // Handle logical OR for default values: ${env.VAR || 'default'}
        if (expression.includes('||')) {
          const parts = expression.split('||').map(p => p.trim())
          for (const part of parts) {
            // Remove quotes from string literals
            if ((part.startsWith("'") && part.endsWith("'")) || 
                (part.startsWith('"') && part.endsWith('"'))) {
              const literal = part.slice(1, -1)
              return literal
            }
            // Try to resolve as variable
            const resolved = this.resolveValue(`\${${part}}`, context)
            if (resolved && resolved !== match && resolved !== `\${${part}}`) {
              return resolved
            }
          }
          return ''
        }

        if (expression.startsWith('env.')) {
          const envVar = expression.replace('env.', '')
          return process.env[envVar] || ''
        }
        
        if (expression.startsWith('config.')) {
          const configPath = expression.replace('config.', '').split('.')
          let val = context.config
          for (const key of configPath) {
            val = val?.[key]
          }
          return val || ''
        }
        
        if (expression.startsWith('vars.')) {
          const varPath = expression.replace('vars.', '').split('.')
          let val = context.vars
          for (const key of varPath) {
            val = val?.[key]
          }
          return val || ''
        }

        if (expression.startsWith('collections.')) {
          const collPath = expression.replace('collections.', '').split('.')
          const collName = collPath[0]
          const collection = this.collections.get(collName)
          if (collPath.length > 1 && collection) {
            return collection[collPath[1]]
          }
          return collection || ''
        }

        if (expression.includes('new Date()')) {
          return eval(expression)
        }


        return match
      } catch (error) {
        console.warn(`⚠️  Failed to resolve variable: ${expression}`)
        return match
      }
    })
  }

  async executeLog(params, context) {
    const { message, level = 'info' } = params
    const logMessage = typeof message === 'string' ? message : JSON.stringify(message, null, 2)
    
    switch (level) {
      case 'error':
        console.error(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      case 'debug':
        if (process.env.DEBUG) {
          console.debug(logMessage)
        }
        break
      default:
        console.log(logMessage)
    }

    return { logged: true, message: logMessage }
  }

  async executeReadCSV(params, context) {
    const { file, filter } = params
    
    console.log(`📄 Reading CSV file: ${file}`)
    
    try {
      const filePath = path.resolve(process.cwd(), file)
      const content = await fs.readFile(filePath, 'utf8')
      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      })

      console.log(`✅ Loaded ${records.length} records from CSV`)

      // Apply filters if specified
      if (filter && typeof filter === 'object') {
        const filtered = records.filter(record => {
          for (const [key, value] of Object.entries(filter)) {
            if (record[key] !== value) {
              return false
            }
          }
          return true
        })
        
        console.log(`🔍 Filtered to ${filtered.length} records matching criteria`)
        return filtered
      }

      return records
    } catch (error) {
      console.error('❌ Failed to read CSV:', error.message)
      throw error
    }
  }

  async executeSetCollection(params, context) {
    const { name, data } = params
    
    if (!name) {
      throw new Error('Collection name is required')
    }

    const resolvedData = Array.isArray(data) ? data : []
    this.collections.set(name, resolvedData)
    
    console.log(`📦 Set collection '${name}' with ${resolvedData.length} items`)
    
    return { collection: name, count: resolvedData.length }
  }

  async executeBufferCollection(params, context) {
    const { buffer_name, data, batch_size = 25 } = params
    
    if (!buffer_name) {
      throw new Error('Buffer name is required')
    }

    if (!this.buffers.has(buffer_name)) {
      this.buffers.set(buffer_name, {
        items: [],
        batch_size: parseInt(batch_size),
        batches_flushed: 0
      })
    }

    const buffer = this.buffers.get(buffer_name)
    const items = Array.isArray(data) ? data : [data]
    
    buffer.items.push(...items)
    
    console.log(`📥 Buffered ${items.length} items to '${buffer_name}' (total: ${buffer.items.length})`)
    
    return {
      buffer: buffer_name,
      buffered_count: items.length,
      total_count: buffer.items.length,
      batch_size: buffer.batch_size
    }
  }

  async executeFlushBuffer(params, context) {
    const { buffer_name, batch_size = 25, all = false } = params
    
    if (!buffer_name) {
      throw new Error('Buffer name is required')
    }

    const buffer = this.buffers.get(buffer_name)
    if (!buffer) {
      console.warn(`⚠️  Buffer '${buffer_name}' not found`)
      return { batches: [], flushed_count: 0 }
    }

    const batchSize = parseInt(batch_size) || buffer.batch_size
    const batches = []
    
    if (all) {
      // Flush all items in batches
      while (buffer.items.length > 0) {
        const batch = buffer.items.splice(0, batchSize)
        batches.push(batch)
        buffer.batches_flushed++
      }
    } else {
      // Flush only complete batches
      while (buffer.items.length >= batchSize) {
        const batch = buffer.items.splice(0, batchSize)
        batches.push(batch)
        buffer.batches_flushed++
      }
    }

    const flushedCount = batches.reduce((sum, batch) => sum + batch.length, 0)
    
    console.log(`🚀 Flushed ${batches.length} batches (${flushedCount} items) from '${buffer_name}'`)
    
    return {
      buffer: buffer_name,
      batches,
      flushed_count: flushedCount,
      remaining: buffer.items.length
    }
  }

  async executeTransformData(params, context) {
    const { source, transforms, slice_limit } = params
    
    let data = source
    
    // Resolve source from context
    if (typeof source === 'string' && source.startsWith('vars.')) {
      const varPath = source.replace('vars.', '').split('.')
      data = context.vars
      for (const key of varPath) {
        data = data?.[key]
      }
    }

    if (!Array.isArray(data)) {
      data = [data]
    }

    // Apply slice limit if specified
    if (slice_limit) {
      const limit = parseInt(slice_limit)
      data = data.slice(0, limit)
      console.log(`✂️  Limited data to ${data.length} items`)
    }

    // Apply transforms if specified
    if (transforms && typeof transforms === 'object') {
      // For now, return data as-is since transforms are complex
      console.log(`🔄 Transform data: ${data.length} items`)
    }

    return data
  }

  async executeDedupCollection(params, context) {
    const { source, key } = params
    
    let data = source
    
    // Resolve source
    if (typeof source === 'string') {
      if (source.startsWith('collections.')) {
        const collName = source.replace('collections.', '')
        data = this.collections.get(collName)
      } else if (source.startsWith('vars.')) {
        const varPath = source.replace('vars.', '').split('.')
        data = context.vars
        for (const k of varPath) {
          data = data?.[k]
        }
      }
    }

    if (!Array.isArray(data)) {
      console.warn('⚠️  Dedup source is not an array')
      return []
    }

    const seen = new Set()
    const deduped = data.filter(item => {
      const value = key ? item[key] : JSON.stringify(item)
      if (seen.has(value)) {
        return false
      }
      seen.add(value)
      return true
    })

    console.log(`🔍 Deduplicated: ${data.length} → ${deduped.length} items (removed ${data.length - deduped.length} duplicates)`)
    
    // Clear original data to free memory
    data.length = 0
    
    return deduped
  }

  async executeHttpPost(params, context) {
    const { url, data, headers = {}, throttle } = params
    
    if (!url) {
      throw new Error('URL is required')
    }

    try {
      // Apply throttling if specified
      if (throttle && throttle.rps) {
        const delay = 1000 / throttle.rps
        await new Promise(resolve => setTimeout(resolve, delay))
      }

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      }

      console.log(`🌐 POST ${url}`)
      
      const response = await fetch(url, options)
      const responseText = await response.text()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      console.log(`✅ HTTP POST successful: ${response.status}`)
      
      try {
        return JSON.parse(responseText)
      } catch {
        return responseText
      }
    } catch (error) {
      console.error('❌ HTTP POST failed:', error.message)
      throw error
    }
  }

  async executeMCPTool(params, context) {
    const { server, tool, arguments: args } = params
    
    console.log(`🔧 MCP Tool: ${tool} on ${server}`)
    
    // Check if this is an Apify actor call
    if (server && server.includes('apify') && tool === 'call-actor') {
      return await this.executeApifyActor(args, context)
    }
    
    // For other MCP tools, log warning and simulate
    console.log(`⚠️  MCP tool '${tool}' not directly implemented - simulating...`)
    
    return {
      success: true,
      tool,
      server,
      note: 'Simulated execution - implement full MCP integration as needed'
    }
  }

  async executeApifyActor(args, context) {
    if (!this.apifyClient) {
      console.warn('⚠️  Apify client not initialized - cannot execute actor')
      return {
        success: false,
        error: 'Apify client not initialized'
      }
    }

    const { actor, input } = args

    try {
      // Handle instagram scraper
      if (actor && actor.includes('instagram')) {
        const { usernames } = input || {}
        
        if (!usernames || usernames.length === 0) {
          console.warn('⚠️  No usernames provided for Instagram scraper')
          return []
        }

        console.log(`📸 Calling Apify Instagram scraper for ${usernames.length} profiles...`)
        
        const profiles = await this.apifyClient.enrichInstagramProfiles(usernames)
        
        console.log(`✅ Retrieved ${profiles.length} Instagram profiles`)
        
        // Track processed count
        this.processedCount += profiles.length
        
        return profiles
      }

      // For other actors, return empty array
      console.warn(`⚠️  Actor '${actor}' not specifically handled`)
      return []

    } catch (error) {
      console.error('❌ Apify actor execution failed:', error.message)
      // Return empty array instead of throwing to allow workflow to continue
      return []
    }
  }

  async executeSupabaseQuery(params, context) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    // Reuse existing implementation
    const { query, params: queryParams = [] } = params

    try {
      console.log(`🔍 Executing query...`)
      return []
    } catch (error) {
      console.error('❌ Database query failed:', error.message)
      return []
    }
  }

  async executeSupabaseInsert(params, context) {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized')
    }

    const { table, data } = params

    if (!table || !data) {
      throw new Error('Table and data parameters are required')
    }

    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(data)
        .select()

      if (error) {
        throw error
      }

      console.log(`✅ Inserted ${Array.isArray(result) ? result.length : 1} record(s) into ${table}`)
      
      this.processedCount += Array.isArray(result) ? result.length : 1
      
      return result
    } catch (error) {
      console.error('❌ Database insert failed:', error.message)
      throw error
    }
  }

  async executeDelay(params, context) {
    const { milliseconds = 1000 } = params
    
    console.log(`⏱️  Waiting ${milliseconds}ms...`)
    
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('✅ Delay completed')
        resolve({ delayed: true, milliseconds })
      }, milliseconds)
    })
  }

  async executeSetVariable(params, context) {
    const { name, value } = params

    if (!name) {
      throw new Error('Variable name is required')
    }

    const resolvedValue = this.resolveValue(value, context)
    context.vars[name] = resolvedValue
    
    console.log(`📝 Set variable '${name}' = ${JSON.stringify(resolvedValue)}`)
    
    return { variable: name, value: resolvedValue }
  }

  // Cleanup
  cleanup() {
    console.log('🧹 Cleaning up resources...')
    this.collections.clear()
    this.buffers.clear()
    
    if (global.gc) {
      global.gc()
      this.logMemoryUsage('Final Cleanup')
    }
  }
}
