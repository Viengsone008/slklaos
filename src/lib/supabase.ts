import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logging to help identify the issue
console.log('🔍 Supabase Environment Check:', {
  url: supabaseUrl ? '✅ Present' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Present' : '❌ Missing',
  urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
  keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
})
 
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl || 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'PRESENT' : 'MISSING'
  })
  throw new Error(`Missing Supabase environment variables. Please check your .env file contains:
    NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || 'MISSING'}
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey ? 'PRESENT' : 'MISSING'}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'slk-auth-token',
  },
  // Add global performance options for better international access
  global: {
    // Increase timeout for international connections
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // Increase timeout to 30 seconds for slow international connections
        signal: options?.signal || (AbortSignal.timeout ? AbortSignal.timeout(30000) : undefined)
      })
    }
  },
  // Add database performance options
  db: {
    // Reduce schema caching time for better performance
    schema: 'public',
  },
  // Add realtime performance options
  realtime: {
    // Increase timeout for realtime connections
    timeout: 30000,
    // Increase heartbeat interval to reduce network traffic
    heartbeatIntervalMs: 15000
  }
})

// Test the connection
supabase.from('settings').select('count').limit(1).then(
  ({ data, error }) => {
    if (error) {
      console.warn('⚠️ Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
    }
  }
).catch((err: any) => {
  console.warn('⚠️ Supabase connection test error:', err.message)
})

// Database helper functions with better error handling and performance optimizations
export const dbHelpers = {
  // Users
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        // Add caching for better performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching users:', error)
      return []
    }
  },

  async createUser(userData: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating user:', error)
      throw error
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating user:', error)
      throw error
    }
  },

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      throw error
    }
  },

  // Projects - with performance optimizations
  async getProjects() {
    try {
      // Use a more efficient query with fewer joins
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, name, description, status, start_date, end_date, 
          budget, spent, progress, location, client_name,
          manager:manager_id(id, name, email)
        `)
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching projects:', error)
      return []
    }
  },

