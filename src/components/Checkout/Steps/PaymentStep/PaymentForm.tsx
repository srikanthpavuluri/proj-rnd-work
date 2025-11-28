// components/Checkout/Steps/PaymentStep/PaymentForm.tsx
import React, { useState, useEffect } from 'react';
import AddressForm, { AddressFields } from '../../Shared/AddressForm';
import { SavedAddress } from '../../Shared/SavedAddressSelector';
import { useCheckout } from '../../../../context/CheckoutContext';
import { mockApiResponses } from '../../../../utils/mockApi';
import GiftCardForm from './GiftCardForm';

const PaymentForm: React.FC = () => {
  const {
    state: { payment, delivery, loading, errors },
    saveGiftCard,
    removeGiftCard,
    saveCreditCard,
    saveBillingAddress,
    completePaymentStep,
  } = useCheckout();

  const [creditCardData, setCreditCardData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
  });
  const [creditCardErrors, setCreditCardErrors] = useState<Partial<typeof creditCardData>>({});

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, use mock data
    const addresses = (mockApiResponses.savedAddresses || []) as SavedAddress[];
    setSavedAddresses(addresses);
  }, []);

  const handleApplyGiftCard = async (cardNumber: string, pin: string) => {
    await saveGiftCard({
      cardNumber,
      pin,
      amount: 0, // Amount will be calculated on backend
    });
  };

  const handleRemoveGiftCard = async (paymentId: string) => {
    await removeGiftCard(paymentId);
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
      await saveCreditCard({
        cardNumber: creditCardData.cardNumber,
        cardHolderName: creditCardData.cardHolderName,
        expirationMonth: creditCardData.expirationMonth,
        expirationYear: creditCardData.expirationYear,
        cvv: creditCardData.cvv,
      });

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
        phone: addressData.phone || delivery.shippingAddress?.phone || '',
        email: addressData.emailAddress || delivery.shippingAddress?.email || '',
        company: addressData.company || '',
        billingSameAsShipping: addressData.billingSameAsShipping || false,
      };

      await saveBillingAddress(billingAddress);

      // Complete payment step
      completePaymentStep();
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
      <GiftCardForm
        onApply={handleApplyGiftCard}
        onRemove={handleRemoveGiftCard}
        loading={loading.giftCard}
        error={errors.giftCard}
      />

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

export default PaymentForm;

