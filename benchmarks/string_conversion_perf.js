const { performance } = require('perf_hooks');

function currentImplementation(etymology, displayed, word, discoveredLinks) {
    const currentLinks = new Set(discoveredLinks);
    let linksAdded = false;

    displayed.forEach(other => {
        if (other.id !== word.id && etymology.toLowerCase().includes(other.text.toLowerCase())) {
            const link = [word.id, other.id].sort((a, b) => a - b).join('-');
            if (!currentLinks.has(link)) {
                currentLinks.add(link);
                linksAdded = true;
            }
        }
    });
    return { currentLinks, linksAdded };
}

function optimizedImplementation(etymology, displayed, word, discoveredLinks) {
    const currentLinks = new Set(discoveredLinks);
    let linksAdded = false;
    const lowerEtymology = etymology.toLowerCase();

    displayed.forEach(other => {
        if (other.id !== word.id && lowerEtymology.includes(other.text.toLowerCase())) {
            const link = [word.id, other.id].sort((a, b) => a - b).join('-');
            if (!currentLinks.has(link)) {
                currentLinks.add(link);
                linksAdded = true;
            }
        }
    });
    return { currentLinks, linksAdded };
}

// Data Setup
const etymology = "This is a long etymology text that might contain some words like linguistics, philosophy, and history. It's meant to simulate a real etymology string from an API response.".repeat(10);
const displayed = [];
for (let i = 0; i < 100; i++) {
    displayed.push({
        id: i,
        text: `Word${i}`
    });
}
displayed.push({ id: 101, text: "linguistics" });
displayed.push({ id: 102, text: "philosophy" });

const word = { id: 200, text: "test" };
const discoveredLinks = new Set();

// Benchmark
const iterations = 10000;

console.log(`Running benchmark with etymology length ${etymology.length} and ${displayed.length} displayed words...`);

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
    currentImplementation(etymology, displayed, word, discoveredLinks);
}
const end1 = performance.now();
console.log(`Current Implementation: ${(end1 - start1).toFixed(2)}ms`);

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
    optimizedImplementation(etymology, displayed, word, discoveredLinks);
}
const end2 = performance.now();
console.log(`Optimized Implementation: ${(end2 - start2).toFixed(2)}ms`);

const speedup = (end1 - start1) / (end2 - start2);
console.log(`Speedup: ${speedup.toFixed(2)}x`);

// Verification
const res1 = currentImplementation(etymology, displayed, word, discoveredLinks);
const res2 = optimizedImplementation(etymology, displayed, word, discoveredLinks);
const passed = res1.linksAdded === res2.linksAdded && res1.currentLinks.size === res2.currentLinks.size;
console.log(`Verification: ${passed ? 'PASSED' : 'FAILED'}`);
