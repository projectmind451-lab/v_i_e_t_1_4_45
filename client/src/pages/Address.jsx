import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAddress } from "../context/AddressContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Address() {
  const { address, updateAddress } = useAddress();
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState({ email: false, submit: false });
  const [status, setStatus] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    updateAddress(e.target.name, e.target.value);
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const requiredFields = [
      "firstname",
      "lastname",
      "email",
      "street",
      "city",
      "state",
      "zipcode",
      "country",
      "phone",
    ];

    let errs = {};
    requiredFields.forEach((field) => {
      if (!address[field]) {
        errs[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} required`;
      }
    });

    if (address.email && !emailRegex.test(address.email)) {
      errs.email = "Invalid email format";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const sendEmailOtp = async () => {
    if (!address.email || !emailRegex.test(address.email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      return;
    }

    setLoading((prev) => ({ ...prev, email: true }));
    setStatus("");

    try {
      await axios.post("/api/send-email-otp", { email: address.email });
      setOtpSent(true);
      setStatus("OTP sent to your email");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setStatus("Please enter the OTP");
      return;
    }

    setLoading((prev) => ({ ...prev, email: true }));

    try {
      await axios.post("/api/verify-email-otp", {
        email: address.email,
        otp,
      });
      setOtpVerified(true);
      setStatus("Email verified successfully!");
    } catch (err) {
      setStatus(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading((prev) => ({ ...prev, email: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    if (!otpSent) {
      await sendEmailOtp();
      return;
    }

    if (!otpVerified) {
      setStatus("Please verify your email before submitting");
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      const newAddress = {
        firstname: address.firstname,
        lastname: address.lastname,
        email: address.email,
        street: address.street,
        city: address.city,
        state: address.state,
        zipcode: address.zipcode,
        country: address.country,
        phone: address.phone,
      };

      // Save to backend
      await axios.post("/api/address", newAddress);

      // Update context instantly
      Object.entries(newAddress).forEach(([key, value]) => {
        updateAddress(key, value);
      });

      // Navigate to cart
      navigate("/cart");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to submit address");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-4 border rounded-md">
      <h2 className="text-xl font-semibold mb-4">Address Form</h2>

      <InputField name="firstname" label="First Name" value={address.firstname} onChange={handleChange} error={errors.firstname} />
      <InputField name="lastname" label="Last Name" value={address.lastname} onChange={handleChange} error={errors.lastname} />

      {/* Email + OTP */}
      <div className="mb-4">
        <label className="block mb-1">Email</label>
        <div className="flex gap-2">
          <input
            name="email"
            type="email"
            value={address.email}
            onChange={handleChange}
            disabled={otpVerified}
            className="flex-1 p-2 border rounded-md"
          />
          {!otpVerified && (
            <button
              type="button"
              onClick={sendEmailOtp}
              disabled={loading.email || !address.email || !emailRegex.test(address.email)}
              className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
            >
              {loading.email ? (otpSent ? "Resending..." : "Sending...") : otpSent ? "Resend OTP" : "Send OTP"}
            </button>
          )}
        </div>
        {errors.email && <ErrorMsg msg={errors.email} />}

        {otpSent && !otpVerified && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="Enter OTP"
              className="w-full p-2 border rounded-md"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={loading.email || !otp}
              className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
            >
              {loading.email ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {status && (
          <div className={`mt-2 text-sm ${status.includes("fail") ? "text-red-600" : "text-green-600"}`}>
            {status}
          </div>
        )}
      </div>

      <InputField name="street" label="Street Address" value={address.street} onChange={handleChange} error={errors.street} />

      <div className="grid grid-cols-2 gap-4">
        <InputField name="city" label="City" value={address.city} onChange={handleChange} error={errors.city} />
        <InputField name="state" label="State/Province" value={address.state} onChange={handleChange} error={errors.state} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <InputField name="zipcode" label="ZIP/Postal Code" value={address.zipcode} onChange={handleChange} error={errors.zipcode} />
        <InputField name="country" label="Country" value={address.country} onChange={handleChange} error={errors.country} />
      </div>

      <InputField name="phone" label="Phone Number" value={address.phone} onChange={handleChange} error={errors.phone} />

      <button
        type="submit"
        disabled={loading.submit}
        className="w-full p-3 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-lg"
      >
        {loading.submit ? "Submitting..." : "Submit Address"}
      </button>
    </form>
  );
}

function InputField({ name, label, value, onChange, error }) {
  return (
    <div className="mb-4">
      <label className="block mb-1">{label}</label>
      <input name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-md" />
      {error && <ErrorMsg msg={error} />}
    </div>
  );
}

function ErrorMsg({ msg }) {
  return <div className="text-red-600 text-sm mt-1">{msg}</div>;
}






// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useAddress } from "../context/AddressContext";

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const initialState = {
//   firstname: "",
//   lastname: "",
//   email: "",
//   street: "",
//   city: "",
//   state: "",
//   zipcode: "",
//   country: "",
//   phone: "",
//   emailOtp: "",
// };

// export default function Address() {
//   const [fields, setFields] = useState(initialState);
//   const [errors, setErrors] = useState({});
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [loading, setLoading] = useState({ email: false, submit: false });
//   const [status, setStatus] = useState("");

//   const navigate = useNavigate();
//   const { setSelectedAddress } = useAddress();

//   const handleChange = (e) => {
//     setFields({ ...fields, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" });
//   };

//   const validate = () => {
//     const requiredFields = [
//       "firstname",
//       "lastname",
//       "email",
//       "street",
//       "city",
//       "state",
//       "zipcode",
//       "country",
//       "phone",
//     ];

//     let errs = {};
//     requiredFields.forEach((field) => {
//       if (!fields[field]) {
//         errs[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} required`;
//       }
//     });

//     if (fields.email && !emailRegex.test(fields.email)) {
//       errs.email = "Invalid email format";
//     }

//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const sendEmailOtp = async () => {
//     if (!fields.email || !emailRegex.test(fields.email)) {
//       setErrors({ ...errors, email: "Please enter a valid email" });
//       return;
//     }

//     setLoading((prev) => ({ ...prev, email: true }));
//     setStatus("");

//     try {
//       await axios.post("/api/send-email-otp", { email: fields.email });
//       setOtpSent(true);
//       setStatus("OTP sent to your email");
//     } catch (err) {
//       setStatus(err.response?.data?.message || "Failed to send OTP");
//     } finally {
//       setLoading((prev) => ({ ...prev, email: false }));
//     }
//   };

//   const verifyOtp = async () => {
//     if (!fields.emailOtp) {
//       setStatus("Please enter the OTP");
//       return;
//     }

//     setLoading((prev) => ({ ...prev, email: true }));

//     try {
//       await axios.post("/api/verify-email-otp", {
//         email: fields.email,
//         otp: fields.emailOtp,
//       });
//       setOtpVerified(true);
//       setStatus("Email verified successfully!");
//     } catch (err) {
//       setStatus(err.response?.data?.message || "OTP verification failed");
//     } finally {
//       setLoading((prev) => ({ ...prev, email: false }));
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     if (!otpSent) {
//       await sendEmailOtp();
//       return;
//     }

//     if (!otpVerified) {
//       setStatus("Please verify your email before submitting");
//       return;
//     }

//     setLoading((prev) => ({ ...prev, submit: true }));

//     try {
//       const newAddress = {
//         fullName: `${fields.firstname} ${fields.lastname}`,
//         street: fields.street,
//         city: fields.city,
//         state: fields.state,
//         zipCode: fields.zipcode,
//         country: fields.country,
//         phone: fields.phone,
//         email: fields.email,
//       };

//       // Save to backend
//       await axios.post("/api/address", newAddress);

//       // Save to context
//       setSelectedAddress(newAddress);

//       // Navigate to cart
//       navigate("/cart");
//     } catch (err) {
//       setStatus(err.response?.data?.message || "Failed to submit address");
//     } finally {
//       setLoading((prev) => ({ ...prev, submit: false }));
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-8 p-4 border rounded-md">
//       <h2 className="text-xl font-semibold mb-4">Address Form</h2>

//       {/* First Name */}
//       <InputField name="firstname" label="First Name" value={fields.firstname} onChange={handleChange} error={errors.firstname} />
//       {/* Last Name */}
//       <InputField name="lastname" label="Last Name" value={fields.lastname} onChange={handleChange} error={errors.lastname} />

//       {/* Email + OTP */}
//       <div className="mb-4">
//         <label className="block mb-1">Email</label>
//         <div className="flex gap-2">
//           <input
//             name="email"
//             type="email"
//             value={fields.email}
//             onChange={handleChange}
//             disabled={otpVerified}
//             className="flex-1 p-2 border rounded-md"
//           />
//           {!otpVerified && (
//             <button
//               type="button"
//               onClick={sendEmailOtp}
//               disabled={loading.email || !fields.email || !emailRegex.test(fields.email)}
//               className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
//             >
//               {loading.email ? (otpSent ? "Resending..." : "Sending...") : otpSent ? "Resend OTP" : "Send OTP"}
//             </button>
//           )}
//         </div>
//         {errors.email && <ErrorMsg msg={errors.email} />}

//         {otpSent && !otpVerified && (
//           <div className="flex gap-2 mt-2">
//             <input
//               type="text"
//               name="emailOtp"
//               value={fields.emailOtp}
//               onChange={handleChange}
//               maxLength={6}
//               placeholder="Enter OTP"
//               className="w-full p-2 border rounded-md"
//             />
//             <button
//               type="button"
//               onClick={verifyOtp}
//               disabled={loading.email || !fields.emailOtp}
//               className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
//             >
//               {loading.email ? "Verifying..." : "Verify OTP"}
//             </button>
//           </div>
//         )}

//         {status && (
//           <div className={`mt-2 text-sm ${status.includes("fail") ? "text-red-600" : "text-green-600"}`}>
//             {status}
//           </div>
//         )}
//       </div>

//       {/* Street */}
//       <InputField name="street" label="Street Address" value={fields.street} onChange={handleChange} error={errors.street} />

//       {/* City & State */}
//       <div className="grid grid-cols-2 gap-4">
//         <InputField name="city" label="City" value={fields.city} onChange={handleChange} error={errors.city} />
//         <InputField name="state" label="State/Province" value={fields.state} onChange={handleChange} error={errors.state} />
//       </div>

//       {/* Zip & Country */}
//       <div className="grid grid-cols-2 gap-4 mt-4">
//         <InputField name="zipcode" label="ZIP/Postal Code" value={fields.zipcode} onChange={handleChange} error={errors.zipcode} />
//         <InputField name="country" label="Country" value={fields.country} onChange={handleChange} error={errors.country} />
//       </div>

//       {/* Phone */}
//       <InputField name="phone" label="Phone Number" value={fields.phone} onChange={handleChange} error={errors.phone} />

//       {/* Submit */}
//       <button
//         type="submit"
//         disabled={loading.submit}
//         className="w-full p-3 mt-4 bg-green-600 hover:bg-green-700 text-white rounded-md text-lg"
//       >
//         {loading.submit ? "Submitting..." : "Submit Address"}
//       </button>
//     </form>
//   );
// }

// function InputField({ name, label, value, onChange, error }) {
//   return (
//     <div className="mb-4">
//       <label className="block mb-1">{label}</label>
//       <input name={name} value={value} onChange={onChange} className="w-full p-2 border rounded-md" />
//       {error && <ErrorMsg msg={error} />}
//     </div>
//   );
// }

// function ErrorMsg({ msg }) {
//   return <div className="text-red-600 text-sm mt-1">{msg}</div>;
// }






















// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const initialState = {
//   firstname: "",
//   lastname: "",
//   email: "",
//   street: "",
//   city: "",
//   state: "",
//   zipcode: "",
//   country: "",
//   phone: "",
//   emailOtp: "",
// };

// export default function Address() {
//   const [fields, setFields] = useState(initialState);
//   const [errors, setErrors] = useState({});
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [loading, setLoading] = useState({ email: false, submit: false });
//   const [status, setStatus] = useState("");

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFields({ ...fields, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" });
//   };

//   const validate = () => {
//     let errs = {};
//     if (!fields.firstname) errs.firstname = "First name required";
//     if (!fields.lastname) errs.lastname = "Last name required";
//     if (!fields.email) {
//       errs.email = "Email required";
//     } else if (!emailRegex.test(fields.email)) {
//       errs.email = "Invalid email format";
//     }
//     if (!fields.street) errs.street = "Street required";
//     if (!fields.city) errs.city = "City required";
//     if (!fields.state) errs.state = "State required";
//     if (!fields.zipcode) errs.zipcode = "Zipcode required";
//     if (!fields.country) errs.country = "Country required";
//     if (!fields.phone) errs.phone = "Phone required";

//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const sendEmailOtp = async () => {
//     if (!fields.email || !emailRegex.test(fields.email)) {
//       setErrors({ ...errors, email: "Please enter a valid email" });
//       return;
//     }

//     setLoading({ ...loading, email: true });
//     setStatus("");

//     try {
//       await axios.post("/api/send-email-otp", { email: fields.email });
//       setOtpSent(true);
//       setStatus("OTP sent to your email");
//     } catch (err) {
//       setStatus(
//         err.response?.data?.message || "Failed to send OTP. Please try again."
//       );
//     } finally {
//       setLoading({ ...loading, email: false });
//     }
//   };

//   const verifyOtp = async () => {
//     if (!fields.emailOtp) {
//       setStatus("Please enter the OTP");
//       return;
//     }

//     setLoading({ ...loading, email: true });

//     try {
//       await axios.post("/api/verify-email-otp", {
//         email: fields.email,
//         otp: fields.emailOtp,
//       });
//       setOtpVerified(true);
//       setStatus("Email verified successfully!");
//     } catch (err) {
//       setStatus(
//         err.response?.data?.message || "OTP verification failed. Please try again."
//       );
//     } finally {
//       setLoading({ ...loading, email: false });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     if (!otpSent) {
//       await sendEmailOtp();
//       return;
//     }

//     if (!otpVerified) {
//       setStatus("Please verify your email with the OTP before submitting");
//       return;
//     }

//     setLoading({ ...loading, submit: true });

//     try {
//       const response = await axios.post("/api/address", {
//         fullName: `${fields.firstname} ${fields.lastname}`,
//         street: fields.street,
//         city: fields.city,
//         state: fields.state,
//         zipCode: fields.zipcode,
//         country: fields.country,
//         phone: fields.phone,
//         email: fields.email,
//       });

//       if (response.data.success) {
//         alert("Address submitted successfully!");
//         setFields(initialState);
//         setOtpSent(false);
//         setOtpVerified(false);
//         // setStatus("");
//         navigate("/cart");
//       } else {
//         setStatus("Failed to submit address. Please try again.");
//       }
//     } catch (err) {
//       setStatus(
//         err.response?.data?.message || "Failed to submit address. Please try again."
//       );
//     } finally {
//       setLoading({ ...loading, submit: false });
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto mt-8 p-4 border rounded-md"
//     >
//       <h2 className="text-xl font-semibold mb-4">Address Form</h2>

//       <div className="mb-4">
//         <label className="block mb-1">First Name</label>
//         <input
//           name="firstname"
//           value={fields.firstname}
//           onChange={handleChange}
//           className="w-full p-2 border rounded-md"
//         />
//         {errors.firstname && (
//           <div className="text-red-600 text-sm mt-1">{errors.firstname}</div>
//         )}
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1">Last Name</label>
//         <input
//           name="lastname"
//           value={fields.lastname}
//           onChange={handleChange}
//           className="w-full p-2 border rounded-md"
//         />
//         {errors.lastname && (
//           <div className="text-red-600 text-sm mt-1">{errors.lastname}</div>
//         )}
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1">Email</label>
//         <div className="flex gap-2">
//           <input
//             name="email"
//             type="email"
//             value={fields.email}
//             onChange={handleChange}
//             onBlur={() => {
//               if (fields.email && !emailRegex.test(fields.email)) {
//                 setErrors({ ...errors, email: "Invalid email format" });
//               }
//             }}
//             disabled={otpVerified}
//             className="flex-1 p-2 border rounded-md"
//           />
//           {!otpVerified && (
//             <button
//               type="button"
//               onClick={sendEmailOtp}
//               disabled={loading.email || !fields.email || !emailRegex.test(fields.email)}
//               className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
//             >
//               {loading.email ? (otpSent ? "Resending..." : "Sending...") : otpSent ? "Resend OTP" : "Send OTP"}
//             </button>
//           )}
//         </div>
//         {errors.email && (
//           <div className="text-red-600 text-sm mt-1">{errors.email}</div>
//         )}

//         {otpSent && !otpVerified && (
//           <div className="flex gap-2 mt-2">
//             <input
//               type="text"
//               name="emailOtp"
//               value={fields.emailOtp}
//               onChange={handleChange}
//               maxLength={6}
//               placeholder="Enter OTP"
//               className="w-full p-2 border rounded-md"
//             />
//             <button
//               type="button"
//               onClick={verifyOtp}
//               disabled={loading.email || !fields.emailOtp}
//               className="px-4 bg-green-500 hover:bg-green-600 text-white rounded-md"
//             >
//               {loading.email ? "Verifying..." : "Verify OTP"}
//             </button>
//           </div>
//         )}

//         {status && (
//           <div
//             className={`mt-2 text-sm ${
//               status.toLowerCase().includes("failed") ||
//               status.toLowerCase().includes("invalid")
//                 ? "text-red-600"
//                 : "text-green-600"
//             }`}
//           >
//             {status}
//           </div>
//         )}
//       </div>

//       <div className="mb-4">
//         <label className="block mb-1">Street Address</label>
//         <input
//           name="street"
//           value={fields.street}
//           onChange={handleChange}
//           className="w-full p-2 border rounded-md"
//         />
//         {errors.street && (
//           <div className="text-red-600 text-sm mt-1">{errors.street}</div>
//         )}
//       </div>

//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div>
//           <label className="block mb-1">City</label>
//           <input
//             name="city"
//             value={fields.city}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-md"
//           />
//           {errors.city && (
//             <div className="text-red-600 text-sm mt-1">{errors.city}</div>
//           )}
//         </div>
//         <div>
//           <label className="block mb-1">State/Province</label>
//           <input
//             name="state"
//             value={fields.state}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-md"
//           />
//           {errors.state && (
//             <div className="text-red-600 text-sm mt-1">{errors.state}</div>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4 mb-4">
//         <div>
//           <label className="block mb-1">ZIP/Postal Code</label>
//           <input
//             name="zipcode"
//             value={fields.zipcode}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-md"
//           />
//           {errors.zipcode && (
//             <div className="text-red-600 text-sm mt-1">{errors.zipcode}</div>
//           )}
//         </div>
//         <div>
//           <label className="block mb-1">Country</label>
//           <input
//             name="country"
//             value={fields.country}
//             onChange={handleChange}
//             className="w-full p-2 border rounded-md"
//           />
//           {errors.country && (
//             <div className="text-red-600 text-sm mt-1">{errors.country}</div>
//           )}
//         </div>
//       </div>

//       <div className="mb-6">
//         <label className="block mb-1">Phone Number</label>
//         <input
//           name="phone"
//           type="tel"
//           value={fields.phone}
//           onChange={handleChange}
//           className="w-full p-2 border rounded-md"
//         />
//         {errors.phone && (
//           <div className="text-red-600 text-sm mt-1">{errors.phone}</div>
//         )}
//       </div>

//       <button
//         type="submit"
//         disabled={loading.submit}
//         className="w-full p-3 bg-green-600 hover:bg-green-700 text-white rounded-md text-lg"
//       >
//         {loading.submit ? "Submitting..." : "Submit Address"}
//       </button>
//     </form>
//   );
// }

































// import React, { useState, useContext, useEffect } from "react";
// import { assets } from "../assets/assets";
// import { AppContext } from "../context/AppContext";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// // Email validation regex
// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// const Address = () => {
//   const { axios, user, navigate: contextNavigate } = useContext(AppContext);
//   const navigate = useNavigate();

//   // Form fields state
//   const [fields, setFields] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     street: "",
//     city: "",
//     state: "",
//     zipCode: "",
//     country: "",
//     phone: "",
//     emailOtp: "",
//   });

//   // Errors state for validation messages
//   const [errors, setErrors] = useState({});

//   // OTP states
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);

//   // Loading states
//   const [loading, setLoading] = useState({ email: false, submit: false });

//   // Status message for user feedback
//   const [status, setStatus] = useState("");

//   // Update fields on input change
//   const handleChange = (e) => {
//     setFields({ ...fields, [e.target.name]: e.target.value });
//     setErrors({ ...errors, [e.target.name]: "" });
//     setStatus("");
//   };

//   // Validation function
//   const validate = () => {
//     let errs = {};
//     if (!fields.firstName) errs.firstName = "First name required";
//     if (!fields.lastName) errs.lastName = "Last name required";
//     if (!fields.email) {
//       errs.email = "Email required";
//     } else if (!emailRegex.test(fields.email)) {
//       errs.email = "Invalid email format";
//     }
//     if (!fields.street) errs.street = "Street required";
//     if (!fields.city) errs.city = "City required";
//     if (!fields.state) errs.state = "State required";
//     if (!fields.zipCode) errs.zipCode = "Zip Code required";
//     if (!fields.country) errs.country = "Country required";
//     if (!fields.phone) errs.phone = "Phone required";

//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   // Send OTP to email
//   const sendEmailOtp = async () => {
//     if (!fields.email || !emailRegex.test(fields.email)) {
//       setErrors({ ...errors, email: "Please enter a valid email" });
//       return;
//     }
//     setLoading((prev) => ({ ...prev, email: true }));
//     setStatus("");
//     try {
//       const { data } = await axios.post("/api/send-email-otp", { email: fields.email });
//       if (data.success) {
//         setOtpSent(true);
//         setStatus("OTP sent to your email");
//         toast.success("OTP sent to your email");
//       } else {
//         setStatus(data.message || "Failed to send OTP");
//         toast.error(data.message || "Failed to send OTP");
//       }
//     } catch (err) {
//       setStatus(err.response?.data?.message || "Failed to send OTP. Please try again.");
//       toast.error(err.response?.data?.message || "Failed to send OTP. Please try again.");
//     } finally {
//       setLoading((prev) => ({ ...prev, email: false }));
//     }
//   };

//   // // Verify OTP entered by user
//   // const verifyOtp = async () => {
//   //   if (!fields.emailOtp) {
//   //     setStatus("Please enter the OTP");
//   //     return;
//   //   }
//   //   setLoading((prev) => ({ ...prev, email: true }));
//   //   setStatus("");
//   //   try {
//   //     const { data } = await axios.post("/api/verify-email-otp", {
//   //       email: fields.email,
//   //       otp: fields.emailOtp,
//   //     });
//   //     if (data.success) {
//   //       setOtpVerified(true);
//   //       setStatus("Email verified successfully!");
//   //       toast.success("Email verified successfully!");
//   //     } else {
//   //       setStatus(data.message || "OTP verification failed");
//   //       toast.error(data.message || "OTP verification failed");
//   //     }
//   //   } catch (err) {
//   //     setStatus(err.response?.data?.message || "OTP verification failed. Please try again.");
//   //     toast.error(err.response?.data?.message || "OTP verification failed. Please try again.");
//   //   } finally {
//   //     setLoading((prev) => ({ ...prev, email: false }));
//   //   }
//   // };

//    // Verify OTP
//    const verifyOtp = async () => {
//     if (!fields.emailOtp) {
//       setStatus("Please enter the OTP");
//       return;
//     }

//     setLoading({ ...loading, email: true });
    
//     try {
//       await axios.post("/api/verify-email-otp", {
//         email: fields.email,
//         otp: fields.emailOtp,
//       });
//       setOtpVerified(true);
//       setStatus("Email verified successfully!");
//     } catch (err) {
//       setStatus(err.response?.data?.message || "OTP verification failed. Please try again.");
//     } finally {
//       setLoading({ ...loading, email: false });
//     }
//   };


//   // // Form submit handler
//   // const submitHandler = async (e) => {
//   //   e.preventDefault();

//   //   if (!validate()) return;

//   //   if (!otpSent) {
//   //     await sendEmailOtp();
//   //     return;
//   //   }

//   //   if (!otpVerified) {
//   //     setStatus("Please verify your email with the OTP before submitting");
//   //     return;
//   //   }

//   //   setLoading((prev) => ({ ...prev, submit: true }));
//   //   setStatus("");

//   //   try {
//   //     const { data } = await axios.post("/api/address/add", {
//   //       firstName: fields.firstName,
//   //       lastName: fields.lastName,
//   //       email: fields.email,
//   //       street: fields.street,
//   //       city: fields.city,
//   //       state: fields.state,
//   //       zipCode: fields.zipCode,
//   //       country: fields.country,
//   //       phone: fields.phone,
//   //     });

//   //     if (data.success) {
//   //       toast.success(data.message || "Address saved successfully");
//   //       setFields({
//   //         firstName: "",
//   //         lastName: "",
//   //         email: "",
//   //         street: "",
//   //         city: "",
//   //         state: "",
//   //         zipCode: "",
//   //         country: "",
//   //         phone: "",
//   //         emailOtp: "",
//   //       });
//   //       setOtpSent(false);
//   //       setOtpVerified(false);
//   //       setStatus("");
//   //       navigate("/cart");
//   //     } else {
//   //       toast.error(data.message || "Failed to save address");
//   //       setStatus(data.message || "Failed to save address");
//   //     }
//   //   } catch (error) {
//   //     toast.error(error.message || "Failed to save address");
//   //     setStatus(error.message || "Failed to save address");
//   //   } finally {
//   //     setLoading((prev) => ({ ...prev, submit: false }));
//   //   }
//   // };

//    // Handle form submission

//    const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validate()) return;

//     if (!otpSent) {
//       await sendEmailOtp();
//       return;
//     }

//     if (!otpVerified) {
//       setStatus("Please verify your email with the OTP before submitting");
//       return;
//     }

//     setLoading({ ...loading, submit: true });

//     try {
//       // Submit the form data without OTP field
//       const response = await axios.post("/api/address", {
//         fullName: `${fields.firstname} ${fields.lastname}`,
//         street: fields.street,
//         city: fields.city,
//         state: fields.state,
//         zipCode: fields.zipcode,
//         country: fields.country,
//         phone: fields.phone,
//         email: fields.email, // optional if backend expects email too
//       });
//       console.log("Address submit response:", response.data);

//       if (response.data.success) {
//         console.log("Success branch reached");
//         alert("Address submitted successfully!");
//         setFields(initialState);
//         setOtpSent(false);
//         setOtpVerified(false);
//         setStatus("");
//         // Navigate to Cart page after success
//         navigate("/cart");
//       } else {
//         console.log("Failure branch reached")
//         setStatus("Failed to submit address. Please try again.");      
//       }
//     } catch (err) {
//       console.log("Catch block reached", err);
//       setStatus(err.response?.data?.message || "Failed to submit address. Please try again.");
//     } finally {
//       setLoading({ ...loading, submit: false });
//     }
//   };

//   useEffect(() => {
//     if (!user) {
//       // If no user, redirect to cart (or login)
//       navigate("/cart");
//     }
//   }, [user, navigate]);

//   return (
//     <div className="mt-12 flex flex-col md:flex-row gap-6 p-6 bg-gray-100 rounded-lg shadow-md">
//       {/* Left Side: Address Form */}
//       <div className="flex-1 bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-semibold text-gray-700 mb-4">Address Details</h2>
//         <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {/* First Name */}
//           <div>
//             <label className="block text-gray-600">First Name</label>
//             <input
//               type="text"
//               name="firstName"
//               value={fields.firstName}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.firstName && <p className="text-red-600 text-sm">{errors.firstName}</p>}
//           </div>

//           {/* Last Name */}
//           <div>
//             <label className="block text-gray-600">Last Name</label>
//             <input
//               type="text"
//               name="lastName"
//               value={fields.lastName}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.lastName && <p className="text-red-600 text-sm">{errors.lastName}</p>}
//           </div>

//           {/* Email + OTP */}
//           <div className="col-span-2">
//             <label className="block text-gray-600">Email</label>
//             <div className="flex gap-2">
//               <input
//                 type="email"
//                 name="email"
//                 value={fields.email}
//                 onChange={handleChange}
//                 disabled={otpVerified}
//                 className="w-full p-2 border rounded-md"
//                 required
//                 onBlur={() => {
//                   if (fields.email && !emailRegex.test(fields.email)) {
//                     setErrors({ ...errors, email: "Invalid email format" });
//                   }
//                 }}
//               />
//               {!otpVerified && (
//                 <button
//                   type="button"
//                   onClick={sendEmailOtp}
//                   disabled={loading.email || !fields.email || !emailRegex.test(fields.email)}
//                   className="px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded"
//                 >
//                   {loading.email ? (otpSent ? "Resending..." : "Sending...") : otpSent ? "Resend OTP" : "Send OTP"}
//                 </button>
//               )}
//             </div>
//             {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}

//             {otpSent && !otpVerified && (
//               <div style={{ marginTop: "0.5rem" }}>
//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   <input
//                     name="emailOtp"
//                     placeholder="Enter OTP"
//                     value={fields.emailOtp}
//                     onChange={handleChange}
//                     maxLength={6}
//                     style={{ flex: 1, padding: "0.5rem", border: "none", outline: "none" }}
//                   />
//                   <button 
//                     type="button" 
//                     onClick={verifyOtp}
//                     disabled={loading.email || !fields.emailOtp}
//                   >
//                     {loading.email ? "Verifying..." : "Verify OTP"}
//                   </button>
//                 </div>
//               </div>
//             )}
//             {status && (
//               <p
//                 className={`mt-2 text-sm ${
//                   status.toLowerCase().includes("failed") || status.toLowerCase().includes("invalid")
//                     ? "text-red-600"
//                     : "text-green-600"
//                 }`}
//               >
//                 {status}
//               </p>
//             )}
//           </div>

//           {/* Street */}
//           <div className="col-span-2">
//             <label className="block text-gray-600">Street</label>
//             <input
//               type="text"
//               name="street"
//               value={fields.street}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.street && <p className="text-red-600 text-sm">{errors.street}</p>}
//           </div>

//           {/* City */}
//           <div>
//             <label className="block text-gray-600">City</label>
//             <input
//               type="text"
//               name="city"
//               value={fields.city}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.city && <p className="text-red-600 text-sm">{errors.city}</p>}
//           </div>

//           {/* State */}
//           <div>
//             <label className="block text-gray-600">State</label>
//             <input
//               type="text"
//               name="state"
//               value={fields.state}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.state && <p className="text-red-600 text-sm">{errors.state}</p>}
//           </div>

//           {/* Zip Code */}
//           <div>
//             <label className="block text-gray-600">Zip Code</label>
//             <input
//               type="text"
//               name="zipCode"
//               value={fields.zipCode}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.zipCode && <p className="text-red-600 text-sm">{errors.zipCode}</p>}
//           </div>

//           {/* Country */}
//           <div>
//             <label className="block text-gray-600">Country</label>
//             <input
//               type="text"
//               name="country"
//               value={fields.country}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.country && <p className="text-red-600 text-sm">{errors.country}</p>}
//           </div>

//           {/* Phone */}
//           <div className="col-span-2">
//             <label className="block text-gray-600">Phone</label>
//             <input
//               type="tel"
//               name="phone"
//               value={fields.phone}
//               onChange={handleChange}
//               className="w-full p-2 border rounded-md"
//               required
//             />
//             {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
//           </div>

//           {/* Submit Button */}
//           <div className="col-span-2">
//             <button
//               type="submit"
//               disabled={loading.submit}
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md"
//             >
//               {loading.submit ? "Submitting..." : "Save Address"}
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Right Side: Image */}
//       <div className="flex-1 flex items-center justify-center">
//         <img
//           src={assets.add_address_iamge}
//           alt="Address Illustration"
//           className="w-full max-w-xs rounded-lg shadow-md"
//         />
//       </div>
//     </div>
//   );
// };

// export default Address;


























// // import React, { useContext, useEffect } from "react";
// // import { assets } from "../assets/assets";
// // import { AppContext } from "../context/AppContext";
// // import toast from "react-hot-toast";


// // const Address = () => {
// //   const [address, setAddress] = React.useState({
// //     firstName: "",
// //     lastName: "",
// //     email: "",
// //     street: "",
// //     city: "",
// //     state: "",
// //     zipCode: "",
// //     country: "",
// //     phone: "",
// //   });
// //   const { axios, user, navigate } = useContext(AppContext);
// //   const handleChange = (e) => {
// //     setAddress({ ...address, [e.target.name]: e.target.value });
// //   };

// //   const submitHanlder = async (e) => {
// //     try {
// //       e.preventDefault();
// //       const { data } = await axios.post("/api/address/add", { address });
// //       console.log("data", data);
// //       if (data.success) {
// //         toast.success(data.message);
// //         navigate("/cart");
// //       } else {
// //         toast.error(data.message);
// //       }
// //     } catch (error) {
// //       toast.error(error.message);
// //     }
// //   };
// //   useEffect(() => {
// //     if (!user) {
// //       navigate("/cart");
// //     }
// //   }, []);
// //   return (
// //     <div className="mt-12 flex flex-col md:flex-row gap-6 p-6 bg-gray-100 rounded-lg shadow-md">
// //       {/* Left Side: Address Fields */}
// //       <div className="flex-1 bg-white p-6 rounded-lg shadow">
// //         <h2 className="text-xl font-semibold text-gray-700 mb-4">
// //           Address Details
// //         </h2>
// //         <form
// //           onSubmit={submitHanlder}
// //           className="grid grid-cols-1 md:grid-cols-2 gap-4"
// //         >
// //           <div>
// //             <label className="block text-gray-600">First Name</label>
// //             <input
// //               type="text"
// //               name="firstName"
// //               value={address.firstName}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-gray-600">Last Name</label>
// //             <input
// //               type="text"
// //               name="lastName"
// //               value={address.lastName}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="col-span-2">
// //             <label className="block text-gray-600">Email</label>
// //             <input
// //               type="email"
// //               name="email"
// //               value={address.email}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="col-span-2">
// //             <label className="block text-gray-600">Street</label>
// //             <input
// //               type="text"
// //               name="street"
// //               value={address.street}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-gray-600">City</label>
// //             <input
// //               type="text"
// //               name="city"
// //               value={address.city}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-gray-600">State</label>
// //             <input
// //               type="text"
// //               name="state"
// //               value={address.state}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-gray-600">Zip Code</label>
// //             <input
// //               type="number"
// //               name="zipCode"
// //               value={address.zipCode}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-gray-600">Country</label>
// //             <input
// //               type="text"
// //               name="country"
// //               value={address.country}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="col-span-2">
// //             <label className="block text-gray-600">Phone</label>
// //             <input
// //               type="number"
// //               name="phone"
// //               value={address.phone}
// //               onChange={handleChange}
// //               className="w-full p-2 border rounded-md"
// //               required
// //             />
// //           </div>

// //           <div className="col-span-2">
// //             <button
// //               type="submit"
// //               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md"
// //             >
// //               Save Address
// //             </button>
// //           </div>
// //         </form>
// //       </div>

// //       {/* Right Side: Image */}
// //       <div className="flex-1 flex items-center justify-center">
// //         <img
// //           src={assets.add_address_iamge}
// //           alt="Address Illustration"
// //           className="w-full max-w-xs rounded-lg shadow-md"
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default Address;
