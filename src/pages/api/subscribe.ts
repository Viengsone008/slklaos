import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

function escapeHtml(text = "") {
  return text.replace(/[&<>"']/g, function (m) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[m];
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const services = [
  {
    title: "Design & Construction",
    description: "Complete construction solutions for residential, commercial, and industrial projects. From concept to completion, we handle every aspect of your building needs.",
    features: [
      "Architectural Design & Planning",
      "Structural Engineering",
      "Project Management",
      "Quality Control & Inspection",
      "Interior Design Services",
      "Landscape Architecture"
    ],
    image: "https://images.pexels.com/photos/3862365/pexels-photo-3862365.jpeg?auto=compress&cs=tinysrgb&w=1920"
  },
  {
    title: "Waterproofing Solutions",
    description: "Premium waterproofing solutions to protect your property from water damage. We supply and install high-quality waterproofing materials for all applications.",
    features: [
      "Roof Waterproofing",
      "Foundation Protection",
      "Basement Waterproofing",
      "Bathroom & Kitchen Sealing",
      "Swimming Pool Waterproofing",
      "Industrial Waterproofing"
    ],
    image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//WaterproofingService.png"
  },
  {
    title: "Flooring Materials & Installation",
    description: "Extensive range of premium flooring materials for every space. We provide high-quality flooring solutions that combine aesthetics with durability.",
    features: [
      "Ceramic & Porcelain Tiles",
      "Natural Stone Flooring",
      "Hardwood & Laminate",
      "Vinyl & LVT Flooring",
      "Epoxy Floor Coatings",
      "Custom Design Solutions"
    ],
    image: "https://qawxuytlwqmsomsqlrsc.supabase.co/storage/v1/object/public/image//FlooringHomePage.png"
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, name } = req.body;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  // Fetch latest 5 projects
  const { data: latestProjects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, description, image')
    .order('created_at', { ascending: false })
    .limit(5);

  const safeLatestProjects = (latestProjects || []).filter(
    p => p && p.id && p.title
  );

  // Fetch latest 5 news/posts
  const { data: latestPosts, error: postsError } = await supabase
    .from('posts')
    .select('id, title, excerpt, featured_image')
    .order('created_at', { ascending: false })
    .limit(5);

  const safeLatestPosts = (latestPosts || []).filter(
    p => p && p.id && p.title
  );

  // Build services HTML
  const servicesHtml = `
    <h2 style="margin-top:32px;">Our Services</h2>
    <ul style="padding:0;list-style:none;">
      ${services.map(s => `
        <li style="margin-bottom:24px;">
          <strong style="font-size:18px;">${escapeHtml(s.title)}</strong><br/>
          <img src="${s.image}" alt="${escapeHtml(s.title)}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" /><br/>
          <span>${escapeHtml(s.description)}</span>
          <ul style="margin:8px 0 0 16px; padding:0;">
            ${s.features.map(f => `<li style="font-size:14px;">• ${escapeHtml(f)}</li>`).join('')}
          </ul>
        </li>
      `).join('')}
    </ul>
  `;

  // Build projects HTML
  const latestProjectsHtml = safeLatestProjects.length
    ? `
      <h2 style="margin-top:32px;">Our Latest Projects</h2>
      <ul style="padding:0;list-style:none;">
        ${safeLatestProjects.map(p => `
          <li style="margin-bottom:24px;">
            <a href="https://slklaos.netlify.app/projects/${p.id}" 
              style="font-size:18px;font-weight:bold;color:#2980b9;text-decoration:none;">
              ${escapeHtml(p.title)}
            </a>
            ${
              p.image
                ? `<br/><a href="https://slklaos.netlify.app/projects/${p.id}">
                    <img src="${p.image}" alt="${escapeHtml(p.title)}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />
                  </a>`
                : ''
            }
            <p style="margin:0 0 8px 0;">${escapeHtml(p.description || '')}</p>
          </li>
        `).join('')}
      </ul>
    `
    : '';

  // Build posts HTML
  const latestNewsHtml = safeLatestPosts.length
    ? `
      <h2 style="margin-top:32px;">Latest News</h2>
      <ul style="padding:0;list-style:none;">
        ${safeLatestPosts.map(p => `
          <li style="margin-bottom:24px;">
            <a href="https://slklaos.netlify.app/news/${p.id}" 
              style="font-size:18px;font-weight:bold;color:#e67e22;text-decoration:none;">
              ${escapeHtml(p.title)}
            </a>
            ${
              p.featured_image
                ? `<br/><a href="https://slklaos.netlify.app/news/${p.id}">
                    <img src="${p.featured_image}" alt="${escapeHtml(p.title)}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />
                  </a>`
                : ''
            }
            <p style="margin:0 0 8px 0;">${escapeHtml(p.excerpt || '')}</p>
          </li>
        `).join('')}
      </ul>
    `
    : '';

  // Footer
  const logoUrl = 'https://slklaos.netlify.app/SLK-logo.png';
  const footerHtml = `
    <hr style="margin:32px 0 16px 0; border:none; border-top:1px solid #eee;" />
    <div style="font-size:13px; color:#888; text-align:center; line-height:1.6;">
      <img src="${logoUrl}" alt="SLK Logo" style="height:58px; margin-bottom:12px;" /><br/>
      <strong>SLK Trading & Design Construction Co., Ltd.</strong><br/>
      Vientiane, Laos<br/>
      <a href="mailto:info@slklaos.la" style="color:#888;text-decoration:underline;">info@slklaos.la</a> | 
      <a href="https://slklaos.netlify.app/" style="color:#888;text-decoration:underline;">slklaos.netlify.app</a><br/>
      You are receiving this email because you subscribed to our newsletter.<br/>
      <span>If you wish to unsubscribe, <a href="https://slklaos.netlify.app/unsubscribe?email=${encodeURIComponent(email)}" style="color:#e74c3c;text-decoration:underline;">click here</a>.</span>
    </div>
  `;

  // Main content
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <img 
        src="https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1200" 
        alt="SLK Construction Hero" 
        style="width:100%;max-width:600px;border-radius:12px;margin-bottom:24px;display:block;"
      />
      <h2 style="color: #1a4d6b;">Welcome${name ? `, ${escapeHtml(name)}` : ''} to the <span style="color:#e67e22;">SLK Newsletter</span>!</h2>
      <br>
      <p>Thank you for subscribing to our newsletter. Here are our latest news, services, and projects:</p>
      ${latestNewsHtml}
      ${servicesHtml}
      ${latestProjectsHtml}
      ${footerHtml}
    </div>
  `;

  // Send email (example with nodemailer, adjust as needed)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CONTACT_EMAIL_USER,
      pass: process.env.CONTACT_EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL_USER,
      to: email,
      subject: 'Welcome to SLK Newsletter!',
      html: htmlContent,
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ Error sending subscription email:', error);
    res.status(500).json({ error: error.message });
  }
}