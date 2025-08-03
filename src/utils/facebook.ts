// utils/facebook.ts
export async function shareToFacebook(post, pageAccessToken, pageId) {
  const url = `https://graph.facebook.com/${pageId}/feed`;
  const message = `${post.title}\n\n${post.excerpt}\n\nRead more: https://slklaos.netlify.app/news/${post.id}`;
  const params = new URLSearchParams({
    message,
    access_token: pageAccessToken,
  });
  if (post.featured_image) {
    params.append('picture', post.featured_image);
  }
  const res = await fetch(url, {
    method: 'POST',
    body: params,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || 'Failed to share on Facebook');
  }
}