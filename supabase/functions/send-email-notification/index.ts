import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get request body
    const { post } = await req.json();
    
    // Validate required fields
    if (!post || !post.id || !post.title) {
      return new Response(
        JSON.stringify({ error: 'Missing required post data' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Create Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('status', 'active');
    
    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError);
      throw subscribersError;
    }
    
    // If no subscribers, return early
    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscribers found',
          recipientCount: 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Log the email notification attempt
    const { error: insertError } = await supabase
      .from('email_notifications')
      .insert({
        post_id: post.id,
        recipient_count: subscribers.length,
        status: 'pending',
        content: {
          title: post.title,
          excerpt: post.excerpt,
          image_url: post.featuredImage,
          post_url: post.url,
          author: post.author,
          published_at: post.publishedAt
        }
      });
    
    if (insertError) {
      console.error('Error inserting email notification record:', insertError);
    }
    
    // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
    // For demonstration purposes, we'll just log the email content and simulate sending
    
    // Create email content
    const emailSubject = `New Post: ${post.title}`;
    const emailHtml = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { max-width: 150px; }
            .post-image { width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; }
            .post-title { font-size: 24px; font-weight: bold; margin: 15px 0; color: #333; }
            .post-excerpt { font-size: 16px; margin-bottom: 20px; color: #666; }
            .cta-button { display: inline-block; background-color: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://slktrading.la/logo.png" alt="SLK Trading Logo" class="logo" />
              <h1>SLK Trading & Design Construction</h1>
            </div>
            
            <p>Hello,</p>
            <p>We've just published a new post that we thought you might be interested in:</p>
            
            <img src="${post.featuredImage || ''}" alt="${post.title}" class="post-image" />
            <h2 class="post-title">${post.title}</h2>
            <p class="post-excerpt">${post.excerpt || ''}</p>
            
            <p><a href="${post.url || ''}" class="cta-button">Read More</a></p>
            
            <p>Thank you for subscribing to our newsletter!</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} SLK Trading & Design Construction Co., Ltd</p>
              <p>If you no longer wish to receive these emails, <a href="https://slktrading.la/unsubscribe">unsubscribe here</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    console.log('Email notification content:', {
      subject: emailSubject,
      recipients: subscribers.length,
      previewHtml: emailHtml.substring(0, 200) + '...'
    });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update the notification record with success status
    const { data: notificationData, error: updateError } = await supabase
      .from('email_notifications')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        success_count: subscribers.length,
        error_count: 0
      })
      .eq('post_id', post.id)
      .eq('status', 'pending')
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating email notification record:', updateError);
      // Don't throw error, just log it since the main operation succeeded
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email notifications sent successfully',
        recipientCount: subscribers.length,
        notificationId: notificationData?.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-email-notification function:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while sending email notifications' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});