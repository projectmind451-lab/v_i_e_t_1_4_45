import ProductCard from "./ProductCard";
import { useAppContext } from "../context/appContext";

const BestSeller = () => {
  const { products, searchQuery } = useAppContext();

  // Filter products by search query if present
  let displayProducts = products.filter((product) => product.inStock);
  if (searchQuery && searchQuery.trim().length > 0) {
    displayProducts = displayProducts
      .filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  } else {
    displayProducts = displayProducts.slice(0, 5);
  }

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
        Best Sellers
      </h2>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {displayProducts.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;





// import { useState } from "react";
  // import ProductCard from "./ProductCard";
  // import { useAppContext } from "../context/appContext";
  // const BestSeller = () => {
  //   const { products } = useAppContext();
  //   return (
  //     <div className="mt-16">
  //       <p className="text-2xl md:text-3xl font-medium">Best Sellers</p>
  //       <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
  //         {products
  //           .filter((product) => product.inStock)
  //           .slice(0, 5)
  //           .map((product, index) => (
  //             <ProductCard key={index} product={product} />
  //           ))}
  //       </div>
  //     </div>
  //   );
  // };
  // export default BestSeller;





















// import { useState } from "react";
// import ProductCard from "./ProductCard";
// import { useAppContext } from "../context/appContext";
// const BestSeller = () => {
//   const { products } = useAppContext();
//   return (
//     <div className="mt-16">
//       <p className="text-2xl md:text-3xl font-medium">Best Sellers</p>
//       <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
//         {products
//           .filter((product) => product.inStock)
//           .slice(0, 5)
//           .map((product, index) => (
//             <ProductCard key={index} product={product} />
//           ))}
//       </div>
//     </div>
//   );
// };
// export default BestSeller;
