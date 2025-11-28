# Checkout Flow - Next.js Project

A complete checkout flow implementation built with Next.js (Pages Router), React, TypeScript, and Context API.

## Features

- ✅ Step-based checkout flow (Delivery → Payment → Review)
- ✅ Context API state management for checkout data
- ✅ Form validation and error handling
- ✅ Incremental saving of checkout steps
- ✅ Edit mode for completed steps
- ✅ Reusable address form component
- ✅ Gift message support
- ✅ Gift card and credit card payment options
- ✅ Order summary sidebar
- ✅ Saved addresses for logged-in users
- ✅ Google Places API integration (with mock data)

## Project Structure

```
refactor/
├── pages/
│   ├── _app.tsx                      # Next.js app wrapper with providers
│   ├── _document.tsx                 # Custom HTML document
│   ├── index.tsx                     # Home page (redirects to checkout)
│   └── checkout.tsx                  # Checkout page
├── src/
│   ├── components/
│   │   └── Checkout/
│   │       ├── index.tsx             # Main checkout component
│   │       ├── Steps/
│   │       │   ├── DeliveryStep/    # Delivery step (shipping + gift message)
│   │       │   ├── PaymentStep/     # Payment step (gift card + credit card + billing)
│   │       │   └── ReviewStep/      # Review step (final review + place order)
│   │       └── Shared/
│   │           ├── AddressForm.tsx  # Reusable address form
│   │           └── SavedAddressSelector.tsx  # Saved address selector
│   ├── context/
│   │   └── CheckoutContext.tsx      # Checkout context provider
│   ├── hooks/
│   │   └── useGooglePlaces.ts       # Google Places autocomplete hook
│   └── utils/
│       └── mockApi.ts                # Mock API for development
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Google Places API Key (for address autocomplete)

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Set up Google Places API (optional):
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Enable "Places API" in your Google Cloud project
   - Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```
   - Note: The address autocomplete works with mock data by default, so the API key is optional.

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `.next` directory.

### Start Production Server

```bash
npm start
# or
yarn start
# or
pnpm start
```

## API Endpoints

The checkout flow expects the following API endpoints:

- `GET /api/cart` - Fetch cart data
- `POST /api/checkout/shipping-address` - Save shipping address
- `POST /api/checkout/gift-message` - Save gift message
- `DELETE /api/checkout/gift-message` - Remove gift message
- `POST /api/checkout/gift-card` - Apply gift card
- `DELETE /api/checkout/gift-card/:paymentId` - Remove gift card
- `POST /api/checkout/credit-card` - Save credit card
- `POST /api/checkout/billing-address` - Save billing address
- `POST /api/checkout/place-order` - Place order

## Usage

### Basic Setup

The checkout flow is already set up in `pages/checkout.tsx`. The `CheckoutProvider` is configured in `pages/_app.tsx` to wrap all pages.

### Accessing Checkout State

```tsx
import { useCheckout } from '../context/CheckoutContext';

const MyComponent = () => {
  const { state } = useCheckout();
  const { currentStep, delivery, payment, cart } = state;
  
  return <div>Current Step: {currentStep}</div>;
};
```

### Dispatching Actions

```tsx
import { useCheckout } from '../context/CheckoutContext';

const MyComponent = () => {
  const { saveShippingAddress } = useCheckout();
  
  const handleSave = async (address) => {
    try {
      await saveShippingAddress(address);
      // Success!
    } catch (error) {
      // Handle error
    }
  };
};
```

## Technologies Used

- **Next.js 14** - React framework with Pages Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Context API** - State management
- **Next.js Router** - Built-in routing

## Development

### Linting

```bash
npm run lint
```

### Type Checking

TypeScript type checking is integrated into the build process. Run:

```bash
npm run build
```

## License

MIT

