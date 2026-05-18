import api from './api';

const allowedLevels = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const allowedPackages = new Set(['api', 'component', 'hook', 'page', 'state', 'style', 'middleware', 'utils', 'auth', 'config']);

export async function logFrontendEvent({ level = 'info', packageName = 'component', message = 'UI event' }) {
  if (!allowedLevels.has(level) || !allowedPackages.has(packageName)) {
    return;
  }

  try {
    await api.post('/logs/client', {
      level,
      packageName,
      message,
    });
  } catch (err) {
  
    console.warn('Frontend log failed', err?.message || err);
  }
}
