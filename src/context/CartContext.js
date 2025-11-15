import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [salonId, setSalonId] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSalonId = localStorage.getItem('cartSalonId');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedSalonId) {
      setSalonId(savedSalonId);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (salonId) {
      localStorage.setItem('cartSalonId', salonId);
    } else {
      localStorage.removeItem('cartSalonId');
    }
  }, [cart, salonId]);

  const addToCart = (service, salon) => {
    // If adding from a different salon, clear cart
    if (salonId && salonId !== salon.id) {
      const confirm = window.confirm(
        'Adding services from a different salon will clear your current cart. Continue?'
      );
      if (!confirm) return false;
      clearCart();
    }

    setSalonId(salon.id);

    const existingItem = cart.find(item => item.serviceId === service.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.serviceId === service.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        serviceId: service.id,
        name: service.name,
        price: parseFloat(service.price),
        duration: service.duration,
        gender: service.gender,
        quantity: 1,
        salonName: salon.name
      }]);
    }
    return true;
  };

  const removeFromCart = (serviceId) => {
    const newCart = cart.filter(item => item.serviceId !== serviceId);
    setCart(newCart);
    if (newCart.length === 0) {
      setSalonId(null);
    }
  };

  const updateQuantity = (serviceId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setCart(cart.map(item =>
      item.serviceId === serviceId
        ? { ...item, quantity: parseInt(quantity) }
        : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setSalonId(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('cartSalonId');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    salonId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
