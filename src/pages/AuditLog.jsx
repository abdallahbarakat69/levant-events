
import React from 'react';
import RecentChanges from '../components/RecentChanges';
import styles from '../components/RecentChanges.module.css'; // Reusing styles container

const AuditLog = () => {
    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: 'var(--primary-gold)', marginBottom: '1rem', fontFamily: 'Playfair Display, serif' }}>System Audit Log</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Detailed history of all changes made to client data.</p>
            <RecentChanges />
        </div>
    );
};

export default AuditLog;
