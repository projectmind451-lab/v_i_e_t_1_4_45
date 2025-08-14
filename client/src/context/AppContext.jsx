import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dummyProducts } from "../assets/images/assets";
import toast from "react-hot-toast";
import axios from "axios";
import { getBackendUrl } from "../utils/config";

// Set default axios configuration
const backendUrl = getBackendUrl();
axios.defaults.withCredentials = true;
axios.defaults.baseURL = backendUrl;
export const AppContext = createContext(null);

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [sellerToken, setSellerToken] = useState(localStorage.getItem('sellerToken'));
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Set up axios interceptor to add Authorization header if token exists
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (sellerToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${sellerToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [sellerToken]);

  // check seller status
  const fetchSeller = async () => {
    try {
      const { data } = await axios.get("/api/seller/is-auth");
      if (data.success) {
        setIsSeller(true);
      } else {
        setIsSeller(false);
      }
    } catch (error) {
      setIsSeller(false);
    }
  };

  // fetch user auth status ,user Data and cart items
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth");
      if (data?.success) {
        setUser(data.user);
        setCartItems(data.user?.cart || {});
      } else {
        // Not logged in: silently set guest state
        setUser(null);
        setCartItems({});
      }
    } catch (error) {
      // Network or server error: treat as guest without noisy toasts
      setUser(null);
      setCartItems({});
    }
  };

  // fetch products
  const fetchProducts = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // add product to cart
  const addToCart = (itemId) => {
    let cartData = structuredClone(cartItems || {}); // safeguard for undefined

    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }

    setCartItems(cartData);
    toast.success("Added to cart");
  };

  // update cart item quantity
  const updateCartItem = (itemId, quantity) => {
    let cartData = structuredClone(cartItems);
    cartData[itemId] = quantity;
    setCartItems(cartData);
    toast.success(`cart updated`);
  };

  // total cart items
  const cartCount = () => {
    let totalCount = 0;
    for (const item in cartItems) {
      totalCount += cartItems[item];
    }
    return totalCount;
  };
  // total cart amount
  const totalCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0) {
        totalAmount += cartItems[items] * itemInfo.offerPrice;
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };
  // remove product from cart
  const removeFromCart = (itemId) => {
    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] -= 1;
      if (cartData[itemId] === 0) {
        delete cartData[itemId];
      }
      toast.success(`remove from cart`);
      setCartItems(cartData);
    }
  };
  useEffect(() => {
    fetchSeller();
    fetchProducts();
    fetchUser();
  }, []);

  // update database cart items
  useEffect(() => {
    const updateCart = async () => {
      try {
        const { data } = await axios.post("/api/cart/update", { cartItems });

        if (!data.success) {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (user) {
      updateCart();
    }
  }, [cartItems]);

  // Token management functions
  const setSellerTokenAndStore = (token) => {
    setSellerToken(token);
    if (token) {
      localStorage.setItem('sellerToken', token);
    } else {
      localStorage.removeItem('sellerToken');
    }
  };

  const clearSellerToken = () => {
    setSellerToken(null);
    localStorage.removeItem('sellerToken');
    setIsSeller(false);
  };

  const value = {
    navigate,
    user,
    setUser,
    isSeller,
    setIsSeller,
    sellerToken,
    setSellerToken: setSellerTokenAndStore,
    clearSellerToken,
    showUserLogin,
    setShowUserLogin,
    products,
    setProducts,
    cartItems,
    setCartItems,
    searchQuery,
    setSearchQuery,
    fetchSeller,
    fetchUser,
    fetchProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    cartCount,
    totalCartAmount,
    axios,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
