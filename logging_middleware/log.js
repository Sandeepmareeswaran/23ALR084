const allowedStacks = new Set(['backend', 'frontend']);
const allowedLevels = new Set(['debug', 'info', 'warn', 'error', 'fatal']);
const backendPackages = new Set([
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'repository',
  'route',
  'service',
]);
const frontendPackages = new Set(['api', 'component', 'hook', 'page', 'state', 'style']);
const sharedPackages = new Set(['auth', 'config', 'middleware', 'utils']);

function validateLogInput({ stack, level, packageName }) {
  if (!allowedStacks.has(stack)) {
    throw new Error('Invalid stack value');
  }
  if (!allowedLevels.has(level)) {
    throw new Error('Invalid level value');
  }

  if (sharedPackages.has(packageName)) {
    return;
  }

  if (stack === 'backend' && backendPackages.has(packageName)) {
    return;
  }

  if (stack === 'frontend' && frontendPackages.has(packageName)) {
    return;
  }

  throw new Error('Invalid package value for stack');
}

async function Log({ stack, level, packageName, message, token, endpoint }) {
  if (!token || !endpoint) {
    return;
  }

  validateLogInput({ stack, level, packageName });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        stack,
        level,
        package: packageName,
        message,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Log request failed: ${response.status} ${body}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  Log,
};
