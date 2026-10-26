/**
 * LeetCode slug utilities for DSA question mapping.
 */

// Questions whose canonical LeetCode slug differs from a naive title→slug conversion.
const SLUG_OVERRIDES = {
    // Parenthetical annotations / alternate names
    "Maximum Subarray (Kadane's)": "maximum-subarray",
    "Sort Colors (Dutch National Flag)": "sort-colors",
    "Rotate Image (90 degrees)": "rotate-image",
    "Implement strStr() / Needle in Haystack": "find-the-index-of-the-first-occurrence-in-a-string",
    "Insert Delete GetRandom O(1)": "insert-delete-getrandom-o1",
    "Sort an Array (Merge/Quick from scratch)": "sort-an-array",
    "01 Matrix (Distance to nearest 0)": "01-matrix",
    "01 Matrix": "01-matrix",
    "Implement Trie (Prefix Tree)": "implement-trie-prefix-tree",
    "Dijkstra's Algorithm (Network Delay Time)": "network-delay-time",
    "Bellman-Ford (Cheapest Flights K Stops)": "cheapest-flights-within-k-stops",
    "Minimum Spanning Tree (Kruskal/Prim)": "min-cost-to-connect-all-points",
    "0/1 Knapsack (Target Sum)": "target-sum",
    "Best Time to Buy/Sell Stock with Cooldown": "best-time-to-buy-and-sell-stock-with-cooldown",
    "Best Time to Buy/Sell Stock with Fee": "best-time-to-buy-and-sell-stock-with-transaction-fee",
    "Subsets (bitmask)": "subsets",
    "Subsets": "subsets",
    "Subsets II": "subsets-ii",

    // Tree traversal & BST canonical LeetCode names
    "Level Order Traversal": "binary-tree-level-order-traversal",
    "Zigzag Level Order Traversal": "binary-tree-zigzag-level-order-traversal",
    "Populate Next Right Pointers": "populating-next-right-pointers-in-each-node",
    "Vertical Order Traversal": "vertical-order-traversal-of-a-binary-tree",
    "Maximum Path Sum": "binary-tree-maximum-path-sum",
    "Search in BST": "search-in-a-binary-search-tree",
    "Insert into BST": "insert-into-a-binary-search-tree",
    "Lowest Common Ancestor of BST": "lowest-common-ancestor-of-a-binary-search-tree",
    "Two Sum IV in BST": "two-sum-iv-input-is-a-bst",
    "BST Iterator": "binary-search-tree-iterator",
    "Trim BST": "trim-a-binary-search-tree",
    "Design Add and Search Words DS": "design-add-and-search-words-data-structure",

    // Grammatical / naming nuances
    "Kth Largest Element in Array": "kth-largest-element-in-an-array",
    "Maximum XOR of Two Numbers in Array": "maximum-xor-of-two-numbers-in-an-array",
    "Pow(x, n) — Fast Exponentiation": "powx-n",
    "Pow(x, n)": "powx-n",
    "Sqrt(x)": "sqrtx",
    "Sum of Two Integers (without +)": "sum-of-two-integers",
    "Sum of Two Integers (no + operator)": "sum-of-two-integers",
    "Detect Cycle in Directed Graph": "course-schedule",
    "i": "remove-nth-node-from-end-of-list",

    // Stock series — slash in title
    "Best Time to Buy/Sell Stock": "best-time-to-buy-and-sell-stock",
    "Best Time to Buy/Sell Stock II": "best-time-to-buy-and-sell-stock-ii",
    "Best Time to Buy/Sell Stock III": "best-time-to-buy-and-sell-stock-iii",
    "Best Time to Buy/Sell Stock IV": "best-time-to-buy-and-sell-stock-iv",

    // Parenthetical descriptions that should be stripped
    "Flood Fill (DFS on grid)": "flood-fill",
    "Number of Islands (DFS/BFS)": "number-of-islands",
    "Word Search (DFS backtrack)": "word-search",
    "Course Schedule (Cycle detection)": "course-schedule",
    "Course Schedule II (Topological sort)": "course-schedule-ii",
    "Clone Graph (BFS/DFS)": "clone-graph",
    "Pacific Atlantic Water Flow (Multi-source DFS)": "pacific-atlantic-water-flow",
    "Surrounded Regions (Border DFS)": "surrounded-regions",
    "Rotting Oranges (Multi-source BFS)": "rotting-oranges",
    "Accounts Merge (Union-Find/DFS)": "accounts-merge",

    // Graph problems with algorithm annotations
    "Floyd-Warshall (Find the City)": "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
    "Topological Sort (Kahn's BFS)": "course-schedule-ii",

    // DP problems with annotations
    "Coin Change (min coins)": "coin-change",
    "Unbounded Knapsack (Coin Change II)": "coin-change-2",
    "Edit Distance (Levenshtein)": "edit-distance",
    "Matrix Chain Multiplication (Burst Balloons)": "burst-balloons",
    "Palindrome Partitioning (DP)": "palindrome-partitioning-ii",
    "Distinct Subsequences (DP)": "distinct-subsequences",

    // Backtracking with annotations
    "Permutations (swap-based)": "permutations",
    "N-Queens (backtracking)": "n-queens",
    "Sudoku Solver (backtracking)": "sudoku-solver",
    "Word Break II (backtracking + DP)": "word-break-ii",

    // Greedy with annotations
    "Jump Game (can reach end?)": "jump-game",
    "Jump Game II (min jumps)": "jump-game-ii",
    "Gas Station (circular route)": "gas-station",
    "Candy (two-pass greedy)": "candy",
    "Task Scheduler (greedy/math)": "task-scheduler",
    "Meeting Rooms II (min rooms)": "meeting-rooms-ii",
    "Partition Labels (greedy intervals)": "partition-labels",
    "Non-overlapping Intervals (greedy)": "non-overlapping-intervals",
    "Minimum Number of Arrows to Burst Balloons": "minimum-number-of-arrows-to-burst-balloons",

    // Trie annotations
    "Design Add and Search Words Data Structure (Wildcard Trie)": "design-add-and-search-words-data-structure",
    "Word Search II (Trie + DFS)": "word-search-ii",

    // Sliding window / Two pointer annotations
    "Container With Most Water (two pointers)": "container-with-most-water",
    "Trapping Rain Water (two pointers/stack)": "trapping-rain-water",

    // Math / Bit annotations
    "Single Number (XOR)": "single-number",
    "Number of 1 Bits (Hamming Weight)": "number-of-1-bits",
    "Counting Bits (DP + Bit)": "counting-bits",
    "Reverse Bits (bit manipulation)": "reverse-bits",
    "Missing Number (XOR / Math)": "missing-number",

    // Heap / Priority Queue annotations
    "Kth Largest Element (Quickselect/Heap)": "kth-largest-element-in-an-array",
    "Top K Frequent Elements (Bucket Sort / Heap)": "top-k-frequent-elements",
    "Find Median from Data Stream (two heaps)": "find-median-from-data-stream",
    "Merge K Sorted Lists (min heap)": "merge-k-sorted-lists",
    "Sliding Window Maximum (Deque)": "sliding-window-maximum",

    // Tree annotations
    "Lowest Common Ancestor (BST)": "lowest-common-ancestor-of-a-binary-search-tree",
    "Lowest Common Ancestor (Binary Tree)": "lowest-common-ancestor-of-a-binary-tree",
    "Serialize and Deserialize Binary Tree (BFS/DFS)": "serialize-and-deserialize-binary-tree",
    "Binary Tree Maximum Path Sum (hard DFS)": "binary-tree-maximum-path-sum",

    // Linked list annotations
    "Linked List Cycle (Floyd's)": "linked-list-cycle",
    "Linked List Cycle II (start of cycle)": "linked-list-cycle-ii",
    "Reverse Nodes in k-Group (hard)": "reverse-nodes-in-k-group",
    "LRU Cache (DLL + HashMap)": "lru-cache",
    "Copy List with Random Pointer (interleave trick)": "copy-list-with-random-pointer",

    // Segment Tree / BIT annotations
    "Range Sum Query – Mutable (BIT/Segment Tree)": "range-sum-query-mutable",

    // Intervals
    "Merge Intervals (sort + merge)": "merge-intervals",
    "Insert Interval (greedy)": "insert-interval",
};

