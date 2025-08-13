import { Routes, Route, useLocation } from "react-router-dom";
import SEO from "./components/SEO";
import Products from "./pages/Products";
import SingleProduct from "./pages/SingleProduct";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Auth from "./modals/Auth";
import ProductCategory from "./pages/ProductCategory";
import Address from "./pages/Address";
import MyOrders from "./pages/MyOrders";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import Loading from "./components/Loading";
import About from "./pages/About";
import Contact from "./pages/Contact";

const App = () => {
  const { loading } = useAppContext();
  const location = useLocation();
  const isSellerRoute = location.pathname.startsWith("/seller");
  
  // Set default SEO values
  const defaultSEO = {
    title: 'VinitaMart',
    description: 'Discover amazing products at great prices on VinitaMart. Shop now for the best deals!',
    keywords: 'ecommerce, online shopping, buy online, VinitaMart, shop, electronics, fashion, home, beauty, deals, offers',
    ogTitle: 'VinitaMart',
    ogDescription: 'Discover amazing products at great prices on VinitaMart. Shop now for the best deals!',
    ogImage: '/logo.png',
    ogUrl: window.location.href,
    canonical: window.location.href
  };
  const { showUserLogin, isSeller } = useAppContext();
  return (
    <>
      <SEO {...defaultSEO} />
      <div className="min-h-screen flex flex-col">
        {loading && <Loading />}
        {isSellerRoute ? null : <Navbar />}
        {showUserLogin ? <Auth /> : null}
        <Toaster />
        <div
          className={`${isSellerRoute ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:category" element={<ProductCategory />} />
            <Route path="/product/:category/:id" element={<SingleProduct />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/add-address" element={<Address />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/loader" element={<Loading />} />

            <Route
              path="/seller"
              element={isSeller ? <SellerLayout /> : <SellerLogin />}
            >
              <Route index element={isSeller ? <AddProduct /> : null} />
              <Route
                path="product-list"
                element={isSeller ? <ProductList /> : null}
              />
              {/* Categories route removed */}
              <Route path="orders" element={isSeller ? <Orders /> : null} />
            </Route>
          </Routes>
        </div>
        {isSellerRoute ? null : <Footer />}
      </div>
    </>
  );
};
export default App;
