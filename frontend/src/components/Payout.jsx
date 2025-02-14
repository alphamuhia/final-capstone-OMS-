// import React, { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// const stripePromise = loadStripe('pk_test_51Qrze7E0j5VdeT2CDBj1hXIjylBtDdPS8FbqX7tbWr8dz1YCwFBlGNcoUYB0GxYE0Co5692mJ1O0AW2rHJHfm4Ww00LtcCm6Ex');

// const PayoutForm = ({ amount }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [clientSecret, setClientSecret] = useState('');
//   const [processing, setProcessing] = useState(false);
//   const [paymentSucceeded, setPaymentSucceeded] = useState(false);
//   const [error, setError] = useState('');

//   const token = localStorage.getItem("access_token")

//   useEffect(() => {
//     fetch('http://127.0.0.1:8000/api/createpayment/', {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify()
//     })
//       .then((res) => res.json())
//       .then((data) => setClientSecret(data.clientSecret))
//       .catch((err) => {
//         console.error('Error creating PaymentIntent:', err);
//         setError('Failed to initialize payment.');
//       });
//   }, []);

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!stripe || !elements) return;

//     setProcessing(true);
//     setError('');

//     const cardElement = elements.getElement(CardElement);

//     const payload = await stripe.confirmCardPayment(clientSecret, {
//       payment_method: { card: cardElement }
//     });

//     if (payload.error) {
//       setError(`Payment failed: ${payload.error.message}`);
//       setProcessing(false);
//     } else {
//       setPaymentSucceeded(true);
//       setProcessing(false);
//     }
//   };

//   return (
//     <div className="payout-form">
//       <h2>Credit Card Payment Form</h2>
//       {error && <div style={{ color: 'red' }}>{error}</div>}
//       {paymentSucceeded ? (
//         <div>Payment succeeded! Your payout has been processed.</div>
//       ) : (
//         <form onSubmit={handleSubmit}>
//           <CardElement options={{ hidePostalCode: true }} />
//           <button type="submit" disabled={!stripe || processing || !clientSecret}>
//             {processing ? 'Processing…' : `Pay $${(amount / 100).toFixed(2)}`}
//           </button>
//         </form>
//       )}
//     </div>
//   );
// };

// const Payout = ({ amount }) => (
//   <Elements stripe={stripePromise}>
//     <PayoutForm amount={amount} />
//   </Elements>
// );

// export default Payout;





import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './styling/Payout.css'; 
import AdminNavbar from './AdminNavbar';

const stripePromise = loadStripe('pk_test_51Qrze7E0j5VdeT2CDBj1hXIjylBtDdPS8FbqX7tbWr8dz1YCwFBlGNcoUYB0GxYE0Co5692mJ1O0AW2rHJHfm4Ww00LtcCm6Ex');

const PayoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/createpayment/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }) 
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => {
        console.error('Error creating PaymentIntent:', err);
        setError('Failed to initialize payment.');
      });
  }, [amount, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    const cardElement = elements.getElement(CardElement);

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement }
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setPaymentSucceeded(true);
      setProcessing(false);
    }
  };

  return (
    <>
    <AdminNavbar />
    <div className="payout-form">
      <h2>Credit Card Payment Form</h2>
      {error && <div className="error">{error}</div>}
      {paymentSucceeded ? (
        <div>Payment succeeded! Your payout has been processed.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* 
            For testing, use the following dummy credit card details:
            - Card Number: 4242 4242 4242 4242
            - Expiration Date: Any future date (e.g., 12/34)
            - CVC: Any three digits (e.g., 123)
          */}
          {/* <CardElement options={{ hidePostalCode: true }} />
          <button type="submit" disabled={!stripe || processing || !clientSecret}>
            {processing ? 'Processing…' : `Pay $${(amount / 100).toFixed(2)}`}
          </button> */}
          <h1>Coming Soon</h1>
        </form>
      )}
    </div>
    </>
  );
};

const Payout = ({ amount }) => (
  <Elements stripe={stripePromise}>
    <PayoutForm amount={amount} />
  </Elements>
);

export default Payout;

