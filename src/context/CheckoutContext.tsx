// context/CheckoutContext.tsx
import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { mockFetch } from '../utils/mockApi';
import { GTMService } from '../utils/gtm';

// Types
interface ShippingAddress {
  firstName: string;
  lastName: string;
  streetName: string;
  additionalStreetInfo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  company?: string;
}

interface GiftMessage {
  giftMessage: string;
  giftSenderName: string;
  giftReceiverName: string;
}

interface GiftCardPayment {
  cardNumber: string;
  pin: string;
  amount: number;
}

interface GiftCardData {
  id?: string;
  last4Digits: string;
  appliedAmount: number;
}

interface CreditCardPaymentInput {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
}

interface CreditCardPayment {
  cardType: string;
  last4Digits: string;
  expirationMonth: string;
  expirationYear: string;
  cardHolderName: string;
}

interface BillingAddress extends ShippingAddress {
  billingSameAsShipping: boolean;
}

interface CheckoutState {
  currentStep: 1 | 2 | 3;
  delivery: {
    shippingAddress: ShippingAddress | null;
    giftMessage: GiftMessage | null;
    isComplete: boolean;
    isEditing: boolean;
  };
  payment: {
    giftCard: GiftCardData | null;
    creditCard: CreditCardPayment | null;
    billingAddress: BillingAddress | null;
    isComplete: boolean;
    isEditing: boolean;
  };
  cart: any;
  loading: {
    shippingAddress: boolean;
    giftMessage: boolean;
    giftCard: boolean;
    creditCard: boolean;
    billingAddress: boolean;
  };
  errors: {
    shippingAddress: string | null;
    giftMessage: string | null;
    giftCard: string | null;
    creditCard: string | null;
    billingAddress: string | null;
  };
}

// Mock cart data for development
const getMockCart = () => ({
  id: 'e3010dc9-16f8-4fdb-980d-6d43a71d2406',
  cartNumber: 67376322,
  cartState: 'Active',
  orderNumber: null,
  orderDate: '11/23/2025',
  customerId: null,
  customerEmail: 'TEST@TEST.COM',
  anonymousId: 'c84bcbb7a91a4212a796dcd737003e811763859319147',
  lineItemCount: 1,
  billingSameAsShipping: false,
  displayGiftCardPayment: true,
  lineItems: [
    {
      id: '838bdad0-81b5-47fa-ac63-97a62c1c2f41',
      productId: 'ba1a7e00-fdc2-4183-9d1c-59926759bae2',
      productKey: 'DA4912-81144715',
      name: 'Whimsical Pre-Lit Christmas Tree - 5 ft',
      productSlug: 'DA4912-81144715',
      variant: {
        id: 1,
        sku: '5961339',
        key: '81144715',
        imageSet: 'https://cdn.media.amplience.net/s/hobbylobby/5961339-81144715-09192025-IMGSET',
        attributes: {
          excludeFreeShipping: true,
        },
      },
      originalPricePerQuantity: 139.98,
      discountedPricePerQuantity: 69.99,
      totalPrice: 69.99,
      quantity: 1,
    },
  ],
  totalLineItemQuantity: 1,
  inventoryMessages: null,
  giftOrder: false,
  giftMessage: null,
  orderSummary: {
    merchandisePrice: 139.98,
    merchandiseDiscount: 69.99,
    merchandiseSubTotal: 69.99,
    standardShipping: 12.95,
    shippingDiscount: 0,
    additionalShipping: 0,
    carrierSurCharge: 0,
    shippingSubTotal: 18.99,
    totalPrice: 88.98,
    totalSaved: 69.99,
    totalTax: 6.04,
    giftCardProcessingFee: 0,
    isGCCoversFullPayment: false,
    retailDeliveryFee: 0,
    retailDeliveryFeeLabel: '',
  },
  cartSubTotalForFreeShippingEligibleItems: 0,
  shippingAddress: {
    "key": "home",
    "id": null,
    "firstName": "Test",
    "lastName": "t",
    "streetName": "1113 NW 103rd St",
    "additionalStreetInfo": "",
    "postalCode": "73114-5001",
    "city": "Oklahoma City",
    "state": "OK",
    "country": "US",
    "phone": "(312) 312-3121",
    "email": "TEST@TEST.COM",
    "company": null,
    "billingAddress": null,
    "shippingAddress": null,
    "defaultBillingAddress": null,
    "defaultShippingAddress": null,
    "__typename": "CartAddress"
  },
  billingAddress: null,
  paymentDetails: {
    cardHolderName: null,
    maskedNumber: null,
    last4Digits: null,
    expirationMonth: null,
    expirationYear: null,
    cardType: null,
    paymentMethod: '',
    amount: null,
    paymentClassification: {
      applePay: null,
      paypal: null,
      giftCard: null,
      creditCard: null,
    },
  },
});

