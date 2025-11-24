import { useEffect, useRef, RefObject, useState } from 'react';

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
  }
}

interface UseGooglePlacesProps {
  inputRef: RefObject<HTMLInputElement>;
  onPlaceSelect: (place: any) => void;
  disabled?: boolean;
}

// Mock address data for testing without API key
const MOCK_ADDRESSES = [
  {
    formatted_address: '123 Main Street, Oklahoma City, OK 73114, USA',
    address_components: [
      { long_name: '123', short_name: '123', types: ['street_number'] },
      { long_name: 'Main Street', short_name: 'Main St', types: ['route'] },
      { long_name: 'Oklahoma City', short_name: 'Oklahoma City', types: ['locality'] },
      { long_name: 'Oklahoma', short_name: 'OK', types: ['administrative_area_level_1'] },
      { long_name: '73114', short_name: '73114', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '456 Oak Avenue, Tulsa, OK 74103, USA',
    address_components: [
      { long_name: '456', short_name: '456', types: ['street_number'] },
      { long_name: 'Oak Avenue', short_name: 'Oak Ave', types: ['route'] },
      { long_name: 'Tulsa', short_name: 'Tulsa', types: ['locality'] },
      { long_name: 'Oklahoma', short_name: 'OK', types: ['administrative_area_level_1'] },
      { long_name: '74103', short_name: '74103', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '789 Elm Street, Norman, OK 73069, USA',
    address_components: [
      { long_name: '789', short_name: '789', types: ['street_number'] },
      { long_name: 'Elm Street', short_name: 'Elm St', types: ['route'] },
      { long_name: 'Norman', short_name: 'Norman', types: ['locality'] },
      { long_name: 'Oklahoma', short_name: 'OK', types: ['administrative_area_level_1'] },
      { long_name: '73069', short_name: '73069', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '321 Pine Road, Edmond, OK 73034, USA',
    address_components: [
      { long_name: '321', short_name: '321', types: ['street_number'] },
      { long_name: 'Pine Road', short_name: 'Pine Rd', types: ['route'] },
      { long_name: 'Edmond', short_name: 'Edmond', types: ['locality'] },
      { long_name: 'Oklahoma', short_name: 'OK', types: ['administrative_area_level_1'] },
      { long_name: '73034', short_name: '73034', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '555 Maple Drive, Broken Arrow, OK 74012, USA',
    address_components: [
      { long_name: '555', short_name: '555', types: ['street_number'] },
      { long_name: 'Maple Drive', short_name: 'Maple Dr', types: ['route'] },
      { long_name: 'Broken Arrow', short_name: 'Broken Arrow', types: ['locality'] },
      { long_name: 'Oklahoma', short_name: 'OK', types: ['administrative_area_level_1'] },
      { long_name: '74012', short_name: '74012', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '1113 NW 103rd Street, Oklahoma City, OK 73114, USA',
    address_components: [
      { long_name: '1113', short_name: '1113', types: ['street_number'] },
      { long_name: 'Northwest 103rd Street', short_name: 'NW 103rd St', types: ['route'] },
      { long_name: 'Oklahoma City', short_name: 'Oklahoma City', types: ['locality'] },
      { long_name: 'Oklahoma', short_name: 'OK', types: ['administrative_area_level_1'] },
      { long_name: '73114', short_name: '73114', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '200 Broadway Avenue, New York, NY 10007, USA',
    address_components: [
      { long_name: '200', short_name: '200', types: ['street_number'] },
      { long_name: 'Broadway Avenue', short_name: 'Broadway Ave', types: ['route'] },
      { long_name: 'New York', short_name: 'New York', types: ['locality'] },
      { long_name: 'New York', short_name: 'NY', types: ['administrative_area_level_1'] },
      { long_name: '10007', short_name: '10007', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '1500 Market Street, San Francisco, CA 94102, USA',
    address_components: [
      { long_name: '1500', short_name: '1500', types: ['street_number'] },
      { long_name: 'Market Street', short_name: 'Market St', types: ['route'] },
      { long_name: 'San Francisco', short_name: 'San Francisco', types: ['locality'] },
      { long_name: 'California', short_name: 'CA', types: ['administrative_area_level_1'] },
      { long_name: '94102', short_name: '94102', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '800 Michigan Avenue, Chicago, IL 60611, USA',
    address_components: [
      { long_name: '800', short_name: '800', types: ['street_number'] },
      { long_name: 'Michigan Avenue', short_name: 'Michigan Ave', types: ['route'] },
      { long_name: 'Chicago', short_name: 'Chicago', types: ['locality'] },
      { long_name: 'Illinois', short_name: 'IL', types: ['administrative_area_level_1'] },
      { long_name: '60611', short_name: '60611', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
  {
    formatted_address: '100 Peachtree Street, Atlanta, GA 30309, USA',
    address_components: [
      { long_name: '100', short_name: '100', types: ['street_number'] },
      { long_name: 'Peachtree Street', short_name: 'Peachtree St', types: ['route'] },
      { long_name: 'Atlanta', short_name: 'Atlanta', types: ['locality'] },
      { long_name: 'Georgia', short_name: 'GA', types: ['administrative_area_level_1'] },
      { long_name: '30309', short_name: '30309', types: ['postal_code'] },
      { long_name: 'United States', short_name: 'US', types: ['country'] },
    ],
  },
];

export interface MockAutocompleteState {
  showSuggestions: boolean;
  filteredAddresses: any[];
}

export const useGooglePlaces = ({
  inputRef,
  onPlaceSelect,
  disabled = false,
}: UseGooglePlacesProps) => {
  const autocompleteRef = useRef<any>(null);
  const isScriptLoaded = useRef(false);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const [showMockSuggestions, setShowMockSuggestions] = useState(false);
  const [filteredAddresses, setFilteredAddresses] = useState<any[]>([]);

  // Keep onPlaceSelect ref updated
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  // Mock autocomplete functionality
  const handleMockInput = (value: string) => {
    if (!value || value.length < 2) {
      setShowMockSuggestions(false);
      setFilteredAddresses([]);
      return;
    }

    const filtered = MOCK_ADDRESSES.filter((addr) =>
      addr.formatted_address.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredAddresses(filtered);
    setShowMockSuggestions(filtered.length > 0);
  };

  // Handle mock address selection
  const selectMockAddress = (address: any) => {
    setShowMockSuggestions(false);
    // Trigger the onPlaceSelect callback which will parse and fill the form
    // This will update React state, so the input value will update via controlled component
    onPlaceSelectRef.current(address);
  };

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!inputRef.current || disabled || !window.google?.maps?.places) {
        return;
      }

      // Clean up existing autocomplete if it exists
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      // Initialize autocomplete with componentRestrictions disabled to allow manual typing
      const autocomplete = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ['address'],
          componentRestrictions: { country: ['us', 'ca'] },
          fields: [
            'address_components',
            'formatted_address',
            'geometry',
            'name',
          ],
        }
      );

      autocompleteRef.current = autocomplete;

      // Listen for place selection
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place && place.address_components) {
          // Update React state via callback instead of directly modifying input
          onPlaceSelectRef.current(place);
        }
      });

      // Ensure the input remains editable - Google Places might try to restrict input
      // We'll let React handle the value through controlled component
      if (inputRef.current) {
        inputRef.current.setAttribute('autocomplete', 'off');
        inputRef.current.removeAttribute('readonly');
        // Ensure input is not disabled by autocomplete
        if (inputRef.current.hasAttribute('readonly')) {
          inputRef.current.removeAttribute('readonly');
        }
      }
    };

    const setupMockAutocomplete = () => {
      if (!inputRef.current || disabled) return;

      const input = inputRef.current;

      // Ensure input is editable - critical for allowing typing
      input.removeAttribute('readonly');
      input.setAttribute('autocomplete', 'off');
      // Force enable the input
      if (input.disabled && !disabled) {
        input.disabled = false;
      }

      // Add focus event to show suggestions if there's text
      // We'll rely on React state changes to trigger suggestions via updateSuggestions
      const handleFocus = () => {
        if (input.value && input.value.length >= 2) {
          handleMockInput(input.value);
        }
      };

      // Add blur event to hide suggestions (with delay to allow click)
      const handleBlur = () => {
        setTimeout(() => {
          setShowMockSuggestions(false);
        }, 200);
      };

      // Use passive listeners for focus/blur only
      // We don't listen to input events - React's onChange will trigger updateSuggestions
      input.addEventListener('focus', handleFocus, { passive: true });
      input.addEventListener('blur', handleBlur, { passive: true });

      return () => {
        input.removeEventListener('focus', handleFocus);
        input.removeEventListener('blur', handleBlur);
      };
    };

    // Check if API key is available
    const apiKey = (import.meta as any).env?.VITE_GOOGLE_PLACES_API_KEY;
    const hasApiKey = apiKey && apiKey !== 'YOUR_API_KEY' && apiKey !== 'your_api_key_here';

    if (hasApiKey) {
      // Try to use real Google Places API
      if (window.google?.maps?.places) {
        isScriptLoaded.current = true;
        initializeAutocomplete();
        return;
      }

      // Load Google Places API script
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          isScriptLoaded.current = true;
          initializeAutocomplete();
        };
        script.onerror = () => {
          console.warn('Failed to load Google Places API. Using mock data instead.');
          setupMockAutocomplete();
        };
        document.head.appendChild(script);
      } else {
        // Script exists but might not be loaded yet
        const checkGoogle = setInterval(() => {
          if (window.google?.maps?.places) {
            isScriptLoaded.current = true;
            clearInterval(checkGoogle);
            initializeAutocomplete();
          }
        }, 100);

        return () => clearInterval(checkGoogle);
      }
    } else {
      // No API key, use mock data
      console.log('No Google Places API key found. Using mock address data for testing.');
      return setupMockAutocomplete();
    }

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [inputRef, disabled]);

  // Expose function to update suggestions from React state
  const updateSuggestions = (value: string) => {
    handleMockInput(value);
  };

  return {
    showMockSuggestions,
    filteredAddresses,
    selectMockAddress,
    updateSuggestions,
  };
};