async createProject(projectData: any) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError
    if (!session || !session.user) throw new Error("User not authenticated")

    const finalProjectData = {
      ...projectData,
      user_id: session.user.id  // ✅ Required for RLS
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([finalProjectData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('❌ Error creating project:', error)
    throw error
  }
},



  async updateProject(id: string, projectData: any) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...projectData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating project:', error)
      throw error
    }
  },

  // Tasks - with performance optimizations
  async getTasks(projectId?: string) {
    try {
      // Use a more efficient query with fewer joins and fields
      let query = supabase
        .from('tasks')
        .select(`
          id, title, description, status, priority, due_date,
          assigned_user:assigned_to(id, name),
          project:project_id(id, name)
        `)
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (projectId) {
        query = query.eq('project_id', projectId)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching tasks:', error)
      return []
    }
  },

  async createTask(taskData: any) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating task:', error)
      throw error
    }
  },

  async updateTask(id: string, taskData: any) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...taskData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating task:', error)
      throw error
    }
  },

  async deleteContact(id: string) {
  try {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error deleting contact:', error);
    throw error;
  }
},

    async deleteQuote(id: string) {
  try {
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('❌ Error deleting Quote:', error);
    throw error;
  }
},

  // Materials - with performance optimizations
  async getMaterials() {
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .order('name', { ascending: true })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching materials:', error)
      return []
    }
  },

  async createMaterial(materialData: any) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .insert([materialData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating material:', error)
      throw error
    }
  },

  async updateMaterial(id: string, materialData: any) {
    try {
      const { data, error } = await supabase
        .from('materials')
        .update({ ...materialData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating material:', error)
      throw error
    }
  },

  // Documents - with performance optimizations
  async getDocuments() {
    try {
      // Use a more efficient query with fewer joins and fields
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id, title, description, type, category, file_url, 
          status, is_confidential, version, tags,
          uploaded_user:uploaded_by(name),
          project:project_id(name)
        `)
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching documents:', error)
      return []
    }
  },

  async createDocument(documentData: any) {
    try {
      console.log('📄 Creating document with data:', documentData);
      
      // Ensure we have the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error('Authentication required to create documents');
      }
      
      if (!session) {
        throw new Error('User must be logged in to create documents');
      }
      
      console.log('✅ User session found:', session.user.id);
      
      // Ensure uploaded_by is set to current user
      const finalDocumentData = {
        ...documentData,
        uploaded_by: session.user.id
      };
      
      console.log('📄 Final document data:', finalDocumentData);
      
      const { data, error } = await supabase
        .from('documents')
        .insert([finalDocumentData])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Document creation error:', error);
        throw error;
      }
      
      console.log('✅ Document created successfully:', data);
      return data
    } catch (error) {
      console.error('❌ Error creating document:', error)
      throw error
    }
  },

  async updateDocument(id: string, documentData: any) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({ ...documentData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating document:', error)
      throw error
    }
  },

  // Contacts - with performance optimizations
  async getContacts() {
    try {
      // Use a more efficient query with fewer joins and fields
      const { data, error } = await supabase
        .from('contacts')
        .select(`
          id, name, email, phone, company, service, subject, message,
          status, priority, source, lead_score, created_at,
          assigned_user:assigned_to(id, name)
        `)
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching contacts:', error)
      return []
    }
  },

  async createContact(contactData: any) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating contact:', error)
      throw error
    }
  },

  async updateContact(id: string, contactData: any) {
    try {
      const sanitizedData = sanitizeContactData(contactData);
      const { data, error } = await supabase
        .from('contacts')
        .update({ ...sanitizedData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error updating contact:', error);
      throw error;
    }
  },

  // Quotes - with performance optimizations
  async getQuotes() {
    try {
      // Use a more efficient query with fewer joins and fields
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id, name, email, phone, company, project_type, budget_range,
          status, priority, source, estimated_value, created_at, project_details, customer_profile, 
          assigned_user:assigned_to(id, name)
        `)
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching quotes:', error)
      return [] 
    }
  },

  async createQuote(quoteData: any) {
    try {
      console.log('🔍 Creating quote with data:', quoteData); 
      
      const { data, error } = await supabase
        .from('quotes')
        .insert([quoteData])
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating quote:', error);
        throw error;
      }
      
      console.log('✅ Quote created successfully:', data);
      return data
    } catch (error) {
      console.error('❌ Error creating quote:', error)
      throw error
    }
  },  
 
