const nodemailer = require('nodemailer');

// Sends a notification email to the business owner whenever a new
// booking/contact request comes in. Uses Gmail SMTP with an App Password
// (see DEPLOYMENT.md for how to generate one) - free, no paid service needed.
const sendBookingEmail = async (booking) => {
  // If email isn't configured yet, skip silently instead of crashing the request
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email not configured (EMAIL_USER/EMAIL_PASS missing) - skipping notification email');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const rows = [
    ['Name', booking.name],
    ['Phone', booking.phone],
    ['Email', booking.email],
    ['Location', booking.location],
    ['Vehicle Type', booking.vehicleType],
    ['Service', booking.service],
    ['Message', booking.message],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `<tr><td style="padding:6px 12px;color:#7a7f8c;">${label}</td><td style="padding:6px 12px;color:#0a0e1a;font-weight:600;">${value}</td></tr>`)
    .join('');

  await transporter.sendMail({
    from: `"Usama Towing Service Website" <${process.env.EMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.EMAIL_USER,
    subject: `New Tow Request from ${booking.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;">
        <h2 style="color:#0a0e1a;">New Request Received</h2>
        <table style="border-collapse:collapse;width:100%;">${rows}</table>
      </div>
    `,
  });
};

module.exports = { sendBookingEmail };

