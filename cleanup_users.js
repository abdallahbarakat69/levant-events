
import { supabase } from './src/supabaseClient.js';

async function cleanupUsers() {
    console.log('Starting user cleanup...');

    // 1. Get all profiles
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    console.log(`Found ${profiles.length} profiles.`);

    const keepUsername = 'abdallahbarakat';
    let deletedCount = 0;

    for (const user of profiles) {
        if (user.username === keepUsername) {
            console.log(`[SKIP] Keeping user: ${user.username} (${user.id})`);
            continue;
        }

        console.log(`[DELETE] Deleting user: ${user.username} (${user.id})`);

        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (deleteError) {
            console.error(`  Failed to delete ${user.username}:`, deleteError.message);
        } else {
            deletedCount++;
        }
    }

    console.log('Cleanup complete.');
    console.log(`Total users deleted: ${deletedCount}`);
    console.log(`Remaining users should be: 1 (if abdallahbarakat existed)`);
}

cleanupUsers();
