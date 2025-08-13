import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { assets } from "../assets/images/assets";
import vinitamartLogo from "../assets/images/vinitamart_logo.png";
import { useAppContext } from "../context/AppContext";

  const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { searchQuery, setSearchQuery, cartCount } = useAppContext();

  // Show search bar only on Home and Products pages
  const showSearch = location.pathname === "/" || location.pathname === "/products";
  // Hide cart icon on About and Contact pages
  const showCart = !(location.pathname === "/about" || location.pathname === "/contact");

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = original || "";
    }
    return () => {
      document.body.style.overflow = original || "";
    };
  }, [open]);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2 md:gap-0">
        <div className="flex items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center" aria-label="vinitamart home">
            <img
              src={vinitamartLogo}
              alt="vinitamart logo"
              className="h-10 md:h-12 lg:h-16 w-auto object-contain"
              loading="eager"
            />
          </Link>
        </div>

        {/* Desktop Nav - centered */}
        <nav className="hidden md:flex gap-6 text-sm font-medium flex-1 justify-center">
          <Link to="/" className={`${isActive("/") ? "text-primary border-b-2 border-primary" : "text-gray-700 hover:text-primary"} pb-1`}>Home</Link>
          <Link to="/products" className={`${isActive("/products") ? "text-primary border-b-2 border-primary" : "text-gray-700 hover:text-primary"} pb-1`}>Products</Link>
          <Link to="/about" className={`${isActive("/about") ? "text-primary border-b-2 border-primary" : "text-gray-700 hover:text-primary"} pb-1`}>About</Link>
          <Link to="/contact" className={`${isActive("/contact") ? "text-primary border-b-2 border-primary" : "text-gray-700 hover:text-primary"} pb-1`}>Contact</Link>
        </nav>

        {/* Search Bar (only Home & Products) */}
        {showSearch && (
          <div className="flex-1 flex justify-center md:justify-end mx-2">
            <div className="relative w-full max-w-[240px] sm:max-w-[280px] md:w-72">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 1 0 4.25 12.01l4.744 4.744a.75.75 0 1 0 1.06-1.06l-4.744-4.745A6.75 6.75 0 0 0 10.5 3.75Zm-5.25 6.75a5.25 5.25 0 1 1 10.5 0 5.25 5.25 0 0 1-10.5 0Z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="search"
                inputMode="search"
                aria-label="Search products"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-9 md:h-9 pl-9 pr-9 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-sm shadow-sm"
                autoCorrect="on"
                autoCapitalize="none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 active:bg-gray-200"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]">
                    <path fillRule="evenodd" d="M6.72 6.72a.75.75 0 0 1 1.06 0L12 10.94l4.22-4.22a.75.75 0 1 1 1.06 1.06L13.06 12l4.22 4.22a.75.75 0 1 1-1.06 1.06L12 13.06l-4.22 4.22a.75.75 0 1 1-1.06-1.06L10.94 12 6.72 7.78a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Toggle (moved to far right) */}
        <button
          className="md:hidden p-2 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 ml-auto"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <img src={assets.menu_icon} alt="Menu" className="w-6 h-6" />
        </button>

        {/* Right Side Icons (desktop only) */}
        <div className="hidden md:flex items-center gap-4 mt-2 md:mt-0">
          {showCart && (() => {
            const count = cartCount?.() || 0;
            return (
              <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-gray-50 active:bg-gray-100"
                aria-label={`Cart${count ? `, ${count} items` : ""}`}
              >
                <img src={assets.cart_icon} alt="Cart" className="w-6 h-6 md:w-7 md:h-7" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] leading-[18px] text-center font-semibold select-none">
                    {count}
                  </span>
                )}
              </Link>
            );
          })()}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      <div
        id="mobile-menu"
        className={`${open ? "flex" : "hidden"} absolute top-full left-0 w-full bg-white shadow-md py-2 flex-col items-stretch divide-y divide-gray-100 md:hidden z-50`}
      >
        <Link onClick={() => setOpen(false)} to={"/"} className={`px-6 py-4 text-sm font-medium ${isActive("/") ? "text-primary" : "text-gray-800"}`}>
          Home
        </Link>
        <Link onClick={() => setOpen(false)} to={"/products"} className={`px-6 py-4 text-sm font-medium ${isActive("/products") ? "text-primary" : "text-gray-800"}`}>
          Products
        </Link>
        <Link onClick={() => setOpen(false)} to={"/about"} className={`px-6 py-4 text-sm font-medium ${isActive("/about") ? "text-primary" : "text-gray-800"}`}>
          About
        </Link>
        <Link onClick={() => setOpen(false)} to={"/contact"} className={`px-6 py-4 text-sm font-medium ${isActive("/contact") ? "text-primary" : "text-gray-800"}`}>
          Contact
        </Link>
        {/* Cart in mobile menu */}
        {showCart && (() => { const count = cartCount?.() || 0; return (
          <Link onClick={() => setOpen(false)} to={"/cart"} className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-2">
            <img src={assets.cart_icon} alt="Cart" className="w-5 h-5" />
            <span>Cart{count > 0 ? ` (${count})` : ""}</span>
          </Link>
        ); })()}
      </div>
      {/* Backdrop overlay for mobile menu */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40"
        />
      )}
    </header>
  );
};

export default Navbar;
