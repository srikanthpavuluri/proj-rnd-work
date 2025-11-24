// components/Checkout/Steps/DeliveryStep/index.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddressForm, { AddressFields } from '../../Shared/AddressForm';
import { SavedAddress } from '../../Shared/SavedAddressSelector';
import {
  saveShippingAddress,
  saveGiftMessage,
  removeGiftMessage,
  completeDeliveryStep,
  setDeliveryEditing,
} from '../../../../store/checkoutSlice';
import { mockApiResponses } from '../../../../utils/mockApi';

interface GiftMessageData {
  giftMessage: string;
  giftSenderName: string;
  giftReceiverName: string;
}

const DeliveryStep: React.FC = () => {
  const dispatch = useDispatch();
  const {
    delivery,
    loading,
    errors,
  } = useSelector((state: any) => state.checkout);

  const [isGiftOrder, setIsGiftOrder] = useState(!!delivery.giftMessage);
  const [giftFormData, setGiftFormData] = useState<GiftMessageData>({
    giftMessage: delivery.giftMessage?.giftMessage || '',
    giftSenderName: delivery.giftMessage?.giftSenderName || '',
    giftReceiverName: delivery.giftMessage?.giftReceiverName || '',
  });
  const [giftErrors, setGiftErrors] = useState<Partial<GiftMessageData>>({});
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, use mock data
    const addresses = (mockApiResponses.savedAddresses || []) as SavedAddress[];
    setSavedAddresses(addresses);
  }, []);

  // If step is complete and we're editing, show edit mode
  // Otherwise, the main Checkout component will show DeliveryReview when on step 2
  // We always show the form here if we're on step 1 or if editing

  const handleAddressSubmit = async (addressData: AddressFields) => {
    const shippingAddress = {
      firstName: addressData.firstName,
      lastName: addressData.lastName,
      streetName: addressData.addressLineOne,
      additionalStreetInfo: addressData.addressLineTwo || '',
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.zipCode,
      country: addressData.country,
      phone: addressData.phone,
      email: addressData.emailAddress,
      company: addressData.company || '',
    };

    try {
      await dispatch(saveShippingAddress(shippingAddress) as any).unwrap();
      
      // If there's a gift message, save it
      if (isGiftOrder && validateGiftMessage()) {
        await dispatch(saveGiftMessage(giftFormData) as any).unwrap();
      } else if (!isGiftOrder && delivery.giftMessage) {
        // Remove gift message if unchecked
        await dispatch(removeGiftMessage() as any).unwrap();
      }

      // Complete the delivery step
      dispatch(completeDeliveryStep());
    } catch (error) {
      console.error('Failed to save delivery information:', error);
    }
  };

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

  const handleSaveAndContinue = async () => {
    // Get the address form data
    const form = document.querySelector('.address-form') as HTMLFormElement;
    if (form) {
      // Check if a saved address is selected
      const savedAddressRadio = form.querySelector('input[name="savedAddress"]:checked') as HTMLInputElement;
      
      if (savedAddressRadio && savedAddressRadio.value !== 'add-new') {
        // A saved address is selected, submit it
        const selectedAddress = savedAddresses.find(addr => addr.id === savedAddressRadio.value);
        if (selectedAddress) {
          const addressData: AddressFields = {
            firstName: selectedAddress.firstName,
            lastName: selectedAddress.lastName,
            company: selectedAddress.company || '',
            addressLineOne: selectedAddress.streetName,
            addressLineTwo: selectedAddress.additionalStreetInfo || '',
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.postalCode,
            country: selectedAddress.country,
            emailAddress: selectedAddress.email || '',
            phone: selectedAddress.phone,
            billingSameAsShipping: false,
          };
          await handleAddressSubmit(addressData);
        }
      } else {
        // Trigger the form submission which will validate and call handleAddressSubmit
        form.requestSubmit();
      }
    }
  };

  return (
    <div className="delivery-step">
      <h2>Delivery</h2>

      <div className="delivery-forms">
        {/* Shipping Address Form */}
        <section className="shipping-address-section">
          <h3>Shipping Address</h3>
          <AddressForm
            initialValues={
              delivery.shippingAddress
                ? {
                    firstName: delivery.shippingAddress.firstName,
                    lastName: delivery.shippingAddress.lastName,
                    company: delivery.shippingAddress.company,
                    addressLineOne: delivery.shippingAddress.streetName,
                    addressLineTwo: delivery.shippingAddress.additionalStreetInfo,
                    city: delivery.shippingAddress.city,
                    state: delivery.shippingAddress.state,
                    zipCode: delivery.shippingAddress.postalCode,
                    country: delivery.shippingAddress.country,
                    emailAddress: delivery.shippingAddress.email,
                    phone: delivery.shippingAddress.phone,
                  }
                : undefined
            }
            onSubmit={handleAddressSubmit}
            isShipping={true}
            loading={loading.shippingAddress || loading.giftMessage}
            error={errors.shippingAddress}
            savedAddresses={savedAddresses}
            showSubmitButton={false}
          />
        </section>

        {/* Gift Message Form */}
        <section className="gift-message-section">
          <h3>Gift Message</h3>
          <div className="gift-checkbox">
            <label>
              <input
                type="checkbox"
                checked={isGiftOrder}
                onChange={handleGiftCheckboxChange}
                disabled={loading.giftMessage}
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
                  Sender's Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="giftSenderName"
                  name="giftSenderName"
                  value={giftFormData.giftSenderName}
                  onChange={handleGiftInputChange}
                  aria-invalid={!!giftErrors.giftSenderName}
                  aria-describedby={giftErrors.giftSenderName ? 'giftSenderName-error' : undefined}
                  disabled={loading.giftMessage}
                />
                {giftErrors.giftSenderName && (
                  <span id="giftSenderName-error" className="error-message" role="alert">
                    {giftErrors.giftSenderName}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="giftReceiverName">
                  Recipient's Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="giftReceiverName"
                  name="giftReceiverName"
                  value={giftFormData.giftReceiverName}
                  onChange={handleGiftInputChange}
                  aria-invalid={!!giftErrors.giftReceiverName}
                  aria-describedby={giftErrors.giftReceiverName ? 'giftReceiverName-error' : undefined}
                  disabled={loading.giftMessage}
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
                  disabled={loading.giftMessage}
                  placeholder="Enter your gift message here..."
                />
                <div className="char-counter">
                  {remainingChars} characters remaining
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Save & Continue Button */}
        <div className="delivery-actions">
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="submit-button"
            disabled={loading.shippingAddress || loading.giftMessage}
          >
            {loading.shippingAddress || loading.giftMessage ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Review mode component when delivery is complete
export const DeliveryReview: React.FC = () => {
  const dispatch = useDispatch();
  const { delivery } = useSelector((state: any) => state.checkout);

  const handleEdit = () => {
    dispatch(setDeliveryEditing(true));
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

export default DeliveryStep;

