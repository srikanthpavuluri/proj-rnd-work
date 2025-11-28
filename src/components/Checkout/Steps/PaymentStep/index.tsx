// components/Checkout/Steps/PaymentStep/index.tsx
import React from 'react';
import PaymentForm from './PaymentForm';
import PaymentReviewComponent from './PaymentReview';
import { useCheckout } from '../../../../context/CheckoutContext';

const PaymentStep: React.FC = () => {
  const {
    state: { payment },
  } = useCheckout();

  // If step is complete and not editing, show review mode
  if (payment.isComplete && !payment.isEditing) {
    return <PaymentReviewComponent />;
  }

  // Otherwise, show the form
  return <PaymentForm />;
};

// Export both components
export { default as PaymentReview } from './PaymentReview';
export default PaymentStep;
