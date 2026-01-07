import { supabase } from '../supabaseClient';

export const authService = {
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;

        // Improve: fetch role from 'profiles' table if needed
        return data.user;
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    isAuthenticated: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session;
    },

    // User Management Methods
    // Note: 'getUsers' cannot list all auth users from client side for security.
    // We will query the 'profiles' table instead.
    getUsers: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*');
        if (error) {
            console.error('Error fetching users:', error);
            return [];
        }
        return data; // { id, username, full_name, role }
    },

    addUser: async (userData) => {
        // 1. Create Auth User
        // Note: This automatically logs in as the new user in most configs!
        // For an admin panel adding users, this is tricky.
        // We might need an Edge Function or just warn the user.
        // For now, simpler approach: signUp works, but we might lose current session.
        // Ideally, use a second client or Admin API (service role).
        // Since we don't have service role key in frontend (insecure), 
        // we will use standard signUp and handle session restore or re-login.

        // Actually, preventing auto-login requires specific Supabase config 'Disable email confirmations' 
        // or using Admin API.

        // Let's assume for this migration we just try standard signUp.
        const { data, error } = await supabase.auth.signUp({
            email: userData.username + '@levantevents.com', // Fake email generator
            password: userData.password,
            options: {
                data: {
                    full_name: userData.name,
                    role: userData.role,
                    username: userData.username
                }
            }
        });

        if (error) throw error;

        // 2. Create Profile Entry
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    username: userData.username,
                    full_name: userData.name,
                    role: userData.role
                }]);

            if (profileError) console.error('Error creating profile:', profileError);
        }

        return data.user;
    },

    deleteUser: async (id) => {
        // Client-side cannot delete Auth Users.
        // We can only delete from 'profiles'.
        // To delete Auth User, requires Admin API (Edge Function).
        // For this demo, we will just delete the profile so they disappear from list.
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
        alert("Note: User removed from list, but Auth account still exists (Client-side limitation).");
    }
};
