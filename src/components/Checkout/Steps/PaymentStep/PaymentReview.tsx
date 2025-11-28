// components/Checkout/Steps/PaymentStep/PaymentReview.tsx
import React from 'react';
import { useCheckout } from '../../../../context/CheckoutContext';

const PaymentReview: React.FC = () => {
  const {
    state: { payment },
    setPaymentEditing,
  } = useCheckout();

  const handleEdit = () => {
    setPaymentEditing(true);
  };

  return (
    <div className="payment-review">
      <div className="section-header">
        <h3>Payment</h3>
        <button onClick={handleEdit} className="edit-button">
          Edit
        </button>
      </div>

      {payment.giftCard && (
        <div className="gift-card-display">
          <h4>Gift Card</h4>
          <p>Ending in {payment.giftCard.last4Digits}</p>
          <p>Applied Amount: ${payment.giftCard.appliedAmount}</p>
        </div>
      )}

      {payment.creditCard && (
        <div className="credit-card-display">
          <h4>Credit Card</h4>
          <p>{payment.creditCard.cardType} ending in {payment.creditCard.last4Digits}</p>
          <p>Expires: {payment.creditCard.expirationMonth}/{payment.creditCard.expirationYear}</p>
        </div>
      )}

      {payment.billingAddress && (
        <div className="billing-address-display">
          <h4>Billing Address</h4>
          {payment.billingAddress.billingSameAsShipping ? (
            <p>Same as shipping address</p>
          ) : (
            <>
              <p className="name">
                {payment.billingAddress.firstName} {payment.billingAddress.lastName}
              </p>
              <p className="street">{payment.billingAddress.streetName}</p>
              {payment.billingAddress.additionalStreetInfo && (
                <p className="street2">{payment.billingAddress.additionalStreetInfo}</p>
              )}
              <p className="city-state-zip">
                {payment.billingAddress.city}, {payment.billingAddress.state}{' '}
                {payment.billingAddress.postalCode}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentReview;

