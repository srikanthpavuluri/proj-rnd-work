// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { CheckoutProvider } from '../context/CheckoutContext';
import '../index.css';
import '../App.css';
// Initialize mock API (sets up window.mockApi for browser console access)
import '../utils/mockApi';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CheckoutProvider>
      <Component {...pageProps} />
    </CheckoutProvider>
  );
}