// Initial State
const initialCheckoutState: CheckoutState = {
  currentStep: 1,
  delivery: {
    shippingAddress: null,
    giftMessage: null,
    isComplete: false,
    isEditing: false,
  },
  payment: {
    giftCard: null,
    creditCard: null,
    billingAddress: null,
    isComplete: false,
    isEditing: false,
  },
  cart: null,
  loading: {
    shippingAddress: false,
    giftMessage: false,
    giftCard: false,
    creditCard: false,
    billingAddress: false,
  },
  errors: {
    shippingAddress: null,
    giftMessage: null,
    giftCard: null,
    creditCard: null,
    billingAddress: null,
  },
};

// Action Types
type CheckoutAction =
  | { type: 'SET_CURRENT_STEP'; payload: 1 | 2 | 3 }
  | { type: 'SET_DELIVERY_EDITING'; payload: boolean }
  | { type: 'SET_PAYMENT_EDITING'; payload: boolean }
  | { type: 'COMPLETE_DELIVERY_STEP' }
  | { type: 'COMPLETE_PAYMENT_STEP' }
  | { type: 'RESET_CHECKOUT' }
  | { type: 'SAVE_SHIPPING_ADDRESS_PENDING' }
  | { type: 'SAVE_SHIPPING_ADDRESS_SUCCESS'; payload: any }
  | { type: 'SAVE_SHIPPING_ADDRESS_ERROR'; payload: string }
  | { type: 'SAVE_GIFT_MESSAGE_PENDING' }
  | { type: 'SAVE_GIFT_MESSAGE_SUCCESS'; payload: any }
  | { type: 'SAVE_GIFT_MESSAGE_ERROR'; payload: string }
  | { type: 'REMOVE_GIFT_MESSAGE_SUCCESS'; payload: any }
  | { type: 'SAVE_GIFT_CARD_PENDING' }
  | { type: 'SAVE_GIFT_CARD_SUCCESS'; payload: any }
  | { type: 'SAVE_GIFT_CARD_ERROR'; payload: string }
  | { type: 'REMOVE_GIFT_CARD_SUCCESS'; payload: any }
  | { type: 'SAVE_CREDIT_CARD_PENDING' }
  | { type: 'SAVE_CREDIT_CARD_SUCCESS'; payload: any }
  | { type: 'SAVE_CREDIT_CARD_ERROR'; payload: string }
  | { type: 'SAVE_BILLING_ADDRESS_PENDING' }
  | { type: 'SAVE_BILLING_ADDRESS_SUCCESS'; payload: any }
  | { type: 'SAVE_BILLING_ADDRESS_ERROR'; payload: string }
  | { type: 'FETCH_CART_PENDING' }
  | { type: 'FETCH_CART_SUCCESS'; payload: any }
  | { type: 'FETCH_CART_ERROR'; payload: string };

