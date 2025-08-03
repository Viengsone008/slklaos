import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  // Accept both camelCase and snake_case for preferredContact/preferred_contact
  const {
    name,
    email,
    phone,
    company,
    service,
    subject,
    message,
    preferredContact,
    preferred_contact,
    urgency,
  } = req.body.contact || req.body;

  // Use whichever is present
  const preferredContactValue = preferredContact || preferred_contact || 'N/A';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CONTACT_EMAIL_USER,
      pass: process.env.CONTACT_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name || 'Website Contact'}" <${email || process.env.CONTACT_EMAIL_USER}>`,
    to: 'viengsone.s@gmail.com', // Change to your notification email
    subject: `SLKLAOS-New Inquiry: ${service || 'General'}${company ? ` (${company})` : ''}`,
    text: `
You have received a new inquiry.

--- Contact Information ---
Name: ${name}
Email: ${email}
Phone: ${phone}
Company: ${company || 'N/A'}

--- Inquiry Details ---
Service: ${service}
Subject: ${subject}
Message: ${message}
Preferred Contact: ${preferredContactValue}
Urgency: ${urgency}

----------------------------------------
SLK Trading & Design Construction Co., Ltd.
www.slklaos.com | info@slklaos.com | +856 21 773 737
This message was generated automatically from the website contact form.
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; color: #222;">
        <h2 style="color:#d97706;">You have Received a New Inquiry from a Contact Submission on the Website</h2>
        <h3>Contact Information</h3>
        <ul>
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
          <li><strong>Company:</strong> ${company || 'N/A'}</li>
        </ul>
        <h3>Inquiry Details</h3>
        <ul>
          <li><strong>Service:</strong> ${service}</li>
          <li><strong>Subject:</strong> ${subject}</li>
          <li><strong>Message:</strong> ${message}</li>
          <li><strong>Preferred Contact:</strong> ${preferredContactValue}</li>
          <li><strong>Urgency:</strong> ${urgency}</li>
        </ul>
        <hr style="margin:24px 0; border:none; border-top:1px solid #eee;">
        <div style="font-size:13px; color:#555; display:flex; align-items:center; gap:12px;">
          <img src="https://www.slklaos.com/SLK-logo.png" alt="SLK Trading & Design Construction Logo" style="height:40px;vertical-align:middle;border-radius:4px;">
          <div>
            <strong>SLK Trading & Design Construction Co., Ltd.</strong><br>
            <a href="https://www.slklaos.com" style="color:#d97706;">www.slklaos.com</a> | 
            <a href="mailto:info@slklaos.com" style="color:#d97706;">info@slklaos.com</a> | 
            +856 21 773 737<br>
            <span style="color:#888;">This message was generated automatically from the website contact form.</span>
          </div>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ Email send error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}