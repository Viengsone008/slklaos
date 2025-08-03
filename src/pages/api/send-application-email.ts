import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { emails } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Missing or invalid emails array' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const footerHtml = `
    <hr style="margin:32px 0 16px 0;">
    <div style="font-size:13px;color:#888;">
      This email was sent by SLK Trading & Design Construction Co., Ltd.<br>
      Visit our website at <a href="https://www.slklaos.la">www.slklaos.la</a>.<br>
      <br>
      For inquiries, contact us at <a href="mailto:info@slklaos.la">info@slklaos.la</a>.<br>
      <br>Inquiries regarding your application can be sent to <a href="mailto:hr@slklaos.la">hr@slklaos.la</a>.
      <br>
      &copy; ${new Date().getFullYear()} SLK Trading & Design Construction Co., Ltd. All rights reserved.
    </div>
  `;

  function formatMessageWithLineBreaks(text: string) {
    return text.replace(/\r?\n/g, '<br>');
  }

  const results = [];
  for (const emailObj of emails) {
    const { to, subject, message } = emailObj;
    const mailOptions = {
      from: `"SLK Trading & Design Construction" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
      html: `<p>${formatMessageWithLineBreaks(message)}</p>` + footerHtml,
      replyTo: process.env.EMAIL_USER,
    };
    try {
      const info = await transporter.sendMail(mailOptions);
      results.push({ to, success: true, messageId: info.messageId });
    } catch (error: any) {
      results.push({ to, success: false, error: error.message });
    }
  }

  res.status(200).json({ results });
}