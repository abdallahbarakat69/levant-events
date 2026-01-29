
import { authService } from './src/services/authService.js';
import { supabase } from './src/supabaseClient.js';

// Polyfill alert for node environment (since authService uses alert)
global.alert = (msg) => console.log('ALERT:', msg);

async function runTest() {
    const timestamp = Date.now();
    const testUser = {
        name: `Test User ${timestamp}`,
        username: `testuser${timestamp}`,
        password: 'password123',
        role: 'staff'
    };

    console.log(`1. Creating user: ${testUser.username}`);
    try {
        const user = await authService.addUser(testUser);
        console.log(`   User created with ID: ${user.id}`);

        console.log('2. Attempting first login...');
        const loggedInUser = await authService.login(`${testUser.username}@levantevents.com`, testUser.password);
        console.log(`   Login successful for: ${loggedInUser.email}`);

        console.log('3. Deleting user...');
        await authService.deleteUser(user.id);
        console.log('   User deletion requested.');

        // Verify deletion from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            console.log('   WARNING: Profile still exists in database!');
        } else {
            console.log('   Profile successfully removed from database.');
        }

        console.log('4. Attempting login AFTER deletion...');
        try {
            await authService.login(`${testUser.username}@levantevents.com`, testUser.password);
            console.log('   FAILURE: Login succeeded but should have failed!');
        } catch (e) {
            console.log('   SUCCESS: Login failed as expected with error:', e.message);
        }

    } catch (err) {
        console.error('An error occurred during the test:', err);
    }
}

runTest();
