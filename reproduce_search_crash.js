
const clients = [
    { fullName: "Normal Client", phone: "0501234567" },
    { fullName: "Client With Number 2", phone: 1234567890 }, // Simulating number type from bad import
    { fullName: "Another Client", phone: null }
];

const searchTerm = "2";

function testSearch(search) {
    console.log(`Testing search with term: "${search}"`);
    try {
        const result = clients.filter(c => {
            const term = search.toLowerCase();
            const cleanSearchTerm = term.replace(/\D/g, '');

            const nameMatch = c.fullName.toLowerCase().includes(term);

            let phoneMatch = false;
            // Potential crash here if c.phone is a number
            if (c.phone) {
                // BUG: c.phone.toLowerCase() throws if c.phone is a number
                if (c.phone.toLowerCase().includes(term)) phoneMatch = true;

                if (!phoneMatch && cleanSearchTerm.length > 0) {
                    // BUG: c.phone.replace throw if c.phone is a number
                    const cleanPhone = c.phone.replace(/\D/g, '');
                    if (cleanPhone.includes(cleanSearchTerm)) phoneMatch = true;
                }
            }

            return nameMatch || phoneMatch;
        });
        console.log(`Search result count: ${result.length}`);
    } catch (e) {
        console.error("SEARCH CRASHED:", e.message); // Should match "c.phone.toLowerCase is not a function"
    }
}

testSearch("2");
