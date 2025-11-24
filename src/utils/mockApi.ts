// Mock API system - stores responses in global object and returns them on API calls

interface MockApiResponse {
  [key: string]: any;
}

// Global object to store mock API responses
export const mockApiResponses: MockApiResponse = {
  cart: null,
  shippingAddress: null,
  giftMessage: null,
  giftCard: null,
  creditCard: null,
  billingAddress: null,
  placeOrder: null,
  savedAddresses: [],
};

// Helper to update mock responses
export const updateMockResponse = (key: string, data: any) => {
  mockApiResponses[key] = data;
  // If updating cart directly, ensure it's the full cart object
  if (key === 'cart') {
    mockApiResponses.cart = data;
  }
};

// Mock fetch function that intercepts API calls
export const mockFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  let responseData: any;
  let status = 200;

  // Handle different API endpoints
  if (url.includes('/api/cart') && options?.method === 'GET') {
    responseData = mockApiResponses.cart || getDefaultCart();
    // Ensure cart is always initialized
    if (!mockApiResponses.cart) {
      mockApiResponses.cart = responseData;
    }
  } 
  else if (url.includes('/api/checkout/shipping-address') && options?.method === 'POST') {
    const body = JSON.parse(options.body as string);
    const currentCart = mockApiResponses.cart || getDefaultCart();
    responseData = {
      ...currentCart,
      shippingAddress: {
        key: 'home',
        id: null,
        firstName: body.firstName,
        lastName: body.lastName,
        streetName: body.streetName,
        additionalStreetInfo: body.additionalStreetInfo || '',
        postalCode: body.postalCode,
        city: body.city,
        state: body.state,
        country: body.country,
        phone: body.phone,
        email: body.email,
        company: body.company || null,
      },
    };
    updateMockResponse('cart', responseData);
    updateMockResponse('shippingAddress', responseData.shippingAddress);
  }
  else if (url.includes('/api/checkout/gift-message')) {
    const currentCart = mockApiResponses.cart || getDefaultCart();
    if (options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      responseData = {
        ...currentCart,
        giftMessage: {
          giftMessage: body.giftMessage,
          giftSenderName: body.giftSenderName,
          giftReceiverName: body.giftReceiverName,
        },
        giftOrder: true,
      };
      updateMockResponse('cart', responseData);
      updateMockResponse('giftMessage', responseData.giftMessage);
    } else if (options?.method === 'DELETE') {
      responseData = {
        ...currentCart,
        giftMessage: null,
        giftOrder: false,
      };
      updateMockResponse('cart', responseData);
      updateMockResponse('giftMessage', null);
    }
  }
  else if (url.includes('/api/checkout/gift-card')) {
    const currentCart = mockApiResponses.cart || getDefaultCart();
    if (options?.method === 'POST') {
      const body = JSON.parse(options.body as string);
      const last4Digits = body.cardNumber.slice(-4);
      responseData = {
        ...currentCart,
        paymentDetails: {
          ...currentCart.paymentDetails,
          last4Digits,
          paymentMethod: 'GIFT_CARD',
          paymentClassification: {
            ...currentCart.paymentDetails?.paymentClassification,
            giftCard: {
              id: `gc_${Date.now()}`,
              last4Digits,
              appliedAmount: 50.00, // Mock applied amount
            },
          },
        },
      };
      updateMockResponse('cart', responseData);
      updateMockResponse('giftCard', responseData.paymentDetails.paymentClassification.giftCard);
    } else if (options?.method === 'DELETE') {
      responseData = {
        ...currentCart,
        paymentDetails: {
          ...currentCart.paymentDetails,
          paymentClassification: {
            ...currentCart.paymentDetails?.paymentClassification,
            giftCard: null,
          },
        },
      };
      updateMockResponse('cart', responseData);
      updateMockResponse('giftCard', null);
    }
  }
  else if (url.includes('/api/checkout/credit-card') && options?.method === 'POST') {
    const currentCart = mockApiResponses.cart || getDefaultCart();
    const body = JSON.parse(options.body as string);
    const last4Digits = body.cardNumber.slice(-4);
    const cardType = getCardType(body.cardNumber);
    responseData = {
      ...currentCart,
      paymentDetails: {
        cardHolderName: body.cardHolderName,
        maskedNumber: `****${last4Digits}`,
        last4Digits,
        expirationMonth: body.expirationMonth,
        expirationYear: body.expirationYear,
        cardType,
        paymentMethod: 'CREDIT_CARD',
        paymentClassification: {
          ...currentCart.paymentDetails?.paymentClassification,
          creditCard: {
            cardType,
            last4Digits,
            expirationMonth: body.expirationMonth,
            expirationYear: body.expirationYear,
            cardHolderName: body.cardHolderName,
          },
        },
      },
    };
    updateMockResponse('cart', responseData);
    updateMockResponse('creditCard', responseData.paymentDetails);
  }
  else if (url.includes('/api/checkout/billing-address') && options?.method === 'POST') {
    const currentCart = mockApiResponses.cart || getDefaultCart();
    const body = JSON.parse(options.body as string);
    responseData = {
      ...currentCart,
      billingAddress: {
        key: null,
        id: null,
        firstName: body.firstName,
        lastName: body.lastName,
        streetName: body.streetName,
        additionalStreetInfo: body.additionalStreetInfo || '',
        postalCode: body.postalCode,
        city: body.city,
        state: body.state,
        country: body.country,
        phone: body.phone,
        email: body.email || null,
        company: body.company || null,
      },
      billingSameAsShipping: body.billingSameAsShipping || false,
    };
    updateMockResponse('cart', responseData);
    updateMockResponse('billingAddress', responseData.billingAddress);
  }
  else if (url.includes('/api/checkout/place-order') && options?.method === 'POST') {
    const currentCart = mockApiResponses.cart || getDefaultCart();
    const body = JSON.parse(options.body as string);
    responseData = {
      orderNumber: `ORD-${Date.now()}`,
      orderDate: new Date().toLocaleDateString('en-US'),
      cartNumber: body.cartNumber,
      ...currentCart,
    };
    updateMockResponse('placeOrder', responseData);
  }
  else {
    // Unknown endpoint
    status = 404;
    responseData = { error: 'Not found' };
  }

  return new Response(JSON.stringify(responseData), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

// Helper to get card type from card number
const getCardType = (cardNumber: string): string => {
  const number = cardNumber.replace(/\s/g, '');
  if (/^4/.test(number)) return 'Visa';
  if (/^5[1-5]/.test(number)) return 'Mastercard';
  if (/^3[47]/.test(number)) return 'American Express';
  if (/^6/.test(number)) return 'Discover';
  return 'Unknown';
};

// Default cart data
const getDefaultCart = () => ({
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

// Initialize default cart
mockApiResponses.cart = getDefaultCart();

// Export function to reset mock data
export const resetMockApi = () => {
  Object.keys(mockApiResponses).forEach(key => {
    mockApiResponses[key] = null;
  });
  mockApiResponses.cart = getDefaultCart();
};

// Mock saved addresses for logged-in users
const getMockSavedAddresses = () => [
  {
    id: 'addr_1',
    key: 'home',
    firstName: 'John',
    lastName: 'Doe',
    streetName: '123 Main Street',
    additionalStreetInfo: 'Apt 4B',
    city: 'Oklahoma City',
    state: 'OK',
    postalCode: '73114',
    country: 'US',
    phone: '(405) 555-1234',
    email: 'john.doe@example.com',
    isDefault: true,
  },
  {
    id: 'addr_2',
    key: 'work',
    firstName: 'John',
    lastName: 'Doe',
    company: 'Acme Corp',
    streetName: '456 Business Blvd',
    city: 'Tulsa',
    state: 'OK',
    postalCode: '74103',
    country: 'US',
    phone: '(918) 555-5678',
    email: 'john.doe@acme.com',
    isDefault: false,
  },
  {
    id: 'addr_3',
    key: 'other',
    firstName: 'John',
    lastName: 'Doe',
    streetName: '789 Elm Street',
    city: 'Norman',
    state: 'OK',
    postalCode: '73069',
    country: 'US',
    phone: '(405) 555-9012',
    email: 'john.doe@example.com',
    isDefault: false,
  },
];

// Initialize saved addresses
mockApiResponses.savedAddresses = getMockSavedAddresses();

// Make mockApiResponses available globally for browser console access
if (typeof window !== 'undefined') {
  (window as any).mockApi = {
    responses: mockApiResponses,
    update: updateMockResponse,
    reset: resetMockApi,
    getCart: () => mockApiResponses.cart,
    setCart: (cart: any) => {
      mockApiResponses.cart = cart;
    },
    getSavedAddresses: () => mockApiResponses.savedAddresses,
    setSavedAddresses: (addresses: any[]) => {
      mockApiResponses.savedAddresses = addresses;
    },
  };
  
  console.log('Mock API available at window.mockApi');
  console.log('Usage: window.mockApi.getCart() - view current cart');
  console.log('Usage: window.mockApi.setCart({...}) - update cart');
  console.log('Usage: window.mockApi.getSavedAddresses() - view saved addresses');
  console.log('Usage: window.mockApi.setSavedAddresses([...]) - update saved addresses');
  console.log('Usage: window.mockApi.update("key", data) - update specific response');
}

