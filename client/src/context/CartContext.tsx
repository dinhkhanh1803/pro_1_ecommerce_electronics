import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantName?: string;
  color?: string;
  size?: string;
  seller?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, change: number, color?: string, size?: string) => void;
  removeItem: (id: string, color?: string, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Sync / Load Cart
  useEffect(() => {
    const syncCart = async () => {
      if (token) {
        // Logged in: check if guest cart exists in localStorage and merge
        const saved = localStorage.getItem('shophub_cart');
        const guestItems = saved ? JSON.parse(saved) : [];
        if (guestItems.length > 0) {
          try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/merge`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ items: guestItems })
            });
            if (res.ok) {
              const data = await res.json();
              setCartItems(data);
              localStorage.removeItem('shophub_cart');
              return;
            }
          } catch (error) {
            console.error("Failed to merge guest cart", error);
          }
        }

        // Fetch DB cart if no merge or merge failed
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
          }
        } catch (error) {
          console.error("Failed to fetch cart from DB", error);
        }
      } else {
        // Guest: load from localStorage
        const saved = localStorage.getItem('shophub_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      }
    };

    syncCart();
  }, [token]);

  // Save guest cart to localStorage when it changes (only when not logged in)
  useEffect(() => {
    if (!token) {
      localStorage.setItem('shophub_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, token]);

  const addToCart = async (newItem: CartItem) => {
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            product: newItem.id,
            quantity: newItem.quantity,
            variantName: newItem.variantName,
            color: newItem.color,
            size: newItem.size
          })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
        }
      } catch (error) {
        console.error("Failed to add to cart", error);
      }
    } else {
      // Guest logic
      setCartItems(prev => {
        const existing = prev.find(
          item => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
        );
        if (existing) {
          return prev.map(item =>
            item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          );
        }
        return [...prev, newItem];
      });
    }
  };

  const updateQuantity = async (id: string, change: number, color?: string, size?: string) => {
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            product: id,
            change,
            color: color || "Default",
            size: size || "Default"
          })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
        }
      } catch (error) {
        console.error("Failed to update cart quantity", error);
      }
    } else {
      // Guest logic
      setCartItems(prev =>
        prev.map(item => {
          if (item.id === id && item.color === color && item.size === size) {
            const newQty = Math.max(1, item.quantity + change);
            return { ...item, quantity: newQty };
          }
          return item;
        })
      );
    }
  };

  const removeItem = async (id: string, color?: string, size?: string) => {
    if (token) {
      try {
        const targetColor = color || "Default";
        const targetSize = size || "Default";
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/item?product=${id}&color=${targetColor}&size=${targetSize}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data);
        }
      } catch (error) {
        console.error("Failed to remove cart item", error);
      }
    } else {
      // Guest logic
      setCartItems(prev => prev.filter(item => !(item.id === id && item.color === color && item.size === size)));
    }
  };

  const clearCart = async () => {
    if (token) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setCartItems([]);
        }
      } catch (error) {
        console.error("Failed to clear cart", error);
      }
    } else {
      // Guest logic
      setCartItems([]);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, clearCart, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
