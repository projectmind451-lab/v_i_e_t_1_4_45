import { assets } from "../assets/images/assets";
import { useAppContext } from "../context/AppContext";
import { formatVND } from "../utils/currency";
import { getImageUrl } from "../utils/config";

const ProductCard = ({ product }) => {
  const { addToCart, removeFromCart, cartItems, navigate } = useAppContext();

  if (!product) return null;

  return (
    <div
      onClick={() => {
        navigate(
          `/product/${product.category.toLowerCase()}/${product._id}`
        );
        scrollTo(0, 0);
      }}
      className="bg-white border border-gray-300 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition duration-300 w-full max-w-[250px] mx-auto cursor-pointer flex flex-col"
    >
      {/* Product Image */}
      <div className="flex items-center justify-center h-40 sm:h-44 md:h-48 mb-4 overflow-hidden">
        <img
          className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          src={getImageUrl(product.image[0])}
          alt={product.name}
        />
      </div>

      {/* Product Info */}
      <div className="flex flex-col justify-between flex-grow text-sm text-gray-700">
        <p className="text-gray-500 text-xs sm:text-sm">{product.category}</p>
        <p className="font-semibold text-base sm:text-lg truncate">{product.name}</p>

        {/* Ratings */}
        <div className="flex items-center gap-1 my-1">
          {Array(5)
            .fill("")
            .map((_, i) => (
              <img
                key={i}
                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                alt="rating"
                className="w-3.5 h-3.5"
              />
            ))}
          <p className="text-xs text-gray-600">(4)</p>
        </div>

        {/* Price + Cart */}
        <div className="mt-2 flex items-end justify-between">
          {/* Prices shown in Vietnamese Dong (₫) */}
          <p className="text-indigo-600 text-sm sm:text-base font-semibold">
            {formatVND(product.price)}
          </p>

          {/* Cart Button/Quantity */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="text-indigo-600"
          >
            {!cartItems?.[product._id] ? (
              <button
                onClick={() => addToCart(product._id)}
                className="flex items-center gap-1 px-2 py-1 border border-indigo-300 rounded-md bg-indigo-100 hover:bg-indigo-200 text-xs sm:text-sm"
              >
                <img src={assets.cart_icon} alt="cart" className="w-4 h-4" />
                Add
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-indigo-100 border border-indigo-300 rounded-md px-2 py-1">
                <button
                  onClick={() => removeFromCart(product._id)}
                  className="px-1 text-sm font-bold"
                >
                  −
                </button>
                <span className="text-sm">{cartItems[product._id]}</span>
                <button
                  onClick={() => addToCart(product._id)}
                  className="px-1 text-sm font-bold"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;























// import { assets } from "../assets/assets";
// import { useAppContext } from "../context/AppContext";

// const ProductCard = ({ product }) => {
//   const { addToCart, removeFromCart, cartItems, navigate } = useAppContext();
//   return (
//     product && (
//       <div
//         onClick={() => {
//           navigate(
//             `/product/${product.category.toLowerCase()}/${product?._id}`
//           );
//               .map((_, i) => (
//                 <img
//                   key={i}
//                   src={i < 4 ? assets.star_icon : assets.star_dull_icon}
//                   alt="rating"
//                   className="w-3 md:w-3.5"
//                 />
//               ))}
//             <p>(4)</p>
//           </div>
//           <div className="flex items-end justify-between mt-3">
//             <p className="md:text-xl text-base font-medium text-indigo-500">
//               ${product.offerPrice}{" "}
//               <span className="text-gray-500/60 md:text-sm text-xs line-through">
//                 ${product.price}
//               </span>
//             </p>
//             <div
//               onClick={(e) => e.stopPropagation()}
//               className="text-indigo-500"
//             >
//               {!cartItems?.[product?._id] ? (
//                 <button
//                   onClick={() => addToCart(product?._id)}
//                   className="flex items-center justify-center gap-1 bg-indigo-100 border border-indigo-300 md:w-[80px] w-[64px] h-[34px] rounded text-indigo-600 font-medium cursor-pointer"
//                 >
//                   <img src={assets.cart_icon} alt="cart icon" />
//                   Add
//                 </button>
//               ) : (
//                 <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-indigo-500/25 rounded select-none">
//                   <button
//                     onClick={() => removeFromCart(product?._id)}
//                     className="cursor-pointer text-md px-2 h-full"
//                   >
//                     -
//                   </button>
//                   <span className="w-5 text-center">
//                     {cartItems[product?._id]}
//                   </span>
//                   <button
//                     onClick={() => addToCart(product?._id)}
//                     className="cursor-pointer text-md px-2 h-full"
//                   >
//                     +
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   );
// };
// export default ProductCard;
