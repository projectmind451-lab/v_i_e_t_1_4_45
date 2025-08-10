const NewsLetter = () => {
  return (
    <section className="my-16 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-2xl md:text-4xl font-semibold text-gray-800">
          Never Miss a Deal!
        </h1>
        <p className="text-gray-500/80 md:text-lg mt-2">
          Subscribe to get the latest offers, new arrivals, and exclusive discounts.
        </p>

        <form
          className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-0"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-md sm:rounded-r-none outline-none"
          />
          <button
            type="submit"
            className="bg-indigo-500 text-white px-6 py-3 text-sm rounded-md sm:rounded-l-none hover:bg-indigo-600 transition-all"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default NewsLetter;





















// const NewsLetter = () => {
//   return (
//     <div className="my-16 flex flex-col items-center justify-center text-center space-y-2">
//       <h1 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h1>
//       <p className="md:text-lg text-gray-500/70 pb-8">
//         Subscribe to get the latest offers, new arrivals, and exclusive
//         discounts
//       </p>
//       <form className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
//         <input
//           className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-500"
//           type="text"
//           placeholder="Enter your email id"
//           required
//         />
//         <button
//           type="submit"
//           className="md:px-12 px-8 h-full text-white bg-indigo-500 hover:bg-indigo-600 transition-all cursor-pointer rounded-md rounded-l-none"
//         >
//           Subscribe
//         </button>
//       </form>
//     </div>
//   );
// };
// export default NewsLetter;
