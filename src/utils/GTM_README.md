# Google Tag Manager (GTM) Integration

This document describes the GTM implementation for tracking checkout events.

## Overview

The GTM utility (`src/utils/gtm.ts`) provides a generic service class for pushing events to the Google Tag Manager data layer. All successful API calls in the checkout flow are automatically tracked.

## Implementation

### GTM Service Class

The `GTMService` class provides static methods for tracking specific checkout events:

- `trackFetchCart(cartData)` - Tracks successful cart fetch
- `trackSaveDeliveryAddress(addressData, cartData)` - Tracks successful delivery address save
- `trackSavePayment(paymentData, cartData)` - Tracks successful payment save
- `trackSaveBillingAddress(addressData, cartData)` - Tracks successful billing address save
- `trackCustomEvent(eventName, eventData)` - Generic method for custom events

### Event Names

All events use the following naming convention:
- `checkout_fetch_cart`
- `checkout_save_delivery_address`
- `checkout_save_payment`
- `checkout_save_billing_address`

## Automatic Tracking

The following API calls are automatically tracked when successful:

1. **Fetch Cart** (`fetchCart`)
   - Triggered when cart is successfully fetched
   - Includes: cart ID, cart number, line items, order summary, customer info

2. **Save Delivery Address** (`saveShippingAddress`)
   - Triggered when shipping address is successfully saved
   - Includes: address details, cart ID, cart number

3. **Save Payment** (`saveCreditCard`)
   - Triggered when credit card payment is successfully saved
   - Includes: payment method details, card type, last 4 digits, cart info

4. **Save Billing Address** (`saveBillingAddress`)
   - Triggered when billing address is successfully saved
   - Includes: address details, billing same as shipping flag, cart info

## Data Layer Structure

All events pushed to the data layer follow this structure:

```javascript
{
  event: 'checkout_fetch_cart', // Event name
  cart_id: '...',
  cart_number: 12345,
  // ... other event-specific data
  timestamp: '2025-01-01T00:00:00.000Z'
}
```

## Usage Examples

### Automatic Tracking (Already Implemented)

The tracking is automatically integrated into `CheckoutContext.tsx`. No additional code is needed for the standard checkout flow.

### Custom Event Tracking

If you need to track custom events, you can use:

```typescript
import { GTMService } from '../utils/gtm';

// Track a custom event
GTMService.trackCustomEvent('custom_event_name', {
  custom_field: 'value',
  another_field: 123
});
```

### Generic Data Layer Push

For more control, you can use the generic push method:

```typescript
import { pushToDataLayer } from '../utils/gtm';

pushToDataLayer('my_custom_event', {
  data: 'value',
  number: 123
});
```

## GTM Configuration

To receive these events in Google Tag Manager:

1. Create triggers for each event name:
   - `checkout_fetch_cart`
   - `checkout_save_delivery_address`
   - `checkout_save_payment`
   - `checkout_save_billing_address`

2. Create tags that fire on these triggers

3. Use the data layer variables in your tags:
   - `{{cart_id}}`
   - `{{cart_number}}`
   - `{{address.city}}`
   - etc.

## Testing

To test GTM events in development:

1. Open browser console
2. Check for "GTM Event Pushed:" logs
3. Inspect `window.dataLayer` array
4. Use GTM Preview mode to see events in real-time

## Notes

- Events are only pushed on successful API calls
- All events include a timestamp
- The data layer is automatically initialized if it doesn't exist
- Events are logged to console in development for debugging

