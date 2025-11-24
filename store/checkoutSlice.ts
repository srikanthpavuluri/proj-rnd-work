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

interface CreditCardPayment {
  cardNumber: string;
  cardHolderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;
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
    giftCard: GiftCardPayment | null;
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

// Async Thunks
export const saveShippingAddress = createAsyncThunk(
  'checkout/saveShippingAddress',
  async (address: ShippingAddress, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/checkout/shipping-address', {
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
      const response = await fetch('/api/checkout/gift-message', {
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
      const response = await fetch('/api/checkout/gift-message', {
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
      const response = await fetch('/api/checkout/gift-card', {
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
      const response = await fetch(`/api/checkout/gift-card/${paymentId}`, {
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
  async (creditCard: CreditCardPayment, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/checkout/credit-card', {
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
      const response = await fetch('/api/checkout/billing-address', {
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
      const response = await fetch('/api/cart');
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
        state.payment.giftCard = action.payload.paymentDetails.paymentClassification.giftCard;
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
        state.payment.creditCard = action.payload.paymentDetails;
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
          state.payment.billingAddress = action.payload.billingAddress;
        }
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