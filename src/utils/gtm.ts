// utils/gtm.ts
/**
 * Google Tag Manager (GTM) Utility
 * Provides methods to push events to the GTM data layer
 */

// Declare dataLayer if it doesn't exist
declare global {
  interface Window {
    dataLayer?: any[];
  }
}

/**
 * Initialize the dataLayer if it doesn't exist
 */
const initializeDataLayer = (): void => {
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
  }
};

/**
 * Generic method to push data to GTM dataLayer
 * @param eventName - Name of the event
 * @param eventData - Data object to push
 */
export const pushToDataLayer = (eventName: string, eventData: Record<string, any> = {}): void => {
  if (typeof window === 'undefined') {
    console.warn('GTM: window is not available');
    return;
  }

  initializeDataLayer();

  const event = {
    event: eventName,
    ...eventData,
    timestamp: new Date().toISOString(),
  };

  window.dataLayer?.push(event);
  console.log('GTM Event Pushed:', event);
};

/**
 * GTM Event Names
 */
export const GTM_EVENTS = {
  FETCH_CART: 'checkout_fetch_cart',
  SAVE_DELIVERY_ADDRESS: 'checkout_save_delivery_address',
  SAVE_PAYMENT: 'checkout_save_payment',
  SAVE_BILLING_ADDRESS: 'checkout_save_billing_address',
} as const;

/**
 * GTM Service Class
 * Provides specific methods for each checkout action
 */
export class GTMService {
  /**
   * Track successful cart fetch
   * @param cartData - Cart data from the API response
   */
  static trackFetchCart(cartData: any): void {
    pushToDataLayer(GTM_EVENTS.FETCH_CART, {
      cart_id: cartData?.id || null,
      cart_number: cartData?.cartNumber || null,
      cart_state: cartData?.cartState || null,
      line_item_count: cartData?.lineItemCount || 0,
      total_line_item_quantity: cartData?.totalLineItemQuantity || 0,
      order_summary: {
        merchandise_subtotal: cartData?.orderSummary?.merchandiseSubTotal || 0,
        shipping_subtotal: cartData?.orderSummary?.shippingSubTotal || 0,
        total_tax: cartData?.orderSummary?.totalTax || 0,
        total_price: cartData?.orderSummary?.totalPrice || 0,
        total_saved: cartData?.orderSummary?.totalSaved || 0,
      },
      customer_id: cartData?.customerId || null,
      customer_email: cartData?.customerEmail || null,
      has_shipping_address: !!cartData?.shippingAddress,
      has_billing_address: !!cartData?.billingAddress,
      has_payment_details: !!cartData?.paymentDetails,
    });
  }

  /**
   * Track successful delivery address save
   * @param addressData - Shipping address data
   * @param cartData - Updated cart data from API response
   */
  static trackSaveDeliveryAddress(
    addressData: {
      firstName: string;
      lastName: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    },
    cartData?: any
  ): void {
    pushToDataLayer(GTM_EVENTS.SAVE_DELIVERY_ADDRESS, {
      address: {
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postal_code: addressData.postalCode,
      },
      cart_id: cartData?.id || null,
      cart_number: cartData?.cartNumber || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track successful payment save (credit card)
   * @param paymentData - Credit card payment data
   * @param cartData - Updated cart data from API response
   */
  static trackSavePayment(
    paymentData: {
      cardType?: string;
      last4Digits?: string;
      expirationMonth?: string;
      expirationYear?: string;
    },
    cartData?: any
  ): void {
    pushToDataLayer(GTM_EVENTS.SAVE_PAYMENT, {
      payment: {
        card_type: paymentData.cardType || null,
        last_4_digits: paymentData.last4Digits || null,
        expiration_month: paymentData.expirationMonth || null,
        expiration_year: paymentData.expirationYear || null,
        payment_method: paymentData.cardType ? 'credit_card' : null,
      },
      cart_id: cartData?.id || null,
      cart_number: cartData?.cartNumber || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track successful billing address save
   * @param addressData - Billing address data
   * @param cartData - Updated cart data from API response
   */
  static trackSaveBillingAddress(
    addressData: {
      firstName: string;
      lastName: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      billingSameAsShipping: boolean;
    },
    cartData?: any
  ): void {
    pushToDataLayer(GTM_EVENTS.SAVE_BILLING_ADDRESS, {
      address: {
        first_name: addressData.firstName,
        last_name: addressData.lastName,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        postal_code: addressData.postalCode,
        billing_same_as_shipping: addressData.billingSameAsShipping,
      },
      cart_id: cartData?.id || null,
      cart_number: cartData?.cartNumber || null,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generic method to track any custom event
   * @param eventName - Custom event name
   * @param eventData - Event data
   */
  static trackCustomEvent(eventName: string, eventData: Record<string, any> = {}): void {
    pushToDataLayer(eventName, eventData);
  }
}

export default GTMService;

