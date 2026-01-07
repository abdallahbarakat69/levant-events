import React, { useState, useEffect } from 'react';
import { UserPlus, Trash, Shield, User, Eye, EyeSlash } from 'phosphor-react';
import { authService } from '../services/authService';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import styles from './Users.module.css';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', username: '', password: '', role: 'staff' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        const data = await authService.getUsers();
        setUsers(data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.addUser(formData);
            loadUsers();
            setIsModalOpen(false);
            setFormData({ name: '', username: '', password: '', role: 'staff' });
            setShowPassword(false);
            alert("User created! (Note: You are now logged in as the new user)");
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await authService.deleteUser(id);
                loadUsers();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>System Users</h1>
                    <p>Manage access credentials for the application.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={20} weight="bold" />
                    Add User
                </Button>
            </div>

            <div className={styles.grid}>
                {users.map(user => (
                    <div key={user.id} className={styles.card}>
                        <div className={styles.iconWrapper}>
                            {user.role === 'admin' ?
                                <Shield size={32} weight="duotone" color="#CFB53B" /> :
                                <User size={32} weight="duotone" color="#888" />
                            }
                        </div>
                        <div className={styles.info}>
                            <h3>{user.name}</h3>
                            <p className={styles.role}>{user.role.toUpperCase()}</p>
                            <p className={styles.username}>Username: <strong>{user.username}</strong></p>
                        </div>
                        <div className={styles.actions}>
                            <button
                                onClick={() => handleDelete(user.id)}
                                className={styles.deleteBtn}
                                title="Delete User"
                            >
                                <Trash size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New User"
            >
                <form onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        required
                    />
                    <div style={{ position: 'relative' }}>
                        <Input
                            label="Password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={handleInputChange}
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
                    <div className={styles.formGroup}>
                        <label>Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            className={styles.select}
                        >
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create User</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
