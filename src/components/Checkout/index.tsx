// components/Checkout/index.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DeliveryStep, { DeliveryReview } from './Steps/DeliveryStep';
import PaymentStep from './Steps/PaymentStep';
import ReviewStep from './Steps/ReviewStep';
import { fetchCart } from '../../store/checkoutSlice';
import './Checkout.css';

const Checkout: React.FC = () => {
  const dispatch = useDispatch();
  const { currentStep, delivery, payment, cart } = useSelector(
    (state: any) => state.checkout
  );

  useEffect(() => {
    // Fetch cart data on mount
    dispatch(fetchCart() as any).catch((error: unknown) => {
      console.error('Error fetching cart:', error);
    });
  }, [dispatch]);

  if (!cart) {
    return (
      <div className="checkout-loading" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading cart...</p>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          If this persists, check your API endpoint or browser console for errors.
        </p>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${currentStep === 1 ? 'active' : ''} ${delivery.isComplete ? 'complete' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Delivery</div>
        </div>
        
        <div className="step-divider" />
        
        <div className={`step ${currentStep === 2 ? 'active' : ''} ${payment.isComplete ? 'complete' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Payment</div>
        </div>
        
        <div className="step-divider" />
        
        <div className={`step ${currentStep === 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Confirm</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="checkout-content">
        <div className="checkout-main">
          {currentStep === 1 && <DeliveryStep />}
          {currentStep === 2 && (
            <>
              {/* Show completed step 1 details */}
              {delivery.isComplete && (
                <div style={{ marginBottom: '40px' }}>
                  <DeliveryReview />
                </div>
              )}
              {/* Show step 2 form below */}
              <div style={{ marginTop: delivery.isComplete ? '40px' : '0', paddingTop: delivery.isComplete ? '40px' : '0', borderTop: delivery.isComplete ? '2px solid #e0e0e0' : 'none' }}>
                <PaymentStep />
              </div>
            </>
          )}
          {currentStep === 3 && <ReviewStep />}
        </div>

        {/* Order Summary Sidebar */}
        <aside className="order-summary-sidebar">
          <div className="summary-card">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cart.totalLineItemQuantity} Item{cart.totalLineItemQuantity !== 1 ? 's' : ''})</span>
              <span>${cart.orderSummary?.merchandiseSubTotal?.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>${cart.orderSummary?.shippingSubTotal?.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Tax</span>
              <span>{cart.orderSummary?.totalTax > 0 ? `$${cart.orderSummary?.totalTax?.toFixed(2)}` : '—'}</span>
            </div>
            
            <div className="summary-divider" />
            
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>${cart.orderSummary?.totalPrice?.toFixed(2)}</strong>
            </div>
            
            {cart.orderSummary?.totalSaved > 0 && (
              <div className="savings-badge">
                YOU SAVED ${cart.orderSummary?.totalSaved?.toFixed(2)}
              </div>
            )}

            <div className="summary-help">
              <p>
                Need help? <a href="/contact">Contact us</a> and be sure to
                reference your cart number:
              </p>
              <p className="cart-number">{cart.cartNumber}</p>
            </div>
          </div>

          {/* Cart Items Preview */}
          <div className="cart-items-preview">
            <h4>CART SUMMARY</h4>
            {cart.lineItems?.map((item: any) => (
              <div key={item.id} className="cart-item-preview">
                <div className="item-image">
                  <img src={item.variant.imageSet} alt={item.name} width={60} height={60} />
                  {item.variant.attributes?.excludeFreeShipping && (
                    <div className="shipping-notice">
                      Item not eligible for free shipping
                    </div>
                  )}
                </div>
                <div className="item-info">
                  <h5>{item.name}</h5>
                  <p>SKU: {item.variant.sku}</p>
                  <p>Quantity: {item.quantity}</p>
                  <div className="item-price">
                    {item.originalPricePerQuantity !== item.discountedPricePerQuantity && (
                      <span className="original">${item.originalPricePerQuantity.toFixed(2)}</span>
                    )}
                    <span className="current">${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="return-to-cart">
        <a href="/cart">← Return to cart</a>
      </div>
    </div>
  );
};

export default Checkout;

