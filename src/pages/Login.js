import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOTP, verifyOTP } from '../services/api';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await sendOTP(phoneNumber);
      if (response.data.success) {
        setOtpSent(true);
        setStep('otp');
        // In development, show the OTP
        if (response.data.otp) {
          alert(`Development mode - OTP: ${response.data.otp}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await verifyOTP(phoneNumber, otp);
      if (response.data.success) {
        login(response.data.data.user, response.data.data.token);
        navigate('/salons');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Welcome to NearSalon</h2>
        <p className="subtitle">Find and book salon services near you</p>

        {error && <div className="error-message">{error}</div>}

        {step === 'phone' ? (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                placeholder="+1234567890"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                required
                disabled={loading}
                autoFocus
              />
              <small>OTP sent to {phoneNumber}</small>
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStep('phone');
                setOtp('');
                setOtpSent(false);
              }}
              disabled={loading}
            >
              Change Number
            </button>
          </form>
        )}

        <p className="dev-note">
          Development Mode: OTP is always <strong>123456</strong>
        </p>
      </div>
    </div>
  );
};

export default Login;
