/**
 * VCET TechVerse - PrepZone & Industry Training Catalog
 * Curated training modules, company test patterns, bootcamps, and career readiness toolkits.
 */

export const TRAINING_TRACKS = [
  {
    id: "prepzone-aptitude",
    title: "PrepZone Aptitude & Reasoning Mastery",
    icon: "Target",
    badge: "Most Popular",
    category: "Aptitude",
    level: "All Years",
    duration: "40 Hours",
    description:
      "Comprehensive quantitative aptitude, logical reasoning, and data interpretation drills tailored for Tier-1 campus recruitments.",
    topics: [
      "Speed Math & Number Systems",
      "Time, Speed, Distance & Work",
      "Profit, Loss & Percentages",
      "Syllogisms, Blood Relations & Seating Arrangements",
      "Data Interpretation & Sufficiency (Tables, Bar/Pie Charts)",
    ],
    resources: [
      {
        name: "IndiaBIX Quantitative Aptitude",
        url: "https://www.indiabix.com/aptitude/questions-and-answers/",
        type: "Practice Questions",
      },
      {
        name: "GeeksforGeeks Placement Aptitude",
        url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/",
        type: "Formula Guides",
      },
      {
        name: "Smartkeeda Free Mock Tests",
        url: "https://www.smartkeeda.com",
        type: "Timed Tests",
      },
    ],
  },
  {
    id: "technical-coding",
    title: "Data Structures & Competitive Coding",
    icon: "Code2",
    badge: "Core Requirement",
    category: "Technical",
    level: "2nd - 4th Year",
    duration: "60 Hours",
    description:
      "Intensive algorithmic problem-solving in Python, Java, and C++ covering high-frequency technical interview coding patterns.",
    topics: [
      "Array Two-Pointer & Sliding Window Techniques",
      "Binary Search & Recursion Backtracking",
      "Linked Lists, Stacks & Monotonic Queues",
      "Tree Traversals (BST, Lowest Common Ancestor)",
      "Dynamic Programming & Graph Algorithms (BFS/DFS)",
    ],
    resources: [
      {
        name: "NeetCode 150 Interview Roadmap",
        url: "https://neetcode.io/practice",
        type: "Structured Roadmap",
      },
      {
        name: "LeetCode Top Interview Questions",
        url: "https://leetcode.com/problemset/all/",
        type: "Coding Arena",
      },
      {
        name: "HackerRank Skill Certifications",
        url: "https://www.hackerrank.com/skills-verification",
        type: "Verified Badges",
      },
    ],
  },
  {
    id: "company-specific",
    title: "Company-Specific Recruitment Cracker",
    icon: "Building2",
    badge: "Placement Drive",
    category: "Company Prep",
    level: "3rd & 4th Year",
    duration: "30 Hours",
    description:
      "Pattern-specific preparation for Zoho, TCS NQT, Cognizant GenC/Next, Infosys, Wipro, and Product-based engineering firms.",
    topics: [
      "Zoho Advanced Programming & Round 2/3 System Design",
      "TCS NQT Cognitive & Hands-on Coding Patterns",
      "Cognizant & Accenture Automata Fix & Critical Reasoning",
      "Infosys Pseudo-code & Puzzle Solving Questions",
      "Previous 5 Years VCET Campus Placed Students' Questions",
    ],
    resources: [
      {
        name: "PrepInsta Top MNC Placement Papers",
        url: "https://prepinsta.com",
        type: "Previous Papers",
      },
      {
        name: "CareerRide Company Interview Questions",
        url: "https://www.careerride.com",
        type: "Technical Questions",
      },
    ],
  },
  {
    id: "soft-skills-hr",
    title: "Soft Skills, GD & HR Interview Mastery",
    icon: "Users2",
    badge: "Career Ready",
    category: "Soft Skills",
    level: "All Years",
    duration: "25 Hours",
    description:
      "Professional verbal communication, Group Discussion frameworks, ATS resume building, and behavioral HR interview coaching.",
    topics: [
      "ATS-Friendly Tech Resume & LinkedIn Profile Optimization",
      "Group Discussion (GD) Current Affairs & Stances",
      "STAR Methodology for Behavioral HR Questions",
      "Tell Me About Yourself — 90-Second Executive Pitch",
      "Virtual & In-Person Interview Etiquette",
    ],
    resources: [
      {
        name: "Harvard ATS Resume Templates",
        url: "https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/",
        type: "Resume Templates",
      },
      {
        name: "IndiaBIX HR Interview Questions with Answers",
        url: "https://www.indiabix.com/hr-interview/questions-and-answers/",
        type: "Model Answers",
      },
    ],
  },
  {
    id: "core-engineering",
    title: "Core Engineering Interview Bootcamps",
    icon: "Cpu",
    badge: "Department Specific",
    category: "Core Tech",
    level: "3rd & 4th Year",
    duration: "45 Hours",
    description:
      "Specialized technical preparation for core placements in ECE (VLSI/Embedded), MECH (CAD/FEA/Automation), EEE (Power/EV), and CIVIL (BIM/Structural).",
    topics: [
      "ECE: Verilog HDL, Static Timing Analysis & Microcontrollers (ARM)",
      "MECH: GD&T, SolidWorks Parametric CAD & Thermal Engineering",
      "EEE: Power Electronics Inverters, PLC Automation & Battery Management",
      "CIVIL: AutoCAD, STAAD.Pro & IS 456 RCC Design Calculations",
    ],
    resources: [
      {
        name: "NPTEL Technical Core Placement Series",
        url: "https://nptel.ac.in",
        type: "Video Lectures",
      },
      {
        name: "All About Circuits Technical Forums",
        url: "https://www.allaboutcircuits.com",
        type: "Core Hardware Q&A",
      },
    ],
  },
  {
    id: "industry-certifications",
    title: "Global Industry Certification Pathways",
    icon: "Award",
    badge: "Free Student Vouchers",
    category: "Certifications",
    level: "All Years",
    duration: "Self-Paced",
    description:
      "Verified global industry certification programs providing free vouchers and cloud credits for VCET engineering students.",
    topics: [
      "Google Cloud Career Launchpad & Associate Cloud Engineer",
      "AWS Educate Cloud Practitioner & Serverless Badges",
      "Oracle Cloud Infrastructure (OCI) Free Tier & Certifications",
      "NPTEL Elite & Gold Medal Certification Tracks",
    ],
    resources: [
      {
        name: "Google Cloud Skills Boost for Students",
        url: "https://www.cloudskillsboost.google",
        type: "Free Badges",
      },
      {
        name: "AWS Educate Free Student Portal",
        url: "https://aws.amazon.com/education/awseducate/",
        type: "Cloud Credits",
      },
    ],
  },
];

