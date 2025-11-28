// components/Checkout/Steps/DeliveryStep/DeliveryForm.tsx
import React, { useEffect, useRef, useState } from 'react';
import AddressForm, { AddressFields } from '../../Shared/AddressForm';
import { SavedAddress } from '../../Shared/SavedAddressSelector';
import { useCheckout } from '../../../../context/CheckoutContext';
import { mockApiResponses } from '../../../../utils/mockApi';
import GiftMessageForm, { GiftMessageFormRef, GiftMessageData } from './GiftMessageForm';

const DeliveryForm: React.FC = () => {
  const {
    state: { delivery, loading, errors },
    saveShippingAddress,
    saveGiftMessage,
    removeGiftMessage,
    completeDeliveryStep,
    setDeliveryEditing,
  } = useCheckout();

  const giftMessageFormRef = useRef<GiftMessageFormRef>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Fetch saved addresses for logged-in users
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, use mock data
    const addresses = (mockApiResponses.savedAddresses || []) as SavedAddress[];
    setSavedAddresses(addresses);
  }, []);

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
      await saveShippingAddress(shippingAddress);
      
      // Handle gift message if form ref is available
      if (giftMessageFormRef.current) {
        const isGiftOrder = giftMessageFormRef.current.isGiftOrder();
        if (isGiftOrder && giftMessageFormRef.current.validate()) {
          const giftData = giftMessageFormRef.current.getData();
          await saveGiftMessage(giftData);
        } else if (!isGiftOrder && delivery.giftMessage) {
          // Remove gift message if unchecked
          await removeGiftMessage();
        }
      }

      // Complete the delivery step (this already sets currentStep to 2)
      completeDeliveryStep();
      
      // If we were editing, exit edit mode
      if (delivery.isEditing) {
        setDeliveryEditing(false);
      }
    } catch (error) {
      console.error('Failed to save delivery information:', error);
    }
  };

  const handleSaveAndContinue = async () => {
    // Get the address form data
    const form = document.querySelector('.address-form') as HTMLFormElement;
    if (form) {
      // Check if a saved address is selected
      const savedAddressRadio = form.querySelector('input[name="savedAddress"]:checked') as HTMLInputElement;
      
      if (savedAddressRadio && savedAddressRadio.value !== 'add-new') {
        // A saved address is selected, submit it
        const selectedAddress = savedAddresses.find((addr: SavedAddress) => addr.id === savedAddressRadio.value);
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
        <GiftMessageForm
          ref={giftMessageFormRef}
          initialValues={
            delivery.giftMessage
              ? {
                  giftMessage: delivery.giftMessage.giftMessage,
                  giftSenderName: delivery.giftMessage.giftSenderName,
                  giftReceiverName: delivery.giftMessage.giftReceiverName,
                }
              : undefined
          }
          loading={loading.giftMessage}
        />

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

export default DeliveryForm;

