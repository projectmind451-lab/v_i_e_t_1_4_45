import React from "react";

export default function About() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 md:px-12 lg:px-32 bg-gradient-to-br from-emerald-50 to-white">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-14">
        <div className="text-center mb-10">
          <span className="inline-block bg-emerald-100 text-emerald-700 rounded-full px-4 py-1 text-xs font-semibold tracking-widest uppercase mb-3">
            About vinitamart
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Fresh Groceries. Fair Prices. Fast Delivery.
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto">
            vinitamart is your trusted online grocery partner across Vietnam. We bring farm-fresh produce,
            daily essentials, and quality brands to your doorstep with transparent pricing in VND.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">10K+</p>
            <p className="text-xs text-gray-500">Happy Customers</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">1,000+</p>
            <p className="text-xs text-gray-500">Products</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600">50+</p>
            <p className="text-xs text-gray-500">Cities Covered</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-5 text-center">
            <p className="text-3xl font-bold text-emerald-600"><span className="align-middle">₫</span> Zero</p>
            <p className="text-xs text-gray-500">Hidden Fees</p>
          </div>
        </div>

        {/* Mission & Values */}
        <div className="grid md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h2>
            <p className="text-gray-600">
              Make everyday grocery shopping simple, affordable, and delightful. We work directly with
              trusted suppliers and local markets to ensure freshness and quality you can count on.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">What We Value</h2>
            <ul className="text-gray-600 list-disc ml-5 space-y-2">
              <li>Freshness first, always</li>
              <li>Transparent VND pricing</li>
              <li>On-time delivery</li>
              <li>Kind, responsive support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
