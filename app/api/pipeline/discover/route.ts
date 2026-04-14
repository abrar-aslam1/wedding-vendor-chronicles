import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/pipeline/discover
 *
 * On-demand trigger for the Instagram vendor discovery pipeline.
 * Spawns the pipeline as a background child process and returns immediately.
 *
 * Body (all optional):
 *   { city, state, category, tier, dryRun, limit }
 *
 * Auth: requires X-Ingest-Key header matching INGEST_SHARED_KEY env var.
 */
export async function POST(req: NextRequest) {
  // Auth check
  const ingestKey = req.headers.get('x-ingest-key');
  const expectedKey = process.env.INGEST_SHARED_KEY;

  if (!expectedKey || ingestKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { city, state, category, tier, dryRun, limit } = body as {
      city?: string;
      state?: string;
      category?: string;
      tier?: number;
      dryRun?: boolean;
      limit?: number;
    };

    const runId = `api-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Build CLI args for the pipeline script
    const args: string[] = [];
    if (city) args.push('--city', city);
    if (state) args.push('--state', state);
    if (category) args.push('--category', category);
    if (tier) args.push('--tier', String(tier));
    if (dryRun) args.push('--dry-run');
    if (limit) args.push('--limit', String(limit));

    // Record the run start in Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('pipeline_runs').insert({
        id: runId,
        status: 'queued',
        trigger_type: 'api',
        config: { city, state, category, tier, dryRun, limit }
      });
    }

    // Spawn the pipeline as a detached child process
    // This runs in the background — the API returns immediately
    const { spawn } = await import('child_process');
    const child = spawn(
      'node',
      ['scripts/pipeline/run-pipeline.js', ...args],
      {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore',
        env: { ...process.env }
      }
    );
    child.unref();

    return NextResponse.json({
      success: true,
      runId,
      message: 'Pipeline started in background',
      args
    });
  } catch (err) {
    console.error('Pipeline trigger error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pipeline/discover?runId=xxx
 *
 * Check the status of a pipeline run.
 */
export async function GET(req: NextRequest) {
  const ingestKey = req.headers.get('x-ingest-key');
  const expectedKey = process.env.INGEST_SHARED_KEY;

  if (!expectedKey || ingestKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const runId = req.nextUrl.searchParams.get('runId');

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  if (runId) {
    const { data, error } = await supabase
      .from('pipeline_runs')
      .select('*')
      .eq('id', runId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  }

  // List recent runs
  const { data, error } = await supabase
    .from('pipeline_runs')
    .select('id, started_at, completed_at, status, trigger_type, config, stats')
    .order('started_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ runs: data });
}
