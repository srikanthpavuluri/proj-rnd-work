// components/Checkout/index.tsx
import React, { useEffect } from 'react';
import DeliveryStep, { DeliveryReview } from './Steps/DeliveryStep';
import PaymentStep from './Steps/PaymentStep';
import ReviewStep from './Steps/ReviewStep';
import { useCheckout } from '../../context/CheckoutContext';
import styles from './Checkout.module.css';

const Checkout: React.FC = () => {
  const { state, fetchCart } = useCheckout();
  const { currentStep, delivery, payment, cart } = state;

  useEffect(() => {
    // Fetch cart data on mount
    fetchCart().catch((error: unknown) => {
      console.error('Error fetching cart:', error);
    });
  }, [fetchCart]);

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
    <div className={styles['checkout-container']}>
      {/* Step Indicator */}
      <div className={styles['step-indicator']}>
        <div className={`${styles.step} ${currentStep === 1 ? styles.active : ''} ${delivery.isComplete ? styles.complete : ''}`}>
          <div className={styles['step-number']}>1</div>
          <div className={styles['step-label']}>Delivery</div>
        </div>
        
        <div className={styles['step-divider']} />
        
        <div className={`${styles.step} ${currentStep === 2 ? styles.active : ''} ${payment.isComplete ? styles.complete : ''}`}>
          <div className={styles['step-number']}>2</div>
          <div className={styles['step-label']}>Payment</div>
        </div>
        
        <div className={styles['step-divider']} />
        
        <div className={`${styles.step} ${currentStep === 3 ? styles.active : ''}`}>
          <div className={styles['step-number']}>3</div>
          <div className={styles['step-label']}>Confirm</div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles['checkout-content']}>
        <div className={styles['checkout-main']}>
          {/* Step 1: Delivery - Show form if on step 1 or if editing */}
          {(currentStep === 1 || delivery.isEditing) && <DeliveryStep />}
          
          {/* Step 2: Payment - Show when on step 2 and not editing delivery */}
          {currentStep === 2 && !delivery.isEditing && (
            <>
              {/* Show completed step 1 details in read-only mode */}
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
        <aside className={styles['order-summary-sidebar']}>
          <div className={styles['summary-card']}>
            <h3>Order Summary</h3>
            
            <div className={styles['summary-row']}>
              <span>Subtotal ({cart.totalLineItemQuantity} Item{cart.totalLineItemQuantity !== 1 ? 's' : ''})</span>
              <span>${cart.orderSummary?.merchandiseSubTotal?.toFixed(2)}</span>
            </div>
            
            <div className={styles['summary-row']}>
              <span>Shipping</span>
              <span>${cart.orderSummary?.shippingSubTotal?.toFixed(2)}</span>
            </div>
            
            <div className={styles['summary-row']}>
              <span>Tax</span>
              <span>{cart.orderSummary?.totalTax > 0 ? `$${cart.orderSummary?.totalTax?.toFixed(2)}` : '—'}</span>
            </div>
            
            <div className={styles['summary-divider']} />
            
            <div className={`${styles['summary-row']} ${styles.total}`}>
              <strong>Total</strong>
              <strong>${cart.orderSummary?.totalPrice?.toFixed(2)}</strong>
            </div>
            
            {cart.orderSummary?.totalSaved > 0 && (
              <div className={styles['savings-badge']}>
                YOU SAVED ${cart.orderSummary?.totalSaved?.toFixed(2)}
              </div>
            )}

            <div className={styles['summary-help']}>
              <p>
                Need help? <a href="/contact">Contact us</a> and be sure to
                reference your cart number:
              </p>
              <p className={styles['cart-number']}>{cart.cartNumber}</p>
            </div>
          </div>

          {/* Cart Items Preview */}
          <div className={styles['cart-items-preview']}>
            <h4>CART SUMMARY</h4>
            {cart.lineItems?.map((item: any) => (
              <div key={item.id} className={styles['cart-item-preview']}>
                <div className={styles['item-image']}>
                  <img src={item.variant.imageSet} alt={item.name} width={60} height={60} />
                  {item.variant.attributes?.excludeFreeShipping && (
                    <div className={styles['shipping-notice']}>
                      Item not eligible for free shipping
                    </div>
                  )}
                </div>
                <div className={styles['item-info']}>
                  <h5>{item.name}</h5>
                  <p>SKU: {item.variant.sku}</p>
                  <p>Quantity: {item.quantity}</p>
                  <div className={styles['item-price']}>
                    {item.originalPricePerQuantity !== item.discountedPricePerQuantity && (
                      <span className={styles.original}>${item.originalPricePerQuantity.toFixed(2)}</span>
                    )}
                    <span className={styles.current}>${item.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className={styles['return-to-cart']}>
        <a href="/cart">← Return to cart</a>
      </div>
    </div>
  );
};

export default Checkout;

