import React, { useState, useEffect } from 'react';
import { getUserBookings, cancelBooking } from '../services/api';
import Loading from '../components/Loading';
import '../styles/MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');

    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await getUserBookings(params);

      if (response.data.success) {
        setBookings(response.data.data.bookings);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      fetchBookings(); // Refresh bookings
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  if (loading) return <Loading message="Loading your bookings..." />;

  return (
    <div className="bookings-container">
      <h2>My Bookings</h2>

      <div className="filter-tabs">
        <button
          className={`tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button
          className={`tab ${filter === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed
        </button>
        <button
          className={`tab ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`tab ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No bookings found</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking.id} className={`booking-card status-${booking.status}`}>
              <div className="booking-header">
                <h3>{booking.salon?.name}</h3>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-body">
                <div className="booking-info">
                  <p className="service-name">{booking.service?.name}</p>
                  <div className="booking-details">
                    <span>📅 {booking.bookingDate}</span>
                    <span>🕐 {booking.bookingTime}</span>
                    <span>⏱ {booking.service?.duration} min</span>
                  </div>
                  <p className="address">
                    {booking.salon?.address}, {booking.salon?.city}
                  </p>
                  <p className="confirmation-code">
                    Code: <strong>{booking.confirmationCode}</strong>
                  </p>
                </div>

                <div className="booking-payment">
                  <p className="amount">${booking.totalAmount}</p>
                  <p className={`payment-status ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'paid' ? '✓ Paid' :
                     booking.paymentStatus === 'pending' ? 'Pay at Shop' :
                     booking.paymentStatus}
                  </p>
                </div>
              </div>

              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <div className="booking-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
