import { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { useAppContext } from "../context/AppContext.jsx";

const Products = () => {
  const { products, searchQuery, axios } = useAppContext();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);

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

  // Load categories from backend seller categories
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/category");
        if (data?.success && mounted) {
          setCategories((data.categories || []).map(c => c.name || c.path).filter(Boolean));
        }
      } catch (e) {
        // Silent fallback to client-side grouping
      }
    })();
    return () => { mounted = false; };
  }, [axios]);

  return (
    <div className="mt-16">
      <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>

      {/* Prefer backend categories order if available */}
      {categories.length > 0
        ? (
          categories.map((cat) => {
            const items = filteredProducts.filter(p => (p.category || 'Others') === cat);
            if (items.length === 0) return null;
            return (
              <section key={cat} className="mt-8">
                <h2 className="text-2xl font-semibold mb-3">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
                  {items.map((product, idx) => (
                    <ProductCard key={`${cat}-${product._id || idx}`} product={product} />
                  ))}
                </div>
              </section>
            );
          })
        )
        : (
          // Fallback: group by product category present in client
          Object.entries(
            filteredProducts.reduce((acc, p) => {
              const cat = p.category || 'Others';
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(p);
              return acc;
            }, {})
          ).map(([cat, items]) => (
            <section key={cat} className="mt-8">
              <h2 className="text-2xl font-semibold mb-3">{cat}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
                {items.map((product, idx) => (
                  <ProductCard key={`${cat}-${product._id || idx}`} product={product} />
                ))}
              </div>
            </section>
          ))
        )}
    </div>
  );
};

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
