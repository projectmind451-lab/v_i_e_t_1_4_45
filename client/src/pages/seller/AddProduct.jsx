import { assets, categories } from "../../assets/images/assets";
import { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddProduct = () => {
  const { axios } = useContext(AppContext);

  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [unit, setUnit] = useState("gm");

  const [catList, setCatList] = useState(categories.map((c) => c.path));
  const [addingCat, setAddingCat] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const loadedRef = useRef(false);
  const apiAvailableRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    let mounted = true;
    (async () => {
      try {
        let { data } = await axios.get("/api/category", { withCredentials: true });
        if (!(data?.success && Array.isArray(data.categories))) {
          const res2 = await axios.get("/api/categories", { withCredentials: true });
          data = res2.data;
        }
        if (data?.success && Array.isArray(data.categories)) {
          const names = data.categories.map((c) => c.name || c.path || c);
          if (mounted) setCatList(names);
          apiAvailableRef.current = true;
        } else {
          apiAvailableRef.current = false;
        }
      } catch {
        apiAvailableRef.current = false;
      }
    })();

    return () => {
      mounted = false;
    };
  }, [axios]);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
  
      // Check if at least one image is provided
      const selectedImages = files.filter(file => file); 
      if (selectedImages.length === 0) {
        toast.error("Please upload at least one product image");
        return;
      }
  
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("category", category);
      formData.append("price", price);
      formData.append("offerPrice", offerPrice);
      formData.append("unit", unit);
  
      // Append images with the correct field name expected by backend
      selectedImages.forEach((file) => {
        formData.append("image", file); 
      });
  
      const { data } = await axios.post("/api/product/add-product", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // ensure cookies like sellerToken are sent
      });
  
      if (data.success) {
        toast.success(data.message);
        setName("");
        setDescription("");
        setCategory("");
        setPrice("");
        setOfferPrice("");
        setFiles([]);
        setUnit("gm");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  

  const addCategory = async (e) => {
    e?.preventDefault?.();
    if (!newCat.trim()) {
      return toast.error("Enter category name");
    }
    try {
      setCatLoading(true);

      if (!apiAvailableRef.current) {
        const addedName = newCat.trim();
        setCatList((prev) => (prev.includes(addedName) ? prev : [...prev, addedName]));
        setCategory(addedName);
        setNewCat("");
        setAddingCat(false);
        toast("Category added locally (no API)", { icon: "ℹ️" });
        return;
      }

      let data;
      try {
        ({ data } = await axios.post("/api/category", { name: newCat.trim() }, { withCredentials: true }));
      } catch (err) {
        if (err?.response?.status === 404) {
          apiAvailableRef.current = false;
          const addedName = newCat.trim();
          setCatList((prev) => (prev.includes(addedName) ? prev : [...prev, addedName]));
          setCategory(addedName);
          setNewCat("");
          setAddingCat(false);
          toast("Category added locally (no API)", { icon: "ℹ️" });
          return;
        }
        throw err;
      }

      if (data?.success) {
        toast.success("Category added");
        const addedName = data.category?.name || data.data?.name || newCat.trim();
        setCatList((prev) => (prev.includes(addedName) ? prev : [...prev, addedName]));
        setCategory(addedName);
        setNewCat("");
        setAddingCat(false);
      } else {
        const addedName = newCat.trim();
        setCatList((prev) => (prev.includes(addedName) ? prev : [...prev, addedName]));
        setCategory(addedName);
        setNewCat("");
        setAddingCat(false);
        toast("Category added locally (no API)", { icon: "ℹ️" });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCatLoading(false);
    }
  };

  return (
    <div className="py-10 flex flex-col justify-between bg-white">
      <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
        <div>
          <p className="text-base font-medium">Product Image</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {Array(4)
              .fill("")
              .map((_, index) => (
                <label key={index} htmlFor={`image${index}`}>
                  <input
                    onChange={(e) => {
                      const updatedFiles = [...files];
                      updatedFiles[index] = e.target.files[0];
                      setFiles(updatedFiles);
                    }}
                    accept="image/*"
                    type="file"
                    id={`image${index}`}
                    hidden
                  />
                  <img
                    className="max-w-24 cursor-pointer"
                    src={
                      files[index]
                        ? URL.createObjectURL(files[index])
                        : assets.upload_area
                    }
                    alt="uploadArea"
                    width={100}
                    height={100}
                  />
                </label>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-name">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type here"
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            required
          />
        </div>

        <div className="flex flex-col gap-1 max-w-md">
          <label className="text-base font-medium" htmlFor="product-description">
            Product Description
          </label>
          <textarea
            id="product-description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
            placeholder="Type here"
          ></textarea>
        </div>

        <div className="w-full flex flex-col gap-1">
          <label className="text-base font-medium" htmlFor="category">
            Category
          </label>
          <div className="flex items-center gap-2">
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 flex-1"
            >
              <option value="">Select Category</option>
              {catList.map((c, index) => (
                <option value={c} key={index}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setAddingCat((s) => !s)}
              className="px-3 py-2 rounded border border-gray-300 text-sm hover:bg-gray-50"
            >
              {addingCat ? "Close" : "Add"}
            </button>
          </div>

          {addingCat && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
                placeholder="New category name"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 flex-1"
              />
              <button
                type="button"
                onClick={addCategory}
                disabled={catLoading}
                className="px-4 py-2 rounded bg-primary hover:bg-[color:var(--color-primary-600)] text-white text-sm disabled:opacity-60"
              >
                {catLoading ? "Adding..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="product-price">
              Product Price
            </label>
            <input
              id="product-price"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="offer-price">
              Offer Price
            </label>
            <input
              id="offer-price"
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              placeholder="0"
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
              required
            />
          </div>
          <div className="flex-1 flex flex-col gap-1 w-32">
            <label className="text-base font-medium" htmlFor="unit">
              Unit
            </label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
            >
              <option value="gm">gm</option>
              <option value="kg">kg</option>
            </select>
          </div>
        </div>

        <button className="px-8 py-2.5 bg-indigo-500 text-white font-medium rounded">
          ADD
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
