import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSalons } from '../services/api';
import { useGeolocation } from '../hooks/useGeolocation';
import Loading from '../components/Loading';
import '../styles/SalonsList.css';

const SalonsList = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [radius, setRadius] = useState(10);

  const navigate = useNavigate();
  const { location, error: geoError, loading: geoLoading } = useGeolocation();

  // Fetch salons function
  const fetchSalons = async (includeSearch = true) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        ...(location && {
          latitude: location.latitude,
          longitude: location.longitude,
          radius
        }),
        ...(includeSearch && searchTerm.trim() && { search: searchTerm.trim() })
      };

      const response = await getSalons(params);
      if (response.data.success) {
        setSalons(response.data.data.salons);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load salons');
    } finally {
      setLoading(false);
    }
  };

  // Initial load: fetch salons when geolocation finishes
  useEffect(() => {
    if (!geoLoading) {
      fetchSalons(false); // Don't include search term on initial load
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLoading, location]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Only search if there's a search term
    if (searchTerm.trim()) {
      fetchSalons(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // Fetch default listings without search term
    // Use setTimeout to ensure state is updated before fetching
    setTimeout(() => {
      fetchSalons(false);
    }, 0);
  };

  if ((loading || geoLoading) && salons.length === 0) {
    return <Loading message="Finding salons near you..." />;
  }

  return (
    <div className="salons-container">
      <div className="salons-header">
        <h2>Find Salons Near You</h2>
        {geoError && (
          <p className="warning">
            Location access denied. Showing all salons.
          </p>
        )}
      </div>

      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search by name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="btn-clear"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {location && (
          <select
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="radius-select"
          >
            <option value="5">5 km</option>
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
          </select>
        )}
        <button
          type="submit"
          className="btn-search"
          disabled={!searchTerm.trim()}
        >
          Search
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="salons-grid">
        {salons.length === 0 ? (
          <p className="no-results">No salons found</p>
        ) : (
          salons.map((salon) => (
            <div
              key={salon.id}
              className="salon-card"
              onClick={() => navigate(`/salons/${salon.id}`)}
            >
              <img
                src={salon.imageUrl || 'https://via.placeholder.com/400x300'}
                alt={salon.name}
                className="salon-image"
              />
              <div className="salon-info">
                <h3>{salon.name}</h3>
                <p className="salon-address">
                  {salon.address}, {salon.city}, {salon.state}
                </p>
                <div className="salon-meta">
                  <span className="rating">
                    {salon.rating} ({salon.totalReviews})
                  </span>
                  {salon.distance && (
                    <span className="distance">{salon.distance} km</span>
                  )}
                </div>
                {salon.startingPrice && (
                  <p className="starting-price">
                    Starts from ₹{salon.startingPrice}
                  </p>
                )}
                <p className="salon-hours">
                  {salon.openingTime} - {salon.closingTime}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SalonsList;
