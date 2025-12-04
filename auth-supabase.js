// Supabase Authentication Logic

// Signup with Supabase
async function supabaseSignup(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Store user data in profiles table
        if (data.user) {
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    plan: 'free',
                    created_at: new Date().toISOString()
                });

            if (profileError) {
                console.error('Profile creation error:', profileError);
            }
        }

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login with Supabase
async function supabaseLogin(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            return { success: false, error: error.message };
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
        }

        return { 
            success: true, 
            user: data.user, 
            session: data.session,
            profile: profile 
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Check if user is logged in
async function checkSupabaseSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            return { loggedIn: false };
        }

        // Get user profile
        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return { 
            loggedIn: true, 
            user: session.user,
            profile: profile 
        };
    } catch (error) {
        return { loggedIn: false };
    }
}

// Logout
async function supabaseLogout() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

// Get user count
async function getSupabaseUserCount() {
    try {
        const { count, error } = await supabaseClient
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('User count error:', error);
            return 0;
        }

        return count || 0;
    } catch (error) {
        console.error('User count error:', error);
        return 0;
    }
}
