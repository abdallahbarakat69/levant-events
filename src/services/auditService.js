import { supabase } from '../supabaseClient';

export const auditService = {
    logChange: async (action, details, performedBy) => {
        const { error } = await supabase
            .from('recent_changes')
            .insert([{
                action,
                details,
                performed_by: performedBy
            }]);
        if (error) console.error("Audit Log Error:", error);
    },

    getRecentChanges: async () => {
        const { data, error } = await supabase
            .from('recent_changes')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error("Fetch Log Error:", error);
            return [];
        }
        return data;
    }
};
