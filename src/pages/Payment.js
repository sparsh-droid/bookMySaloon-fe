import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { processPayment } from '../services/api';
import Loading from '../components/Loading';
import '../styles/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, salon, service } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!booking) {
    return <div className="error-message">Invalid payment session</div>;
  }

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await processPayment({
        bookingId: booking.id,
        paymentMethod: booking.paymentMethod
      });

      if (response.data.success) {
        navigate('/confirmation', {
          state: {
            booking: response.data.data.booking,
            payment: response.data.data.payment,
            salon,
            service
          }
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Processing payment..." />;
  }

  return (
    <div className="payment-container">
      <h2>Payment Summary</h2>

      <div className="payment-details">
        <div className="detail-row">
          <span>Salon:</span>
          <strong>{salon?.name}</strong>
        </div>
        <div className="detail-row">
          <span>Service:</span>
          <strong>{service?.name}</strong>
        </div>
        <div className="detail-row">
          <span>Date:</span>
          <strong>{booking.bookingDate}</strong>
        </div>
        <div className="detail-row">
          <span>Time:</span>
          <strong>{booking.bookingTime}</strong>
        </div>
        <div className="detail-row">
          <span>Duration:</span>
          <strong>{service?.duration} minutes</strong>
        </div>
        <div className="detail-row total">
          <span>Total Amount:</span>
          <strong>${booking.totalAmount}</strong>
        </div>
      </div>

      <div className="payment-method-info">
        <h3>Payment Method</h3>
        {booking.paymentMethod === 'online' ? (
          <div className="online-payment">
            <p>💳 Online Payment</p>
            <p className="info-text">
              This is a simulated payment. In production, this would integrate
              with a real payment gateway (Stripe, PayPal, etc.)
            </p>
            <p className="mock-info">
              Mock payment has 90% success rate for testing
            </p>
          </div>
        ) : (
          <div className="cash-payment">
            <p>💵 Pay at Shop</p>
            <p className="info-text">
              You can pay when you arrive at the salon
            </p>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="payment-actions">
        <button
          className="btn-back"
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Go Back
        </button>
        <button
          className="btn-pay"
          onClick={handlePayment}
          disabled={loading}
        >
          {booking.paymentMethod === 'online'
            ? 'Process Payment'
            : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
};

export default Payment;
