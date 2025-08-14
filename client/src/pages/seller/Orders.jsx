import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { formatVND } from "../../utils/currency";
import { getImageUrl } from "../../utils/config";

const Orders = () => {
  const { axios, backendUrl } = useContext(AppContext);
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

  const togglePaymentStatus = async (orderId, currentStatus) => {
    try {
      const { data } = await axios.put(`/api/order/${orderId}/payment`, 
        { isPaid: !currentStatus },
        { withCredentials: true } // Ensure cookies are sent with the request
      );
      
      if (data.success) {
        toast.success(data.message || `Payment status updated to ${!currentStatus ? 'Paid' : 'Pending'}`);
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { 
              ...o, 
              isPaid: !currentStatus,
              paidAt: !currentStatus ? new Date().toISOString() : null
            } : o
          )
        );
      } else {
        toast.error(data.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page, statusFilter]);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <h2 className="text-lg sm:text-xl font-medium mb-4">Orders Management</h2>

      {/* Search and Filter */}
      <div className="space-y-2 mb-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by name or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border p-2 rounded text-sm sm:text-base"
          />
          <button
            onClick={() => fetchOrders(1)}
            className="bg-primary hover:bg-[color:var(--color-primary-600)] text-white px-4 py-2 rounded whitespace-nowrap"
          >
            Search
          </button>
        </div>
        <div className="w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border p-2 rounded text-sm sm:text-base"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="flex justify-center items-center p-8">
          <p className="text-gray-500 text-center">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border border-gray-300 text-sm">
              <thead className="bg-gray-100 text-gray-900">
                <tr>
                  <th className="p-2 border w-1/4">Product</th>
                  <th className="p-2 border w-1/4">Customer</th>
                  <th className="p-2 border w-32">Amount</th>
                  <th className="p-2 border w-32">Payment</th>
                  <th className="p-2 border w-28">Date</th>
                  <th className="p-2 border w-36">Status</th>
                  <th className="p-2 border w-36">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border hover:bg-gray-50">
                    <td className="p-2 border">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img
                            src={
                              item.product?.image?.[0]
                                ? getImageUrl(item.product.image[0])
                                : "/no-image.png"
                            }
                            alt="product"
                            className="w-10 h-10 object-cover rounded"
                          />
                          <span className="truncate max-w-[120px]">
                            {item.product?.name || "Unknown"}
                            {item.quantity > 1 && ` x${item.quantity}`}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="p-2 border group relative">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="font-medium">
                          {order.address.firstName} {order.address.lastName}
                        </div>
                        <div className="text-gray-600 truncate">{order.address.email}</div>
                        <div className="text-gray-500 text-xs">
                          {order.address.phone}
                        </div>
                      </div>
                      
                      {/* Hover card with full details */}
                      <div className="absolute z-10 left-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <h4 className="font-medium text-sm mb-2">Customer Details</h4>
                        <div className="space-y-1 text-xs">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500">First Name</p>
                              <p className="font-medium">{order.address.firstName || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Last Name</p>
                              <p className="font-medium">{order.address.lastName || 'Not provided'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Email</p>
                            <p className="font-medium break-words">{order.address.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Phone</p>
                            <p className="font-medium">{order.address.phone || 'Not provided'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Address</p>
                            <p className="font-medium">{order.address.street || 'Not provided'}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500">City</p>
                              <p className="font-medium">{order.address.city || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">State</p>
                              <p className="font-medium">{order.address.state || 'Not provided'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-gray-500">Postal Code</p>
                              <p className="font-medium">{order.address.zipCode || 'Not provided'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Country</p>
                              <p className="font-medium">{order.address.country || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 border">
                      <span className="font-medium">{formatVND(order.amount)}</span>
                    </td>
                    <td className="p-2 border">
                      <button
                        onClick={() => togglePaymentStatus(order._id, order.isPaid)}
                        className={`w-full px-2 py-1 rounded text-xs sm:text-sm whitespace-nowrap ${
                          order.isPaid 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {order.isPaid ? '✓ Paid' : '✕ Pending'}
                      </button>
                    </td>
                    <td className="p-2 border text-xs sm:text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="p-2 border">
                      <select
                        value={order.status || "Pending"}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="w-full p-1 border rounded text-xs sm:text-sm"
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

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="p-3 border-b bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">Order #{order._id.slice(-6).toUpperCase()}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="p-3 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Customer Details</h4>
                    <button
                      onClick={() => togglePaymentStatus(order._id, order.isPaid)}
                      className={`px-2 py-1 rounded text-xs ${
                        order.isPaid 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.isPaid ? '✓ Paid' : '✕ Pending'}
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500">First Name</p>
                        <p className="font-medium">{order.address.firstName || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Name</p>
                        <p className="font-medium">{order.address.lastName || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{order.address.email || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{order.address.phone || 'Not provided'}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-500">Address</p>
                      <p className="font-medium">{order.address.street || 'Not provided'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500">City</p>
                        <p className="font-medium">{order.address.city || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">State</p>
                        <p className="font-medium">{order.address.state || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-gray-500">Postal Code</p>
                        <p className="font-medium">{order.address.zipCode || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Country</p>
                        <p className="font-medium">{order.address.country || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-b">
                  <h4 className="font-medium mb-2">Products</h4>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1">
                      <img
                        src={
                          item.product?.image?.[0]
                            ? getImageUrl(item.product.image[0])
                            : "/no-image.png"
                        }
                        alt="product"
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product?.name || "Unknown"}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">{formatVND(item.product?.offerPrice * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-medium">{formatVND(order.amount)}</span>
                  </div>
                </div>

                <div className="p-3">
                  <label className="block text-sm font-medium mb-1">Update Status</label>
                  <select
                    value={order.status || "Pending"}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-1 sm:gap-2 mt-4 mb-6">
          {page > 1 && (
            <button
              onClick={() => fetchOrders(page - 1)}
              className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-100"
            >
              &laquo; Prev
            </button>
          )}
          
          {Array.from({ length: Math.min(3, pages) }, (_, i) => {
            let pageNum;
            if (page <= 2) {
              pageNum = i + 1;
            } else if (page >= pages - 1) {
              pageNum = pages - 2 + i;
            } else {
              pageNum = page - 1 + i;
            }
            
            if (pageNum > pages) return null;
            
            return (
              <button
                key={pageNum}
                onClick={() => fetchOrders(pageNum)}
                className={`px-2 sm:px-3 py-1 border rounded text-sm sm:text-base ${
                  page === pageNum ? "bg-primary text-white" : "hover:bg-gray-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {page < pages && (
            <button
              onClick={() => fetchOrders(page + 1)}
              className="px-2 sm:px-3 py-1 border rounded hover:bg-gray-100"
            >
              Next &raquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
