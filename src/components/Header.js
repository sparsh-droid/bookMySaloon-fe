import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount, salonId } = useCart();
  const cartCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo" onClick={() => navigate('/')}>
          BookMySaloon
        </h1>
        <nav className="nav">
          {isAuthenticated ? (
            <>
              <button
                className="nav-link"
                onClick={() => navigate('/salons')}
              >
                Find Salons
              </button>
              <button
                className="nav-link"
                onClick={() => navigate('/bookings')}
              >
                My Bookings
              </button>
              {cartCount > 0 && salonId && (
                <button
                  className="nav-link cart-link"
                  onClick={() => navigate(`/booking/${salonId}`)}
                >
                  🛒 Cart
                  <span className="cart-badge">{cartCount}</span>
                </button>
              )}
              <button
                className="nav-link user-info"
                onClick={() => navigate('/profile')}
              >
                {user?.name || user?.phoneNumber || 'Profile'}
              </button>
              <button
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn-login"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
