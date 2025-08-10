import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { formatVND } from "../../utils/currency";

const Orders = () => {
  const { axios } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchOrders = async (pageNum = 1) => {
    try {
      const { data } = await axios.get("/api/order/seller", {
        params: {
          page: pageNum,
          limit: 10,
          search,
          status: statusFilter,
        },
      });

      if (data.success) {
        setOrders(data.orders);
        setPages(data.pages);
        setPage(data.page);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data } = await axios.put(`/api/order/${orderId}/status`, {
        status: newStatus,
      });
      if (data.success) {
        toast.success("Order status updated");
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, status: newStatus } : o
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page, statusFilter]);

  return (
    <div className="md:p-10 p-3">
      <h2 className="text-base md:text-lg font-medium mb-3 md:mb-4">Orders Management</h2>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3 mb-3 md:mb-4">
        <input
          type="text"
          placeholder="Search by name or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-auto"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button
          onClick={() => fetchOrders(1)}
          className="bg-primary hover:bg-[color:var(--color-primary-600)] text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border border-gray-300 text-xs md:text-sm">
          <thead className="bg-gray-100 text-gray-900">
            <tr>
              <th className="p-2 border">Product</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border">
                <td className="p-2 border">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <img
                        src={
                          item.product?.image?.[0]
                            ? `http://localhost:5000/images/${item.product.image[0]}`
                            : "/no-image.png"
                        }
                        alt="product"
                        className="w-9 h-9 md:w-10 md:h-10 object-cover rounded"
                      />
                      <span className="truncate max-w-[160px] md:max-w-none">
                        {item.product?.name || "Unknown"}{" "}
                        {item.quantity > 1 && `x${item.quantity}`}
                      </span>
                    </div>
                  ))}
                </td>
                <td className="p-2 border">
                  <span className="truncate max-w-[140px] md:max-w-none inline-block align-top">
                  {order.address.firstName} {order.address.lastName}
                  </span>
                  <br />
                  <span className="text-xs text-gray-500">
                    {order.address.city}, {order.address.state}
                  </span>
                </td>
                <td className="p-2 border">{formatVND(order.amount)}</td>
                <td className="p-2 border">
                  {order.isPaid ? "✅ Paid" : "❌ Pending"}
                </td>
                <td className="p-2 border">
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>
                <td className="p-2 border">{order.status || "Pending"}</td>
                <td className="p-2 border">
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="border rounded p-1"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-3 md:mt-4">
          {[...Array(pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => fetchOrders(i + 1)}
              className={`px-3 py-1 border rounded ${
                page === i + 1 ? "bg-primary text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
