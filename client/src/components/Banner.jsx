"use client";
import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

import { home5, home11, home12, home13, home14 } from "../assets/images/assets";

const bannerCaptions = [
  {
    title: "Fresh Groceries Delivered",
    subtitle: "Premium quality products at your doorstep. Experience the freshest ingredients for your family.",
    cta: "Shop Now",
    highlight: "Free Delivery on Orders $50+",
    color: "from-emerald-600 to-teal-600",
    link: "/products"
  },
  {
    title: "Exclusive Daily Deals",
    subtitle: "Save up to 40% on selected items. Limited time offers on your favorite vinitamart essentials.",
    cta: "View Deals",
    highlight: "Up to 40% OFF",
    color: "from-orange-500 to-red-500",
    link: "/products"
  },
  {
    title: "Organic & Natural",
    subtitle: "Handpicked organic produce and natural products for a healthier lifestyle.",
    cta: "Explore Organic",
    highlight: "100% Organic Certified",
    color: "from-green-600 to-lime-600",
    link: "/products"
  }
];

const Banner = () => {
  const bannerImages = [home11, home14, home5];
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleCTAClick = (link) => {
    navigate(link);
  };

  const handleLearnMoreClick = () => {
    // Scroll to products section or navigate to about page
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="w-full relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600"></div>
      </div>
      
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        effect="fade"
        fadeEffect={{
          crossFade: true
        }}
        speed={1000}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="banner-swiper w-full relative z-10"
      >
        {bannerImages.map((img, index) => (
          <SwiperSlide key={index} className="relative">
            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden">
              {/* Image with parallax effect */}
              <div className="absolute inset-0 transform scale-110 transition-transform duration-[10000ms] ease-out">
                <img
                  src={img}
                  alt={`${bannerCaptions[index].title} - Premium vinitamart Shopping`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
              
              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
              
              {/* Content Container */}
              <div className="absolute inset-0 flex items-center justify-start p-6 sm:p-8 md:p-12 lg:p-16">
                <div className={`max-w-2xl transform transition-all duration-1000 ${
                  isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                  {/* Highlight Badge */}
                  <div className={`inline-flex items-center px-4 py-2 mb-4 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r ${bannerCaptions[index].color} rounded-full shadow-lg backdrop-blur-sm border border-white/20 animate-pulse`}>
                    <span className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></span>
                    {bannerCaptions[index].highlight}
                  </div>
                  
                  {/* Main Title */}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-2xl">
                      {bannerCaptions[index].title}
                    </span>
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-lg font-medium">
                    {bannerCaptions[index].subtitle}
                  </p>
                  
                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => handleCTAClick(bannerCaptions[index].link)}
                      className={`group relative px-8 py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r ${bannerCaptions[index].color} rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden cursor-pointer`}
                    >
                      <span className="relative z-10 flex items-center justify-center">
                        {bannerCaptions[index].cta}
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button 
                      onClick={handleLearnMoreClick}
                      className="group px-6 py-4 text-base sm:text-lg font-semibold text-white border-2 border-white/30 rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                    >
                      <span className="flex items-center justify-center">
                        Learn More
                        <svg className="w-4 h-4 ml-2 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute bottom-20 right-20 w-32 h-32 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-2xl animate-bounce"></div>
            </div>
          </SwiperSlide>
        ))}
        

        
        {/* Custom Pagination */}
        <div className="swiper-pagination !bottom-6 sm:!bottom-8 !left-1/2 !transform !-translate-x-1/2"></div>
      </Swiper>
      
      <style>{`
        .banner-swiper {
          width: 100%;
          height: 100%;
        }
        
        .banner-swiper .swiper-slide {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          position: relative;
        }
        
        .banner-swiper .swiper-pagination {
          position: absolute;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          justify-content: center;
          z-index: 30;
          gap: 8px;
        }
        
        .banner-swiper .swiper-pagination-bullet {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
          backdrop-filter: blur(10px);
          margin: 0 4px !important;
          opacity: 1;
        }
        
        .banner-swiper .swiper-pagination-bullet:hover {
          background: rgba(255, 255, 255, 0.7);
          transform: scale(1.2);
        }
        
        .banner-swiper .swiper-pagination-bullet-active {
          background: linear-gradient(135deg, #10b981, #3b82f6);
          width: 40px;
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        .banner-swiper .swiper-slide-active .scale-110 {
          transform: scale(1.05);
        }
        
        @media (max-width: 640px) {
          .banner-swiper .swiper-pagination {
            bottom: 24px;
          }
          
          .banner-swiper .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
          }
          
          .banner-swiper .swiper-pagination-bullet-active {
            width: 30px;
          }
        }
      `}</style>
      
      <style>{`
        @keyframes slideInLeft {
          0% { 
            opacity: 0; 
            transform: translateX(-100px) translateY(20px);
          }
          100% { 
            opacity: 1; 
            transform: translateX(0) translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: scale(0.8) translateY(30px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
          }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default Banner;