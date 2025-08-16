import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { formatVND } from "../utils/currency";
import toast from "react-hot-toast";
import { useAddress } from "../context/AddressContext";
import { getImageUrl } from "../utils/config";

const Cart = () => {
  // Shipping logic
  const SHIPPING_FEE = 30000; // VND
  const FREE_SHIPPING_THRESHOLD = 500000; // VND
  const cartSubtotal = () => totalCartAmount();
  const computedShipping = cartSubtotal() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const {
    products,
    navigate,
    cartCount,
    totalCartAmount,
    cartItems,
    setCartItems,
    removeFromCart,
    updateCartItem,
    axios,
    user,
    backendUrl,
  } = useAppContext();

  // State to store the products in the cart
  const [cartArray, setCartArray] = useState([]);

  // Address from context
  const { address } = useAddress();

  // State for address dropdown
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Payment method
  const [paymentOption, setPaymentOption] = useState("COD");

  // Update cart array
  const getCart = () => {
    let tempArray = [];
    for (const key in cartItems) {
      const product = products.find((p) => p._id === key);
      if (product) {
        product.quantity = cartItems[key];
        tempArray.push(product);
      }
    }
    setCartArray(tempArray);
  };

  // Sync selectedAddress with address from context
  useEffect(() => {
    if (address && Object.keys(address).length > 0) {
      setSelectedAddress(address);
    }
  }, [address]);

  // Update cart products when products/cartItems change
  useEffect(() => {
    if (products.length > 0 && cartItems) {
      getCart();
    }
  }, [products, cartItems]);

  // Place order
  const placeOrder = async () => {
    try {
      if (!selectedAddress || !selectedAddress._id) {
        return toast.error("Please add and select a saved address");
      }

      const orderPayload = {
        items: cartArray.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        address: selectedAddress._id,
      };

      if (paymentOption === "COD") {
        const { data } = await axios.post("/api/order/cod", orderPayload);
        if (data.success) {
          toast.success(data.message);
          setCartItems({});
          navigate("/my-orders");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post("/api/order/stripe", orderPayload);
        if (data.success) {
          window.location.replace(data.url);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!(products.length > 0 && cartItems)) return null;

  return (
    <div className="flex flex-col md:flex-row py-16 max-w-6xl w-full px-6 mx-auto">
      {/* CART PRODUCTS */}
      <div className="flex-1 max-w-4xl">
        <h1 className="text-3xl font-medium mb-6">
          Shopping Cart{" "}
          <span className="text-sm text-indigo-500">{cartCount()} Items</span>
        </h1>

        <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
          <p className="text-left">Product Details</p>
          <p className="text-center">Subtotal</p>
          <p className="text-center">Action</p>
        </div>

        {cartArray.map((product, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
          >
            <div className="flex items-center md:gap-6 gap-3">
              <div
                onClick={() => {
                  navigate(`product/${product.category}/${product._id}`);
                  scrollTo(0, 0);
                }}
                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
              >
                <img
                  className="max-w-full h-full object-cover"
                  src={getImageUrl(product.image[0])}
                  alt={product.name}
                />
              </div>
              <div>
                <p className="hidden md:block font-semibold">{product.name}</p>
                <div className="font-normal text-gray-500/70">
                  <p>
                    Weight: <span>{product.weight || "N/A"}</span>
                  </p>
                  <div className="flex items-center">
                    <p>Qty:</p>
                    <select
                      onChange={(e) =>
                        updateCartItem(product._id, Number(e.target.value))
                      }
                      value={cartItems[product._id] ?? 1}
                      className="outline-none"
                    >
                      {Array(
                        cartItems[product._id] > 9
                          ? cartItems[product._id]
                          : 9
                      )
                        .fill("")
                        .map((_, idx) => (
                          <option key={idx} value={idx + 1}>
                            {idx + 1}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center">
              {formatVND(product.offerPrice * product.quantity)}
            </p>
            <button
              onClick={() => removeFromCart(product._id)}
              className="cursor-pointer mx-auto"
            >
              ✖
            </button>
          </div>
        ))}

        <button
          onClick={() => navigate("/products")}
          className="group cursor-pointer flex items-center mt-8 gap-2 text-indigo-500 font-medium"
        >
          ← Continue Shopping
        </button>
      </div>

      {/* ORDER SUMMARY */}
      <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
        <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
        <hr className="border-gray-300 my-5" />

        {/* Delivery Address */}
        <div className="mb-6 relative">
          <p className="text-sm font-medium uppercase">Delivery Address</p>
          {selectedAddress ? (
            <div className="mt-2 text-gray-500">
              <p>{selectedAddress.firstname} {selectedAddress.lastname}</p>
              <p>{selectedAddress.street}</p>
              <p>
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipcode}
              </p>
              <p>{selectedAddress.country}</p>
              <p>{selectedAddress.phone}</p>
              <p>{selectedAddress.email}</p>
            </div>
          ) : (
            <p className="mt-2 text-gray-500">No Address Found</p>
          )}
          <button
            onClick={() => navigate("/add-address")}
            className="text-indigo-500 hover:underline cursor-pointer mt-2"
          >
            Change / Add Address
          </button>
        </div>

        {/* Payment Options */}
        <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
        <select
          onChange={(e) => {
            if (e.target.value === 'Online') {
              toast.error('Online payment is currently unavailable. Please choose another payment method.');
              return;
            }
            setPaymentOption(e.target.value);
          }}
          className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none"
          value={paymentOption}
        >
          <option value="COD">Cash On Delivery</option>
          <option value="Online" disabled style={{ color: '#9CA3AF' }}>Online Payment (Temporarily Unavailable)</option>
        </select>
        {paymentOption === 'Online' && (
          <p className="text-xs text-red-500 mt-1">
            Online payment is currently unavailable. Please select another payment method.
          </p>
        )}

        <hr className="border-gray-300 mt-4" />

        {/* Price Summary */}
        <div className="text-gray-500 mt-4 space-y-2">
          <p className="flex justify-between">
            <span>Price</span>
            <span>{formatVND(totalCartAmount())}</span>
          </p>
          <div>
            <p className="flex justify-between">
              <span>Shipping Fee</span>
              <span>
                {computedShipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatVND(computedShipping)
                )}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Free shipping on orders over {formatVND(FREE_SHIPPING_THRESHOLD)}
            </p>
          </div>
          <p className="flex justify-between text-lg font-medium mt-3">
            <span>Total Amount:</span>
            <span>
              {formatVND(cartSubtotal() + computedShipping)}
            </span>
          </p>
        </div>

        <button
          onClick={placeOrder}
          disabled={cartArray.length === 0}
          className="w-full py-3 mt-6 cursor-pointer bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition disabled:opacity-50"
        >
          {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
        </button>
      </div>
    </div>
  );
};

export default Cart;
