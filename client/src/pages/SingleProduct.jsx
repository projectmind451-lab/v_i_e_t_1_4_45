import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { Link, useParams } from "react-router-dom";
import { assets } from "../assets/images/assets";
import { formatVND } from "../utils/currency";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import { generateProductStructuredData } from "../utils/structuredData";
import { getImageUrl } from "../utils/config";
const SingleProduct = () => {
  const { products, navigate, addToCart } = useAppContext();
  const { id, category } = useParams();
  const [thumbnail, setThumbnail] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const product = products.find((product) => product._id === id);
  
  // Generate structured data for the product
  const productStructuredData = product ? generateProductStructuredData(product) : null;
  
  // Set SEO metadata
  const seoProps = product ? {
    title: `${product.name} | VinitaMart`,
    description: product.description || `Buy ${product.name} online at the best price on VinitaMart. ${product.shortDescription || ''}`,
    keywords: `${product.name}, ${product.category}, buy online, VinitaMart, ${product.brand || ''}`,
    ogTitle: `${product.name} | VinitaMart`,
    ogDescription: product.description || `Buy ${product.name} online at the best price on VinitaMart`,
    ogImage: product.images && product.images[0] ? product.images[0] : '/logo.png',
    ogUrl: typeof window !== 'undefined' ? window.location.href : '',
    canonical: typeof window !== 'undefined' ? `${window.location.origin}/product/${category}/${id}` : ''
  } : {};
  useEffect(() => {
    if (products.length > 0) {
      let productsCopy = products.slice();
      productsCopy = productsCopy.filter(
        (product) => product.category === product.category
      );
      setRelatedProducts(productsCopy.slice(0, 5));
    }
  }, [products]);

  useEffect(() => {
    setThumbnail(product?.image[0] ? product.image[0] : null);
  }, [product]);
  // Add structured data to the document
  useEffect(() => {
    if (!productStructuredData) return;

    // Add or update the JSON-LD script
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.text = JSON.stringify(productStructuredData);

    // Cleanup function to remove the script when component unmounts
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [productStructuredData]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-16">
      <SEO {...seoProps} />
      <div itemScope itemType="https://schema.org/Product">
        <meta itemProp="name" content={product.name} />
        <meta itemProp="description" content={product.description} />
        <meta itemProp="image" content={product.images?.[0] || ''} />
      </div>

      <p>
        <Link to="/">Home</Link>/<Link to={"/products"}> Products</Link> /
        <Link to={`/products/${product.category.toLowerCase()}`}>
          {' '}
          {product.category}
        </Link>{' '}
        /<span className="text-indigo-500"> {product.name}</span>
      </p>

      <div className="flex flex-col md:flex-row gap-16 mt-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            {product.images?.map((image, index) => (
              <div
                key={index}
                onClick={() => setThumbnail(image)}
                className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
              >
                <img
                  src={getImageUrl(image)}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
            <img
              src={getImageUrl(thumbnail || product.images?.[0])}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="text-sm w-full md:w-1/2">
          <h1 className="text-3xl font-medium">{product.name}</h1>

          <div className="flex items-center gap-0.5 mt-1">
            {Array(5).fill("").map((_, i) => (
              <img
                key={i}
                src={i < (product.rating || 4) ? assets.star_icon : assets.star_dull_icon}
                alt="star"
                className="w-3.5 md:w-4"
              />
            ))}
            <p className="text-base ml-2">({product.rating || 4})</p>
          </div>

          <div className="mt-6">
            {/* Prices shown in Vietnamese Dong (₫) */}
            <p className="text-gray-500/70 line-through">
              MRP: {formatVND(product.price)}
            </p>
            <p className="text-2xl font-medium">MRP: {formatVND(product.offerPrice || product.price)}</p>
            <span className="text-gray-500/70">(inclusive of all taxes)</span>
          </div>

          <p className="text-base font-medium mt-6">About Product</p>
          <ul className="list-disc ml-4 text-gray-500/70">
            {Array.isArray(product.description) ? (
              product.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))
            ) : (
              <li>{product.description || 'No description available'}</li>
            )}
          </ul>

          <div className="flex items-center mt-10 gap-4 text-base">
            <button
              onClick={() => addToCart(product._id)}
              className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
            >
              Add to Cart
            </button>
            <button
              onClick={() => {
                addToCart(product._id);
                navigate("/cart");
                window.scrollTo(0, 0);
              }}
              className="w-full py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      <div className="flex flex-col items-center mt-20">
        <div className="flex flex-col items-center w-max">
          <p className="text-2xl font-medium">Related Products</p>
          <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
        </div>

        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
          {relatedProducts
            .filter((p) => p.inStock && p._id !== product._id)
            .slice(0, 5)
            .map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
        </div>
        
        <button
          onClick={() => {
            navigate("/products");
            window.scrollTo(0, 0);
          }}
          className="w-1/2 my-8 py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
        >
          See More
        </button>
      </div>
    </div>
  );
};

