const USERS_KEY = 'levant_users';

const INITIAL_USERS = [
    { id: 'u1', username: 'admin', password: 'password', role: 'admin', name: 'Admin User' },
    { id: 'u2', username: 'staff', password: 'password', role: 'staff', name: 'Sales Staff' }
];

// Initialize users if empty
if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
}

export const authService = {
    login: (username, password) => {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            const { password, ...userWithoutPass } = user;
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPass));
            return userWithoutPass;
        }
        throw new Error('Invalid credentials');
    },

    logout: () => {
        localStorage.removeItem('currentUser');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('currentUser');
    },

    // User Management Methods
    getUsers: () => {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    },

    addUser: (userData) => {
        const users = authService.getUsers();
        if (users.some(u => u.username === userData.username)) {
            throw new Error('Username already exists');
        }
        const newUser = { ...userData, id: crypto.randomUUID() };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return newUser;
    },

    deleteUser: (id) => {
        let users = authService.getUsers();
        // Prevent deleting the last admin
        if (users.find(u => u.id === id)?.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
            throw new Error('Cannot delete the last administrator');
        }
        users = users.filter(u => u.id !== id);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
};
