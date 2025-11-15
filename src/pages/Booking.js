import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createBooking, getAvailableSlots, getSalonById } from '../services/api';
import { useCart } from '../context/CartContext';
import '../styles/Booking.css';

const Booking = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const { cart, getTotal, removeFromCart, updateQuantity, clearCart } = useCart();

  const [salon, setSalon] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('at_shop');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSalonData();
  }, [salonId]);

  useEffect(() => {
    if (bookingDate) {
      fetchAvailableSlots();
    }
  }, [bookingDate]);

  const fetchSalonData = async () => {
    try {
      const response = await getSalonById(salonId);
      if (response.data.success) {
        setSalon(response.data.data.salon);
      }
    } catch (err) {
      setError('Failed to load salon details');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await getAvailableSlots(salonId, bookingDate);
      if (response.data.success) {
        setAvailableSlots(response.data.data.slots);
      }
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation: cart must not be empty
    if (cart.length === 0) {
      setError('Your cart is empty. Please add services before booking.');
      setLoading(false);
      return;
    }

    // Validate date and time - must be in future
    const now = new Date();
    const selectedDateTime = new Date(`${bookingDate}T${bookingTime}`);

    if (selectedDateTime <= now) {
      setError('Cannot book appointments in the past. Please select a future date and time.');
      setLoading(false);
      return;
    }

    // Prepare services array for booking
    const services = cart.map(item => ({
      serviceId: item.serviceId,
      quantity: item.quantity
    }));

    try {
      const response = await createBooking({
        salonId,
        services,
        bookingDate,
        bookingTime,
        paymentMethod,
        notes
      });

      if (response.data.success) {
        // Clear cart after successful booking
        clearCart();

        // Navigate based on payment method
        if (paymentMethod === 'at_shop') {
          navigate('/confirmation', {
            state: { booking: response.data.data.booking }
          });
        } else {
          navigate('/payment', {
            state: { booking: response.data.data.booking }
          });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="booking-container">
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Please add services to your cart before booking.</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/salons')}
          >
            Browse Salons
          </button>
        </div>
      </div>
    );
  }

  if (!salon) {
    return <div className="loading">Loading...</div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const totalAmount = getTotal();

  return (
    <div className="booking-container">
      <h2>Complete Your Booking</h2>

      <div className="booking-summary">
        <h3>{salon.name}</h3>
        <p className="salon-location">{salon.city}, {salon.state}</p>
      </div>

      {/* Cart Items */}
      <div className="cart-items-section">
        <h3>Selected Services</h3>
        {cart.map((item) => (
          <div key={item.serviceId} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p className="item-meta">
                ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                  className="btn-quantity"
                >
                  −
                </button>
                <span className="quantity">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                  className="btn-quantity"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.serviceId)}
                className="btn-remove"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="cart-total">
          <span>Total Amount:</span>
          <span className="total-price">₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="date">Select Date</label>
          <input
            type="date"
            id="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            min={today}
            max={maxDateStr}
            required
          />
        </div>

        {bookingDate && availableSlots.length > 0 && (
          <div className="form-group">
            <label>Select Time</label>
            <div className="time-slots">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`time-slot ${bookingTime === slot ? 'selected' : ''}`}
                  onClick={() => setBookingTime(slot)}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Payment Method</label>
          <div className="payment-options">
            <label className="radio-option">
              <input
                type="radio"
                value="online"
                checked={paymentMethod === 'online'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay Online
            </label>
            <label className="radio-option">
              <input
                type="radio"
                value="at_shop"
                checked={paymentMethod === 'at_shop'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              Pay at Shop
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special requests or preferences..."
            rows="4"
          />
        </div>

        <button
          type="submit"
          className="btn-submit"
          disabled={loading || !bookingTime}
        >
          <span>
            {loading ? 'Processing...' : paymentMethod === 'at_shop' ? 'Confirm Booking' : 'Continue to Payment'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default Booking;