export default SingleProduct;






























// import { useEffect, useState } from "react";
// import { useAppContext } from "../context/AppContext";
// import { Link, useParams } from "react-router-dom";
// import { assets } from "../assets/assets";
// import ProductCard from "../components/ProductCard";
// const SingleProduct = () => {
//   const { products, navigate, addToCart } = useAppContext();
//   const { id } = useParams();
//   const [thumbnail, setThumbnail] = useState(null);
//   const [relatedProducts, setRelatedProducts] = useState([]);
//   const product = products.find((product) => product._id === id);
//   console.log("product", product);
//   useEffect(() => {
//     if (products.length > 0) {
//       let productsCopy = products.slice();
//       productsCopy = productsCopy.filter(
//         (product) => product.category === product.category
//       );
//       setRelatedProducts(productsCopy.slice(0, 5));
//     }
//   }, [products]);

//   useEffect(() => {
//     setThumbnail(product?.image[0] ? product.image[0] : null);
//   }, [product]);
//   return (
//     product && (
//       <div className="mt-16">
//         <p>
//           <Link to="/">Home</Link>/<Link to={"/products"}> Products</Link> /
//           <Link to={`/products/${product.category.toLowerCase()}`}>
//             {" "}
//             {product.category}
//           </Link>{" "}
//           /<span className="text-indigo-500"> {product.name}</span>
//         </p>

//         <div className="flex flex-col md:flex-row gap-16 mt-4">
//           <div className="flex gap-3">
//             <div className="flex flex-col gap-3">
//               {product.image.map((image, index) => (
//                 <div
//                   key={index}
//                   onClick={() => setThumbnail(image)}
//                   className="border max-w-24 border-gray-500/30 rounded overflow-hidden cursor-pointer"
//                 >
//                   <img
//                     src={getImageUrl(image)}
//                     alt={`Thumbnail ${index + 1}`}
//                   />
//                 </div>
//               ))}
//             </div>

//             <div className="border border-gray-500/30 max-w-100 rounded overflow-hidden">
//               <img
//                 src={`http://localhost:5000/images/${thumbnail}`}
//                 alt="Selected product"
//               />
//             </div>
//           </div>

//           <div className="text-sm w-full md:w-1/2">
//             <h1 className="text-3xl font-medium">{product.name}</h1>

//             <div className="flex items-center gap-0.5 mt-1">
//               {Array(5)
//                 .fill("")
//                 .map(
//                   (_, i) =>
//                     product.rating >
//                     (
//                       <img
//                         src={i < 4 ? assets.star_icon : assets.star_dull_icon}
//                         alt="star"
//                         key={i}
//                         className="w-3.5 md:w-4"
//                       />
//                     )
//                 )}
//               <p className="text-base ml-2">(4)</p>
//             </div>

//             <div className="mt-6">
//               <p className="text-gray-500/70 line-through">
//                 MRP: ${product.price}
//               </p>
//               <p className="text-2xl font-medium">MRP: ${product.offerPrice}</p>
//               <span className="text-gray-500/70">(inclusive of all taxes)</span>
//             </div>

//             <p className="text-base font-medium mt-6">About Product</p>
//             <ul className="list-disc ml-4 text-gray-500/70">
//               {product.description.map((desc, index) => (
//                 <li key={index}>{desc}</li>
//               ))}
//             </ul>

//             <div className="flex items-center mt-10 gap-4 text-base">
//               <button
//                 onClick={() => addToCart(product._id)}
//                 className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition"
//               >
//                 Add to Cart
//               </button>
//               <button
//                 onClick={() => {
//                   addToCart(product._id);
//                   navigate("/cart");
//                   scrollTo(0, 0);
//                 }}
//                 className="w-full py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
//               >
//                 Buy now
//               </button>
//             </div>
//           </div>
//         </div>
//         {/* related prodcuts  */}
//         <div className="flex flex-col items-center mt-20">
//           <div className="flex flex-col items-center w-max">
//             <p className="text-2xl font-medium">Related Products</p>
//             <div className="w-20 h-0.5 bg-primary rounded-full mt-2"></div>
//           </div>

//           <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 items-center justify-center">
//             {relatedProducts
//               .filter((product) => product.inStock)
//               .map((product, index) => (
//                 <ProductCard key={index} product={product} />
//               ))}
//           </div>
//           <button
//             onClick={() => {
//               navigate("/products");
//               scrollTo(0, 0);
//             }}
//             className="w-1/2 my-8 py-3.5 cursor-pointer font-medium bg-indigo-500 text-white hover:bg-indigo-600 transition"
//           >
//             See More
//           </button>
//         </div>
//       </div>
//     )
//   );
// };
// export default SingleProduct;
