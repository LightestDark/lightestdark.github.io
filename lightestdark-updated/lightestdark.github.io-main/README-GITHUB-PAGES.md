# GitHub Pages Deployment Instructions for Next.js

This project uses Next.js, which does not natively support static export for all features (like dynamic routes or API routes). However, you can export a mostly static version suitable for GitHub Pages if you avoid unsupported features.

## Steps to Deploy to GitHub Pages

1. **Install gh-pages:**
   ```sh
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   Add these scripts:
   ```json
   "scripts": {
     ...existing scripts...
     "export": "next export",
     "deploy": "npm run build && npm run export && gh-pages -d out"
   }
   ```
   And add a `homepage` field:
   ```json
   "homepage": "https://abdul.github.io/website"
   ```

3. **Configure next.config.mjs:**
   Add or update the following:
   ```js
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     basePath: '/website',
     assetPrefix: '/website/',
   };
   export default nextConfig;
   ```

4. **Deploy:**
   ```sh
   npm run deploy
   ```

---

- Your site will be available at: https://abdul.github.io/website
- Make sure your abdul.json CNAME is set to abdul.github.io
- If your repo name is different, adjust `/website` accordingly.
