# Checkout Flow - React Project

A complete checkout flow implementation built with React, TypeScript, Redux Toolkit, and Vite.

## Features

- ✅ Step-based checkout flow (Delivery → Payment → Review)
- ✅ Redux state management for checkout data
- ✅ Form validation and error handling
- ✅ Incremental saving of checkout steps
- ✅ Edit mode for completed steps
- ✅ Reusable address form component
- ✅ Gift message support
- ✅ Gift card and credit card payment options
- ✅ Order summary sidebar

## Project Structure

```
src/
├── components/
│   └── Checkout/
│       ├── index.tsx                 # Main checkout component
│       ├── Steps/
│       │   ├── DeliveryStep/         # Delivery step (shipping + gift message)
│       │   ├── PaymentStep/         # Payment step (gift card + credit card + billing)
│       │   └── ReviewStep/          # Review step (final review + place order)
│       └── Shared/
│           └── AddressForm.tsx      # Reusable address form
├── store/
│   ├── index.ts                      # Redux store configuration
│   └── checkoutSlice.ts              # Checkout Redux slice
├── App.tsx                           # Main app component
└── main.tsx                          # Entry point
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

2. Set up Google Places API:
   - Get your API key from [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
   - Enable "Places API" in your Google Cloud project
   - Create a `.env` file in the root directory:
   ```bash
   VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
   ```
   - Note: The address autocomplete will work without the API key, but you'll see a console warning.

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
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

```tsx
import { Provider } from 'react-redux';
import { store } from './store';
import Checkout from './components/Checkout';

function App() {
  return (
    <Provider store={store}>
      <Checkout />
    </Provider>
  );
}
```

### Accessing Checkout State

```tsx
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const { currentStep, delivery, payment, cart } = useSelector(
    (state: RootState) => state.checkout
  );
  
  return <div>Current Step: {currentStep}</div>;
};
```

### Dispatching Actions

```tsx
import { useDispatch } from 'react-redux';
import { saveShippingAddress } from './store/checkoutSlice';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleSave = async (address) => {
    try {
      await dispatch(saveShippingAddress(address)).unwrap();
      // Success!
    } catch (error) {
      // Handle error
    }
  };
};
```

## Technologies Used

- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Vite** - Build tool and dev server
- **React Router** - Routing (optional, for navigation)

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

