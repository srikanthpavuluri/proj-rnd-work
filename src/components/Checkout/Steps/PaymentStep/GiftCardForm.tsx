// components/Checkout/Steps/PaymentStep/GiftCardForm.tsx
import React, { useState } from 'react';
import { useCheckout } from '../../../../context/CheckoutContext';

interface GiftCardFormProps {
  onApply: (cardNumber: string, pin: string) => Promise<void>;
  onRemove: (paymentId: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const GiftCardForm: React.FC<GiftCardFormProps> = ({
  onApply,
  onRemove,
  loading = false,
  error = null,
}) => {
  const {
    state: { payment },
  } = useCheckout();

  const [showGiftCardForm, setShowGiftCardForm] = useState(!!payment.giftCard);
  const [giftCardData, setGiftCardData] = useState({
    cardNumber: '',
    pin: '',
  });
  const [giftCardErrors, setGiftCardErrors] = useState<{ cardNumber?: string; pin?: string }>({});

  const handleGiftCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGiftCardData(prev => ({ ...prev, [name]: value }));
    if (giftCardErrors[name as keyof typeof giftCardErrors]) {
      setGiftCardErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateGiftCard = (): boolean => {
    const errors: { cardNumber?: string; pin?: string } = {};
    if (!giftCardData.cardNumber.trim()) {
      errors.cardNumber = 'Please enter a gift card number.';
    }
    if (!giftCardData.pin.trim()) {
      errors.pin = 'Please enter the PIN.';
    }
    setGiftCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApplyGiftCard = async () => {
    if (!validateGiftCard()) return;

    try {
      await onApply(giftCardData.cardNumber, giftCardData.pin);
      setGiftCardData({ cardNumber: '', pin: '' });
    } catch (error) {
      console.error('Failed to apply gift card:', error);
    }
  };

  const handleRemoveGiftCard = async (paymentId: string) => {
    try {
      await onRemove(paymentId);
      setShowGiftCardForm(false);
    } catch (error) {
      console.error('Failed to remove gift card:', error);
    }
  };

  return (
    <section className="gift-card-section">
      <div className="section-header">
        <input
          type="checkbox"
          id="showGiftCard"
          checked={showGiftCardForm}
          onChange={(e) => setShowGiftCardForm(e.target.checked)}
        />
        <label htmlFor="showGiftCard">Gift Card</label>
      </div>

      {showGiftCardForm && !payment.giftCard && (
        <div className="gift-card-form">
          <div className="form-field">
            <label htmlFor="cardNumber">Gift Card Number</label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={giftCardData.cardNumber}
              onChange={handleGiftCardChange}
              aria-invalid={!!giftCardErrors.cardNumber}
              disabled={loading}
            />
            {giftCardErrors.cardNumber && (
              <span className="error-message">{giftCardErrors.cardNumber}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="pin">PIN</label>
            <input
              type="text"
              id="pin"
              name="pin"
              value={giftCardData.pin}
              onChange={handleGiftCardChange}
              aria-invalid={!!giftCardErrors.pin}
              disabled={loading}
            />
            {giftCardErrors.pin && (
              <span className="error-message">{giftCardErrors.pin}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleApplyGiftCard}
            className="apply-button"
            disabled={loading}
          >
            {loading ? 'Applying...' : 'Apply Gift Card'}
          </button>
        </div>
      )}

      {payment.giftCard && (
        <div className="applied-gift-card">
          <p>
            Gift Card ending in {payment.giftCard.last4Digits} - $
            {payment.giftCard.appliedAmount?.toFixed(2)}
          </p>
          <button
            type="button"
            onClick={() => handleRemoveGiftCard(payment.giftCard?.id || '')}
            className="remove-button"
          >
            Remove
          </button>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}
    </section>
  );
};

export default GiftCardForm;

