import { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const Categories = () => {
  const { axios } = useAppContext();
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
  }, []);

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

  const deleteCategory = async (id) => {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;
    try {
      const { data } = await axios.delete(`/api/category/${id}`);
      if (data?.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(data?.message || "Delete failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
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
                  <p className="font-medium text-gray-800 truncate">{c.name}</p>
                </div>
                <button
                  onClick={() => deleteCategory(c._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-xs"
                >
                  Delete
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
