import React from "react";
import Banner from "../components/Banner";
import BestSeller from "../components/BestSeller";
import Category from "../components/Category";
import NewsLetter from "../components/NewsLetter";

const Home = () => {
  return (
    <div className="mt-6 px-4 sm:px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
        {/* Hero Section */}
        <section className="mb-8">
          <Banner />
        </section>

        {/* Product Categories */}
        <section className="mb-12">
          <Category />
        </section>

        {/* Best Seller Products */}
        <section className="mb-12">
          <BestSeller />
        </section>

        {/* Newsletter Subscription */}
        <section className="mb-16">
          <NewsLetter />
        </section>
  </div>
  );
};
export default Home;
