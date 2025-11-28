// components/Checkout/Steps/DeliveryStep/DeliveryReview.tsx
import React from 'react';
import { useCheckout } from '../../../../context/CheckoutContext';

const DeliveryReview: React.FC = () => {
  const {
    state: { delivery },
    setDeliveryEditing,
  } = useCheckout();

  const handleEdit = () => {
    setDeliveryEditing(true);
  };

  const { shippingAddress, giftMessage } = delivery;

  return (
    <div className="delivery-review">
      <div className="section-header">
        <h3>Delivery</h3>
        <button onClick={handleEdit} className="edit-button">
          Edit
        </button>
      </div>

      {shippingAddress && (
        <div className="address-display">
          <h4>Shipping Address</h4>
          <p className="name">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </p>
          {shippingAddress.company && (
            <p className="company">{shippingAddress.company}</p>
          )}
          <p className="street">{shippingAddress.streetName}</p>
          {shippingAddress.additionalStreetInfo && (
            <p className="street2">{shippingAddress.additionalStreetInfo}</p>
          )}
          <p className="city-state-zip">
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          </p>
          <p className="email">{shippingAddress.email}</p>
          <p className="phone">{shippingAddress.phone}</p>
        </div>
      )}

      {giftMessage && (
        <div className="gift-message-display">
          <h4>Gift Message</h4>
          <p className="gift-label">This order is a gift</p>
          <p>
            <strong>From:</strong> {giftMessage.giftSenderName}
          </p>
          <p>
            <strong>To:</strong> {giftMessage.giftReceiverName}
          </p>
          {giftMessage.giftMessage && (
            <p>
              <strong>Message:</strong> {giftMessage.giftMessage}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DeliveryReview;

