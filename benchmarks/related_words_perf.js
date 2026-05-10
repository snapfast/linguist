const { performance } = require('perf_hooks');

function currentImplementation(fragments, words, discovered) {
    const related = new Set();
    fragments.forEach((frag, wordId) => {
        // Find parent/children
        words.forEach(w => {
            if (w.parentId === wordId) related.add(w.id);
            const self = words.find(s => s.id === wordId);
            if (self && self.parentId === w.id) related.add(w.id);
        });

        // Find discovered links
        discovered.forEach(link => {
            const [id1, id2] = link.split('-').map(Number);
            if (id1 === wordId) related.add(id2);
            if (id2 === wordId) related.add(id1);
        });
    });
    return related;
}

function optimizedImplementation(fragments, words, discovered) {
    const related = new Set();
    fragments.forEach((frag, wordId) => {
        // Find parent/children
        const self = words.find(s => s.id === wordId);
        words.forEach(w => {
            if (w.parentId === wordId) related.add(w.id);
            if (self && self.parentId === w.id) related.add(w.id);
        });

        // Find discovered links
        discovered.forEach(link => {
            const [id1, id2] = link.split('-').map(Number);
            if (id1 === wordId) related.add(id2);
            if (id2 === wordId) related.add(id1);
        });
    });
    return related;
}

// Data Setup
const NUM_WORDS = 500;
const NUM_FRAGMENTS = 50;
const NUM_DISCOVERED = 100;

const words = [];
for (let i = 0; i < NUM_WORDS; i++) {
    words.push({
        id: i,
        parentId: i > 0 ? Math.floor(Math.random() * i) : undefined,
        text: `word${i}`
    });
}

const fragments = new Map();
const fragmentIds = [];
while (fragmentIds.length < NUM_FRAGMENTS) {
    const wordId = Math.floor(Math.random() * NUM_WORDS);
    if (!fragments.has(wordId)) {
        fragments.set(wordId, { word: words[wordId] });
        fragmentIds.push(wordId);
    }
}

const discovered = new Set();
for (let i = 0; i < NUM_DISCOVERED; i++) {
    const id1 = Math.floor(Math.random() * NUM_WORDS);
    const id2 = Math.floor(Math.random() * NUM_WORDS);
    if (id1 !== id2) {
        discovered.add([id1, id2].sort((a, b) => a - b).join('-'));
    }
}

// Benchmark
const iterations = 100;

console.log(`Running benchmark with ${NUM_WORDS} words and ${NUM_FRAGMENTS} fragments...`);

const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
    currentImplementation(fragments, words, discovered);
}
const end1 = performance.now();
console.log(`Current Implementation: ${(end1 - start1).toFixed(2)}ms`);

const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
    optimizedImplementation(fragments, words, discovered);
}
const end2 = performance.now();
console.log(`Optimized Implementation: ${(end2 - start2).toFixed(2)}ms`);

const speedup = (end1 - start1) / (end2 - start2);
console.log(`Speedup: ${speedup.toFixed(2)}x`);

// Verification
const res1 = currentImplementation(fragments, words, discovered);
const res2 = optimizedImplementation(fragments, words, discovered);
const passed = res1.size === res2.size && [...res1].every(v => res2.has(v));
console.log(`Verification: ${passed ? 'PASSED' : 'FAILED'}`);

if (!passed) {
    console.log('Results differ!');
    process.exit(1);
}
