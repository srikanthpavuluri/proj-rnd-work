// components/Checkout/Steps/PaymentStep/index.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddressForm, { AddressFields } from '../../Shared/AddressForm';
import { SavedAddress } from '../../Shared/SavedAddressSelector';
import {
  saveGiftCard,
  removeGiftCard,
  saveCreditCard,
  saveBillingAddress,
  completePaymentStep,
  setPaymentEditing,
} from '../../../../store/checkoutSlice';
import { mockApiResponses } from '../../../../utils/mockApi';

const PaymentStep: React.FC = () => {
  const dispatch = useDispatch();
  const { payment, delivery, loading, errors, cart } = useSelector(
    (state: any) => state.checkout
  );

  const [showGiftCardForm, setShowGiftCardForm] = useState(!!payment.giftCard);
  const [giftCardData, setGiftCardData] = useState({
    cardNumber: '',
    pin: '',
  });
  const [giftCardErrors, setGiftCardErrors] = useState<{ cardNumber?: string; pin?: string }>({});

  const [creditCardData, setCreditCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
  });
  const [creditCardErrors, setCreditCardErrors] = useState<Partial<typeof creditCardData>>({});

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(
    cart?.billingSameAsShipping || false
  );
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, use mock data
    const addresses = (mockApiResponses.savedAddresses || []) as SavedAddress[];
    setSavedAddresses(addresses);
  }, []);

  // If step is complete, show review mode
  if (payment.isComplete && !payment.isEditing) {
    return <PaymentReview />;
  }

  // Gift Card handlers
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
      await dispatch(
        saveGiftCard({
          cardNumber: giftCardData.cardNumber,
          pin: giftCardData.pin,
          amount: 0, // Amount will be calculated on backend
        }) as any
      ).unwrap();
      
      setGiftCardData({ cardNumber: '', pin: '' });
    } catch (error) {
      console.error('Failed to apply gift card:', error);
    }
  };

  const handleRemoveGiftCard = async (paymentId: string) => {
    try {
      await dispatch(removeGiftCard(paymentId) as any).unwrap();
      setShowGiftCardForm(false);
    } catch (error) {
      console.error('Failed to remove gift card:', error);
    }
  };

  // Credit Card handlers
  const handleCreditCardChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreditCardData(prev => ({ ...prev, [name]: value }));
    if (creditCardErrors[name as keyof typeof creditCardErrors]) {
      setCreditCardErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateCreditCard = (): boolean => {
    const errors: Partial<typeof creditCardData> = {};
    
    if (!creditCardData.cardNumber.trim()) {
      errors.cardNumber = 'Please enter a card number.';
    } else if (!/^\d{13,19}$/.test(creditCardData.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Please enter a valid card number.';
    }
    
    if (!creditCardData.cardHolderName.trim()) {
      errors.cardHolderName = 'Please enter the cardholder name.';
    }
    
    if (!creditCardData.expirationMonth) {
      errors.expirationMonth = 'Please select expiration month.';
    }
    
    if (!creditCardData.expirationYear) {
      errors.expirationYear = 'Please select expiration year.';
    }
    
    if (!creditCardData.cvv.trim()) {
      errors.cvv = 'Please enter CVV.';
    } else if (!/^\d{3,4}$/.test(creditCardData.cvv)) {
      errors.cvv = 'Please enter a valid CVV.';
    }
    
    setCreditCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Billing Address handler
  const handleBillingAddressSubmit = async (addressData: AddressFields) => {
    // First validate credit card
    if (!validateCreditCard()) {
      return;
    }

    try {
      // Save credit card
      await dispatch(
        saveCreditCard({
          cardNumber: creditCardData.cardNumber,
          cardHolderName: creditCardData.cardHolderName,
          expirationMonth: creditCardData.expirationMonth,
          expirationYear: creditCardData.expirationYear,
          cvv: creditCardData.cvv,
        }) as any
      ).unwrap();

      // Save billing address
      const billingAddress = {
        firstName: addressData.firstName,
        lastName: addressData.lastName,
        streetName: addressData.addressLineOne,
        additionalStreetInfo: addressData.addressLineTwo || '',
        city: addressData.city,
        state: addressData.state,
        postalCode: addressData.zipCode,
        country: addressData.country,
        phone: addressData.phone || delivery.shippingAddress.phone,
        email: addressData.emailAddress || delivery.shippingAddress.email,
        company: addressData.company || '',
        billingSameAsShipping: addressData.billingSameAsShipping || false,
      };

      await dispatch(saveBillingAddress(billingAddress) as any).unwrap();

      // Complete payment step
      dispatch(completePaymentStep());
    } catch (error) {
      console.error('Failed to save payment information:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear + i);
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div className="payment-step">
      <h2>Payment</h2>

      {/* Gift Card Section */}
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
                disabled={loading.giftCard}
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
                disabled={loading.giftCard}
              />
              {giftCardErrors.pin && (
                <span className="error-message">{giftCardErrors.pin}</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleApplyGiftCard}
              className="apply-button"
              disabled={loading.giftCard}
            >
              {loading.giftCard ? 'Applying...' : 'Apply Gift Card'}
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

        {errors.giftCard && (
          <div className="error-message" role="alert">
            {errors.giftCard}
          </div>
        )}
      </section>

      {/* Credit Card Section */}
      <section className="credit-card-section">
        <h3>Credit/Debit Card</h3>

        <div className="form-field">
          <label htmlFor="creditCardNumber">
            Card Number <span className="required">*</span>
          </label>
          <input
            type="text"
            id="creditCardNumber"
            name="cardNumber"
            value={creditCardData.cardNumber}
            onChange={handleCreditCardChange}
            aria-invalid={!!creditCardErrors.cardNumber}
            disabled={loading.creditCard}
            maxLength={19}
          />
          {creditCardErrors.cardNumber && (
            <span className="error-message">{creditCardErrors.cardNumber}</span>
          )}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="expirationMonth">
              MM/YY <span className="required">*</span>
            </label>
            <select
              id="expirationMonth"
              name="expirationMonth"
              value={creditCardData.expirationMonth}
              onChange={handleCreditCardChange}
              aria-invalid={!!creditCardErrors.expirationMonth}
              disabled={loading.creditCard}
            >
              <option value="">MM</option>
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.value}
                </option>
              ))}
            </select>
            {creditCardErrors.expirationMonth && (
              <span className="error-message">{creditCardErrors.expirationMonth}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="expirationYear" className="sr-only">
              Year
            </label>
            <select
              id="expirationYear"
              name="expirationYear"
              value={creditCardData.expirationYear}
              onChange={handleCreditCardChange}
              aria-invalid={!!creditCardErrors.expirationYear}
              disabled={loading.creditCard}
            >
              <option value="">YY</option>
              {years.map((year) => (
                <option key={year} value={year.toString().slice(-2)}>
                  {year.toString().slice(-2)}
                </option>
              ))}
            </select>
            {creditCardErrors.expirationYear && (
              <span className="error-message">{creditCardErrors.expirationYear}</span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="cvv">
              CVV <span className="required">*</span>
            </label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={creditCardData.cvv}
              onChange={handleCreditCardChange}
              aria-invalid={!!creditCardErrors.cvv}
              disabled={loading.creditCard}
              maxLength={4}
            />
            {creditCardErrors.cvv && (
              <span className="error-message">{creditCardErrors.cvv}</span>
            )}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="cardHolderName">
            Cardholder Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="cardHolderName"
            name="cardHolderName"
            value={creditCardData.cardHolderName}
            onChange={handleCreditCardChange}
            aria-invalid={!!creditCardErrors.cardHolderName}
            disabled={loading.creditCard}
          />
          {creditCardErrors.cardHolderName && (
            <span className="error-message">{creditCardErrors.cardHolderName}</span>
          )}
        </div>
      </section>

      {/* Billing Address Section */}
      <section className="billing-address-section">
        <h3>Billing Address</h3>
        <AddressForm
          initialValues={
            payment.billingAddress
              ? {
                  firstName: payment.billingAddress.firstName,
                  lastName: payment.billingAddress.lastName,
                  company: payment.billingAddress.company,
                  addressLineOne: payment.billingAddress.streetName,
                  addressLineTwo: payment.billingAddress.additionalStreetInfo,
                  city: payment.billingAddress.city,
                  state: payment.billingAddress.state,
                  zipCode: payment.billingAddress.postalCode,
                  country: payment.billingAddress.country,
                  emailAddress: payment.billingAddress.email,
                  phone: payment.billingAddress.phone,
                  billingSameAsShipping: payment.billingAddress.billingSameAsShipping,
                }
              : undefined
          }
          onSubmit={handleBillingAddressSubmit}
          isBilling={true}
          showBillingSameAsShipping={true}
          loading={loading.billingAddress || loading.creditCard}
          error={errors.billingAddress || errors.creditCard}
          savedAddresses={savedAddresses}
        />
      </section>
    </div>
  );
};

// Review mode component when payment is complete
const PaymentReview: React.FC = () => {
  const dispatch = useDispatch();
  const { payment } = useSelector((state: any) => state.checkout);

  const handleEdit = () => {
    dispatch(setPaymentEditing(true));
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

export default PaymentStep;

