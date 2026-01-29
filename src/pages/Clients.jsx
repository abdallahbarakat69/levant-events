import { Plus, MagnifyingGlass, Globe, FacebookLogo, InstagramLogo, LinkedinLogo, Trash, Envelope } from 'phosphor-react';
import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import styles from './Clients.module.css';

const SocialIcon = ({ type, url }) => {
    if (!url) return null;
    const icons = {
        instagram: InstagramLogo,
        facebook: FacebookLogo,
        linkedin: LinkedinLogo,
        website: Globe
    };
    const Icon = icons[type];
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            <Icon size={20} weight="fill" />
        </a>
    );
};

import { auditService } from '../services/auditService';
import { authService } from '../services/authService';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [salesmen, setSalesmen] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [filter, setFilter] = useState({ search: '', salesmanId: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [userRole, setUserRole] = useState('staff');
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const initialFormState = {
        fullName: '',
        phone: '',
        email: '',
        salesmanId: '',
        notes: '',
        website: '',
        socialMedia: { instagram: '', facebook: '', linkedin: '' }
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        const loadData = async () => {
            const [loadedClients, loadedSalesmen] = await Promise.all([
                dataService.getClients(),
                dataService.getSalesmen()
            ]);
            setClients(loadedClients);
            setFilteredClients(loadedClients);
            setSalesmen(loadedSalesmen);

            // Fetch generic role and user info
            const role = await authService.getCurrentUserRole();
            setUserRole(role);
            const user = await authService.getCurrentUser();
            setCurrentUserEmail(user?.email || 'Unknown');
        };
        loadData();
    }, []);

    useEffect(() => {
        let result = clients;
        if (filter.salesmanId !== 'all') {
            if (filter.salesmanId === 'unassigned') {
                result = result.filter(c => !c.salesmanId);
            } else {
                result = result.filter(c => c.salesmanId === filter.salesmanId);
            }
        }
        if (filter.search) {
            const term = filter.search.toLowerCase();
            // Create a "clean" numeric version of the search term for phone matching
            // This removes everything except digits
            const cleanSearchTerm = term.replace(/\D/g, '');

            result = result.filter(c => {
                const nameMatch = c.fullName.toLowerCase().includes(term);

                // If the search term has digits, try to match against clean phone number
                let phoneMatch = false;
                if (c.phone) {
                    const phoneStr = String(c.phone);
                    // Check raw match (e.g. if user types dashes intentionally)
                    if (phoneStr.toLowerCase().includes(term)) phoneMatch = true;

                    // Check clean match (e.g. user types "050123" but phone is "050-123")
                    if (!phoneMatch && cleanSearchTerm.length > 0) {
                        const cleanPhone = phoneStr.replace(/\D/g, '');
                        if (cleanPhone.includes(cleanSearchTerm)) phoneMatch = true;
                    }
                }

                return nameMatch || phoneMatch;
            });
        }
        setFilteredClients(result);
        setCurrentPage(1);
    }, [filter, clients]);

    const handleOpenModal = (client = null) => {
        if (client) {
            setEditingClient(client);
            setFormData({
                ...client,
                socialMedia: client.socialMedia || { instagram: '', facebook: '', linkedin: '' },
                notes: client.notes || '',
                phone: client.phone || '',
                email: client.email || '',
                website: client.website || '',
                salesmanId: client.salesmanId || ''
            });
        } else {
            setEditingClient(null);
            setFormData({ ...initialFormState, salesmanId: salesmen[0]?.id || '' });
        }
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                if (userRole !== 'admin') {
                    alert("Permission Denied: Only Admins can edit clients.");
                    return;
                }
                const updated = await dataService.updateClient(editingClient.id, formData);
                setClients(clients.map(c => c.id === updated.id ? updated : c));
                await auditService.logChange('UPDATE', `Updated client: ${updated.fullName}`, currentUserEmail);
            } else {
                const newClient = await dataService.addClient(formData);
                setClients([...clients, newClient]);
                await auditService.logChange('CREATE', `Added new client: ${newClient.fullName}`, currentUserEmail);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save client", error);
            alert("Failed to save client. Please check your connection.");
        }
    };

    const handleDelete = async (id) => {
        if (userRole !== 'admin') {
            alert("Permission Denied: Only Admins can delete clients.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                const clientToDelete = clients.find(c => c.id === id);
                await dataService.deleteClient(id);
                setClients(prev => prev.filter(c => c.id !== id));
                await auditService.logChange('DELETE', `Deleted client: ${clientToDelete?.fullName}`, currentUserEmail);
            } catch (error) {
                console.error("Failed to delete client", error);
                alert("Failed to delete client.");
            }
        }
    };

    const getSalesmanName = (id) => {
        const s = salesmen.find(sm => String(sm.id) === String(id));
        return s ? s.name : 'Unassigned';
    };

    // Calculate Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h1>Clients</h1>
                    <p>Manage potential and existing clients. ({filteredClients.length} total)</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={20} weight="bold" />
                    Add Client
                </Button>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <MagnifyingGlass size={20} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={filter.search}
                        onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
                        className={styles.searchInput}
                    />
                </div>

                <select
                    className={styles.select}
                    value={filter.salesmanId}
                    onChange={e => setFilter(prev => ({ ...prev, salesmanId: e.target.value }))}
                >
                    <option value="all">All Salesmen</option>
                    <option value="unassigned">Unassigned</option>
                    {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Contact</th>
                            <th>Assigned Salesman</th>
                            <th>Links</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentClients.map(client => (
                            <tr key={client.id} className={styles.row}>
                                <td>
                                    <div className={styles.clientName}>{client.fullName}</div>
                                    <div className={styles.clientNotes}>{client.notes}</div>
                                </td>
                                <td>
                                    <div>{client.phone}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>{client.email}</div>
                                </td>
                                <td>
                                    <span className={styles.salesmanTag}>
                                        {getSalesmanName(client.salesmanId)}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.socials}>
                                        <SocialIcon type="website" url={client.website} />
                                        <SocialIcon type="instagram" url={client.socialMedia?.instagram} />
                                        <SocialIcon type="facebook" url={client.socialMedia?.facebook} />
                                        <SocialIcon type="linkedin" url={client.socialMedia?.linkedin} />
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        {userRole === 'admin' && (
                                            <>
                                                <Button variant="outline" size="small" onClick={() => handleOpenModal(client)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                                    Edit
                                                </Button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(client.id)}
                                                    title="Delete Client"
                                                >
                                                    <Trash size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {currentClients.length === 0 && (
                            <tr><td colSpan="5" className={styles.empty}>No clients found matching filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className={styles.pageInfo}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingClient ? "Edit Client" : "Add New Client"}
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formRow}>
                        <Input label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                        <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} required />
                    </div>
                    <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Assigned Salesman</label>
                        <select
                            name="salesmanId"
                            value={formData.salesmanId}
                            onChange={handleInputChange}
                            className={styles.selectInput}
                            required
                        >
                            <option value="">Select Salesman...</option>
                            {salesmen.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            className={styles.textarea}
                            rows="3"
                        />
                    </div>

                    <div className={styles.divider}>Social Media & Web</div>

                    <Input label="Website URL" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://..." />

                    <div className={styles.formRow}>
                        <Input label="Instagram" name="socialMedia.instagram" value={formData.socialMedia.instagram} onChange={handleInputChange} placeholder="Profile URL" />
                        <Input label="Facebook" name="socialMedia.facebook" value={formData.socialMedia.facebook} onChange={handleInputChange} placeholder="Profile URL" />
                    </div>
                    <Input label="LinkedIn" name="socialMedia.linkedin" value={formData.socialMedia.linkedin} onChange={handleInputChange} placeholder="Profile URL" />

                    <div className={styles.modalActions}>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Client</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Clients;
