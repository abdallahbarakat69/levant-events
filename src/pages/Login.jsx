import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeSlash } from 'phosphor-react';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import styles from './Login.module.css';

const Login = () => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert simple username to fake email for Supabase
            const email = formData.username.includes('@')
                ? formData.username
                : `${formData.username}@levantevents.com`;

            await authService.login(email, formData.password);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert(`Connection Error: ${err.message}\nHint: Check your internet or ad-blockers.`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <h1>Levant Events</h1>
                    <p>Internal Management System</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        autoFocus
                    />
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '38px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#666'
                            }}
                        >
                            {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.actions}>
                        <Button type="submit" variant="primary" style={{ width: '100%' }}>
                            Sign In
                        </Button>
                    </div>
                </form>

                <div className={styles.footer}>
                    <p>Authorized access only.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
