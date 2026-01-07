import React, { useState, useEffect } from 'react';
import { UserPlus, Envelope, Phone, Trash } from 'phosphor-react';
import { dataService } from '../services/dataService';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import styles from './SalesTeam.module.css';

const SalesTeam = () => {
    const [salesmen, setSalesmen] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        setSalesmen(dataService.getSalesmen());
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newSalesman = dataService.addSalesman(formData);
        setSalesmen(prev => [...prev, newSalesman]);
        setFormData({ name: '', email: '', phone: '' });
        setIsModalOpen(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to remove this salesman?')) {
            dataService.deleteSalesman(id);
            setSalesmen(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Sales Team</h1>
                    <p>Manage your sales staff and their contact details.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <UserPlus size={20} weight="bold" />
                    Add Salesman
                </Button>
            </div>

            <div className={styles.grid}>
                {salesmen.map(person => (
                    <div key={person.id} className={styles.card}>
                        <div className={styles.avatar}>
                            {person.name.charAt(0)}
                        </div>
                        <div className={styles.info}>
                            <h3>{person.name}</h3>
                            <div className={styles.contact}>
                                <Envelope size={16} />
                                <span>{person.email}</span>
                            </div>
                            <div className={styles.contact}>
                                <Phone size={16} />
                                <span>{person.phone}</span>
                            </div>
                        </div>
                        <button
                            className={styles.deleteBtn}
                            onClick={() => handleDelete(person.id)}
                            title="Delete Salesman"
                        >
                            <Trash size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Salesman"
            >
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <Input
                        label="Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                    />
                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Employee</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default SalesTeam;
