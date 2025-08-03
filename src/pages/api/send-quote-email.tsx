import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    company,
    project_type,
    budget_range,
    timeline,
    location,
    description,
    preferred_contact,
    source,
  } = req.body;

  if (!name || !email || !project_type) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CONTACT_EMAIL_USER,
      pass: process.env.CONTACT_EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: 'viengsone.s@gmail.com', // Change to your notification email
    subject: `New Quote Request: ${project_type}`,
    text: `
You have received a new quote request from the website.

--- Contact Information ---
Name: ${name}
Email: ${email}
Phone: ${phone || '-'}
Company: ${company || '-'}

--- Project Details ---
Service Requested: ${project_type}
Budget Range: ${budget_range || '-'}
Timeline: ${timeline || '-'}
Location: ${location || '-'}

--- Project Description ---
${description || '-'}

--- Preferences & Source ---
Preferred Contact Method: ${preferred_contact || '-'}
Source: ${source || '-'}

----------------------------------------
SLK Trading & Design Construction Co., Ltd.
www.slklaos.com | info@slklaos.com | +856 21 773 737
This message was generated automatically from the website quote form.
    `.trim(),
    html: `
  <div style="font-family: Arial, sans-serif; color: #222;">
    <h2 style="color:#d97706;">New Quote Request Received</h2>
    <h3 style="margin-bottom:4px;">Contact Information</h3>
    <ul style="margin-top:0;">
      <li><strong>Name:</strong> ${name}</li>
      <li><strong>Email:</strong> ${email}</li>
      <li><strong>Phone:</strong> ${phone || '-'}</li>
      <li><strong>Company:</strong> ${company || '-'}</li>
    </ul>
    <h3 style="margin-bottom:4px;">Project Details</h3>
    <ul style="margin-top:0;">
      <li><strong>Service Requested:</strong> ${project_type}</li>
      <li><strong>Budget Range:</strong> ${budget_range || '-'}</li>
      <li><strong>Timeline:</strong> ${timeline || '-'}</li>
      <li><strong>Location:</strong> ${location || '-'}</li>
    </ul>
    <h3 style="margin-bottom:4px;">Project Description</h3>
    <div style="background:#f3f4f6;padding:10px;border-radius:6px;margin-bottom:12px;">
      ${description ? description.replace(/\n/g, '<br/>') : '-'}
    </div>
    <h3 style="margin-bottom:4px;">Preferences & Source</h3>
    <ul style="margin-top:0;">
      <li><strong>Preferred Contact Method:</strong> ${preferred_contact || '-'}</li>
      <li><strong>Source:</strong> ${source || '-'}</li>
    </ul>
    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;">
    <div style="font-size:13px; color:#555; display:flex; align-items:center; gap:12px;">
      <img src="https://www.slklaos.com/SLK-logo.png" alt="SLK Trading & Design Construction Logo" style="height:40px;vertical-align:middle;border-radius:4px;">
      <div>
        <strong>SLK Trading & Design Construction Co., Ltd.</strong><br>
        <a href="https://www.slklaos.com" style="color:#d97706;">www.slklaos.com</a> | 
        <a href="mailto:info@slklaos.com" style="color:#d97706;">info@slklaos.com</a> | 
        +856 21 773 737<br>
        <span style="color:#888;">This message was generated automatically from the website quote form.</span>
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