// Reducer (following the pattern from images)
const CheckoutReducer = (state = initialCheckoutState, action: CheckoutAction): CheckoutState => {
  let currState = state;

  switch (action.type) {
    case 'SET_CURRENT_STEP':
      currState = { ...currState, currentStep: action.payload };
      break;

    case 'SET_DELIVERY_EDITING':
      currState = {
        ...currState,
        delivery: {
          ...currState.delivery,
          isEditing: action.payload,
        },
        currentStep: action.payload ? 1 : currState.currentStep,
      };
      break;

    case 'SET_PAYMENT_EDITING':
      currState = {
        ...currState,
        payment: {
          ...currState.payment,
          isEditing: action.payload,
        },
        currentStep: action.payload ? 2 : currState.currentStep,
      };
      break;

    case 'COMPLETE_DELIVERY_STEP':
      if (currState.delivery.shippingAddress) {
        currState = {
          ...currState,
          delivery: {
            ...currState.delivery,
            isComplete: true,
            isEditing: false,
          },
          currentStep: 2,
        };
      }
      break;

    case 'COMPLETE_PAYMENT_STEP':
      if (
        currState.payment.billingAddress &&
        (currState.payment.creditCard || currState.payment.giftCard)
      ) {
        currState = {
          ...currState,
          payment: {
            ...currState.payment,
            isComplete: true,
            isEditing: false,
          },
          currentStep: 3,
        };
      }
      break;

    case 'RESET_CHECKOUT':
      return initialCheckoutState;

    // Shipping Address
    case 'SAVE_SHIPPING_ADDRESS_PENDING':
      currState = {
        ...currState,
        loading: { ...currState.loading, shippingAddress: true },
        errors: { ...currState.errors, shippingAddress: null },
      };
      break;

    case 'SAVE_SHIPPING_ADDRESS_SUCCESS':
      currState = {
        ...currState,
        loading: { ...currState.loading, shippingAddress: false },
        delivery: {
          ...currState.delivery,
          shippingAddress: action.payload.shippingAddress,
        },
        cart: action.payload,
      };
      break;

    case 'SAVE_SHIPPING_ADDRESS_ERROR':
      currState = {
        ...currState,
        loading: { ...currState.loading, shippingAddress: false },
        errors: { ...currState.errors, shippingAddress: action.payload },
      };
      break;

    // Gift Message
    case 'SAVE_GIFT_MESSAGE_PENDING':
      currState = {
        ...currState,
        loading: { ...currState.loading, giftMessage: true },
        errors: { ...currState.errors, giftMessage: null },
      };
      break;

    case 'SAVE_GIFT_MESSAGE_SUCCESS':
      currState = {
        ...currState,
        loading: { ...currState.loading, giftMessage: false },
        delivery: {
          ...currState.delivery,
          giftMessage: action.payload.giftMessage,
        },
        cart: action.payload,
      };
      break;

    case 'SAVE_GIFT_MESSAGE_ERROR':
      currState = {
        ...currState,
        loading: { ...currState.loading, giftMessage: false },
        errors: { ...currState.errors, giftMessage: action.payload },
      };
      break;

    case 'REMOVE_GIFT_MESSAGE_SUCCESS':
      currState = {
        ...currState,
        delivery: {
          ...currState.delivery,
          giftMessage: null,
        },
        cart: action.payload,
      };
      break;

    // Gift Card
    case 'SAVE_GIFT_CARD_PENDING':
      currState = {
        ...currState,
        loading: { ...currState.loading, giftCard: true },
        errors: { ...currState.errors, giftCard: null },
      };
      break;

    case 'SAVE_GIFT_CARD_SUCCESS':
      const giftCard =
        action.payload.paymentDetails?.paymentClassification?.giftCard ||
        action.payload.paymentDetails?.giftCard;
      currState = {
        ...currState,
        loading: { ...currState.loading, giftCard: false },
        payment: {
          ...currState.payment,
          giftCard: giftCard
            ? {
                id: giftCard.id || '',
                last4Digits:
                  giftCard.last4Digits ||
                  action.payload.paymentDetails?.last4Digits ||
                  '',
                appliedAmount: giftCard.appliedAmount || giftCard.amount || 0,
              }
            : currState.payment.giftCard,
        },
        cart: action.payload,
      };
      break;

    case 'SAVE_GIFT_CARD_ERROR':
      currState = {
        ...currState,
        loading: { ...currState.loading, giftCard: false },
        errors: { ...currState.errors, giftCard: action.payload },
      };
      break;

    case 'REMOVE_GIFT_CARD_SUCCESS':
      currState = {
        ...currState,
        payment: {
          ...currState.payment,
          giftCard: null,
        },
        cart: action.payload,
      };
      break;

    // Credit Card
    case 'SAVE_CREDIT_CARD_PENDING':
      currState = {
        ...currState,
        loading: { ...currState.loading, creditCard: true },
        errors: { ...currState.errors, creditCard: null },
      };
      break;

    case 'SAVE_CREDIT_CARD_SUCCESS':
      const paymentDetails = action.payload.paymentDetails;
      currState = {
        ...currState,
        loading: { ...currState.loading, creditCard: false },
        payment: {
          ...currState.payment,
          creditCard: paymentDetails
            ? {
                cardType: paymentDetails.cardType || '',
                last4Digits: paymentDetails.last4Digits || '',
                expirationMonth: paymentDetails.expirationMonth || '',
                expirationYear: paymentDetails.expirationYear || '',
                cardHolderName: paymentDetails.cardHolderName || '',
              }
            : currState.payment.creditCard,
        },
        cart: action.payload,
      };
      break;

    case 'SAVE_CREDIT_CARD_ERROR':
      currState = {
        ...currState,
        loading: { ...currState.loading, creditCard: false },
        errors: { ...currState.errors, creditCard: action.payload },
      };
      break;

    // Billing Address
    case 'SAVE_BILLING_ADDRESS_PENDING':
      currState = {
        ...currState,
        loading: { ...currState.loading, billingAddress: true },
        errors: { ...currState.errors, billingAddress: null },
      };
      break;

    case 'SAVE_BILLING_ADDRESS_SUCCESS':
      currState = {
        ...currState,
        loading: { ...currState.loading, billingAddress: false },
        payment: {
          ...currState.payment,
          billingAddress: action.payload.billingAddress,
        },
        cart: action.payload,
      };
      break;

    case 'SAVE_BILLING_ADDRESS_ERROR':
      currState = {
        ...currState,
        loading: { ...currState.loading, billingAddress: false },
        errors: { ...currState.errors, billingAddress: action.payload },
      };
      break;

    // Cart
    case 'FETCH_CART_PENDING':
      // Keep existing cart while loading
      break;

    case 'FETCH_CART_SUCCESS':
      const cart = action.payload;
      const newState = {
        ...currState,
        cart,
      };

      // Hydrate from cart if data exists
      if (cart.shippingAddress) {
        newState.delivery.shippingAddress = cart.shippingAddress;
        // Mark delivery as complete if shipping address exists
        newState.delivery.isComplete = true;
      }
      if (cart.giftMessage) {
        newState.delivery.giftMessage = cart.giftMessage;
      }
      if (cart.billingAddress) {
        newState.payment.billingAddress = {
          ...cart.billingAddress,
          billingSameAsShipping: cart.billingSameAsShipping || false,
        };
      }

      // Extract payment details from cart
      if (cart.paymentDetails) {
        const pd = cart.paymentDetails;
        // Extract gift card if present
        if (pd.paymentClassification?.giftCard) {
          const gc = pd.paymentClassification.giftCard;
          newState.payment.giftCard = {
            id: gc.id || '',
            last4Digits: gc.last4Digits || pd.last4Digits || '',
            appliedAmount: gc.appliedAmount || gc.amount || 0,
          };
        }
        // Extract credit card if present
        if (pd.cardType || pd.last4Digits) {
          newState.payment.creditCard = {
            cardType: pd.cardType || '',
            last4Digits: pd.last4Digits || '',
            expirationMonth: pd.expirationMonth || '',
            expirationYear: pd.expirationYear || '',
            cardHolderName: pd.cardHolderName || '',
          };
        }
      }

      // Determine step based on what's complete
      // Priority: Payment complete > Shipping address exists > Default (step 1)
      
      // If payment is complete (billing address + payment method), go to step 3
      if (
        newState.payment.billingAddress &&
        (newState.payment.giftCard || newState.payment.creditCard)
      ) {
        newState.payment.isComplete = true;
        newState.currentStep = 3;
      } 
      // If shipping address exists (delivery complete), go to step 2 (Payment & Billing)
      else if (newState.delivery.shippingAddress) {
        // Ensure delivery is marked as complete
        newState.delivery.isComplete = true;
        newState.currentStep = 2;
      }
      // Otherwise, stay at step 1 (Delivery)

      currState = newState;
      break;

    case 'FETCH_CART_ERROR':
      // On error, create a mock cart for development
      console.warn('Failed to fetch cart, using mock data:', action.payload);
      currState = {
        ...currState,
        cart: getMockCart(),
      };
      break;

    default:
      return state;
  }

  return { ...state, ...currState };
};

