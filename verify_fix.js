
import { authService } from './src/services/authService.js';
import { supabase } from './src/supabaseClient.js';

// Polyfill alert
global.alert = (msg) => console.log('ALERT:', msg);

async function verifyFix() {
    const timestamp = Date.now();
    const testUser = {
        name: `Verify User ${timestamp}`,
        username: `verify${timestamp}`,
        password: 'password123',
        role: 'staff'
    };

    console.log(`1. Creating user: ${testUser.username}`);
    try {
        const user = await authService.addUser(testUser);
        console.log(`   User created with ID: ${user.id}`);

        console.log('2. Logging in...');
        await authService.login(`${testUser.username}@levantevents.com`, testUser.password);
        console.log('   Login successful.');

        console.log('3. Checking isAuthenticated (should be true)...');
        const isAuthBefore = await authService.isAuthenticated();
        console.log(`   isAuthenticated: ${isAuthBefore}`);

        if (!isAuthBefore) {
            console.error('   ERROR: Should be authenticated after login!');
            return;
        }

        console.log('4. Deleting user profile DIRECTLY (simulating admin deletion)...');
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', user.id);

        if (error) throw error;
        console.log('   User profile deleted.');

        console.log('5. Checking isAuthenticated AGAIN (should be FALSE now)...');
        const isAuthAfter = await authService.isAuthenticated();
        console.log(`   isAuthenticated: ${isAuthAfter}`);

        if (isAuthAfter === false) {
            console.log('   SUCCESS: User is correctly denied access despite having a session!');
        } else {
            console.log('   FAILURE: User is still authenticated but profile is gone.');
        }

    } catch (err) {
        console.error('An error occurred during verification:', err);
    }
}

verifyFix();
