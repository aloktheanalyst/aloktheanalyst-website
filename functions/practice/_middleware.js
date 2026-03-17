// Server-side auth gate for /practice routes.
// Blocks unauthenticated users from ever receiving the page content.

import { authGate } from '../_auth-gate.js';

export const onRequest = (context) =>
  authGate(context, {
    title: 'Sign in to Practice',
    subtitle:
      'Access AI-powered case study coaching, RCA frameworks, and mock interviews — free with Google sign-in.',
  });
