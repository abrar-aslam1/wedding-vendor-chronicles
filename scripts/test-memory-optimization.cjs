#!/usr/bin/env node

/**
 * Test script for memory optimization
 * Tests the enhanced workflow with different batch sizes
 */

const fs = require('fs').promises
const { spawn } = require('child_process')

const TEST_SCENARIOS = [
  {
    name: 'Small Batch (10 profiles)',
    env: {
      TIER: '1',
      MAX_ENRICH: '10',
      LIMIT_PER_ROW: '10'
    },
    expectedMemory: 500, // MB
    timeout: 60000 // 1 minute
  },
  {
    name: 'Medium Batch (50 profiles)',
    env: {
      TIER: '1',
      MAX_ENRICH: '50',
      LIMIT_PER_ROW: '20'
    },
    expectedMemory: 1000, // MB
    timeout: 180000 // 3 minutes
  },
  {
    name: 'Large Batch (100 profiles)',
    env: {
      TIER: '1',
      MAX_ENRICH: '100',
      LIMIT_PER_ROW: '40'
    },
    expectedMemory: 1500, // MB
    timeout: 300000 // 5 minutes
  }
]

class MemoryTester {
  constructor() {
    this.results = []
  }

  async runTest(scenario) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🧪 Testing: ${scenario.name}`)
    console.log(`${'='.repeat(60)}`)
    console.log(`Expected max memory: ${scenario.expectedMemory}MB`)
    console.log(`Timeout: ${scenario.timeout / 1000}s`)
    console.log()

    const startTime = Date.now()
    let maxMemory = 0
    let success = false
    let error = null

    try {
      // Spawn the workflow with --expose-gc flag for manual garbage collection
      const child = spawn('node', [
        '--expose-gc',
        'automations/lib/yaml-runner.js',
        'automations/ig/backfill-tier.yml'
      ], {
        env: {
          ...process.env,
          ...scenario.env
        },
        stdio: ['inherit', 'pipe', 'pipe']
      })

      // Monitor memory usage
      const memoryInterval = setInterval(() => {
        try {
          const memUsage = process.memoryUsage()
          const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
          
          if (heapUsedMB > maxMemory) {
            maxMemory = heapUsedMB
          }

          process.stdout.write(`\r💾 Current memory: ${heapUsedMB}MB | Peak: ${maxMemory}MB`)
        } catch (err) {
          // Ignore errors during monitoring
        }
      }, 1000)

      // Set timeout
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM')
        error = new Error(`Test timed out after ${scenario.timeout / 1000}s`)
      }, scenario.timeout)

      // Wait for completion
      await new Promise((resolve, reject) => {
        let stdout = ''
        let stderr = ''

        child.stdout.on('data', (data) => {
          stdout += data.toString()
          process.stdout.write(data)
        })

        child.stderr.on('data', (data) => {
          stderr += data.toString()
          process.stderr.write(data)
        })

        child.on('close', (code) => {
          clearInterval(memoryInterval)
          clearTimeout(timeoutId)
          
          if (code === 0) {
            success = true
            resolve()
          } else {
            error = new Error(`Process exited with code ${code}`)
            reject(error)
          }
        })

        child.on('error', (err) => {
          clearInterval(memoryInterval)
          clearTimeout(timeoutId)
          error = err
          reject(err)
        })
      })

    } catch (err) {
      error = err
      success = false
    }

    const elapsed = Date.now() - startTime

    const result = {
      scenario: scenario.name,
      success,
      maxMemory,
      expectedMemory: scenario.expectedMemory,
      elapsed,
      error: error ? error.message : null,
      memoryOverrun: maxMemory > scenario.expectedMemory
    }

    this.results.push(result)

    console.log()
    console.log(`\n${'─'.repeat(60)}`)
    console.log(`✅ Test completed`)
    console.log(`   Success: ${success ? '✅ Yes' : '❌ No'}`)
    console.log(`   Peak Memory: ${maxMemory}MB / ${scenario.expectedMemory}MB`)
    console.log(`   Memory Status: ${result.memoryOverrun ? '⚠️  Exceeded' : '✅ Within limit'}`)
    console.log(`   Time: ${(elapsed / 1000).toFixed(1)}s`)
    if (error) {
      console.log(`   Error: ${error.message}`)
    }
    console.log(`${'─'.repeat(60)}`)

    return result
  }

  async runAllTests() {
    console.log('╔═══════════════════════════════════════════════════════════════╗')
    console.log('║         Memory Optimization Test Suite                       ║')
    console.log('╚═══════════════════════════════════════════════════════════════╝')
    console.log()
    console.log(`Running ${TEST_SCENARIOS.length} test scenarios...`)
    
    for (const scenario of TEST_SCENARIOS) {
      await this.runTest(scenario)
      
      // Wait between tests to let memory settle
      console.log('\n⏳ Waiting 5 seconds before next test...\n')
      await new Promise(resolve => setTimeout(resolve, 5000))
    }

    this.displaySummary()
  }

  displaySummary() {
    console.log('\n\n')
    console.log('╔═══════════════════════════════════════════════════════════════╗')
    console.log('║                    Test Summary                               ║')
    console.log('╚═══════════════════════════════════════════════════════════════╝')
    console.log()

    const passed = this.results.filter(r => r.success && !r.memoryOverrun).length
    const failed = this.results.length - passed

    console.log(`Total Tests:    ${this.results.length}`)
    console.log(`Passed:         ${passed} ✅`)
    console.log(`Failed:         ${failed} ${failed > 0 ? '❌' : ''}`)
    console.log()

    console.log('Detailed Results:')
    console.log('─────────────────────────────────────────────────────────────')

    this.results.forEach((result, index) => {
      const status = result.success && !result.memoryOverrun ? '✅' : '❌'
      console.log(`\n${index + 1}. ${result.scenario} ${status}`)
      console.log(`   Peak Memory:  ${result.maxMemory}MB / ${result.expectedMemory}MB`)
      console.log(`   Time:         ${(result.elapsed / 1000).toFixed(1)}s`)
      if (result.error) {
        console.log(`   Error:        ${result.error}`)
      }
    })

    console.log()
    console.log('─────────────────────────────────────────────────────────────')
    
    if (passed === this.results.length) {
      console.log('✅ All tests passed! Memory optimization is working correctly.')
    } else {
      console.log('⚠️  Some tests failed. Review the results above.')
    }

    console.log()
  }

  async saveResults() {
    const resultsFile = 'workflow-test-results.json'
    
    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success && !r.memoryOverrun).length,
        failed: this.results.filter(r => !r.success || r.memoryOverrun).length
      },
      results: this.results
    }

    await fs.writeFile(resultsFile, JSON.stringify(output, null, 2))
    console.log(`📄 Results saved to: ${resultsFile}`)
  }
}

// Main execution
async function main() {
  const tester = new MemoryTester()
  
  try {
    await tester.runAllTests()
    await tester.saveResults()
    
    const allPassed = tester.results.every(r => r.success && !r.memoryOverrun)
    process.exit(allPassed ? 0 : 1)
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    process.exit(1)
  }
}

main()