export const UPCOMING_BOOTCAMPS = [
  {
    id: "bootcamp-zoho-2026",
    title: "Zoho Corporation Intensive Coding & Design Bootcamp",
    trainer: "VCET Placement Cell & Zoho Alumni Network",
    date: "Sep 22 - Sep 26, 2026",
    time: "04:30 PM - 06:30 PM IST",
    mode: "Hybrid (Placement Lab 3 & Google Meet)",
    eligible: "3rd & Final Year (CSE, IT, AI&DS, ECE)",
    seats: "120 Seats Remaining",
    status: "Registration Open",
    tags: ["Zoho", "Advanced Coding", "Round 2 & 3"],
  },
  {
    id: "bootcamp-tcs-nqt",
    title: "TCS National Qualifier Test (NQT 2026) Complete Crash Course",
    trainer: "Corporate Training Partner & Senior Faculty",
    date: "Oct 05 - Oct 10, 2026",
    time: "09:00 AM - 04:00 PM IST",
    mode: "Campus Auditorium & Online Test Labs",
    eligible: "All 2026 & 2027 Passing Batches",
    seats: "Open for All Students",
    status: "Upcoming",
    tags: ["TCS NQT", "Cognitive", "Automata Fix"],
  },
  {
    id: "bootcamp-cloud-devops",
    title: "AWS Cloud & DevOps 30-Day Practical Hands-on Series",
    trainer: "AWS Certified Solutions Architect & Guest Faculty",
    date: "Oct 15 - Nov 15, 2026",
    time: "Weekend Sessions (10:00 AM - 01:00 PM)",
    mode: "Live Cloud Sandbox Labs",
    eligible: "2nd, 3rd & Final Year (All Branches)",
    seats: "85 Seats Remaining",
    status: "Upcoming",
    tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
  },
];

