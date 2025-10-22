const mongoose = require("mongoose");
const Admin = require("./models/Admin");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error(err));

async function createAdmin() {
  try {
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return mongoose.disconnect();
    }

    const admin = new Admin({
      name: "Admin",
      email: "admin@example.com",
      password: "123456", // will be hashed automatically
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
  } catch (err) {
    console.error("❌ Error creating admin:", err);
  } finally {
    mongoose.disconnect();
  }
}

createAdmin();
