import React, { useEffect, useState } from 'react';
import { Users, UserList, UserPlus, Clock } from 'phosphor-react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import RecentChanges from '../components/RecentChanges';
import styles from './Dashboard.module.css';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className={styles.statCard}>
        <div className={styles.statHeader}>
            <div className={styles.iconWrapper} style={{ backgroundColor: color }}>
                <Icon size={24} color="white" weight="fill" />
            </div>
            {trend && <span className={styles.trend}>{trend}</span>}
        </div>
        <div className={styles.statContent}>
            <h3>{value}</h3>
            <p>{title}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ clients: 0, salesmen: 0, recentClients: [] });
    const [userRole, setUserRole] = useState('staff');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [clientCount, salesmen, recentClients, role] = await Promise.all([
                dataService.getClientCount(),
                dataService.getSalesmen(),
                dataService.getRecentClients(5),
                authService.getCurrentUserRole()
            ]);

            setStats({
                clients: clientCount,
                salesmen: salesmen.length,
                recentClients: recentClients
            });
            setUserRole(role);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <p>Overview of your event management performance.</p>
            </div>

            <div className={styles.grid}>
                <StatCard
                    title="Total Clients"
                    value={stats.clients}
                    icon={Users}
                    color="#D4AF37"
                />
                <StatCard
                    title="Active Salesmen"
                    value={stats.salesmen}
                    icon={UserList}
                    color="#121212"
                />
                <StatCard
                    title="New This Month"
                    value="2"
                    icon={UserPlus}
                    color="#4CAF50"
                />
                <StatCard
                    title="Pending Actions"
                    value="5"
                    icon={Clock}
                    color="#FF9800"
                />
            </div>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Recently Updated Clients</h2>
                </div>
                <div className={styles.tableCard}>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Notes</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentClients.map(client => (
                                    <tr key={client.id}>
                                        <td><strong>{client.fullName}</strong></td>
                                        <td>{client.phone}</td>
                                        <td className={styles.truncate}>{client.notes}</td>
                                        <td><span className={styles.badge}>Active</span></td>
                                    </tr>
                                ))}
                                {stats.recentClients.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className={styles.empty}>No clients found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {userRole === 'admin' && (
                <div className={styles.section} style={{ marginTop: '2rem' }}>
                    <RecentChanges />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