export const COMPANY_MOCK_TESTS = [
  {
    company: "Zoho Corporation",
    role: "Software Development Engineer (SDE)",
    rounds: "4 Rounds (Aptitude -> Basic Code -> Advanced Programming -> Tech HR)",
    salary: "₹6.5 - ₹10.0 LPA",
    sampleQuestions: [
      "Print pattern without using two loops (Spiral Matrix / Diamond)",
      "Find shortest path in 2D maze with obstacle walls",
      "Design a railway reservation system console application (Round 3)",
    ],
    testLink: "https://www.geeksforgeeks.org/zoho-interview-questions/",
    pattern: "Heavy focus on pure C/Java logic without built-in libraries.",
  },
  {
    company: "TCS (Ninja & Digital)",
    role: "System Engineer / Digital Innovator",
    rounds: "3 Rounds (TCS NQT Cognitive + Hands-on Coding -> Technical -> HR)",
    salary: "₹3.6 - ₹7.5 LPA",
    sampleQuestions: [
      "Find number of unique sub-arrays with sum equal to target K",
      "String compression & run-length encoding with frequency count",
      "Evaluate mathematical infix/postfix expression with parentheses",
    ],
    testLink: "https://prepinsta.com/tcs-nqt/",
    pattern: "Aptitude + 2 Hands-on Coding Questions in 45 minutes.",
  },
  {
    company: "Cognizant (GenC / GenC Next)",
    role: "Programmer Analyst Trainee",
    rounds: "3 Rounds (Communication -> Automata Fix & Code -> Tech Interview)",
    salary: "₹4.0 - ₹6.75 LPA",
    sampleQuestions: [
      "Debug error in given binary search code snippet (Automata Fix)",
      "SQL Query: Find 2nd highest salary department-wise using window functions",
      "Reverse alternate K nodes in a singly linked list",
    ],
    testLink: "https://www.sanfoundry.com",
    pattern: "Debugging/Pseudo-code speed tests + core DBMS and OOPS.",
  },
  {
    company: "Infosys (SE / Specialist Programmer)",
    role: "System Engineer & DSE",
    rounds: "3 Rounds (InfyTQ / HackWithInfy -> Technical -> HR Interview)",
    salary: "₹3.6 - ₹9.5 LPA",
    sampleQuestions: [
      "Longest palindromic substring using dynamic programming",
      "Tree node value transformation with graph cycle detection",
      "Greedy coin change with constraint optimization",
    ],
    testLink: "https://www.indiabix.com",
    pattern: "Strict camera proctoring with timed coding test cases.",
  },
];

export const DOWNLOADABLE_TOOLKITS = [
  {
    title: "Complete Quantitative Aptitude Formula Cheat Sheet (PDF)",
    category: "Formulas & Cheatsheet",
    size: "4.2 MB",
    downloads: "2.4k+ VCET Students",
    url: "https://www.indiabix.com/aptitude/questions-and-answers/",
    desc: "150+ essential formulas for Time & Work, Speed, Permutations, Probability, and Geometry with shortcut tricks.",
  },
  {
    title: "500+ Top HR & Technical Interview Questions with Model Answers",
    category: "Interview Q&A",
    size: "6.8 MB",
    downloads: "3.1k+ VCET Students",
    url: "https://www.geeksforgeeks.org/commonly-asked-interview-questions-on-data-structures/",
    desc: "Curated behavioral questions, STAR method examples, OOPS, OS, and DBMS revision flashcards.",
  },
  {
    title: "ATS-Optimized Engineering Resume Template (.DOCX & LaTeX)",
    category: "Resume Templates",
    size: "1.5 MB",
    downloads: "4.8k+ VCET Students",
    url: "https://careerservices.fas.harvard.edu/resources/bullet-point-resume-template/",
    desc: "Tested 95%+ ATS score resume template formatted specifically for engineering campus drives.",
  },
];
