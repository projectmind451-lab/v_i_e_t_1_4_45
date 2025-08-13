import { Link, NavLink, Outlet } from "react-router-dom";
import { assets } from "../../assets/assets";
import vinitamartLogo from "../../assets/vinitamart_logo.png";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
const SellerLayout = () => {
  const { isSeller, setIsSeller, axios, navigate } = useAppContext();
  const sidebarLinks = [
    { name: "Add Product", path: "/seller", icon: assets.add_icon },
    {
      name: "Product List",
      path: "/seller/product-list",
      icon: assets.product_list_icon,
    },
    { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
  ];

  const logout = async () => {
    try {
      const { data } = await axios.get("/api/seller/logout");
      if (data.success) {
        setIsSeller(false);
        toast.success("Logged out successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error("Failed to logout");
      console.error(error);
    }
  };
  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-200 py-2.5 md:py-3 bg-white">
        <Link to={"/"} className="flex items-center gap-2" aria-label="vinitamart home">
          <img src={vinitamartLogo} alt="vinitamart" className="h-7 w-auto md:h-8 object-contain" />
          <span className="text-lg md:text-xl font-semibold text-gray-800">Seller</span>
        </Link>
        <div className="flex items-center gap-3 md:gap-5 text-gray-600">
          <p className="hidden sm:block">Hi! Admin</p>
          <button
            onClick={logout}
            className="border border-gray-300 rounded-full text-sm px-3 md:px-4 py-1.5 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="flex">
        <div className="md:w-64 w-16 border-r text-base border-gray-200 pt-3 md:pt-4 flex flex-col max-h-[calc(100vh-56px)] md:max-h-[calc(100vh-64px)] overflow-y-auto">
          {sidebarLinks.map((item) => (
            <NavLink
              to={item.path}
              key={item.name}
              end={item.path === "/seller"}
              className={({ isActive }) => `flex items-center py-3 px-3 md:px-4 gap-3 
                            ${
                              isActive
                                ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary"
                                : "hover:bg-gray-100/90 border-white text-gray-700"
                            }`}
            >
              <img src={item.icon} alt="" className="w-7 h-7" />
              <p className="md:block hidden text-center">{item.name}</p>
            </NavLink>
          ))}
        </div>
        <main className="flex-1 min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </>
  );
};
export default SellerLayout;