// Context Type
interface CheckoutContextType {
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
  // Action creators
  setCurrentStep: (step: 1 | 2 | 3) => void;
  setDeliveryEditing: (editing: boolean) => void;
  setPaymentEditing: (editing: boolean) => void;
  completeDeliveryStep: () => void;
  completePaymentStep: () => void;
  resetCheckout: () => void;
  // Async actions
  saveShippingAddress: (address: ShippingAddress) => Promise<void>;
  saveGiftMessage: (giftMessage: GiftMessage) => Promise<void>;
  removeGiftMessage: () => Promise<void>;
  saveGiftCard: (giftCard: GiftCardPayment) => Promise<void>;
  removeGiftCard: (paymentId: string) => Promise<void>;
  saveCreditCard: (creditCard: CreditCardPaymentInput) => Promise<void>;
  saveBillingAddress: (address: BillingAddress) => Promise<void>;
  fetchCart: () => Promise<void>;
}

// Create Context
const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

// Provider Component
export const CheckoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(CheckoutReducer, initialCheckoutState);

  // Action creators
  const setCurrentStep = useCallback((step: 1 | 2 | 3) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const setDeliveryEditing = useCallback((editing: boolean) => {
    dispatch({ type: 'SET_DELIVERY_EDITING', payload: editing });
  }, []);

  const setPaymentEditing = useCallback((editing: boolean) => {
    dispatch({ type: 'SET_PAYMENT_EDITING', payload: editing });
  }, []);

  const completeDeliveryStep = useCallback(() => {
    dispatch({ type: 'COMPLETE_DELIVERY_STEP' });
  }, []);

  const completePaymentStep = useCallback(() => {
    dispatch({ type: 'COMPLETE_PAYMENT_STEP' });
  }, []);

  const resetCheckout = useCallback(() => {
    dispatch({ type: 'RESET_CHECKOUT' });
  }, []);

  // Async action creators
  const saveShippingAddress = useCallback(async (address: ShippingAddress) => {
    dispatch({ type: 'SAVE_SHIPPING_ADDRESS_PENDING' });
    try {
      const response = await mockFetch('/api/checkout/shipping-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error('Failed to save shipping address');
      const data = await response.json();
      
      // GTM Tracking: Track successful delivery address save
      GTMService.trackSaveDeliveryAddress(address, data);
      
      dispatch({ type: 'SAVE_SHIPPING_ADDRESS_SUCCESS', payload: data });
    } catch (error: any) {
      dispatch({
        type: 'SAVE_SHIPPING_ADDRESS_ERROR',
        payload: error.message || 'Failed to save shipping address',
      });
      throw error;
    }
  }, []);

  const saveGiftMessage = useCallback(async (giftMessage: GiftMessage) => {
    dispatch({ type: 'SAVE_GIFT_MESSAGE_PENDING' });
    try {
      const response = await mockFetch('/api/checkout/gift-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftMessage),
      });
      if (!response.ok) throw new Error('Failed to save gift message');
      const data = await response.json();
      dispatch({ type: 'SAVE_GIFT_MESSAGE_SUCCESS', payload: data });
    } catch (error: any) {
      dispatch({
        type: 'SAVE_GIFT_MESSAGE_ERROR',
        payload: error.message || 'Failed to save gift message',
      });
      throw error;
    }
  }, []);

  const removeGiftMessage = useCallback(async () => {
    try {
      const response = await mockFetch('/api/checkout/gift-message', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove gift message');
      const data = await response.json();
      dispatch({ type: 'REMOVE_GIFT_MESSAGE_SUCCESS', payload: data });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const saveGiftCard = useCallback(async (giftCard: GiftCardPayment) => {
    dispatch({ type: 'SAVE_GIFT_CARD_PENDING' });
    try {
      const response = await mockFetch('/api/checkout/gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftCard),
      });
      if (!response.ok) throw new Error('Failed to apply gift card');
      const data = await response.json();
      dispatch({ type: 'SAVE_GIFT_CARD_SUCCESS', payload: data });
    } catch (error: any) {
      dispatch({
        type: 'SAVE_GIFT_CARD_ERROR',
        payload: error.message || 'Failed to apply gift card',
      });
      throw error;
    }
  }, []);

  const removeGiftCard = useCallback(async (paymentId: string) => {
    try {
      const response = await mockFetch(`/api/checkout/gift-card/${paymentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove gift card');
      const data = await response.json();
      dispatch({ type: 'REMOVE_GIFT_CARD_SUCCESS', payload: data });
    } catch (error: any) {
      throw error;
    }
  }, []);

  const saveCreditCard = useCallback(async (creditCard: CreditCardPaymentInput) => {
    dispatch({ type: 'SAVE_CREDIT_CARD_PENDING' });
    try {
      const response = await mockFetch('/api/checkout/credit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditCard),
      });
      if (!response.ok) throw new Error('Failed to save credit card');
      const data = await response.json();
      
      // GTM Tracking: Track successful payment save
      const paymentDetails = data?.paymentDetails || {};
      GTMService.trackSavePayment(
        {
          cardType: paymentDetails.cardType,
          last4Digits: paymentDetails.last4Digits,
          expirationMonth: paymentDetails.expirationMonth,
          expirationYear: paymentDetails.expirationYear,
        },
        data
      );
      
      dispatch({ type: 'SAVE_CREDIT_CARD_SUCCESS', payload: data });
    } catch (error: any) {
      dispatch({
        type: 'SAVE_CREDIT_CARD_ERROR',
        payload: error.message || 'Failed to save credit card',
      });
      throw error;
    }
  }, []);

  const saveBillingAddress = useCallback(async (address: BillingAddress) => {
    dispatch({ type: 'SAVE_BILLING_ADDRESS_PENDING' });
    try {
      const response = await mockFetch('/api/checkout/billing-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error('Failed to save billing address');
      const data = await response.json();
      
      // GTM Tracking: Track successful billing address save
      GTMService.trackSaveBillingAddress(address, data);
      
      dispatch({ type: 'SAVE_BILLING_ADDRESS_SUCCESS', payload: data });
    } catch (error: any) {
      dispatch({
        type: 'SAVE_BILLING_ADDRESS_ERROR',
        payload: error.message || 'Failed to save billing address',
      });
      throw error;
    }
  }, []);

  const fetchCart = useCallback(async () => {
    dispatch({ type: 'FETCH_CART_PENDING' });
    try {
      const response = await mockFetch('/api/cart', {method: 'GET'});
     
      if (!response.ok) throw new Error('Failed to fetch cart');
      const data = await response.json();
      console.log('response', data);
      
      // GTM Tracking: Track successful cart fetch
      GTMService.trackFetchCart(data);
      
      dispatch({ type: 'FETCH_CART_SUCCESS', payload: data });
    } catch (error: any) {
      dispatch({
        type: 'FETCH_CART_ERROR',
        payload: error.message || 'Failed to fetch cart',
      });
    }
  }, []);

  const value: CheckoutContextType = {
    state,
    dispatch,
    setCurrentStep,
    setDeliveryEditing,
    setPaymentEditing,
    completeDeliveryStep,
    completePaymentStep,
    resetCheckout,
    saveShippingAddress,
    saveGiftMessage,
    removeGiftMessage,
    saveGiftCard,
    removeGiftCard,
    saveCreditCard,
    saveBillingAddress,
    fetchCart,
  };

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>;
};

// Custom Hook
export const useCheckout = (): CheckoutContextType => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
};

// Export types for use in components
export type {
  CheckoutState,
  ShippingAddress,
  GiftMessage,
  GiftCardPayment,
  GiftCardData,
  CreditCardPaymentInput,
  CreditCardPayment,
  BillingAddress,
};

