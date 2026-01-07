const STORAGE_KEYS = {
    CLIENTS: 'levant_clients',
    SALESMEN: 'levant_salesmen'
};

const INITIAL_SALESMEN = [
    { id: 's1', name: 'John Doe', email: 'john@levantevents.com', phone: '555-0101' },
    { id: 's2', name: 'Sarah Smith', email: 'sarah@levantevents.com', phone: '555-0102' },
    { id: 's3', name: 'Mike Johnson', email: 'mike@levantevents.com', phone: '555-0103' },
];

const INITIAL_CLIENTS = [
    {
        id: 'c1',
        fullName: 'Alice Thompson',
        phone: '555-1234',
        email: 'alice@example.com',
        notes: 'Interested in a summer wedding package.',
        salesmanId: 's1',
        socialMedia: { instagram: '', facebook: '', linkedin: '' },
        website: '',
        updatedAt: new Date().toISOString()
    },
    {
        id: 'c2',
        fullName: 'Bob Brown',
        phone: '555-5678',
        email: 'bob@techcorp.com',
        notes: 'Corporate event for Tech Corp.',
        salesmanId: 's2',
        socialMedia: { instagram: '', facebook: '', linkedin: '' },
        website: 'techcorp.com',
        updatedAt: new Date().toISOString()
    }
];

// Initialize data if empty
if (!localStorage.getItem(STORAGE_KEYS.SALESMEN)) {
    localStorage.setItem(STORAGE_KEYS.SALESMEN, JSON.stringify(INITIAL_SALESMEN));
}
if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(INITIAL_CLIENTS));
}

export const dataService = {
    // Clients
    getClients: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS) || '[]');
    },

    addClient: (client) => {
        const clients = dataService.getClients();
        const newClient = { ...client, id: crypto.randomUUID(), updatedAt: new Date().toISOString() };
        clients.push(newClient);
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
        return newClient;
    },

    updateClient: (id, updates) => {
        const clients = dataService.getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
            return clients[index];
        }
        return null;
    },

    deleteClient: (id) => {
        let clients = dataService.getClients();
        clients = clients.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    },

    // Salesmen
    getSalesmen: () => {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALESMEN) || '[]');
    },

    addSalesman: (salesman) => {
        const salesmen = dataService.getSalesmen();
        const newSalesman = { ...salesman, id: crypto.randomUUID() };
        salesmen.push(newSalesman);
        localStorage.setItem(STORAGE_KEYS.SALESMEN, JSON.stringify(salesmen));
        return newSalesman;
    },

    deleteSalesman: (id) => {
        let salesmen = dataService.getSalesmen();
        salesmen = salesmen.filter(s => s.id !== id);
        localStorage.setItem(STORAGE_KEYS.SALESMEN, JSON.stringify(salesmen));
    }
};
