import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing user id' });
  }

  try {
    // 1. Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      return res.status(500).json({ error: `Auth delete failed: ${authError.message}` });
    }

    // 2. Delete from users table
    const { error: dbError } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (dbError) {
      return res.status(500).json({ error: `DB delete failed: ${dbError.message}` });
    }

    return res.status(200).json({ message: 'User deleted from Auth and users table.' });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error occurred' });
  }
}