import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { House, Users, UserList, SignOut, Shield } from 'phosphor-react';
import { authService } from '../services/authService';
import styles from './Sidebar.module.css';

const Sidebar = () => {
    const [userRole, setUserRole] = React.useState(null);
    const navigate = useNavigate(); // Add navigate hook

    React.useEffect(() => {
        const fetchRole = async () => {
            const role = await authService.getCurrentUserRole();
            setUserRole(role);
        };
        fetchRole();
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
                    <>
                        <NavLink to="/users" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                            <Shield size={24} weight="duotone" />
                            <span>Users</span>
                        </NavLink>
                        <NavLink to="/audit-log" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                            <div style={{ position: 'relative' }}>
                                <Shield size={24} weight="duotone" />
                                <span style={{ position: 'absolute', bottom: -2, right: -2, fontSize: 10, background: 'var(--primary-gold)', color: 'black', borderRadius: '50%', width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
                            </div>
                            <span>Audit Log</span>
                        </NavLink>
                    </>
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
