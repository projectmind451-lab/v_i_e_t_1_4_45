import Address from "../models/address.model.js";
// add address :/api/address/add
export const addAddress = async (req, res) => {
  try {
    const { address } = req.body || {};
    let userId = req.user; // may be undefined for guests

    if (!address || typeof address !== "object") {
      return res.status(400).json({ success: false, message: "Invalid address payload" });
    }

    const required = [
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
    for (const key of required) {
      if (!address[key]) {
        return res.status(400).json({ success: false, message: `${key} is required` });
      }
    }

    // If not authenticated, derive a deterministic guest userId from email
    if (!userId) {
      userId = `guest:${address.email}`;
    }

    // Map client fields to model schema fields
    const payload = {
      userId,
      firstName: address.firstname,
      lastName: address.lastname,
      email: address.email,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: Number(address.zipcode),
      country: address.country,
      phone: address.phone,
    };
    if (Number.isNaN(payload.zipCode)) {
      return res.status(400).json({ success: false, message: "zipcode must be a number" });
    }
    const savedAddress = await Address.create(payload);
    res
      .status(201)
      .json({ success: true, message: "Address added successfully", address: savedAddress });
  } catch (error) {
    console.error("addAddress error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//get address:// /api/address/get
export const getAddress = async (req, res) => {
  try {
    const userId = req.user;
    const addresses = await Address.find({ userId });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
