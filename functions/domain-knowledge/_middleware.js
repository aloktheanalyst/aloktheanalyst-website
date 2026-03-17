// Server-side auth gate for /domain-knowledge routes.
// Blocks unauthenticated users from ever receiving the page content.

import { authGate } from '../_auth-gate.js';

export const onRequest = (context) =>
  authGate(context, {
    title: 'Sign in to access Domain Knowledge',
    subtitle:
      'Deep-dive guides on SaaS funnels, marketing analytics, and real-world domain expertise — free with Google sign-in.',
  });
