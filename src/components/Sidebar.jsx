import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { House, Users, UserList, SignOut, Shield } from 'phosphor-react';
import { authService } from '../services/authService';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [userRole, setUserRole] = React.useState(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            const user = await authService.getCurrentUser();
            // In Supabase, user metadata is in user.user_metadata or we fetch profile
            // For now, let's assume authService returns the object we expect or we re-fetch
            if (user) {
                // Determine role. If we need to fetch profile from DB:
                // const profile = ...
                // But authService.getCurrentUser might just return Auth User object.
                // Let's check authService again separately.
                // For safety:
                setUserRole(user.user_metadata?.role || 'staff');
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        navigate('/login');
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <h2>Levant Events</h2>
            </div>

            <nav className={styles.nav}>
                <NavLink to="/" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <House size={24} weight="duotone" />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink to="/clients" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <Users size={24} weight="duotone" />
                    <span>Clients</span>
                </NavLink>

                <NavLink to="/sales-team" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                    <UserList size={24} weight="duotone" />
                    <span>Sales Team</span>
                </NavLink>

                {userRole === 'admin' && (
                    <NavLink to="/users" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                        <Shield size={24} weight="duotone" />
                        <span>Users</span>
                    </NavLink>
                )}
            </nav>

            <div className={styles.footer}>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                    <SignOut size={24} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
