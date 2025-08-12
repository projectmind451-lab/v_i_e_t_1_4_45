import { useState, useEffect } from "react";
import { formatVND } from "../../utils/currency";
import toast from "react-hot-toast";
import { useAppContext } from "../../context/AppContext";

const ProductList = () => {
  const { products, fetchProducts, axios } = useAppContext();
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    offerPrice: "",
    image: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleStock = async (productId, currentStock) => {
    try {
      const res = await axios.post("/api/product/stock", {
        productId,
        inStock: !currentStock,
      });
      if (res.data.success) {
        toast.success("Stock status updated");
        fetchProducts();
      }
    } catch (error) {
      console.error("Error toggling stock:", error);
    }
  };

  const deleteProduct = async (id) => {
    const ok = window.confirm("Delete this product permanently?");
    if (!ok) return;
    try {
      // Common RESTful pattern. Adjust endpoint if your server differs.
      const { data } = await axios.delete(`/api/product/${id}`);
      if (data?.success) {
        toast.success("Product deleted");
        // Refresh list
        fetchProducts();
      } else {
        toast.error(data?.message || "Failed to delete");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Delete failed");
    }
  };

  const startEdit = (product) => {
    setEditingProduct(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      offerPrice: product.offerPrice,
      image: null, // file will be selected if changed
    });
  };

  const saveEdit = async (id) => {
    try {
      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("category", formData.category);
      updateData.append("offerPrice", formData.offerPrice);
      if (formData.image) {
        updateData.append("image", formData.image);
      }

      const { data } = await axios.put(`/api/product/update/${id}`, updateData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        toast.success("Product updated successfully!");
        setEditingProduct(null);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!Array.isArray(products)) {
    return <div className="p-4">Loading products...</div>;
  }

  return (
    <div className="flex-1 py-6 md:py-10 flex flex-col justify-between">
  <div className="w-full md:p-10 p-3">
    <h2 className="pb-3 md:pb-4 text-base md:text-lg font-medium">All Products</h2>
    {/* Mobile cards (xs only) */}
    <div className="sm:hidden space-y-3">
      {products.map((product) => (
        <div key={product._id} className="bg-white border border-gray-200 rounded-md p-3 flex gap-3">
          <div className="border border-gray-300 rounded p-1.5 shrink-0">
            {(() => {
              const img0 = product?.image?.[0];
              const src = img0
                ? (img0.startsWith("http") ? img0 : `/images/${img0}`)
                : null;
              return (
                <img
                  src={src || "/src/assets/upload_area.png"}
                  alt="Product"
                  className="w-16 h-16 object-cover rounded"
                />
              );
            })()}
          </div>
          <div className="flex-1 min-w-0">
            {editingProduct === product._id ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-2 rounded w-full"
              />
            ) : (
              <p className="font-medium text-gray-900 truncate">{product.name}</p>
            )}
            <div className="mt-1 text-xs text-gray-500">
              {editingProduct === product._id ? (
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <span>{product.category}</span>
              )}
            </div>
            <div className="mt-1 text-sm text-gray-700">
              {editingProduct === product._id ? (
                <input
                  type="number"
                  value={formData.offerPrice}
                  onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                  className="border p-1 rounded w-full"
                />
              ) : (
                <span>{formatVND(product.offerPrice)}</span>
              )}
            </div>
            {editingProduct === product._id && (
              <div className="mt-2">
                <input type="file" onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })} />
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer gap-2">
                <input
                  onChange={() => toggleStock(product._id, product.inStock)}
                  checked={product.inStock}
                  type="checkbox"
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-300 rounded-full peer peer-checked:bg-primary transition-colors duration-200"></div>
                <span className="dot absolute left-1 top-[6px] w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4"></span>
                <span className="text-xs text-gray-600">{product.inStock ? "In stock" : "Out of stock"}</span>
              </label>
              <div className="flex items-center gap-2">
                {editingProduct === product._id ? (
                  <>
                    <button onClick={() => saveEdit(product._id)} className="bg-primary hover:bg-[color:var(--color-primary-600)] text-white px-3 py-1 rounded text-xs">Save</button>
                    <button onClick={() => setEditingProduct(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-xs">Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(product)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-xs" aria-label="Edit product">Edit</button>
                    <button onClick={() => deleteProduct(product._id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs" aria-label="Delete product">Delete</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Desktop/tablet table (sm and up) */}
    <div className="hidden sm:block overflow-x-auto">
      <div className="flex flex-col items-center min-w-full rounded-md bg-white border border-gray-200">
        <table className="w-full min-w-[560px] text-xs md:text-sm">
          <thead className="text-gray-900 text-xs md:text-sm text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Product</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Selling Price</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Image</th>
              <th className="px-4 py-3 font-semibold">In Stock</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {Array.isArray(products) && products.map((product) => (
              <tr key={product._id} className="border-t border-gray-500/20">
                {/* Product */}
                <td className="px-3 md:px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="border border-gray-300 rounded p-1.5 md:p-2 shrink-0">
                      {(() => {
                        const img0 = product?.image?.[0];
                        const src = img0
                          ? (img0.startsWith("http") ? img0 : `/images/${img0}`)
                          : null;
                        return (
                          <img
                            src={src || "/src/assets/upload_area.png"}
                            alt="Product"
                            className="w-12 md:w-16 h-auto object-cover rounded"
                          />
                        );
                      })()}
                    </div>
                    <div className="min-w-0 flex-1">
                      {editingProduct === product._id ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="border p-1 rounded w-full max-w-[220px] md:max-w-none"
                        />
                      ) : (
                        <p className="truncate font-medium text-gray-800">{product.name}</p>
                      )}
                      {/* Extra compact details on mobile */}
                      <div className="sm:hidden text-[11px] text-gray-500 mt-0.5">
                        <span>{product.category}</span>
                        <span className="mx-1">•</span>
                        <span>{formatVND(product.offerPrice)}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                  {editingProduct === product._id ? (
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="border p-1 rounded w-full max-w-[140px] md:max-w-none"
                    />
                  ) : (
                    product.category
                  )}
                </td>

                {/* Selling Price */}
                <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                  {editingProduct === product._id ? (
                    <input
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                      className="border p-1 rounded w-full max-w-[120px] md:max-w-none"
                    />
                  ) : (
                    formatVND(product.offerPrice)
                  )}
                </td>

                {/* Image Upload */}
                <td className="px-3 md:px-4 py-3 hidden sm:table-cell">
                  {editingProduct === product._id ? (
                    <input
                      type="file"
                      onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    />
                  ) : (
                    "—"
                  )}
                </td>

                {/* Stock Toggle */}
                <td className="px-3 md:px-4 py-3">
                  <label className="relative inline-flex items-center cursor-pointer gap-3">
                    <input
                      onChange={() => toggleStock(product._id, product.inStock)}
                      checked={product.inStock}
                      type="checkbox"
                      className="sr-only peer"
                    />
                    <div className="w-10 h-6 md:w-12 md:h-7 bg-slate-300 rounded-full peer peer-checked:bg-primary transition-colors duration-200"></div>
                    <span className="dot absolute left-1 top-[6px] md:top-1 w-4 h-4 md:w-5 md:h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4 md:peer-checked:translate-x-5"></span>
                  </label>
                </td>

                {/* Actions */}
                <td className="px-3 md:px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {editingProduct === product._id ? (
                      <>
                        <button onClick={() => saveEdit(product._id)} className="bg-primary hover:bg-[color:var(--color-primary-600)] text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm">Save</button>
                        <button onClick={() => setEditingProduct(null)} className="bg-gray-400 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm">Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(product)} className="bg-amber-500 hover:bg-amber-600 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm" aria-label="Edit product">Edit</button>
                        <button onClick={() => deleteProduct(product._id)} className="bg-red-500 hover:bg-red-600 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm" aria-label="Delete product">Delete</button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

  );
};

export default ProductList;





























// import { useState } from "react";
// import toast from "react-hot-toast";
// import { useAppContext } from "../../context/AppContext";

// const ProductList = () => {
//   const { products, fetchProducts, axios } = useAppContext();
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [formData, setFormData] = useState({ name: "", category: "", offerPrice: "", image: "" });

//   const toggleStock = async (productId, currentStock) => {
//     try {
//       const res = await fetch("/api/product/stock", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ productId, inStock: !currentStock }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         toast.success("Stock updated");
//         fetchProducts(); // simpler than trying to manually update
//       }
//     } catch (error) {
//       console.error("Error toggling stock:", error);
//     }
//   };

//   const startEdit = (product) => {
//     setEditingProduct(product._id);
//     setFormData({
//       name: product.name,
//       category: product.category,
//       offerPrice: product.offerPrice,
//       image: product.image[0],
//     });
//   };

//   const saveEdit = async (id) => {
//     try {
//       const { data } = await axios.put(`/api/product/update/${id}`, formData);
//       if (data.success) {
//         toast.success("Product updated successfully!");
//         setEditingProduct(null);
//         fetchProducts();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   return (
//     <div className="flex-1 py-10 flex flex-col justify-between">
//       <div className="w-full md:p-10 p-4">
//         <h2 className="pb-4 text-lg font-medium">All Products</h2>
//         <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
//           <table className="md:table-auto table-fixed w-full overflow-hidden">
//             <thead className="text-gray-900 text-sm text-left">
//               <tr>
//                 <th className="px-4 py-3 font-semibold">Product</th>
//                 <th className="px-4 py-3 font-semibold">Category</th>
//                 <th className="px-4 py-3 font-semibold hidden md:block">Selling Price</th>
//                 <th className="px-4 py-3 font-semibold">In Stock</th>
//                 <th className="px-4 py-3 font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm text-gray-500">
//               {products.map((product) => (
//                 <tr key={product._id} className="border-t border-gray-500/20">
//                   <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
//                     <div className="border border-gray-300 rounded p-2">
//                       <img
//                         src={`http://localhost:5000/images/${product.image[0]}`}
//                         alt="Product"
//                         className="w-16"
//                       />
//                     </div>
//                     {editingProduct === product._id ? (
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className="border p-1 rounded w-full"
//                       />
//                     ) : (
//                       <span className="truncate max-sm:hidden w-full">{product.name}</span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3">
//                     {editingProduct === product._id ? (
//                       <input
//                         type="text"
//                         value={formData.category}
//                         onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                         className="border p-1 rounded w-full"
//                       />
//                     ) : (
//                       product.category
//                     )}
//                   </td>
//                   <td className="px-4 py-3 max-sm:hidden">
//                     {editingProduct === product._id ? (
//                       <input
//                         type="number"
//                         value={formData.offerPrice}
//                         onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
//                         className="border p-1 rounded w-full"
//                       />
//                     ) : (
//                       `₹${product.offerPrice}`
//                     )}
//                   </td>
//                   <td className="px-4 py-3">
//                     <label className="relative inline-flex items-center cursor-pointer gap-3">
//                       <input
//                         onChange={() => toggleStock(product._id, product.inStock)}
//                         checked={product.inStock}
//                         type="checkbox"
//                         className="sr-only peer"
//                       />
//                       <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
//                       <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
//                     </label>
//                   </td>
//                   <td className="px-4 py-3 flex gap-2">
//                     {editingProduct === product._id ? (
//                       <>
//                         <button onClick={() => saveEdit(product._id)} className="bg-green-500 text-white px-3 py-1 rounded">
//                           Save
//                         </button>
//                         <button onClick={() => setEditingProduct(null)} className="bg-gray-400 text-white px-3 py-1 rounded">
//                           Cancel
//                         </button>
//                       </>
//                     ) : (
//                       <button onClick={() => startEdit(product)} className="bg-yellow-500 text-white px-3 py-1 rounded">
//                         Edit
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductList;























// import toast from "react-hot-toast";
// import { useAppContext } from "../../context/AppContext";

// const ProductList = () => {
//   const { products, fetchProducts, axios } = useAppContext();

//   const toggleStock = async (id, inStock) => {
//     try {
//       const { data } = await axios.post("/api/product/stock", { id, inStock });
//       if (data.success) {
//         fetchProducts();
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       toast.success(error.message);
//     }
//   };
//   return (
//     <div className="flex-1 py-10 flex flex-col justify-between">
//       <div className="w-full md:p-10 p-4">
//         <h2 className="pb-4 text-lg font-medium">All Products</h2>
//         <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
//           <table className="md:table-auto table-fixed w-full overflow-hidden">
//             <thead className="text-gray-900 text-sm text-left">
//               <tr>
//                 <th className="px-4 py-3 font-semibold truncate">Product</th>
//                 <th className="px-4 py-3 font-semibold truncate">Category</th>
//                 <th className="px-4 py-3 font-semibold truncate hidden md:block">
//                   Selling Price
//                 </th>
//                 <th className="px-4 py-3 font-semibold truncate">In Stock</th>
//               </tr>
//             </thead>
//             <tbody className="text-sm text-gray-500">
//               {products.map((product) => (
//                 <tr key={product._id} className="border-t border-gray-500/20">
//                   <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
//                     <div className="border border-gray-300 rounded p-2">
//                       <img
//                         src={`http://localhost:5000/images/${product.image[0]}`}
//                         alt="Product"
//                         className="w-16"
//                       />
//                     </div>
//                     <span className="truncate max-sm:hidden w-full">
//                       {product.name}
//                     </span>
//                   </td>
//                   <td className="px-4 py-3">{product.category}</td>
//                   <td className="px-4 py-3 max-sm:hidden">
//                     ${product.offerPrice}
//                   </td>
//                   <td className="px-4 py-3">
//                     <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
//                       <input
//                         onClick={() =>
//                           toggleStock(product._id, !product.inStock)
//                         }
//                         checked={product.inStock}
//                         type="checkbox"
//                         className="sr-only peer"
//                         defaultChecked={product.inStock}
//                       />
//                       <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-200"></div>
//                       <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5"></span>
//                     </label>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default ProductList;
