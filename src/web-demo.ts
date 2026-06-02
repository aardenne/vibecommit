import fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Start the web demo server
 */
export function startWebServer(port: number = 3000): void {
  const server = fastify({ logger: true });

  // Serve static files from web/ directory
  server.register(async (instance, options) => {
    instance.register(import('@fastify/static'), {
      root: path.join(__dirname, '..', 'web'),
      prefix: '/',
    });
  });

  // API endpoint for commit message generation
  server.post('/api/generate', async (request, reply) => {
    const { diff, vibe, lang } = request.body as { diff: string; vibe: string; lang: string };
    
    if (!diff) {
      return reply.status(400).send({ error: 'Diff is required' });
    }

    try {
      const { generateCommitMessage } = await import('./vibe-generator');
      const message = await generateCommitMessage(diff, vibe || 'professional', lang || 'en');
      return { message };
    } catch (error) {
      return reply.status(500).send({ error: error instanceof Error ? error.message : 'Failed to generate message' });
    }
  });

  // Health check
  server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  server.listen({ port, host: '0.0.0.0' }, (err) => {
    if (err) {
      console.error('❌ Error starting server:', err);
      process.exit(1);
    } else {
      console.log(`🌐 Web demo server running at http://localhost:${port}`);
    }
  });
}
