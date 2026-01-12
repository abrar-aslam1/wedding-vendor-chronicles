#!/usr/bin/env node

import fs from 'fs/promises'
import path from 'path'

/**
 * Real-time monitoring script for Instagram vendor collection workflow
 * Tracks progress, memory usage, cost, and ETA
 */

const PROGRESS_FILE = 'workflow-progress.json'
const REFRESH_INTERVAL = 2000 // 2 seconds

// Cost estimates (based on Apify pricing)
const COST_PER_SEARCH = 0.001 // Estimated $0.001 per search
const COST_PER_PROFILE = 0.002 // Estimated $0.002 per profile enrichment

class ProgressMonitor {
  constructor() {
    this.startTime = null
    this.lastProgress = null
    this.totalExpectedProfiles = 0
    this.searchCount = 0
    this.enrichCount = 0
  }

  clearConsole() {
    console.clear()
  }

  formatMemory(mb) {
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`
    }
    return `${mb} MB`
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  formatCost(amount) {
    return `$${amount.toFixed(4)}`
  }

  calculateETA(processed, total, elapsed) {
    if (processed === 0) return 'Calculating...'
    
    const rate = processed / elapsed // items per ms
    const remaining = total - processed
    const estimatedMs = remaining / rate

    return this.formatTime(estimatedMs)
  }

  calculateRate(processed, elapsed) {
    const seconds = elapsed / 1000
    if (seconds === 0) return 0
    
    const rate = processed / seconds
    return rate.toFixed(2)
  }

  async readProgress() {
    try {
      const data = await fs.readFile(PROGRESS_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      return null
    }
  }

  displayProgress(progress) {
    this.clearConsole()

    const now = Date.now()
    const progressTime = new Date(progress.timestamp)
    const elapsed = progress.elapsed || 0
    const processed = progress.processed || 0
    
    // Extract data from progress
    const data = progress.data || {}
    const step = data.step || 0
    const total = data.total || 0
    const stepName = data.name || 'Unknown'

    // Memory stats
    const memory = progress.memory || {}
    const heapUsed = memory.heapUsed || 0
    const heapTotal = memory.heapTotal || 0
    const rss = memory.rss || 0

    // Calculate costs
    const searchCost = this.searchCount * COST_PER_SEARCH
    const enrichCost = this.enrichCount * COST_PER_PROFILE
    const totalCost = searchCost + enrichCost

    // Display header
    console.log('╔═══════════════════════════════════════════════════════════════╗')
    console.log('║     Instagram Vendor Collection - Real-time Monitoring       ║')
    console.log('╚═══════════════════════════════════════════════════════════════╝')
    console.log()

    // Workflow Progress
    console.log('📊 Workflow Progress:')
    console.log('─────────────────────────────────────────────────────────────')
    console.log(`  Current Step:     ${step}/${total}`)
    console.log(`  Step Name:        ${stepName}`)
    console.log(`  Items Processed:  ${processed}`)
    console.log(`  Elapsed Time:     ${this.formatTime(elapsed)}`)
    console.log(`  Processing Rate:  ${this.calculateRate(processed, elapsed)} items/sec`)
    console.log()

    // Memory Usage
    console.log('💾 Memory Usage:')
    console.log('─────────────────────────────────────────────────────────────')
    console.log(`  Heap Used:        ${this.formatMemory(heapUsed)} / ${this.formatMemory(heapTotal)}`)
    console.log(`  RSS:              ${this.formatMemory(rss)}`)
    console.log(`  Heap Usage:       ${heapTotal > 0 ? ((heapUsed / heapTotal) * 100).toFixed(1) : 0}%`)
    
    // Memory health indicator
    const heapPercent = heapTotal > 0 ? (heapUsed / heapTotal) * 100 : 0
    let memoryStatus = '🟢 Healthy'
    if (heapPercent > 80) {
      memoryStatus = '🔴 Critical'
    } else if (heapPercent > 60) {
      memoryStatus = '🟡 Warning'
    }
    console.log(`  Status:           ${memoryStatus}`)
    console.log()

    // Cost Tracking
    console.log('💰 Cost Tracking:')
    console.log('─────────────────────────────────────────────────────────────')
    console.log(`  Searches:         ${this.searchCount} × ${this.formatCost(COST_PER_SEARCH)} = ${this.formatCost(searchCost)}`)
    console.log(`  Enrichments:      ${this.enrichCount} × ${this.formatCost(COST_PER_PROFILE)} = ${this.formatCost(enrichCost)}`)
    console.log(`  Total Cost:       ${this.formatCost(totalCost)}`)
    console.log()

    // ETA (if we have total expected)
    if (this.totalExpectedProfiles > 0) {
      console.log('⏱️  ETA:')
      console.log('─────────────────────────────────────────────────────────────')
      console.log(`  Expected Total:   ${this.totalExpectedProfiles}`)
      console.log(`  Remaining:        ${this.totalExpectedProfiles - processed}`)
      console.log(`  ETA:              ${this.calculateETA(processed, this.totalExpectedProfiles, elapsed)}`)
      console.log()
    }

    // Status indicator
    const timeSinceUpdate = now - progressTime.getTime()
    let statusIndicator = '🟢 Active'
    if (timeSinceUpdate > 60000) {
      statusIndicator = '🔴 Stalled'
    } else if (timeSinceUpdate > 30000) {
      statusIndicator = '🟡 Slow'
    }

    console.log(`Status: ${statusIndicator} | Last Update: ${timeSinceUpdate > 1000 ? this.formatTime(timeSinceUpdate) + ' ago' : 'Just now'}`)
    console.log()
    console.log('Press Ctrl+C to stop monitoring')
  }

  async start() {
    console.log('🚀 Starting progress monitor...')
    console.log(`📁 Watching: ${PROGRESS_FILE}`)
    console.log('⏳ Waiting for workflow to start...')
    console.log()

    const interval = setInterval(async () => {
      const progress = await this.readProgress()
      
      if (progress) {
        if (!this.startTime) {
          this.startTime = new Date(progress.timestamp)
        }
        
        this.lastProgress = progress
        this.displayProgress(progress)
      } else if (!this.lastProgress) {
        // Still waiting for first progress update
        process.stdout.write('.')
      }
    }, REFRESH_INTERVAL)

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(interval)
      console.log('\n\n👋 Monitoring stopped')
      process.exit(0)
    })
  }

  async displaySummary() {
    if (!this.lastProgress) {
      console.log('No progress data available')
      return
    }

    console.log('\n\n')
    console.log('╔═══════════════════════════════════════════════════════════════╗')
    console.log('║                     Workflow Summary                          ║')
    console.log('╚═══════════════════════════════════════════════════════════════╝')
    console.log()
    console.log(`Total Processed:  ${this.lastProgress.processed}`)
    console.log(`Total Time:       ${this.formatTime(this.lastProgress.elapsed)}`)
    console.log(`Total Cost:       ${this.formatCost((this.searchCount * COST_PER_SEARCH) + (this.enrichCount * COST_PER_PROFILE))}`)
    console.log()
  }
}

// Main execution
async function main() {
  const monitor = new ProgressMonitor()
  
  // Check for expected profiles argument
  const args = process.argv.slice(2)
  if (args.length > 0) {
    monitor.totalExpectedProfiles = parseInt(args[0])
    console.log(`Expected profiles: ${monitor.totalExpectedProfiles}`)
  }
  
  await monitor.start()
}

main().catch(error => {
  console.error('❌ Monitor failed:', error.message)
  process.exit(1)
})