async createQuote(quoteData) {
  console.log('📦 Received quoteData in dbHelpers:', quoteData);

  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteData])
    .select()
    .single();

  if (error) {
    console.error('❌ Supabase insert error:', error.message, error.details);
    throw error;
  }

  return data; 
},
  

  async updateQuote(id: string, quoteData: any) {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .update({ ...quoteData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      console.log('🟢 updateQuote response:', { data, error });

      if (error) throw error;
      if (!data) throw new Error('No quote updated. Check if the ID exists and payload is valid.');
      return data;
    } catch (error) {
      console.error('❌ Error updating quote:', error)
      throw error
    }
  },

  // Newsletter Subscribers - with performance optimizations
  async getNewsletterSubscribers() {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching newsletter subscribers:', error)
      return []
    }
  },

  async createNewsletterSubscriber(subscriberData: any) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([subscriberData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating newsletter subscriber:', error)
      throw error
    }
  },

  async updateNewsletterSubscriber(id: string, subscriberData: any) {
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .update({ ...subscriberData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating newsletter subscriber:', error)
      throw error
    }
  },

  async deleteNewsletterSubscriber(id: string) {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (error) {
      console.error('❌ Error deleting newsletter subscriber:', error)
      throw error
    }
  },

  // Posts - with performance optimizations
  async getPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching posts:', error)
      return []
    }
  },

  async getPublishedPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        // Add timeout for better international performance
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching published posts:', error)
      return []
    }
  },

  async createPost(postData: any) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error creating post:', error)
      throw error
    }
  },

  async updatePost(id: string, postData: any) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ ...postData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating post:', error)
      throw error
    }
  },

  async deletePost(id: string) {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('❌ Error deleting post:', error)
    throw error
  }
},


  // Settings - with performance optimizations
  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('category', { ascending: true })
        // Add caching for better performance
        .maybeSingle()
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching settings:', error)
      return []
    }
  },

  async getPublicSettings() {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('is_public', true)
        // Add caching for better performance
        .maybeSingle()
        .abortSignal(AbortSignal.timeout(15000))
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error fetching public settings:', error)
      return []
    }
  },

  async updateSetting(key: string, value: any) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Error updating setting:', error)
      throw error
    }
  },

  // Dashboard statistics - with performance optimizations
  async getDashboardStats() {
    try {
      // Use a more efficient approach with fewer queries
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_dashboard_stats')
        .maybeSingle()
        .abortSignal(AbortSignal.timeout(15000))
      
      if (statsError) {
        console.error('❌ Error fetching dashboard stats via RPC:', statsError)
        
        // Fallback to manual counting if RPC fails
        const [
          { count: totalProjects },
          { count: activeProjects },
          { count: totalTasks },
          { count: completedTasks },
          { count: totalContacts },
          { count: newContacts },
          { count: totalQuotes },
          { count: pendingQuotes }
        ] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }),
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'in_progress'),
          supabase.from('tasks').select('*', { count: 'exact', head: true }),
          supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('contacts').select('*', { count: 'exact', head: true }),
          supabase.from('contacts').select('*', { count: 'exact', head: true }).eq('status', 'new'),
          supabase.from('quotes').select('*', { count: 'exact', head: true }),
          supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('status', 'new')
        ])

        return {
          totalProjects: totalProjects || 0,
          activeProjects: activeProjects || 0,
          totalTasks: totalTasks || 0,
          completedTasks: completedTasks || 0,
          totalContacts: totalContacts || 0,
          newContacts: newContacts || 0,
          totalQuotes: totalQuotes || 0,
          pendingQuotes: pendingQuotes || 0
        }
      }
      
      return statsData || {
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalContacts: 0,
        newContacts: 0,
        totalQuotes: 0,
        pendingQuotes: 0
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error)
      return {
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalContacts: 0,
        newContacts: 0,
        totalQuotes: 0,
        pendingQuotes: 0
      }
    }
  }
}

// Real-time subscriptions with error handling and performance optimizations
export const subscriptions = {
  subscribeToProjects(callback: (payload: any) => void, channelName = 'projects') {
    try {
      return supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, callback)
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn(`⚠️ Project subscription status: ${status}`)
          }
        })
    } catch (error) {
      console.error('❌ Error subscribing to projects:', error)
      return null
    }
  },

  subscribeToTasks(callback: (payload: any) => void, channelName = 'tasks') {
    try {
      return supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, callback)
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn(`⚠️ Tasks subscription status: ${status}`)
          }
        })
    } catch (error) {
      console.error('❌ Error subscribing to tasks:', error)
      return null
    }
  },

  subscribeToContacts(callback: (payload: any) => void, channelName = 'contacts') {
    try {
      return supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, callback)
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn(`⚠️ Contacts subscription status: ${status}`)
          }
        })
    } catch (error) {
      console.error('❌ Error subscribing to contacts:', error)
      return null
    }
  },

  subscribeToQuotes(callback: (payload: any) => void, channelName = 'quotes') {
    try {
      return supabase
        .channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'quotes' }, callback)
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn(`⚠️ Quotes subscription status: ${status}`)
          }
        })
    } catch (error) {
      console.error('❌ Error subscribing to quotes:', error)
      return null
    }
  }
}

function sanitizeContactData(contactData: any) {
  const sanitized = { ...contactData };
  // Convert empty string date fields to null
  ['created_at', 'updated_at', 'follow_up_date'].forEach((field) => {
    if (sanitized[field] === '') sanitized[field] = null;
  });
  // Convert empty string numbers to null
  ['lead_score', 'estimated_value', 'conversion_probability'].forEach((field) => {
    if (sanitized[field] === '') sanitized[field] = null;
    else if (typeof sanitized[field] === 'string' && sanitized[field] !== null) {
      const num = Number(sanitized[field]);
      sanitized[field] = isNaN(num) ? null : num;
    }
  });
  return sanitized;
}