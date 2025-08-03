import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { appointmentId } = req.body;

  if (!appointmentId) {
    return res.status(400).json({ error: "Missing appointmentId" });
  }

  // Fetch candidate info from appointments table
  const { data, error } = await supabase
    .from("appointments")
    .select("candidate_email, candidate_name, date, time")
    .eq("id", appointmentId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const { candidate_email, candidate_name, date, time } = data;

  if (!candidate_email || !candidate_name || !date || !time) {
    return res.status(400).json({ error: "Incomplete appointment data" });
  }

  // Configure your SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SLK Trading" <${process.env.FROM_EMAIL}>`,
    to: candidate_email,
    subject: "Your Interview Appointment Confirmation",
    html: `
      <h2 style="color:#1a202c;">Interview Appointment Confirmed</h2>
      <p>Dear ${candidate_name},</p>
      <p>Your interview appointment has been successfully booked.</p>
      <ul>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
      </ul>
      <p style="color:#b91c1c;"><strong>Please ensure you arrive at the interview location on time. Being punctual is important for your application process.</strong></p>
      <p>If you need to reschedule, please visit the appointment page and enter your name at 
        <a href="http://localhost:3000/careers/appointments#appointment" style="color:#2563eb;">this link</a>.
      </p>
      <br/>
      <p>Best regards,<br/>SLK Trading HR Team</p>
      <hr style="margin:32px 0 16px 0;">
      <div style="font-size:13px;color:#888;">
        This email was sent by SLK Trading & Design Construction Co., Ltd.<br>
        Visit our website at <a href="https://www.slklaos.la" style="color:#2563eb;text-decoration:none;">www.slklaos.la</a>.<br>
        <br>
        <strong>Our Location:</strong><br>
        <a href="https://maps.google.com/?q=SLK+Trading+%26+Design+Construction+Co.,+Ltd.,+Vientiane,+Laos" style="color:#2563eb;text-decoration:none;" target="_blank">
          View on Google Maps
        </a>
        <br><br>
        For inquiries, contact us at <a href="mailto:info@slklaos.la" style="color:#2563eb;text-decoration:none;">info@slklaos.la</a>.<br>
        <br>
        Inquiries regarding your application can be sent to <a href="mailto:hr@slklaos.la" style="color:#2563eb;text-decoration:none;">hr@slklaos.la</a>.
        <br>
        &copy; ${new Date().getFullYear()} SLK Trading & Design Construction Co., Ltd. All rights reserved.
      </div>
    `,
  };

  try {
    // Send confirmation to candidate
    await transporter.sendMail(mailOptions);

    // Send dedicated notification to HR
    await transporter.sendMail({
      from: `"SLK Trading" <${process.env.FROM_EMAIL}>`,
      to: "viengsone.s@gmail.com",
      subject: `New Interview Appointment Booked: ${candidate_name}`,
      html: `
        <h2 style="color:#1a202c;">New Interview Appointment Booked</h2>
        <ul>
          <li><strong>Name:</strong> ${candidate_name}</li>
          <li><strong>Email:</strong> ${candidate_email}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
        </ul>
        <hr style="margin:32px 0 16px 0;">
        <div style="font-size:13px;color:#888;">
          This is an automated notification from SLK Trading & Design Construction Co., Ltd.<br>
          &copy; ${new Date().getFullYear()} SLK Trading & Design Construction Co., Ltd. All rights reserved.
        </div>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to send email" });
  }
}