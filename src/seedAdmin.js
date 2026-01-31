const mongoose = require("mongoose");
const Admin = require("./models/Admin");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error(err));

async function createAdmin() {
  try {
    const existingAdmin = await Admin.findOne({
      email: process.env.ADMIN_EMAIL
    });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists");
      return mongoose.disconnect();
    }

    const admin = new Admin({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD, // from env
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
