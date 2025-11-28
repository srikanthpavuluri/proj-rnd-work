// components/Checkout/Shared/AddressForm.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useGooglePlaces } from '../../../hooks/useGooglePlaces';
import SavedAddressSelector, { SavedAddress } from './SavedAddressSelector';
import { useCheckout } from '../../../context/CheckoutContext';

interface AddressFormProps {
  initialValues?: AddressFields;
  onSubmit: (values: AddressFields) => void;
  isShipping?: boolean;
  isBilling?: boolean;
  showBillingSameAsShipping?: boolean;
  loading?: boolean;
  error?: string | null;
  savedAddresses?: SavedAddress[];
  onSelectSavedAddress?: (address: SavedAddress) => void;
  showSubmitButton?: boolean;
}

export interface AddressFields {
  firstName: string;
  lastName: string;
  company?: string;
  addressLineOne: string;
  addressLineTwo?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emailAddress: string;
  phone: string;
  billingSameAsShipping?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  initialValues,
  onSubmit,
  isShipping = false,
  isBilling = false,
  showBillingSameAsShipping = false,
  loading = false,
  error = null,
  savedAddresses = [],
  onSelectSavedAddress,
  showSubmitButton = true,
}) => {
  const {
    state: { delivery },
  } = useCheckout();
  const shippingAddress = delivery.shippingAddress;
  
  const [formData, setFormData] = useState<AddressFields>({
    firstName: '',
    lastName: '',
    company: '',
    addressLineOne: '',
    addressLineTwo: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    emailAddress: '',
    phone: '',
    billingSameAsShipping: false,
    ...initialValues,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AddressFields, string>>>({});
  const [companyActive, setCompanyActive] = useState(!!initialValues?.company);
  const [address2Active, setAddress2Active] = useState(!!initialValues?.addressLineTwo);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  // Show new address form by default only if no saved addresses, or if initial values are provided (editing)
  // If saved addresses exist, form is hidden until "Add New Address" is selected
  const [showNewAddressForm, setShowNewAddressForm] = useState(savedAddresses.length === 0 || !!initialValues);
  
  // Ref for address input to attach Google Places autocomplete
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Parse Google Places address components
  const parseAddressComponents = (addressComponents: any[]) => {
    const address: any = {
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
    };

    addressComponents.forEach((component) => {
      const type = component.types[0];
      const value = component.long_name;

      switch (type) {
        case 'street_number':
          address.streetNumber = value;
          break;
        case 'route':
          address.route = value;
          break;
        case 'locality':
        case 'postal_town':
          address.city = value;
          break;
        case 'administrative_area_level_1':
          address.state = component.short_name;
          break;
        case 'postal_code':
          address.zipCode = value;
          break;
        case 'country':
          address.country = component.short_name;
          break;
      }
    });

    return address;
  };

  // Handle Google Places place selection (works for both real API and mock data)
  const handlePlaceSelect = (place: any) => {
    if (!place.address_components) return;

    const parsed = parseAddressComponents(place.address_components);
    const streetAddress = [parsed.streetNumber, parsed.route]
      .filter(Boolean)
      .join(' ');

    setFormData(prev => ({
      ...prev,
      addressLineOne: streetAddress,
      city: parsed.city || prev.city,
      state: parsed.state || prev.state,
      zipCode: parsed.zipCode || prev.zipCode,
      country: parsed.country || prev.country,
    }));

    // Clear address errors when place is selected
    setErrors(prev => ({
      ...prev,
      addressLineOne: undefined,
      city: undefined,
      state: undefined,
      zipCode: undefined,
    }));
  };

  // Initialize Google Places autocomplete - only if input is not disabled
  const isAddressInputDisabled = loading || (formData.billingSameAsShipping && isBilling);
  const { showMockSuggestions, filteredAddresses, selectMockAddress, updateSuggestions } = useGooglePlaces({
    inputRef: addressInputRef,
    onPlaceSelect: handlePlaceSelect,
    disabled: isAddressInputDisabled,
  });

  // Watch addressLineOne changes and update suggestions
  useEffect(() => {
    if (!isAddressInputDisabled && updateSuggestions && formData.addressLineOne.length >= 2) {
      updateSuggestions(formData.addressLineOne);
    }
  }, [formData.addressLineOne, isAddressInputDisabled, updateSuggestions]);

  // Auto-fill billing address from shipping when checkbox is checked
  useEffect(() => {
    if (formData.billingSameAsShipping && shippingAddress) {
      setFormData(prev => ({
        ...prev,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        company: shippingAddress.company || '',
        addressLineOne: shippingAddress.streetName,
        addressLineTwo: shippingAddress.additionalStreetInfo || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        zipCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        phone: shippingAddress.phone,
      }));
    }
  }, [formData.billingSameAsShipping, shippingAddress]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    // Ensure we can update the state
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof AddressFields]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Ensure address input is always editable - run on every render to catch any interference
  useEffect(() => {
    const input = addressInputRef.current;
    if (input && !isAddressInputDisabled) {
      // Force remove readonly
      input.removeAttribute('readonly');
      // Ensure it's not disabled
      if (input.disabled) {
        input.disabled = false;
      }
      // Ensure autocomplete doesn't block
      input.setAttribute('autocomplete', 'off');
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFields, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Please enter a first name.';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Please enter a last name.';
    }
    if (!formData.addressLineOne.trim()) {
      newErrors.addressLineOne = 'Please enter an address.';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Please enter a city.';
    }
    if (!formData.state) {
      newErrors.state = 'Please select a state.';
    }
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'Please enter a ZIP Code.';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP Code.';
    }
    if (isShipping && !formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Please enter an email address.';
    } else if (formData.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address.';
    }
    if (isShipping && !formData.phone.trim()) {
      newErrors.phone = 'Please enter a phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If a saved address is selected (not "Add New"), submit that address
    if (selectedSavedAddressId && selectedSavedAddressId !== 'add-new') {
      const selectedAddress = savedAddresses.find(addr => addr.id === selectedSavedAddressId);
      if (selectedAddress) {
        // Convert SavedAddress to AddressFields format
        const addressFields: AddressFields = {
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
          billingSameAsShipping: formData.billingSameAsShipping,
        };
        onSubmit(addressFields);
        return;
      }
    }
    
    // Otherwise, validate and submit the form data (for "Add New Address")
    if (validateForm()) {
      onSubmit(formData);
    } else {
      // Scroll to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const statesList = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
  ];

  // Handle saved address selection
  const handleSelectSavedAddress = (address: SavedAddress | null) => {
    if (address) {
      setSelectedSavedAddressId(address.id);
      setShowNewAddressForm(false); // Don't show form when saved address is selected
      
      // Clear form data
      setFormData({
        firstName: '',
        lastName: '',
        company: '',
        addressLineOne: '',
        addressLineTwo: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US',
        emailAddress: '',
        phone: '',
        billingSameAsShipping: formData.billingSameAsShipping,
      });

      // Clear errors
      setErrors({});

      // Notify parent component (for tracking only, no auto-submit)
      if (onSelectSavedAddress) {
        onSelectSavedAddress(address);
      }
    } else {
      setSelectedSavedAddressId(null);
    }
  };

  const handleAddNewAddress = () => {
    setSelectedSavedAddressId('add-new'); // Mark "Add New" as selected
    setShowNewAddressForm(true); // Show form only when "Add New" is selected
    setFormData({
      firstName: '',
      lastName: '',
      company: '',
      addressLineOne: '',
      addressLineTwo: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      emailAddress: '',
      phone: '',
      billingSameAsShipping: formData.billingSameAsShipping,
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="address-form">
      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
        </div>
      )}

      {showBillingSameAsShipping && (
        <div className="form-field checkbox-field">
          <label>
            <input
              type="checkbox"
              name="billingSameAsShipping"
              checked={formData.billingSameAsShipping}
              onChange={handleChange}
            />
            <span>My billing and shipping information is the same.</span>
          </label>
        </div>
      )}

      {/* Saved Address Selector - only show if user has saved addresses */}
      {savedAddresses.length > 0 && (
        <SavedAddressSelector
          savedAddresses={savedAddresses}
          selectedAddressId={selectedSavedAddressId}
          onSelectAddress={handleSelectSavedAddress}
          onAddNew={handleAddNewAddress}
          loading={loading}
          label={isShipping ? 'Select Shipping Address' : 'Select Billing Address'}
        />
      )}

      {/* Address Form - show only when "Add New Address" is selected */}
      {showNewAddressForm && selectedSavedAddressId === 'add-new' && (
        <>
          <div className="form-row">
        <div className="form-field">
          <label htmlFor="firstName">
            First Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          />
          {errors.firstName && (
            <span id="firstName-error" className="error-message" role="alert">
              {errors.firstName}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="lastName">
            Last Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          />
          {errors.lastName && (
            <span id="lastName-error" className="error-message" role="alert">
              {errors.lastName}
            </span>
          )}
        </div>
      </div>

      {!companyActive ? (
        <button
          type="button"
          className="add-optional-field"
          onClick={() => setCompanyActive(true)}
        >
          + Add Company
        </button>
      ) : (
        <div className="form-field">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          />
        </div>
      )}

      <div className="form-field" style={{ position: 'relative' }}>
        <label htmlFor="addressLineOne">
          Address <span className="required">*</span>
        </label>
        <input
          ref={addressInputRef}
          type="text"
          id="addressLineOne"
          name="addressLineOne"
          value={formData.addressLineOne}
          onChange={handleChange}
          aria-invalid={!!errors.addressLineOne}
          aria-describedby={errors.addressLineOne ? 'addressLineOne-error' : undefined}
          disabled={loading || (formData.billingSameAsShipping && isBilling)}
          placeholder="Start typing your address..."
          autoComplete="off"
          readOnly={false}
        />
        {errors.addressLineOne && (
          <span id="addressLineOne-error" className="error-message" role="alert">
            {errors.addressLineOne}
          </span>
        )}
        <small style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
          Start typing to see address suggestions (using test data)
        </small>
        {showMockSuggestions && filteredAddresses.length > 0 && (
          <div
            className="pac-container"
            style={{
              position: 'absolute',
              zIndex: 1000,
              width: addressInputRef.current?.offsetWidth || '100%',
              marginTop: '4px',
            }}
          >
            {filteredAddresses.map((address, index) => (
              <div
                key={index}
                className="pac-item"
                onClick={() => selectMockAddress(address)}
                onMouseDown={(e) => e.preventDefault()}
              >
                <span className="pac-icon pac-icon-marker"></span>
                <span className="pac-matched">{address.formatted_address}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!address2Active ? (
        <button
          type="button"
          className="add-optional-field"
          onClick={() => setAddress2Active(true)}
        >
          + Add Apartment, Suite, Building
        </button>
      ) : (
        <div className="form-field">
          <label htmlFor="addressLineTwo">Apartment, Suite, Building</label>
          <input
            type="text"
            id="addressLineTwo"
            name="addressLineTwo"
            value={formData.addressLineTwo}
            onChange={handleChange}
            maxLength={40}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="city">
            City <span className="required">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          />
          {errors.city && (
            <span id="city-error" className="error-message" role="alert">
              {errors.city}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="state">
            State <span className="required">*</span>
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? 'state-error' : undefined}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          >
            <option value="">Select a state</option>
            {statesList.map(state => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
          {errors.state && (
            <span id="state-error" className="error-message" role="alert">
              {errors.state}
            </span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="zipCode">
            ZIP Code <span className="required">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            maxLength={10}
            aria-invalid={!!errors.zipCode}
            aria-describedby={errors.zipCode ? 'zipCode-error' : undefined}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          />
          {errors.zipCode && (
            <span id="zipCode-error" className="error-message" role="alert">
              {errors.zipCode}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            disabled={loading || (formData.billingSameAsShipping && isBilling)}
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>

      {isShipping && (
        <>
          <div className="form-field">
            <label htmlFor="emailAddress">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="emailAddress"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              aria-invalid={!!errors.emailAddress}
              aria-describedby={errors.emailAddress ? 'emailAddress-error' : undefined}
              disabled={loading}
            />
            {errors.emailAddress && (
              <span id="emailAddress-error" className="error-message" role="alert">
                {errors.emailAddress}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="phone">
              Phone <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={17}
              placeholder="(•••) •••-••••"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              disabled={loading}
            />
            {errors.phone && (
              <span id="phone-error" className="error-message" role="alert">
                {errors.phone}
              </span>
            )}
            <small>Some shipping carriers require a phone number for delivery.</small>
          </div>
        </>
      )}

      {/* Submit button - only show if showSubmitButton is true */}
      {showSubmitButton && (
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Saving...' : 'Save & Continue'}
        </button>
      )}
        </>
      )}
    </form>
  );
};

export default AddressForm;

