// components/Checkout/Steps/ReviewStep/index.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useCheckout } from '../../../../context/CheckoutContext';

const ReviewStep: React.FC = () => {
  const router = useRouter();
  const {
    state: { delivery, payment, cart },
    setDeliveryEditing,
    setPaymentEditing,
  } = useCheckout();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { mockFetch } = await import('../../../../utils/mockApi');
      const response = await mockFetch('/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartNumber: cart.cartNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const orderData = await response.json();
      
      // Redirect to order confirmation page
      router.push(`/order-confirmation/${orderData.orderNumber}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while placing your order.';
      setSubmitError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-step">
      <h2>Review Your Order</h2>

      {submitError && (
        <div className="error-banner" role="alert">
          <p>{submitError}</p>
        </div>
      )}

      {/* Delivery Summary */}
      <section className="review-section">
        <div className="section-header">
          <h3>Delivery</h3>
          <button
            onClick={() => setDeliveryEditing(true)}
            className="edit-link"
          >
            Edit
          </button>
        </div>

        <div className="section-content">
          {delivery.shippingAddress && (
            <div className="address-info">
              <h4>Shipping Address</h4>
              <p>
                {delivery.shippingAddress.firstName} {delivery.shippingAddress.lastName}
              </p>
              {delivery.shippingAddress.company && (
                <p>{delivery.shippingAddress.company}</p>
              )}
              <p>{delivery.shippingAddress.streetName}</p>
              {delivery.shippingAddress.additionalStreetInfo && (
                <p>{delivery.shippingAddress.additionalStreetInfo}</p>
              )}
              <p>
                {delivery.shippingAddress.city}, {delivery.shippingAddress.state}{' '}
                {delivery.shippingAddress.postalCode}
              </p>
              <p>{delivery.shippingAddress.email}</p>
              <p>{delivery.shippingAddress.phone}</p>
            </div>
          )}

          {delivery.giftMessage && (
            <div className="gift-info">
              <h4>Gift Message</h4>
              <p className="gift-label">This order is a gift</p>
              <p>
                <strong>From:</strong> {delivery.giftMessage.giftSenderName}
              </p>
              <p>
                <strong>To:</strong> {delivery.giftMessage.giftReceiverName}
              </p>
              {delivery.giftMessage.giftMessage && (
                <p>
                  <strong>Message:</strong> {delivery.giftMessage.giftMessage}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Payment Summary */}
      <section className="review-section">
        <div className="section-header">
          <h3>Payment</h3>
          <button
            onClick={() => setPaymentEditing(true)}
            className="edit-link"
          >
            Edit
          </button>
        </div>

        <div className="section-content">
          {payment.giftCard && (
            <div className="payment-method">
              <h4>Gift Card</h4>
              <p>Ending in {payment.giftCard.last4Digits}</p>
              <p>Applied: ${payment.giftCard.appliedAmount?.toFixed(2)}</p>
            </div>
          )}

          {payment.creditCard && (
            <div className="payment-method">
              <h4>Credit Card</h4>
              <p>
                {payment.creditCard.cardType} ending in {payment.creditCard.last4Digits}
              </p>
              <p>
                Expires: {payment.creditCard.expirationMonth}/
                {payment.creditCard.expirationYear}
              </p>
            </div>
          )}

          {payment.billingAddress && (
            <div className="billing-info">
              <h4>Billing Address</h4>
              {payment.billingAddress.billingSameAsShipping ? (
                <p>Same as shipping address</p>
              ) : (
                <>
                  <p>
                    {payment.billingAddress.firstName} {payment.billingAddress.lastName}
                  </p>
                  <p>{payment.billingAddress.streetName}</p>
                  {payment.billingAddress.additionalStreetInfo && (
                    <p>{payment.billingAddress.additionalStreetInfo}</p>
                  )}
                  <p>
                    {payment.billingAddress.city}, {payment.billingAddress.state}{' '}
                    {payment.billingAddress.postalCode}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Order Summary */}
      <section className="review-section">
        <h3>Order Summary</h3>
        
        <div className="order-items">
          {cart.lineItems?.map((item: any) => (
            <div key={item.id} className="order-item">
              <div className="item-image">
                <img
                  src={item.variant.imageSet}
                  alt={item.name}
                  width={80}
                  height={80}
                />
              </div>
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>SKU: {item.variant.sku}</p>
                <p>Quantity: {item.quantity}</p>
              </div>
              <div className="item-price">
                {item.originalPricePerQuantity !== item.discountedPricePerQuantity && (
                  <p className="original-price">
                    ${item.originalPricePerQuantity.toFixed(2)}
                  </p>
                )}
                <p className="current-price">${item.totalPrice.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="order-totals">
          <div className="total-row">
            <span>Subtotal ({cart.totalLineItemQuantity} Item{cart.totalLineItemQuantity !== 1 ? 's' : ''})</span>
            <span>${cart.orderSummary?.merchandiseSubTotal?.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Shipping</span>
            <span>${cart.orderSummary?.shippingSubTotal?.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Tax</span>
            <span>${cart.orderSummary?.totalTax?.toFixed(2)}</span>
          </div>
          {cart.orderSummary?.totalSaved > 0 && (
            <div className="total-row savings">
              <span>You Saved</span>
              <span>${cart.orderSummary?.totalSaved?.toFixed(2)}</span>
            </div>
          )}
          <div className="total-row grand-total">
            <strong>Total</strong>
            <strong>${cart.orderSummary?.totalPrice?.toFixed(2)}</strong>
          </div>
        </div>
      </section>

      <div className="place-order-section">
        <button
          onClick={handlePlaceOrder}
          className="place-order-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Placing Order...' : 'Place Order'}
        </button>
        
        <p className="terms-notice">
          By placing your order, you agree to our{' '}
          <a href="/terms" target="_blank">Terms of Service</a> and{' '}
          <a href="/privacy" target="_blank">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;

