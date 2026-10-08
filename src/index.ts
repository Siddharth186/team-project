/**
 * NEXUS AI — Member 2: Information Intelligence Engine
 * Main Entrypoint & Public Exports
 */

export type * from './models/types.ts';
export * from './normalization/index.ts';
export * from './entity_resolution/entity_resolver.ts';
export * from './fact_linking/fact_linker.ts';
export * from './contradiction/contradiction_engine.ts';
export * from './missing_info/missing_info_engine.ts';
export * from './temporal/temporal_engine.ts';
export * from './evidence/evidence_engine.ts';
export * from './confidence/confidence_engine.ts';
export * from './intelligence_pipeline.ts';
export * from './api/server.ts';

import { IntelligenceServer } from './api/server.ts';

// If run directly via node: start REST server
const isDirectRun = process.argv[1] && (process.argv[1].endsWith('index.ts') || process.argv[1].endsWith('index.js'));
if (isDirectRun) {
  const port = parseInt(process.env.PORT || '3002', 10);
  const server = new IntelligenceServer();
  server.start(port).then(() => {
    console.log(`[NEXUS AI Member 2] Information Intelligence Engine REST API listening on http://localhost:${port}`);
    console.log(`[NEXUS AI Member 2] Available endpoints:`);
    console.log(`  - POST /api/v1/intelligence/process`);
    console.log(`  - GET  /api/v1/intelligence/:case_id`);
    console.log(`  - GET  /api/v1/findings?case_id=...&type=...`);
    console.log(`  - GET  /api/v1/evidence/:finding_id`);
    console.log(`  - GET  /api/v1/timeline/:entity_id`);
    console.log(`  - GET  /api/v1/health`);
  }).catch(err => {
    console.error('Failed to start Intelligence Engine server:', err);
  });
}
