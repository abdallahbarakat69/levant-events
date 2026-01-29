import React, { useEffect, useState } from 'react';
import { auditService } from '../services/auditService';
import styles from './RecentChanges.module.css';

const RecentChanges = () => {
    const [changes, setChanges] = useState([]);

    useEffect(() => {
        loadChanges();
        // Set up an interval to refresh changes periodically
        const interval = setInterval(loadChanges, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadChanges = async () => {
        const data = await auditService.getRecentChanges();
        setChanges(data);
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return '#10B981'; // Green
        if (action.includes('UPDATE')) return '#F59E0B'; // Amber
        if (action.includes('DELETE')) return '#EF4444'; // Red
        return '#6B7280'; // Gray
    };

    return (
        <div className={styles.container}>
            <div className={styles.titleRow}>
                <h3>Recent Activity Log</h3>
                <button onClick={loadChanges} className={styles.refreshBtn}>Refresh</button>
            </div>
            <div className={styles.list}>
                {changes.length === 0 ? <p className={styles.empty}>No recent activity found.</p> :
                    changes.map(change => (
                        <div key={change.id} className={styles.item} style={{ borderLeft: `4px solid ${getActionColor(change.action)}` }}>
                            <div className={styles.header}>
                                <span className={styles.action} style={{ color: getActionColor(change.action) }}>{change.action}</span>
                                <span className={styles.date}>{new Date(change.created_at).toLocaleString()}</span>
                            </div>
                            <p className={styles.details}>{change.details}</p>
                            <small className={styles.user}>By: {change.performed_by || 'Unknown'}</small>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default RecentChanges;
