import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    name, email, password, role, loginType, department, position
  } = req.body;
 
  // Validation check
  if (!name || !email || !password || !role || !loginType) {
    return res.status(400).json({ error: 'Invalid or missing fields' });
  }

  try {
    // 1. Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        login_type: loginType,
        department,
        position,
      },
    });

    console.log("admin.createUser result:", { data, error });

    if (error) {
      console.log("Supabase admin.createUser error:", error); // <-- Add this line
      return res.status(500).json({ error: `Create user error: ${error.message}` });
    }

    const userId = data?.user?.id;
    if (!userId) {
      return res.status(500).json({ error: 'User ID not returned from Supabase' });
    }

    // 2. Insert user metadata into your users table
    const { error: insertError } = await supabaseAdmin.from('users').insert([
      {
        id: userId,
        name,
        email,
        role,
        login_type: loginType,
        department,
        position,
        created_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      return res.status(500).json({ error: `Database insert failed: ${insertError.message}` });
    }

    return res.status(200).json({ message: "User created! Share the password with the user." });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error occurred' });
  }
}
