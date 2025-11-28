# Project Structure

## Next.js Project Setup

Your checkout flow is now set up as a Next.js (Pages Router) project with the following structure:

```
refactor/
├── pages/
│   ├── _app.tsx                              # Next.js app wrapper with providers
│   ├── _document.tsx                         # Custom HTML document
│   ├── index.tsx                             # Home page (redirects to checkout)
│   └── checkout.tsx                          # Checkout page
├── src/
│   ├── components/
│   │   └── Checkout/
│   │       ├── index.tsx                     # Main checkout orchestrator
│   │       ├── Steps/
│   │       │   ├── DeliveryStep/
│   │       │   │   └── index.tsx            # Delivery step component
│   │       │   ├── PaymentStep/
│   │       │   │   └── index.tsx            # Payment step component
│   │       │   └── ReviewStep/
│   │       │       └── index.tsx             # Review step component
│   │       └── Shared/
│   │           ├── AddressForm.tsx           # Reusable address form
│   │           └── SavedAddressSelector.tsx  # Saved address selector
│   ├── context/
│   │   └── CheckoutContext.tsx               # Checkout context provider
│   ├── hooks/
│   │   └── useGooglePlaces.ts                # Google Places autocomplete hook
│   ├── utils/
│   │   └── mockApi.ts                        # Mock API for development
│   ├── App.css                               # App styles
│   └── index.css                             # Global styles
├── next.config.js                            # Next.js configuration
├── package.json                              # Dependencies and scripts
├── tsconfig.json                             # TypeScript configuration
├── .eslintrc.json                            # ESLint configuration
├── .gitignore                                # Git ignore rules
└── README.md                                 # Project documentation
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Key Files

- **`src/main.tsx`** - Application entry point
- **`src/App.tsx`** - Main app component with Redux Provider and Router
- **`src/store/index.ts`** - Redux store setup
- **`src/store/checkoutSlice.ts`** - Checkout state management
- **`src/components/Checkout/index.tsx`** - Main checkout component
- **`vite.config.ts`** - Build tool configuration

## Technologies

- React 18
- TypeScript
- Redux Toolkit
- Vite
- React Router DOM

## Next Steps

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Customize styles in `src/App.css` or create separate CSS files
4. Set up your API endpoints (currently pointing to `/api/*`)
5. Add routing if needed for order confirmation page

