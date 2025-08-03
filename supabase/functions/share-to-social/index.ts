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
    const { platform, post } = await req.json();
    
    // Validate required fields
    if (!platform || !post || !post.id || !post.title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
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
    
    // Log the sharing attempt
    const { error: insertError } = await supabase
      .from('social_shares')
      .insert({
        post_id: post.id,
        platform,
        status: 'pending',
        content: {
          title: post.title,
          excerpt: post.excerpt,
          image_url: post.featuredImage,
          post_url: post.url,
          tags: post.tags
        }
      });
    
    if (insertError) {
      console.error('Error inserting social share record:', insertError);
    }
    
    // Simulate API call to social media platform
    // In a real implementation, this would use the appropriate SDK or API
    // for each platform (Facebook Graph API, Instagram API, LinkedIn API)
    
    // For demonstration purposes, we'll just log the request and return success
    console.log(`Sharing post to ${platform}:`, {
      title: post.title,
      excerpt: post.excerpt,
      image: post.featuredImage,
      url: post.url
    });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock platform post ID
    const platformPostId = `${platform}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Update the share record with success status
    const { data: shareData, error: updateError } = await supabase
      .from('social_shares')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        platform_post_id: platformPostId
      })
      .eq('post_id', post.id)
      .eq('platform', platform)
      .eq('status', 'pending')
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating social share record:', updateError);
      // Don't throw error, just log it since the main operation succeeded
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Post shared to ${platform} successfully`,
        shareId: shareData?.id,
        platformPostId: platformPostId
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in share-to-social function:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while sharing the post' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});