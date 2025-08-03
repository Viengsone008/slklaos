import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { post } = req.body;
  if (!post) {
    return res.status(400).json({ error: 'Missing post data' });
  }

  const pageId = process.env.FB_PAGE_ID;
  const accessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return res.status(500).json({ error: 'Facebook credentials not set' });
  }

  const message = `${post.title}\n\n${post.excerpt}\n\nRead more: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com'}/news/${post.id}`;
  const url = `https://graph.facebook.com/${pageId}/feed`;

  const params = new URLSearchParams({
    message,
    access_token: accessToken,
  });

  if (post.featuredImage) {
    params.append('picture', post.featuredImage);
  }

  try {
    const fbRes = await fetch(url, {
      method: 'POST',
      body: params,
    });
    const data = await fbRes.json();

    if (!fbRes.ok) {
      return res.status(500).json({ error: data.error?.message || 'Failed to share on Facebook' });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
}