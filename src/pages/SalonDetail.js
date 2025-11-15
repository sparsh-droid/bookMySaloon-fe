import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalonById } from '../services/api';
import { useCart } from '../context/CartContext';
import Loading from '../components/Loading';
import '../styles/SalonDetail.css';

const SalonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart, getItemCount } = useCart();

  useEffect(() => {
    fetchSalonDetails();
  }, [id]);

  const fetchSalonDetails = async () => {
    setLoading(true);
    try {
      const response = await getSalonById(id);

      if (response.data.success) {
        setSalon(response.data.data.salon);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load salon details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (service) => {
    const success = addToCart(service, salon);
    if (success) {
      // Optional: show notification
      alert(`${service.name} added to cart!`);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="error-message">{error}</div>;
  if (!salon) return <div>Salon not found</div>;

  const servicesByGender = salon.servicesByGender || {
    male: [],
    female: [],
    unisex: []
  };

  const cartCount = getItemCount();

  const renderServiceSection = (title, services, icon) => {
    if (!services || services.length === 0) return null;

    return (
      <div className="category-section">
        <h3 className="category-title">
          {icon} {title}
        </h3>
        <div className="services-list">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-info">
                <h4>{service.name}</h4>
                <p className="service-description">{service.description}</p>
                <div className="service-meta">
                  <span className="duration">⏱ {service.duration} min</span>
                  <span className="price">₹{service.price}</span>
                </div>
              </div>
              <button
                className="btn-add-to-cart"
                onClick={() => handleAddToCart(service)}
              >
                <span>+ Add to Cart</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="salon-detail-container">
      <div className="salon-header">
        <img
          src={salon.imageUrl || 'https://via.placeholder.com/800x400'}
          alt={salon.name}
          className="salon-banner"
        />
        <div className="salon-header-info">
          <h1>{salon.name}</h1>
          <p className="rating">⭐ {salon.rating} ({salon.totalReviews} reviews)</p>
          <p className="address">📍 {salon.address}, {salon.city}, {salon.state}</p>
          <p className="hours">🕒 Hours: {salon.openingTime} - {salon.closingTime}</p>
          <p className="contact">📞 {salon.phoneNumber}</p>
          {salon.startingPrice && (
            <p className="starting-price-banner">Starts from ₹{salon.startingPrice}</p>
          )}
        </div>
      </div>

      <div className="salon-description">
        <p>{salon.description}</p>
      </div>

      {cartCount > 0 && (
        <div className="cart-banner">
          <div className="cart-info">
            <span className="cart-count">{cartCount} items in cart</span>
          </div>
          <button
            className="btn-view-cart"
            onClick={() => navigate(`/booking/${id}`)}
          >
            View Cart & Book
          </button>
        </div>
      )}

      <div className="services-section">
        <h2>Our Services</h2>
        {renderServiceSection('Men\'s Services', servicesByGender.male, '👨')}
        {renderServiceSection('Women\'s Services', servicesByGender.female, '👩')}
        {renderServiceSection('Unisex Services', servicesByGender.unisex, '✨')}
      </div>
    </div>
  );
};

export default SalonDetail;
