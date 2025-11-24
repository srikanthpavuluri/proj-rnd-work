// components/Checkout/Shared/SavedAddressSelector.tsx
import React from 'react';

export interface SavedAddress {
  id: string;
  key: string;
  firstName: string;
  lastName: string;
  company?: string;
  streetName: string;
  additionalStreetInfo?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
  isDefault?: boolean;
}

interface SavedAddressSelectorProps {
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: SavedAddress | null) => void;
  onAddNew: () => void;
  loading?: boolean;
  label?: string;
}

const SavedAddressSelector: React.FC<SavedAddressSelectorProps> = ({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onAddNew,
  loading = false,
  label = 'Select Address',
}) => {
  if (savedAddresses.length === 0) {
    return null; // Don't show selector if no saved addresses
  }

  const formatAddress = (address: SavedAddress): string => {
    const parts = [
      address.streetName,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const isAddNewSelected = selectedAddressId === 'add-new';

  return (
    <div className="saved-address-selector">
      <div className="selector-header">
        <label>{label}</label>
      </div>

      <div className="address-options">
        <div className="address-list">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              className={`address-option ${selectedAddressId === address.id ? 'selected' : ''}`}
              onClick={() => {
                onSelectAddress(address);
              }}
            >
              <div className="address-radio">
                <input
                  type="radio"
                  name="savedAddress"
                  value={address.id}
                  checked={selectedAddressId === address.id}
                  onChange={() => {
                    onSelectAddress(address);
                  }}
                  disabled={loading}
                />
              </div>
              <div className="address-details">
                <div className="address-header">
                  <span className="address-name">
                    {address.firstName} {address.lastName}
                  </span>
                  {address.isDefault && (
                    <span className="default-badge">Default</span>
                  )}
                </div>
                {address.company && (
                  <p className="address-company">{address.company}</p>
                )}
                <p className="address-line">{formatAddress(address)}</p>
                {address.phone && (
                  <p className="address-phone">{address.phone}</p>
                )}
              </div>
            </div>
          ))}
          
          {/* Add New Address as a radio option */}
          <div
            className={`address-option ${isAddNewSelected ? 'selected' : ''}`}
            onClick={() => {
              onAddNew();
            }}
          >
            <div className="address-radio">
              <input
                type="radio"
                name="savedAddress"
                value="add-new"
                checked={isAddNewSelected}
                onChange={() => {
                  onAddNew();
                }}
                disabled={loading}
              />
            </div>
            <div className="address-details">
              <span className="address-name">Add New Address</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedAddressSelector;

