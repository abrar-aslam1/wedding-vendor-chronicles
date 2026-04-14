/**
 * Pipeline Logger
 * Structured logging with run tracking for the pipeline.
 */

export class PipelineLogger {
  constructor(runId) {
    this.runId = runId;
    this.logs = [];
    this.startTime = Date.now();
  }

  _format(level, message, data) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const entry = {
      timestamp: new Date().toISOString(),
      elapsed: `${elapsed}s`,
      level,
      runId: this.runId,
      message,
      ...(data ? { data } : {})
    };
    this.logs.push(entry);
    const prefix = { info: 'ℹ️', warn: '⚠️', error: '❌', success: '✅', debug: '🔍' }[level] || '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    console.log(`[${elapsed}s] ${prefix} ${message}${dataStr}`);
    return entry;
  }

  info(msg, data) { return this._format('info', msg, data); }
  warn(msg, data) { return this._format('warn', msg, data); }
  error(msg, data) { return this._format('error', msg, data); }
  success(msg, data) { return this._format('success', msg, data); }
  debug(msg, data) { return this._format('debug', msg, data); }

  getFullLog() {
    return this.logs.map(l => `[${l.elapsed}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
  }

  getSummary() {
    const errors = this.logs.filter(l => l.level === 'error');
    const warns = this.logs.filter(l => l.level === 'warn');
    return {
      runId: this.runId,
      duration: `${((Date.now() - this.startTime) / 1000).toFixed(1)}s`,
      totalLogs: this.logs.length,
      errors: errors.length,
      warnings: warns.length
    };
  }
}
