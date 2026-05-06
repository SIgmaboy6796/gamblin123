# Hosting Options for Socket.io Apps

Since Vercel's serverless architecture causes lag with Socket.io, and Railway/Render have limitations, here are better alternatives:

## Free Tier Options with Persistent Connections

### 1. Fly.io (Best Free Option)
- **Free tier**: 3 small VMs (shared CPU, 256 MB RAM each)
- **Pros**: Persistent VMs, great for WebSockets, global edge locations
- **Cons**: Requires credit‑card verification (no charge)

**Deploy steps**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

### 2. Koyeb (No Credit Card Needed)
- **Free tier**: Nano instances with 512 MB RAM
- **Pros**: No credit‑card required, Docker support, global edge
- **Cons**: Limited resources, may not handle many concurrent users

### 3. Oracle Cloud Free Tier (Most Generous)
- **Free tier**: Always‑free ARM VM (4 ARM cores, 24 GB RAM)
- **Pros**: Extremely generous resources, completely free
- **Cons**: Complex setup, requires credit‑card verification

## Why Vercel Doesn't Work Well

Vercel’s serverless architecture is fundamentally incompatible with Socket.io:
- **No persistent connections** – functions spin down after 10 seconds
- **No WebSocket support** – each request may hit a different instance, breaking rooms
- **Cold starts** – added latency for every new connection
- **Timeouts** – long‑lived connections are cut off

If you must use Vercel, you can force polling (much slower) and accept degraded performance:
```javascript
// In public/client.js
const socket = io({
  transports: ['polling'],
  upgrade: false
});
```
Even with polling, Vercel’s 10‑second timeout will cause issues for long‑running games.

## Recommended Approach (No Credit Card)

Since you don't want to use a credit card, **Koyeb** is your best option:

### Koyeb (Best Free Option – No Credit Card)
1. Go to https://www.koyeb.com and sign up with GitHub
2. Create a new app → select your GitHub repo
3. Configure:
   - **Build command**: `npm install`
   - **Run command**: `node server.js`
4. Click Deploy!

Your app will be live at `https://your-app-name.koyeb.app`

### Alternative: Fly.io (Requires Credit Card)
If you change your mind, Fly.io offers persistent VMs:
- Sign up at https://fly.io (credit card required for verification)
- Run: `fly launch` then `fly deploy`
- Your app will be at `https://your-app.fly.dev`

### Quick Local Test (Easiest)
1. Run the server locally: `node server.js`
2. Expose it with ngrok:
   ```bash
   # Install ngrok (Windows)
   choco install ngrok   # or download from https://ngrok.com

   # Start your server
   node server.js

   # In another terminal
   ngrok http 3000
   ```
3. Share the ngrok URL (e.g., `https://abc123.ngrok.io`) with friends to test multiplayer instantly.

## Testing Locally with Friends

1. Open a terminal, run `node server.js`
2. Open another terminal, run `ngrok http 3000`
3. Share the generated ngrok URL with anyone you want to join
4. Open the URL in multiple browsers/tabs – you’ll see real‑time chat, player counts, and table interactions working perfectly.
