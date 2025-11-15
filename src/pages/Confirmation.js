import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/Confirmation.css';

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, payment } = location.state || {};

  if (!booking) {
    return (
      <div className="confirmation-container">
        <div className="error-icon">✗</div>
        <h1>Invalid Session</h1>
        <p className="error-message">No booking information found</p>
        <button className="btn-primary" onClick={() => navigate('/salons')}>
          Browse Salons
        </button>
      </div>
    );
  }

  const isPaymentSuccess = payment?.status === 'success' || booking.paymentMethod === 'at_shop';
  const salon = booking.salon;
  const services = booking.services || [];

  return (
    <div className="confirmation-container">
      {isPaymentSuccess ? (
        <>
          <div className="success-icon">✓</div>
          <h1>Booking Confirmed!</h1>
          <p className="success-message">
            Your appointment has been successfully booked
          </p>

          <div className="confirmation-details">
            <div className="detail-card">
              <h3>Booking Details</h3>
              <div className="detail-row">
                <span>Confirmation Code:</span>
                <strong className="confirmation-code">
                  {booking.confirmationCode}
                </strong>
              </div>
              <div className="detail-row">
                <span>Salon:</span>
                <strong>{salon?.name || 'N/A'}</strong>
              </div>
              <div className="detail-row">
                <span>Date:</span>
                <strong>{booking.bookingDate}</strong>
              </div>
              <div className="detail-row">
                <span>Time:</span>
                <strong>{booking.bookingTime}</strong>
              </div>
            </div>

            <div className="detail-card">
              <h3>Services Booked</h3>
              {services.length > 0 ? (
                <div className="services-list-confirmation">
                  {services.map((service, index) => (
                    <div key={index} className="service-item-confirmation">
                      <div className="service-info-confirmation">
                        <span className="service-name">{service.name}</span>
                        <span className="service-meta">
                          ₹{service.BookingService?.price} × {service.BookingService?.quantity}
                        </span>
                      </div>
                      <strong className="service-subtotal">
                        ₹{service.BookingService?.subtotal}
                      </strong>
                    </div>
                  ))}
                  <div className="total-amount-row">
                    <span>Total Amount:</span>
                    <strong className="total-amount">₹{booking.totalAmount}</strong>
                  </div>
                </div>
              ) : (
                <p>No services found</p>
              )}
            </div>

            <div className="detail-card">
              <h3>Payment Status</h3>
              {booking.paymentMethod === 'online' ? (
                <>
                  <p className="payment-status success">Paid Online</p>
                  <div className="detail-row">
                    <span>Transaction ID:</span>
                    <strong>{payment?.transactionId || 'N/A'}</strong>
                  </div>
                </>
              ) : (
                <>
                  <p className="payment-status pending">Pay at Shop</p>
                  <p className="info-text">
                    Please pay ₹{booking.totalAmount} when you arrive at the salon
                  </p>
                </>
              )}
            </div>

            <div className="detail-card">
              <h3>Salon Information</h3>
              <p>{salon?.address || 'N/A'}</p>
              <p>{salon?.city}, {salon?.state}</p>
              <p>📞 {salon?.phoneNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="confirmation-actions">
            <button
              className="btn-primary"
              onClick={() => navigate('/bookings')}
            >
              View My Bookings
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/salons')}
            >
              Book Another Service
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="error-icon">✗</div>
          <h1>Payment Failed</h1>
          <p className="error-message">
            Unfortunately, your payment could not be processed
          </p>
          <p>Reason: {payment?.gatewayResponse?.message || 'Unknown error'}</p>

          <div className="confirmation-actions">
            <button
              className="btn-primary"
              onClick={() => navigate(-1)}
            >
              Try Again
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate('/salons')}
            >
              Back to Salons
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Confirmation;
