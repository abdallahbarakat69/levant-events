
import Fuse from 'fuse.js';

const clients = [
    { fullName: "Client 123", phone: "050123" },
    { fullName: "Client 12A", phone: "05012A" },
    { fullName: "Client 120", phone: "050120" },
    { fullName: "Client 45", phone: "050045" },
    { fullName: "A Day 2 Remember", phone: 123456 } // Numeric phone test
];

function testSearch(query) {
    console.log(`\nSearching for: "${query}"`);
    const fuse = new Fuse(clients, {
        keys: ['fullName', 'phone'],
        threshold: 0.3,
        ignoreLocation: true,
        includeScore: true
    });

    const results = fuse.search(query);

    if (results.length === 0) {
        console.log("No results found.");
    } else {
        results.forEach((r, i) => {
            console.log(`${i + 1}. ${r.item.fullName} (Score: ${r.score.toFixed(4)})`);
        });
    }
}

testSearch("Client 12"); // Expect 123, 12A, 120 to be top
testSearch("remem"); // Part of "Remember"
testSearch("123456"); // Phone number search
