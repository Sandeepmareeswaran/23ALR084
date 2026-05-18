# Logging Middleware

This folder contains the reusable `Log` function expected by the evaluation.

## Usage

```js
const { Log } = require('../logging_middleware/log');

await Log({
  stack: 'backend',
  level: 'info',
  packageName: 'service',
  message: 'Backend started',
  token: process.env.LOG_BEARER_TOKEN,
  endpoint: process.env.LOG_API_URL,
});
```

## Allowed values

- stack: `backend`, `frontend`
- level: `debug`, `info`, `warn`, `error`, `fatal`
- package (backend): `cache`, `controller`, `cron_job`, `db`, `domain`, `repository`, `route`, `service`
- package (frontend): `api`, `component`, `hook`, `page`, `state`, `style`
- package (shared): `auth`, `config`, `middleware`, `utils`
