import { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext.jsx";

const Products = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Step 1: Only take products that are in stock
    const availableProducts = products.filter((p) => p.inStock);

    // Step 2: Apply search filter if there's a search query
    if (searchQuery.length > 0) {
      setFilteredProducts(
        availableProducts.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredProducts(availableProducts);
    }
  }, [products, searchQuery]);

  // Derive categories from the filtered product list (avoids backend dependency)
  const derivedCategories = useMemo(() => {
    const set = new Set(
      filteredProducts.map((p) => (p.category && String(p.category).trim()) || "Others")
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filteredProducts]);

  const slugify = (str) =>
    (str || "Others")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <div className="mt-16">
      <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fixed sidebar with categories */}
        <aside className="lg:col-span-3">
          <div className="lg:sticky lg:top-20 bg-white border border-gray-200 rounded-md p-3">
            <h3 className="text-base font-semibold mb-2">Categories</h3>
            <nav className="space-y-1">
              {derivedCategories.map((cat) => (
                <a
                  key={cat}
                  href={`#cat-${slugify(cat)}`}
                  className="block px-2 py-1 rounded hover:bg-gray-100 text-gray-700"
                >
                  {cat}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Product sections */}
        <main className="lg:col-span-9">
          {derivedCategories.map((cat) => {
            const items = filteredProducts.filter(
              (p) => (p.category && String(p.category).trim()) === cat || (!p.category && cat === "Others")
            );
            if (items.length === 0) return null;
            return (
              <section key={cat} id={`cat-${slugify(cat)}`} className="mt-2 scroll-mt-24">
                <h2 className="text-2xl font-semibold mb-3">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-center justify-center">
                  {items.map((product, idx) => (
                    <ProductCard key={`${cat}-${product._id || idx}`} product={product} />
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}
;

export default Products;













// import { useState, useEffect } from "react";
// import ProductCard from "../components/ProductCard";
// import { useAppContext } from "../context/AppContext";

// const Products = () => {
//   const { products, searchQuery } = useAppContext();
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   useEffect(() => {
//     if (searchQuery.length > 0) {
//       setFilteredProducts(
//         products.filter((product) =>
//           product.name.toLowerCase().includes(searchQuery.toLowerCase())
//         )
//       );
//     } else {
//       setFilteredProducts(products);
//     }
//   }, [products, searchQuery]);
//   return (
//     <div className="mt-16">
//       <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>
//       <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
//         {filteredProducts
//           .filter((product) => product.inStock)
//           .map((product, index) => (
//             <ProductCard key={index} product={product} />
//           ))}
//       </div>
//     </div>
//   );
// };
// export default Products;
