// Mock Data for Student Academic Resources Exchange System
// Pre-populated with realistic campus academic items

const CATEGORY_MAP = {
  textbook: { name: "Textbook", icon: "book-open", color: "blue" },
  drafter: { name: "Engineering Drafter", icon: "compass", color: "purple" },
  calculator: { name: "Scientific Calculator", icon: "calculator", color: "emerald" },
  "lab-coat": { name: "Lab Coat", icon: "shield", color: "teal" },
  notes: { name: "Notes & PYQs", icon: "file-text", color: "amber" },
  "lab-kit": { name: "Lab Kit & Components", icon: "cpu", color: "rose" },
  "drawing-tools": { name: "Drawing Tools & Tubes", icon: "pen-tool", color: "indigo" }
};

const BRANCH_INFO = {
  CSE: { name: "Computer Science & Engineering", color: "bg-blue-100 text-blue-800 border-blue-200" },
  ME: { name: "Mechanical Engineering", color: "bg-orange-100 text-orange-800 border-orange-200" },
  ECE: { name: "Electronics & Communication", color: "bg-purple-100 text-purple-800 border-purple-200" },
  CIVIL: { name: "Civil Engineering", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
};

const CONDITION_INFO = {
  "Brand New": {
    badge: "Brand New",
    rating: 5,
    stars: "★★★★★",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    pillClass: "border-emerald-500 text-emerald-700 bg-emerald-50",
    description: "Pristine, untouched condition. Zero marks, unopened packaging or like-new."
  },
  "Gently Used": {
    badge: "Gently Used",
    rating: 4,
    stars: "★★★★☆",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    pillClass: "border-blue-500 text-blue-700 bg-blue-50",
    description: "Well maintained with minor signs of handling. Fully functional, all scales/pages intact."
  },
  "Marked with Notes": {
    badge: "Marked with Notes",
    rating: 3.5,
    stars: "★★★½☆",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    pillClass: "border-amber-500 text-amber-700 bg-amber-50",
    description: "Contains valuable senior highlights, exam formulas, stickies and solved previous year questions."
  }
};

// Curated SVG placeholders for offline resilience & realistic look
const SVG_PLACEHOLDERS = {
  drafter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%234338ca"/><circle cx="300" cy="200" r="140" fill="%233730a3"/><path d="M220 160 L380 160 L380 180 L240 180 L240 300 L220 300 Z" fill="%23ffffff"/><circle cx="230" cy="170" r="12" fill="%23fbbf24"/><path d="M230 170 L340 280" stroke="%23ffffff" stroke-width="8" stroke-linecap="round"/><circle cx="340" cy="280" r="16" fill="%2360a5fa"/><text x="300" y="350" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23e0e7ff" text-anchor="middle">MINI DRAFTER &amp; SCALES</text></svg>`,
  calculator: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23065f46"/><rect x="220" y="60" width="160" height="280" rx="16" fill="%231f2937" stroke="%2310b981" stroke-width="4"/><rect x="240" y="90" width="120" height="50" rx="6" fill="%23a7f3d0"/><text x="250" y="125" font-family="monospace" font-weight="bold" font-size="20" fill="%23064e3b">fx-991EX</text><rect x="240" y="160" width="22" height="18" rx="3" fill="%234b5563"/><rect x="272" y="160" width="22" height="18" rx="3" fill="%234b5563"/><rect x="304" y="160" width="22" height="18" rx="3" fill="%234b5563"/><rect x="336" y="160" width="22" height="18" rx="3" fill="%23ef4444"/><circle cx="300" cy="210" r="18" fill="%239ca3af"/><text x="300" y="370" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23a7f3d0" text-anchor="middle">SCIENTIFIC CALCULATOR</text></svg>`,
  "lab-coat": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%230f766e"/><path d="M220 80 L300 130 L380 80 L420 180 L370 200 L360 360 L240 360 L230 200 L180 180 Z" fill="%23ffffff"/><path d="M300 130 L300 360" stroke="%23cbd5e1" stroke-width="3"/><rect x="250" y="210" width="30" height="36" rx="4" fill="%23f1f5f9" stroke="%2394a3b8"/><text x="300" y="380" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23ccfbf1" text-anchor="middle">COTTON LAB COAT</text></svg>`,
  textbook: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%231e3a8a"/><rect x="200" y="80" width="180" height="240" rx="8" fill="%23f8fafc" stroke="%233b82f6" stroke-width="6"/><rect x="220" y="110" width="140" height="16" rx="4" fill="%232563eb"/><rect x="220" y="140" width="100" height="10" rx="3" fill="%2394a3b8"/><rect x="220" y="160" width="120" height="10" rx="3" fill="%2394a3b8"/><path d="M220 200 L360 200 L360 280 L220 280 Z" fill="%23dbeafe"/><text x="300" y="360" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23bfdbfe" text-anchor="middle">ENGINEERING TEXTBOOK</text></svg>`,
  notes: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%2378350f"/><rect x="220" y="70" width="160" height="240" rx="6" fill="%23fef3c7"/><line x1="240" y1="120" x2="360" y2="120" stroke="%23d97706" stroke-width="3"/><line x1="240" y1="150" x2="360" y2="150" stroke="%23d97706" stroke-width="2"/><line x1="240" y1="180" x2="340" y2="180" stroke="%23d97706" stroke-width="2"/><line x1="240" y1="210" x2="350" y2="210" stroke="%23d97706" stroke-width="2"/><polygon points="290,190 320,270 300,280" fill="%23f59e0b"/><text x="300" y="350" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23fde68a" text-anchor="middle">TOPPER NOTES &amp; PYQs</text></svg>`,
  "lab-kit": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23881337"/><rect x="200" y="100" width="200" height="180" rx="10" fill="%231e293b" stroke="%23f43f5e" stroke-width="4"/><rect x="240" y="130" width="120" height="70" rx="4" fill="%230f172a"/><circle cx="260" cy="150" r="6" fill="%2322c55e"/><circle cx="280" cy="150" r="6" fill="%23eab308"/><circle cx="300" cy="150" r="6" fill="%23ef4444"/><circle cx="320" cy="150" r="6" fill="%233b82f6"/><path d="M220 240 Q300 270 380 240" stroke="%23fbbf24" stroke-width="6" fill="none"/><text x="300" y="340" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23fecdd3" text-anchor="middle">HARDWARE &amp; SENSOR KIT</text></svg>`,
  "drawing-tools": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="none"><rect width="600" height="400" fill="%23312e81"/><rect x="270" y="60" width="60" height="260" rx="30" fill="%234338ca" stroke="%23818cf8" stroke-width="4"/><path d="M260 120 L340 120" stroke="%23c7d2fe" stroke-width="4"/><path d="M260 260 L340 260" stroke="%23c7d2fe" stroke-width="4"/><text x="300" y="360" font-family="system-ui, sans-serif" font-weight="bold" font-size="20" fill="%23c7d2fe" text-anchor="middle">SHEET HOLDER &amp; COMPASS</text></svg>`
};

const INITIAL_ITEMS = [
  {
    id: "item-101",
    title: "Omega Mini Drafter with 360° Clamp & Canvas Carry Case",
    category: "drafter",
    branch: "ME",
    semester: 1,
    price: 150,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS.drafter,
    description: "Original stainless steel arms, smooth calibrated scales (15cm x 30cm). Clamps securely to all campus drawing hall tables. Kept safely in cushioned waterproof canvas bag.",
    seller: {
      name: "Rahul Sharma",
      year: "Final Year (8th Sem) ME",
      badge: "Verified Senior",
      hostel: "bh-4, Block-40, Room 214",
      phone: "+91 98765 43210",
      whatsapp: "919876543210",
      email: "rahul.me21@college.edu.in",
      availability: "Evenings after 5:30 PM near Central Library"
    },
    postedAt: "2026-10-28",
    views: 42,
    saved: false
  },
  {
    id: "item-102",
    title: "Casio fx-991EX ClassWiz (552 Functions, High-Res Display)",
    category: "calculator",
    branch: "ECE",
    semester: 2,
    price: 300,
    condition: "Brand New",
    photo: SVG_PLACEHOLDERS.calculator,
    description: "Natural textbook display, dual solar + battery power. Has matrix, polynomial equation solver, numerical calculus and vector mode. In flawless condition with original snap-on hard case.",
    seller: {
      name: "Priya Nair",
      year: "3rd Year (5th Sem) ECE",
      badge: "Top Seller",
      hostel: "Shanti devi mittal, Room 108",
      phone: "+91 98123 45678",
      whatsapp: "919812345678",
      email: "priya.ece23@college.edu.in",
      availability: "Available anytime near Campus Cafeteria"
    },
    postedAt: "2026-10-29",
    views: 89,
    saved: false
  },
  {
    id: "item-103",
    title: "White Pure Cotton Lab Coat (Medium / 38 Chest) with Emblem Pocket",
    category: "lab-coat",
    branch: "CSE",
    semester: 1,
    price: 0,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS["lab-coat"],
    description: "Thick premium cotton lab coat required for Chemistry and Physics lab sessions. Freshly washed, ironed, and free of stains. Gifting for free to any 1st year fresher in need!",
    seller: {
      name: "Amit Verma",
      year: "2nd Year (3rd Sem) CSE",
      badge: "Community Donor",
      hostel: "CV Raman Hall, Room 302",
      phone: "+91 97654 32109",
      whatsapp: "919765432109",
      email: "amit.cse24@college.edu.in",
      availability: "Available at Sports Complex Gazebo"
    },
    postedAt: "2026-10-30",
    views: 65,
    saved: false
  },
  {
    id: "item-104",
    title: "Database System Concepts - Silberschatz, Korth (7th Ed International)",
    category: "textbook",
    branch: "CSE",
    semester: 4,
    price: 180,
    condition: "Marked with Notes",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "The gold standard book for DBMS! Contains my handwritten sticky notes on B+ Trees, Normalization, ACID transactions and SQL indexing. Helped me score an A+ in end-sems.",
    seller: {
      name: "Sneha Patel",
      year: "Final Year (7th Sem) CSE",
      badge: "Department Ranker",
      hostel: "Sarojini Naidu Hostel, Room 415",
      phone: "+91 99234 56789",
      whatsapp: "919923456789",
      email: "sneha.cse22@college.edu.in",
      availability: "Available weekdays 4 PM - 6 PM at CS Dept Lawn"
    },
    postedAt: "2026-10-26",
    views: 110,
    saved: true
  },
  {
    id: "item-105",
    title: "Fluid Mechanics & Hydraulic Machinery - Dr. R.K. Bansal (SI Units)",
    category: "textbook",
    branch: "ME",
    semester: 3,
    price: 120,
    condition: "Marked with Notes",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "Complete textbook covering Bernoulli's equation, boundary layer theory and turbines. Book includes previous 5 years solved university numericals glued neatly inside.",
    seller: {
      name: "Vikram Chauhan",
      year: "4th Year (7th Sem) ME",
      badge: "Verified Senior",
      hostel: "Visvesvaraya Hall, Block A-12",
      phone: "+91 98987 65432",
      whatsapp: "919898765432",
      email: "vikram.me22@college.edu.in",
      availability: "Mechanical Workshop Quadrangle"
    },
    postedAt: "2026-10-27",
    views: 54,
    saved: false
  },
  {
    id: "item-106",
    title: "Prismatic Compass & Surveying Leveling Staff Kit with Tripod Bag",
    category: "drafter",
    branch: "CIVIL",
    semester: 3,
    price: 250,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS.drafter,
    description: "Essential for 3rd/4th sem Civil Surveying Field Lab. Prism sighted compass with hairline vane, smooth jewel pivot, plus folding metric leveling staff in good condition.",
    seller: {
      name: "Arpan Mukherjee",
      year: "Final Year (8th Sem) CIVIL",
      badge: "Field Captain",
      hostel: "Aryabhatta Hostel, Room 501",
      phone: "+91 98451 23456",
      whatsapp: "919845123456",
      email: "arpan.civ21@college.edu.in",
      availability: "Civil Surveying Lab after 4:00 PM"
    },
    postedAt: "2026-10-25",
    views: 73,
    saved: false
  },
  {
    id: "item-107",
    title: "Signals and Systems - Alan V. Oppenheim & Alan S. Willsky (2nd Ed)",
    category: "textbook",
    branch: "ECE",
    semester: 4,
    price: 0,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "Free senior gift! The must-read guide for CT/DT Fourier, Laplace transform and Z-transforms. Clean spine, zero loose pages. Giving it away free to pass on academic good karma.",
    seller: {
      name: "Ananya Gupta",
      year: "Final Year (7th Sem) ECE",
      badge: "Community Donor",
      hostel: "Gargi Hall, Room 221",
      phone: "+91 97321 65498",
      whatsapp: "919732165498",
      email: "ananya.ece22@college.edu.in",
      availability: "ECE Seminar Hall or Main Canteen"
    },
    postedAt: "2026-10-31",
    views: 132,
    saved: false
  },
  {
    id: "item-108",
    title: "Design of Steel Structures (IS 800:2007 Limit State) - N. Subramanian",
    category: "textbook",
    branch: "CIVIL",
    semester: 6,
    price: 200,
    condition: "Brand New",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "Comprehensive book on welded connections, plate girders, tension/compression members. Bought new and barely touched as semester was conducted partly online. Like brand new.",
    seller: {
      name: "Rohan Deshmukh",
      year: "4th Year (8th Sem) CIVIL",
      badge: "Verified Senior",
      hostel: "Hostel 2, Room 112",
      phone: "+91 98670 12345",
      whatsapp: "919867012345",
      email: "rohan.civ22@college.edu.in",
      availability: "Near Civil Dept Notice Board"
    },
    postedAt: "2026-10-24",
    views: 48,
    saved: false
  },
  {
    id: "item-109",
    title: "Complete 8085 / 8086 Microprocessor Kit with 60+ Jumper Wires & LEDs",
    category: "lab-kit",
    branch: "ECE",
    semester: 5,
    price: 190,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS["lab-kit"],
    description: "Includes solderless breadboard, 8255 Programmable Peripheral Interface chip, 7-segment display module, logic probes, and multicolored jumper wires. Fully tested and working.",
    seller: {
      name: "Karthik Sundaram",
      year: "Final Year (7th Sem) ECE",
      badge: "Robotics Club Lead",
      hostel: "Bhabha Hall, Room 310",
      phone: "+91 99401 23456",
      whatsapp: "919940123456",
      email: "karthik.ece22@college.edu.in",
      availability: "Makerspace Lab 1st Floor"
    },
    postedAt: "2026-10-27",
    views: 95,
    saved: false
  },
  {
    id: "item-110",
    title: "Higher Engineering Mathematics - Dr. B.S. Grewal (44th Golden Jubilee Ed)",
    category: "textbook",
    branch: "CSE",
    semester: 1,
    price: 0,
    condition: "Marked with Notes",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "The bible of engineering math for Sem 1 & 2 (Calculus, Differential Equations, Linear Algebra). Features formula cheat sheets stapled into the inside covers by departmental topper.",
    seller: {
      name: "Divya Rao",
      year: "3rd Year (5th Sem) CSE",
      badge: "Gold Medalist",
      hostel: "Mother Teresa Hall, Room 204",
      phone: "+91 98220 54321",
      whatsapp: "919822054321",
      email: "divya.cse23@college.edu.in",
      availability: "Reading Room, Central Library"
    },
    postedAt: "2026-10-31",
    views: 210,
    saved: true
  },
  {
    id: "item-111",
    title: "Expandable Engineering Drawing Sheet Storage Tube with Adjustable Strap",
    category: "drawing-tools",
    branch: "ME",
    semester: 2,
    price: 90,
    condition: "Brand New",
    photo: SVG_PLACEHOLDERS["drawing-tools"],
    description: "Heavy duty telescopic cylinder tube for carrying A1 and A2 drawing sheets safely in rain or wind. Waterproof locking cap with shoulder strap. Brand new, never used.",
    seller: {
      name: "Sameer Qureshi",
      year: "3rd Year (6th Sem) ME",
      badge: "Verified Senior",
      hostel: "Hostel 5, Wing C, Room 102",
      phone: "+91 98111 22334",
      whatsapp: "919811122334",
      email: "sameer.me23@college.edu.in",
      availability: "Engineering Graphics Lab"
    },
    postedAt: "2026-10-29",
    views: 38,
    saved: false
  },
  {
    id: "item-112",
    title: "Environmental Engineering Vol 1 & 2 - S.K. Garg (Water Supply & Sewage)",
    category: "textbook",
    branch: "CIVIL",
    semester: 5,
    price: 160,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "Standard reference for water purification, pipeline hydraulics, sedimentation tanks and aeration designs. Clean text with key formulas highlighted in yellow.",
    seller: {
      name: "Pooja Kulkarni",
      year: "Final Year (8th Sem) CIVIL",
      badge: "Verified Senior",
      hostel: "Sarojini Naidu Hall, Room 318",
      phone: "+91 98888 77665",
      whatsapp: "919888877665",
      email: "pooja.civ21@college.edu.in",
      availability: "Environmental Engg Lab Lobby"
    },
    postedAt: "2026-10-23",
    views: 52,
    saved: false
  },
  {
    id: "item-113",
    title: "Operating Systems Principles (Three Easy Pieces + Galvin Reference Set)",
    category: "notes",
    branch: "CSE",
    semester: 5,
    price: 0,
    condition: "Marked with Notes",
    photo: SVG_PLACEHOLDERS.notes,
    description: "Spiral-bound printed notes with custom diagrammatic explanations of CPU scheduling, Virtual Memory, Paging, Deadlocks and Semaphore mutex synchronization. Free donation!",
    seller: {
      name: "Harish Venkat",
      year: "Final Year (7th Sem) CSE",
      badge: "Community Donor",
      hostel: "Tagore Hostel, Room 408",
      phone: "+91 97766 55443",
      whatsapp: "919776655443",
      email: "harish.cse22@college.edu.in",
      availability: "Near Computing Lab 3"
    },
    postedAt: "2026-10-31",
    views: 147,
    saved: false
  },
  {
    id: "item-114",
    title: "Theory of Machines & Mechanisms - S.S. Rattan (McGraw Hill)",
    category: "textbook",
    branch: "ME",
    semester: 4,
    price: 175,
    condition: "Gently Used",
    photo: SVG_PLACEHOLDERS.textbook,
    description: "Covers slider crank mechanisms, gear trains, gyroscopic couples, governor design and balancing. Super clean copy with no pages missing or folded.",
    seller: {
      name: "Devendra Patel",
      year: "3rd Year (6th Sem) ME",
      badge: "Verified Senior",
      hostel: "Visvesvaraya Hall, Room 209",
      phone: "+91 98334 11223",
      whatsapp: "919833411223",
      email: "devendra.me23@college.edu.in",
      availability: "Mechanical Seminar Hall foyer"
    },
    postedAt: "2026-10-20",
    views: 61,
    saved: false
  },
  {
    id: "item-115",
    title: "Casio fx-82MS 2nd Gen Scientific Calculator (240 Functions)",
    category: "calculator",
    branch: "CIVIL",
    semester: 1,
    price: 130,
    condition: "Brand New",
    photo: SVG_PLACEHOLDERS.calculator,
    description: "Brand new unopened spare calculator. 2-line display, fraction calculations, coordinate conversion and permutations. Great for 1st sem physics and civil mechanics.",
    seller: {
      name: "Tanya Sen",
      year: "2nd Year (3rd Sem) CIVIL",
      badge: "Verified Student",
      hostel: "Kalpana Chawla Bhawan, Room 314",
      phone: "+91 98444 33221",
      whatsapp: "919844433221",
      email: "tanya.civ24@college.edu.in",
      availability: "Hostel visitor lounge"
    },
    postedAt: "2026-10-28",
    views: 45,
    saved: false
  },
  {
    id: "item-116",
    title: "Digital Logic Design & Verilog Lab Kit with Breadboard & Logic ICs",
    category: "lab-kit",
    branch: "ECE",
    semester: 3,
    price: 210,
    condition: "Marked with Notes",
    photo: SVG_PLACEHOLDERS["lab-kit"],
    description: "Includes 7408 AND, 7432 OR, 7404 NOT, 7486 XOR gates, 555 Timer IC, DIP switches, patch cables and quick reference pinout chart. Ready for digital electronics lab.",
    seller: {
      name: "Manish Joshi",
      year: "3rd Year (5th Sem) ECE",
      badge: "Verified Senior",
      hostel: "Aryabhatta Hostel, Room 102",
      phone: "+91 98555 66778",
      whatsapp: "919855566778",
      email: "manish.ece23@college.edu.in",
      availability: "ECE Hardware Lab"
    },
    postedAt: "2026-10-26",
    views: 82,
    saved: false
  }
];
