import { categories } from "../assets/assets";
import { useAppContext } from "../context/appContext";

const Category = () => {
  const { navigate } = useAppContext();

  return (
    <div className="mt-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">
        Categories
      </h2>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="group cursor-pointer rounded-xl p-4 flex flex-col items-center justify-between transition duration-300 ease-in-out hover:shadow-lg"
            style={{ backgroundColor: category.bgColor }}
            onClick={() => {
              navigate(`/products/${category.path.toLowerCase()}`);
              scrollTo(0, 0);
            }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-3">
              <img
                src={category.image}
                alt={category.text}
                className="h-full object-contain transform transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <p className="text-sm sm:text-base font-medium text-center text-gray-900">
              {category.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;






















// import { categories } from "../assets/assets";
// import { useAppContext } from "../context/appContext";
// const Category = () => {
//   const { navigate } = useAppContext();
//   return (
//     <div className="mt-16">
//       <p className="text-2xl md:text-3xl font-medium">Categories</p>
//       <div className=" my-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 items-center justify-center">
//       {categories.map((category, index) => (
//         <div
//           key={index}
//           className="group cursor-pointer w-40 h-48 rounded-lg flex flex-col items-center justify-between p-4"
//           style={{ backgroundColor: category.bgColor }}
//           onClick={() => {
//             navigate(`/products/${category.path.toLowerCase()}`);
//             scrollTo(0, 0);
//           }}
//         >
//           <div className="w-24 h-24 flex items-center justify-center">
//             <img
//               src={category.image}
//               alt={category.text}
//               className="h-full object-contain transition group-hover:scale-110"
//             />
//           </div>
//           <p className="text-sm font-medium text-center">{category.text}</p>
//         </div>
//       ))}
//       </div>
//     </div>
//   );
// };
// export default Category;
