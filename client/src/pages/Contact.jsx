import React, { useState } from "react";
import Scanner from "../assets/images/Scanner.jpeg" ;

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 md:px-12 lg:px-32 bg-gradient-to-br from-white to-emerald-50">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-16 flex flex-col md:flex-row gap-12">
        {/* Contact Details */}
        <div className="flex-1 flex flex-col justify-center items-start gap-8">
          <div>
            <span className="inline-block bg-indigo-100 text-indigo-600 rounded-full px-4 py-1 text-xs font-semibold tracking-widest uppercase mb-2">
              Contact Us
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">We're here to help</h2>
            <p className="text-gray-600 text-base">
              Questions about orders, delivery, or products? Reach us anytime.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-gray-700 w-full">
            <div className="flex items-center gap-3">
              <span className="text-indigo-500 text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25M2.25 6.75l9.72 7.29c.42.32 1.02.32 1.44 0l9.81-7.29" />
                </svg>
              </span>
              <span className="text-base">raja@vnitagroup.com</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-indigo-500 text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75v10.5A2.25 2.25 0 004.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25M2.25 6.75l9.72 7.29c.42.32 1.02.32 1.44 0l9.81-7.29" />
                </svg>
              </span>
              <span className="text-base">+84 975473459</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-indigo-500 text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v6.75A2.25 2.25 0 009.75 15.75h4.5A2.25 2.25 0 0016.5 13.5v-3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75v2.25" />
                </svg>
              </span>
              <span className="text-base">No. 15B, Lane 729, Bat Khoi Street, Cu Khoi Ward, Long Bien District, Hanoi City, Vietnam</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 text-2xl">🕒</span>
              <span className="text-base">Support Hours: Mon–Sun, 8:00–22:00</span>
            </div>
          </div>
          {/* Scanner / QR or contact image */}
          <div className="w-full">
            <img
              src={Scanner}
              alt="Scan or save our contact"
              className="w-full max-w-sm rounded-2xl shadow-md border border-gray-200"
            />
            <p className="text-xs text-gray-500 mt-2">Scan/save this image for quick contact.</p>
          </div>
        </div>
        {/* Contact Form */}
        <form
          className="flex-1 flex flex-col gap-6 bg-indigo-50 rounded-2xl p-6 md:p-8 shadow-md"
          onSubmit={handleSubmit}
        >
          <h3 className="text-xl font-bold text-emerald-700 mb-2">Contact vinitamart</h3>
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
              placeholder="Your Name"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              required
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              placeholder="Order #12345, Delivery, Product info, etc."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
              placeholder="you@example.com"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white resize-none"
              placeholder="Your message..."
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
          >
            Send Message
          </button>
          {submitted && (
            <div className="text-emerald-600 text-sm font-medium mt-2">
              Thanks for contacting vinitamart! We’ll get back to you soon.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
