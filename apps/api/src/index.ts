import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ELEMENT_TYPES } from '@monster-proto/shared';

const app = new Hono();

app.use('*', cors());

app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    game: 'Monster Proto',
    supportedTypes: ELEMENT_TYPES,
    timestamp: new Date().toISOString()
  });
});

export default app;
