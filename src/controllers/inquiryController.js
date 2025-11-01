const Inquiry = require("../models/Inquiry");
const nodemailer = require("nodemailer");

// ✅ Create Inquiry
const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, requiredItem } = req.body;

    if (!name || !email || !requiredItem) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      message,
      requiredItem,
    });

    // Respond to user immediately ✅
    res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully. Admin will be notified by email.",
      data: inquiry,
    });

    // ---- Send email asynchronously (non-blocking) ----
    const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"Orange Productions Inquiry" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 New Inquiry from ${name}`,
      html: `
  <div style="background-color:#f7f7f7;padding:30px 0;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background-color:#E7671E;color:#fff;padding:20px 30px;text-align:center;">
        <h1 style="margin:0;font-size:22px;letter-spacing:0.5px;">Orange Productions</h1>
        <p style="margin:5px 0 0;font-size:14px;">New Customer Inquiry Received</p>
      </div>

      <!-- Body -->
      <div style="padding:30px;color:#333;">
        <p style="font-size:15px;margin-bottom:15px;">Hello Admin,</p>
        <p style="font-size:15px;margin-bottom:20px;">
          You have received a new inquiry from your website. Below are the details:
        </p>

        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;width:150px;color:#555;font-weight:600;">👤 Name:</td>
            <td style="padding:8px 0;color:#333;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;">📧 Email:</td>
            <td style="padding:8px 0;color:#333;">${email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;">📞 Phone:</td>
            <td style="padding:8px 0;color:#333;">${phone || "N/A"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;">📦 Required Item:</td>
            <td style="padding:8px 0;color:#333;">${requiredItem}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;">💬 Message:</td>
            <td style="padding:8px 0;color:#333;">${message || "No message provided"}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:600;">🕒 Time:</td>
            <td style="padding:8px 0;color:#333;">${time}</td>
          </tr>
        </table>

        <p style="margin-top:25px;font-size:14px;color:#777;">
          Kindly respond to this inquiry at your earliest convenience.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color:#fafafa;text-align:center;padding:15px 10px;font-size:13px;color:#888;border-top:1px solid #eee;">
        © ${new Date().getFullYear()} Orange Productions. All rights reserved.<br>
        <a href="mailto:${process.env.ADMIN_EMAIL}" style="color:#ff6600;text-decoration:none;">${process.env.ADMIN_EMAIL}</a>
      </div>
    </div>
  </div>
  `,
    };

    transporter.sendMail(mailOptions).catch((err) =>
      console.error("❌ Email sending failed:", err.message)
    );
  } catch (error) {
    console.error("❌ Error creating inquiry:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Get all inquiries (admin)
const getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    console.error("❌ Error fetching inquiries:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createInquiry, getInquiries };
