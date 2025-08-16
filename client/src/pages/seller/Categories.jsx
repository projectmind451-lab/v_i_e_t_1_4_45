import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Categories = () => {
  const { axios, products, fetchProducts } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get("/api/category");
      if (data?.success) setCategories(data.categories || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts?.();
  }, []);

  // Derive product counts per category (from context products)
  const categoryCounts = useMemo(() => {
    const counts = {};
    (products || []).forEach(p => {
      const key = (p.category && String(p.category).trim()) || 'Others';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [products]);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter category name");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/category", { name: name.trim() });
      if (data?.success) {
        toast.success("Category added");
        setName("");
        fetchCategories();
      } else {
        toast.error(data?.message || "Failed to add");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id, catName) => {
    const count = categoryCounts[catName] || 0;
    const msg = count > 0
      ? `Category "${catName}" has ${count} product(s).\n\nDelete category and move those products to "Others"?`
      : `Delete category "${catName}"?`;
    const ok = window.confirm(msg);
    if (!ok) return;
    try {
      setDeletingId(id);
      // If products exist under this category, reassign them to 'Others' first
      if (count > 0 && Array.isArray(products)) {
        const toMove = products.filter(p => ((p.category && String(p.category).trim()) || 'Others') === catName);
        for (const p of toMove) {
          try {
            await axios.put(`/api/product/update/${p._id}`, { category: 'Others' });
          } catch (e) {
            console.error('Failed to move product', p._id, e);
          }
        }
        await fetchProducts?.();
      }
      const { data } = await axios.delete(`/api/category/${id}`);
      if (data?.success) {
        toast.success("Category deleted");
        fetchCategories();
        await fetchProducts?.();
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 py-6 md:py-10 flex flex-col gap-4">
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <h2 className="text-base md:text-lg font-semibold mb-3">Add Category</h2>
        <form onSubmit={addCategory} className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            className="border border-gray-300 rounded px-3 py-2 text-sm w-full sm:w-auto flex-1 min-w-[200px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-[color:var(--color-primary-600)] disabled:opacity-60 text-white px-4 py-2 rounded text-sm"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-md">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-medium">Categories</h3>
          <span className="text-xs text-gray-500">{categories.length} total</span>
        </div>
        {categories.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((c) => (
              <li key={c._id} className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-medium text-gray-800 truncate">{c.name}
                    <span className="ml-2 text-xs text-gray-500">{categoryCounts[c.name] || 0}</span>
                  </p>
                </div>
                <button
                  onClick={() => deleteCategory(c._id, c.name)}
                  disabled={deletingId === c._id}
                  className="bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-3 py-1.5 rounded text-xs"
                >
                  {deletingId === c._id ? 'Deleting...' : 'Delete'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Categories;
