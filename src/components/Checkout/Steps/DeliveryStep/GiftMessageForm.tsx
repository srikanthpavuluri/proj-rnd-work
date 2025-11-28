// components/Checkout/Steps/DeliveryStep/GiftMessageForm.tsx
import React, { useState, forwardRef, useImperativeHandle } from 'react';

export interface GiftMessageData {
  giftMessage: string;
  giftSenderName: string;
  giftReceiverName: string;
}

export interface GiftMessageFormRef {
  validate: () => boolean;
  getData: () => GiftMessageData;
  isGiftOrder: () => boolean;
}

interface GiftMessageFormProps {
  initialValues?: GiftMessageData;
  loading?: boolean;
}

const GiftMessageForm = forwardRef<GiftMessageFormRef, GiftMessageFormProps>(({
  initialValues,
  loading = false,
}, ref) => {
  const [isGiftOrder, setIsGiftOrder] = useState(!!initialValues);
  const [giftFormData, setGiftFormData] = useState<GiftMessageData>({
    giftMessage: initialValues?.giftMessage || '',
    giftSenderName: initialValues?.giftSenderName || '',
    giftReceiverName: initialValues?.giftReceiverName || '',
  });
  const [giftErrors, setGiftErrors] = useState<Partial<GiftMessageData>>({});

  const handleGiftCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsGiftOrder(e.target.checked);
    if (!e.target.checked) {
      setGiftFormData({
        giftMessage: '',
        giftSenderName: '',
        giftReceiverName: '',
      });
      setGiftErrors({});
    }
  };

  const handleGiftInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGiftFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (giftErrors[name as keyof GiftMessageData]) {
      setGiftErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateGiftMessage = (): boolean => {
    if (!isGiftOrder) return true;

    const newErrors: Partial<GiftMessageData> = {};
    
    if (!giftFormData.giftSenderName.trim()) {
      newErrors.giftSenderName = "Please enter sender's name.";
    }
    if (!giftFormData.giftReceiverName.trim()) {
      newErrors.giftReceiverName = "Please enter recipient's name.";
    }

    setGiftErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const remainingChars = 72 - giftFormData.giftMessage.length;

  // Expose validation function to parent
  useImperativeHandle(ref, () => ({
    validate: validateGiftMessage,
    getData: () => giftFormData,
    isGiftOrder: () => isGiftOrder,
  }));

  return (
    <section className="gift-message-section">
      <h3>Gift Message</h3>
      <div className="gift-checkbox">
        <label>
          <input
            type="checkbox"
            checked={isGiftOrder}
            onChange={handleGiftCheckboxChange}
            disabled={loading}
          />
          <span>This order is a gift.</span>
        </label>
      </div>

      {isGiftOrder && (
        <div className="gift-message-form">
          <p className="gift-instructions">
            Select if you would like to send a gift. Otherwise, select Save & Continue.
          </p>

          <div className="form-field">
            <label htmlFor="giftSenderName">
              Sender&apos;s Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="giftSenderName"
              name="giftSenderName"
              value={giftFormData.giftSenderName}
              onChange={handleGiftInputChange}
              aria-invalid={!!giftErrors.giftSenderName}
              aria-describedby={giftErrors.giftSenderName ? 'giftSenderName-error' : undefined}
              disabled={loading}
            />
            {giftErrors.giftSenderName && (
              <span id="giftSenderName-error" className="error-message" role="alert">
                {giftErrors.giftSenderName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="giftReceiverName">
              Recipient&apos;s Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="giftReceiverName"
              name="giftReceiverName"
              value={giftFormData.giftReceiverName}
              onChange={handleGiftInputChange}
              aria-invalid={!!giftErrors.giftReceiverName}
              aria-describedby={giftErrors.giftReceiverName ? 'giftReceiverName-error' : undefined}
              disabled={loading}
            />
            {giftErrors.giftReceiverName && (
              <span id="giftReceiverName-error" className="error-message" role="alert">
                {giftErrors.giftReceiverName}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="giftMessage">Gift Message</label>
            <textarea
              id="giftMessage"
              name="giftMessage"
              value={giftFormData.giftMessage}
              onChange={handleGiftInputChange}
              maxLength={72}
              rows={4}
              disabled={loading}
              placeholder="Enter your gift message here..."
            />
            <div className="char-counter">
              {remainingChars} characters remaining
            </div>
          </div>
        </div>
      )}
    </section>
  );
});

GiftMessageForm.displayName = 'GiftMessageForm';

export default GiftMessageForm;

