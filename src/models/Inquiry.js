// const mongoose = require("mongoose");

// const inquirySchema = new mongoose.Schema({
//     name: { type: String, required: true }, // user name
//     email: { type: String, required: true }, // user email
//     phone: String, // optional
//     message: String, // user message
//     product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
//     variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
//     createdAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Inquiry", inquirySchema);


const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // ✅ user must enter their name
  },
  email: {
    type: String,
    required: true, // ✅ user must enter email
  },
  phone: {
    type: String,
    required: true, // optional
  },
  message: {
    type: String,
    required: false, // optional
  },
  requiredItem: {
    type: String,
    required: true, // ✅ user must specify what item they want
  },
  createdAt: {
    type: Date,
    default: Date.now, // auto timestamp
  },
});

module.exports = mongoose.model("Inquiry", inquirySchema);
