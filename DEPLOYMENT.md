# Deployment Guide

This guide will help you deploy your LuxeStay hotel application to various platforms.

## Quick Start - Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts and your app will be live!

**Alternative (No CLI):**
- Push code to GitHub
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Vite and deploy

### Option 2: Netlify

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Build and deploy:
```bash
npm run build
netlify deploy --prod
```

**Alternative (Drag & Drop):**
- Run `npm run build`
- Go to [netlify.com/drop](https://app.netlify.com/drop)
- Drag your `dist` folder

### Option 3: GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/your-repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Deploy:
```bash
npm run deploy
```

### Option 4: Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize:
```bash
firebase login
firebase init hosting
```

3. Configure:
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub integration: Optional

4. Deploy:
```bash
npm run build
firebase deploy
```

## Environment Variables (For Production API)

If you switch to a real API, create `.env` file:

```env
VITE_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.example.com
```

Access in code:
```typescript
const API_KEY = import.meta.env.VITE_API_KEY;
```

## Post-Deployment Checklist

- [ ] Test all pages (Home, Hotels, Detail)
- [ ] Test search functionality
- [ ] Check mobile responsiveness
- [ ] Verify all images load
- [ ] Test error states (offline mode)
- [ ] Confirm routing works (refresh on detail page)
- [ ] Share link with review team

## Common Issues

### Blank Page After Deploy
- Check browser console for errors
- Ensure `base` is set correctly in `vite.config.ts`
- For GitHub Pages, set: `base: '/repo-name/'`

### 404 on Refresh
- Configure redirect rules for SPA:
  - **Vercel**: Add `vercel.json`
  - **Netlify**: Add `_redirects` file in public folder
  - **Firebase**: Already configured with `rewrites`

Example `public/_redirects` for Netlify:
```
/*    /index.html   200
```

## Getting Your Deployment URL

After deploying, you'll receive a URL like:
- Vercel: `https://your-app.vercel.app`
- Netlify: `https://your-app.netlify.app`
- GitHub Pages: `https://username.github.io/repo-name`

Share this URL with your instructor for review!

## Performance Tips

- Images are lazy-loaded
- CSS is optimized in production
- React is minified
- All assets are cached

Your Lighthouse score should be excellent! 🚀
