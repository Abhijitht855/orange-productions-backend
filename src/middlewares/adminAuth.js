const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
  let token;

  // Check Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Ensure the user is admin
      const admin = await Admin.findById(decoded.id);
      if (!admin) {
        return res.status(401).json({ message: "Unauthorized access" });
      }

      req.admin = admin; // attach admin to request
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Unauthorized access" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = adminAuth;
