import { useState, useEffect } from "react";
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

  return (
    <div className="mt-16">
      <h1 className="text-3xl lg:text-4xl font-medium">All Products</h1>
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
        {filteredProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
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
