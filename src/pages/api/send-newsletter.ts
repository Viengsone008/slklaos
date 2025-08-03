import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

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

  const { emails, post } = req.body;
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Missing subscriber emails' });
  }

  // Fetch latest 5 posts (excluding the current one)
  const { data: latestPosts, error: latestError } = await supabase
    .from('posts')
    .select('id, title, excerpt, featured_image')
    .neq('id', post.id)
    .order('created_at', { ascending: false })
    .limit(5);

  if (latestError) {
    return res.status(500).json({ error: 'Failed to fetch latest posts.' });
  }

  const safeLatestPosts = (latestPosts || []).filter(
    p => p && p.id && p.title
  );

  // Fetch latest 5 projects
  const { data: latestProjects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, description, image')
    .order('created_at', { ascending: false })
    .limit(3);

  if (projectsError) {
    return res.status(500).json({ error: 'Failed to fetch latest projects.' });
  }

  const safeLatestProjects = (latestProjects || []).filter(
    p => p && p.id && p.title
  );

  const mainPostHtml = `
    <h1>${escapeHtml(post.title)}</h1>
    ${
      post.featuredImage || post.featured_image
        ? `<a href="https://slklaos.netlify.app/news/${post.id}">
            <img src="${post.featuredImage || post.featured_image}" alt="Hero Image" style="max-width:100%;height:auto;border-radius:8px;margin-bottom:16px;" />
          </a>`
        : ''
    }
    <p>${escapeHtml(post.excerpt)}</p>
    <a href="https://slklaos.netlify.app/news/${post.id}">Read more</a>
  `;

  const latestPostsHtml = safeLatestPosts.length
    ? `
      <h2 style="margin-top:32px;">Other Recent Posts</h2>
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

  const logoUrl = 'https://slklaos.netlify.app/SLK-logo.png'; // Use your deployed public path

  const footerHtml = `
  <hr style="margin:32px 0 16px 0; border:none; border-top:1px solid #eee;" />
  <div style="font-size:13px; color:#888; text-align:center; line-height:1.6;">
    <img src="${logoUrl}" alt="SLK Logo" style="height:48px; margin-bottom:12px;" /><br/>
    <strong>SLK Trading & Design Construction Co., Ltd.</strong><br/>
    Vientiane, Laos<br/>
    <a href="mailto:info@slklaos.la" style="color:#888;text-decoration:underline;">info@slklaos.la</a> | 
    <a href="https://slklaos.netlify.app/" style="color:#888;text-decoration:underline;">slklaos.netlify.app</a><br/>
    You are receiving this email because you subscribed to our newsletter.<br/>
    <span>If you wish to unsubscribe, <a href="https://slklaos.netlify.app/unsubscribe?email={{EMAIL}}" style="color:#e74c3c;text-decoration:underline;">click here</a>.</span>
  </div>
`;

  const html = `
  ${mainPostHtml}
  ${latestPostsHtml}
  ${servicesHtml}
  ${latestProjectsHtml}
  ${footerHtml}
`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.CONTACT_EMAIL_USER,
      pass: process.env.CONTACT_EMAIL_PASS,
    },
  });

  try {
    for (const email of emails) {
      const personalizedFooter = footerHtml.replace('{{EMAIL}}', encodeURIComponent(email));
      const personalizedHtml = `
        ${mainPostHtml}
        ${latestPostsHtml}
        ${servicesHtml}
        ${latestProjectsHtml}
        ${personalizedFooter}
      `;
      await transporter.sendMail({
        from: process.env.CONTACT_EMAIL_USER,
        to: email,
        subject: `New Updates from SLK Trading & Design Construction: ${post.title}`,
        html: personalizedHtml,
      });
      console.log('Sent to:', email);
    }
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('❌ Error sending newsletter:', error);
    res.status(500).json({ error: error.message });
  }
}