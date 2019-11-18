#### koa-csrf-playground

### How to play

```bash
# Install dependencies
npm i

# Run server
npm start

# Open example page (SSR version)
open http://localhost:3000

# Open example page (SPA Version)
open http://localhost:3000
```

### How to test CSRF

```bash
# Start server with CSRF attack content.
npm run startm

# Add these records to `/etc/hosts` (for simulate attack from other domain)
sudo echo "127.0.0.1 example.local" >> /etc/hosts

# Toggle CSRF protection of root/index.js, and see what happens with(or without) CSRF protection.
# Open malicious-site
open http://example.local:4000/spa
```
