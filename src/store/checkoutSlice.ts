// store/checkoutSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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

// Mock cart data for development when API is not available
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
  shippingAddress: null,
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

const initialState: CheckoutState = {
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

// Import mock API
import { mockFetch } from '../utils/mockApi';

// Async Thunks
export const saveShippingAddress = createAsyncThunk(
  'checkout/saveShippingAddress',
  async (address: ShippingAddress, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/checkout/shipping-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error('Failed to save shipping address');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveGiftMessage = createAsyncThunk(
  'checkout/saveGiftMessage',
  async (giftMessage: GiftMessage, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/checkout/gift-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftMessage),
      });
      if (!response.ok) throw new Error('Failed to save gift message');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeGiftMessage = createAsyncThunk(
  'checkout/removeGiftMessage',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/checkout/gift-message', {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove gift message');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveGiftCard = createAsyncThunk(
  'checkout/saveGiftCard',
  async (giftCard: GiftCardPayment, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/checkout/gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(giftCard),
      });
      if (!response.ok) throw new Error('Failed to apply gift card');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeGiftCard = createAsyncThunk(
  'checkout/removeGiftCard',
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await mockFetch(`/api/checkout/gift-card/${paymentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove gift card');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveCreditCard = createAsyncThunk(
  'checkout/saveCreditCard',
  async (creditCard: CreditCardPaymentInput, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/checkout/credit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creditCard),
      });
      if (!response.ok) throw new Error('Failed to save credit card');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveBillingAddress = createAsyncThunk(
  'checkout/saveBillingAddress',
  async (address: BillingAddress, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/checkout/billing-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
      if (!response.ok) throw new Error('Failed to save billing address');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCart = createAsyncThunk(
  'checkout/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await mockFetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<1 | 2 | 3>) => {
      state.currentStep = action.payload;
    },
    setDeliveryEditing: (state, action: PayloadAction<boolean>) => {
      state.delivery.isEditing = action.payload;
      if (action.payload) {
        state.currentStep = 1;
      }
    },
    setPaymentEditing: (state, action: PayloadAction<boolean>) => {
      state.payment.isEditing = action.payload;
      if (action.payload) {
        state.currentStep = 2;
      }
    },
    completeDeliveryStep: (state) => {
      if (state.delivery.shippingAddress) {
        state.delivery.isComplete = true;
        state.delivery.isEditing = false;
        state.currentStep = 2;
      }
    },
    completePaymentStep: (state) => {
      if (state.payment.billingAddress && 
          (state.payment.creditCard || state.payment.giftCard)) {
        state.payment.isComplete = true;
        state.payment.isEditing = false;
        state.currentStep = 3;
      }
    },
    resetCheckout: () => initialState,
  },
  extraReducers: (builder) => {
    // Shipping Address
    builder
      .addCase(saveShippingAddress.pending, (state) => {
        state.loading.shippingAddress = true;
        state.errors.shippingAddress = null;
      })
      .addCase(saveShippingAddress.fulfilled, (state, action) => {
        state.loading.shippingAddress = false;
        state.delivery.shippingAddress = action.payload.shippingAddress;
        state.cart = action.payload;
      })
      .addCase(saveShippingAddress.rejected, (state, action) => {
        state.loading.shippingAddress = false;
        state.errors.shippingAddress = action.payload as string;
      });

    // Gift Message
    builder
      .addCase(saveGiftMessage.pending, (state) => {
        state.loading.giftMessage = true;
        state.errors.giftMessage = null;
      })
      .addCase(saveGiftMessage.fulfilled, (state, action) => {
        state.loading.giftMessage = false;
        state.delivery.giftMessage = action.payload.giftMessage;
        state.cart = action.payload;
      })
      .addCase(saveGiftMessage.rejected, (state, action) => {
        state.loading.giftMessage = false;
        state.errors.giftMessage = action.payload as string;
      });

    builder
      .addCase(removeGiftMessage.fulfilled, (state, action) => {
        state.delivery.giftMessage = null;
        state.cart = action.payload;
      });

    // Gift Card
    builder
      .addCase(saveGiftCard.pending, (state) => {
        state.loading.giftCard = true;
        state.errors.giftCard = null;
      })
      .addCase(saveGiftCard.fulfilled, (state, action) => {
        state.loading.giftCard = false;
        // Extract gift card from paymentClassification, or use paymentDetails if giftCard is directly there
        const giftCard = action.payload.paymentDetails?.paymentClassification?.giftCard || action.payload.paymentDetails?.giftCard;
        if (giftCard) {
          state.payment.giftCard = {
            id: giftCard.id || '',
            last4Digits: giftCard.last4Digits || action.payload.paymentDetails?.last4Digits || '',
            appliedAmount: giftCard.appliedAmount || giftCard.amount || 0,
          };
        }
        state.cart = action.payload;
      })
      .addCase(saveGiftCard.rejected, (state, action) => {
        state.loading.giftCard = false;
        state.errors.giftCard = action.payload as string;
      });

    builder
      .addCase(removeGiftCard.fulfilled, (state, action) => {
        state.payment.giftCard = null;
        state.cart = action.payload;
      });

    // Credit Card
    builder
      .addCase(saveCreditCard.pending, (state) => {
        state.loading.creditCard = true;
        state.errors.creditCard = null;
      })
      .addCase(saveCreditCard.fulfilled, (state, action) => {
        state.loading.creditCard = false;
        // Extract credit card details from paymentDetails
        const paymentDetails = action.payload.paymentDetails;
        if (paymentDetails) {
          state.payment.creditCard = {
            cardType: paymentDetails.cardType || '',
            last4Digits: paymentDetails.last4Digits || '',
            expirationMonth: paymentDetails.expirationMonth || '',
            expirationYear: paymentDetails.expirationYear || '',
            cardHolderName: paymentDetails.cardHolderName || '',
          };
        }
        state.cart = action.payload;
      })
      .addCase(saveCreditCard.rejected, (state, action) => {
        state.loading.creditCard = false;
        state.errors.creditCard = action.payload as string;
      });

    // Billing Address
    builder
      .addCase(saveBillingAddress.pending, (state) => {
        state.loading.billingAddress = true;
        state.errors.billingAddress = null;
      })
      .addCase(saveBillingAddress.fulfilled, (state, action) => {
        state.loading.billingAddress = false;
        state.payment.billingAddress = action.payload.billingAddress;
        state.cart = action.payload;
      })
      .addCase(saveBillingAddress.rejected, (state, action) => {
        state.loading.billingAddress = false;
        state.errors.billingAddress = action.payload as string;
      });

    // Cart
    builder
      .addCase(fetchCart.pending, () => {
        // Keep existing cart while loading
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        // Hydrate from cart if data exists
        if (action.payload.shippingAddress) {
          state.delivery.shippingAddress = action.payload.shippingAddress;
        }
        if (action.payload.giftMessage) {
          state.delivery.giftMessage = action.payload.giftMessage;
        }
        if (action.payload.billingAddress) {
          state.payment.billingAddress = {
            ...action.payload.billingAddress,
            billingSameAsShipping: action.payload.billingSameAsShipping || false,
          };
        }
        // Extract payment details from cart
        if (action.payload.paymentDetails) {
          const paymentDetails = action.payload.paymentDetails;
          // Extract gift card if present
          if (paymentDetails.paymentClassification?.giftCard) {
            const giftCard = paymentDetails.paymentClassification.giftCard;
            state.payment.giftCard = {
              id: giftCard.id || '',
              last4Digits: giftCard.last4Digits || paymentDetails.last4Digits || '',
              appliedAmount: giftCard.appliedAmount || giftCard.amount || 0,
            };
          }
          // Extract credit card if present
          if (paymentDetails.cardType || paymentDetails.last4Digits) {
            state.payment.creditCard = {
              cardType: paymentDetails.cardType || '',
              last4Digits: paymentDetails.last4Digits || '',
              expirationMonth: paymentDetails.expirationMonth || '',
              expirationYear: paymentDetails.expirationYear || '',
              cardHolderName: paymentDetails.cardHolderName || '',
            };
          }
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        // On error, create a mock cart for development
        console.warn('Failed to fetch cart, using mock data:', action.payload);
        state.cart = getMockCart();
      });
  },
});

export const {
  setCurrentStep,
  setDeliveryEditing,
  setPaymentEditing,
  completeDeliveryStep,
  completePaymentStep,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;