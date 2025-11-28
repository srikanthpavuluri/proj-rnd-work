# Next.js Migration Guide

This project has been migrated from Vite + React to Next.js Pages Router.

## Changes Made

### 1. Package Dependencies
- Removed: `vite`, `@vitejs/plugin-react`, `react-router-dom`, `react-redux`, `@reduxjs/toolkit`
- Added: `next` (v14.0.0)
- Updated: TypeScript and ESLint configurations for Next.js

### 2. Project Structure
```
refactor/
├── pages/
│   ├── _app.tsx          # App wrapper with CheckoutProvider
│   ├── _document.tsx     # Custom HTML document
│   ├── index.tsx         # Home page (redirects to /checkout)
│   └── checkout.tsx      # Checkout page
├── src/
│   ├── components/       # All React components (unchanged)
│   ├── context/          # Context providers (unchanged)
│   ├── hooks/            # Custom hooks (unchanged)
│   └── utils/            # Utilities (unchanged)
├── next.config.js        # Next.js configuration
├── tsconfig.json         # Updated for Next.js
└── .eslintrc.json        # Next.js ESLint config
```

### 3. Key Changes

#### Routing
- **Before**: Used `react-router-dom` with `BrowserRouter` and `useNavigate`
- **After**: Uses Next.js file-based routing with `useRouter` from `next/router`

#### Entry Point
- **Before**: `src/main.tsx` with `index.html`
- **After**: `pages/_app.tsx` wraps all pages, `pages/index.tsx` is the home route

#### Navigation
- **Before**: `navigate('/path')` from `react-router-dom`
- **After**: `router.push('/path')` from `next/router`

### 4. Removed Files
- `vite.config.ts` - No longer needed
- `index.html` - Next.js generates HTML automatically
- `src/main.tsx` - Replaced by `pages/_app.tsx`
- `tsconfig.node.json` - Not needed for Next.js

### 5. Running the Application

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

The application will be available at `http://localhost:3000`

### 6. Routes

- `/` - Redirects to `/checkout`
- `/checkout` - Main checkout flow page

### 7. Notes

- All components remain in `src/components/` directory
- Context API setup is maintained in `src/context/CheckoutContext.tsx`
- Mock API initialization happens in `pages/_app.tsx`
- All styling and component logic remains unchanged