/**
 * Generate a LeetCode-style slug from a question title.
 * Checks SLUG_OVERRIDES first.
 */
function generateSlug(questionText) {
    if (!questionText || typeof questionText !== 'string') return '';
    const trimmed = questionText.trim();

    if (SLUG_OVERRIDES[trimmed]) {
        return SLUG_OVERRIDES[trimmed];
    }

    let clean = trimmed;

    // Strip trailing parenthetical if it exists, e.g. "Some Problem (Extra Info)"
    if (clean.includes('(') && clean.endsWith(')')) {
        clean = clean.replace(/\s*\([^)]*\)$/, '');
    }

    // Strip trailing "/ Alternate Name"
    if (clean.includes(' / ')) {
        clean = clean.split(' / ')[0].trim();
    }

    // Strip trailing em-dash or en-dash annotations, e.g. "Pow(x, n) — Fast Exponentiation"
    if (clean.includes(' — ')) {
        clean = clean.split(' — ')[0].trim();
    } else if (clean.includes(' - ')) {
        clean = clean.split(' - ')[0].trim();
    }

    return clean
        .toLowerCase()
        .replace(/['']/g, '')        // Remove apostrophes
        .replace(/[^a-z0-9]+/g, '-') // Non-alphanumeric → hyphens
        .replace(/^-+|-+$/g, '');    // Trim leading/trailing hyphens
}

module.exports = {
    SLUG_OVERRIDES,
    generateSlug
};
