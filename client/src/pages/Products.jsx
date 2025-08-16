import { useState, useEffect, useMemo } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext.jsx";

const Products = () => {
  const { products, searchQuery } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Derive categories from products
  const categories = useMemo(() => {
    const set = new Set((products || []).map(p => (p.category && String(p.category).trim()) || 'Others'));
    return ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  // Category counts for chips (in-stock only)
  const categoryCounts = useMemo(() => {
    const counts = {};
    const available = (products || []).filter(p => p.inStock);
    for (const p of available) {
      const key = (p.category && String(p.category).trim()) || 'Others';
      counts[key] = (counts[key] || 0) + 1;
    }
    counts['All'] = available.length;
    return counts;
  }, [products]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const availableProducts = (products || []).filter((product) => product.inStock);
    let list = availableProducts;
    if (selectedCategory && selectedCategory !== 'All') {
      list = list.filter(p => ((p.category && String(p.category).trim()) || 'Others') === selectedCategory);
    }
    if (searchQuery) {
      list = list.filter((product) => product.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredProducts(list);
  }, [products, searchQuery, selectedCategory]);

  // A–Z index removed as requested

  // Sort products by name for predictable letter anchors
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [filteredProducts]);

  // Group products by category for category-wise rendering
  const groupedByCategory = useMemo(() => {
    const groups = {};
    for (const p of sortedProducts) {
      const key = (p.category && String(p.category).trim()) || 'Others';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    // return entries sorted by category name
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [sortedProducts]);

  return (
    <div className="mt-16 relative">
      <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>

      <div className="mt-6 relative">

        {/* Category filter chips removed as requested */}

        {/* Category-wise sections */}
        {groupedByCategory.length === 0 ? (
          <div className="py-20 text-center text-gray-600 border border-dashed rounded-lg">
            No products found.
          </div>
        ) : (
          <div className="space-y-8">
            {groupedByCategory.map(([cat, items]) => (
              <section key={cat}>
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-800">{cat}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{items.length}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {items.map((product, idx) => (
                    <div key={product._id || idx}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
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
