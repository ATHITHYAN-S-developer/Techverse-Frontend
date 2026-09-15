/**
 * TechVerse Company Preparation Blueprints
 * In-depth recruitment rounds, eligibility, exam patterns, and mock test roadmaps.
 */

export const COMPANIES_DATA = [
  {
    id: "zoho",
    name: "Zoho Corporation",
    slug: "zoho",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zoho_Corporation_logo.svg/320px-Zoho_Corporation_logo.svg.png",
    tagline: "Product Engineering & Software Development",
    packageRange: "₹6.0 LPA – ₹8.5 LPA",
    eligibility: "BE/B.Tech (All Branches) • No standing arrears • CGPA > 6.5",
    description: "Zoho recruitment focuses rigorously on C/Java fundamentals, pure problem solving without standard libraries, and advanced application design.",
    rounds: [
      {
        round: "Round 1",
        title: "Basic Programming & Aptitude",
        duration: "90 mins",
        details: "25 Aptitude questions (Speed math, P&L, Time & Work) + 10 Flowchart & C-output prediction MCQs.",
        tips: "Focus on pointer arithmetic, loops, recursion call stacks, and bitwise operations."
      },
      {
        round: "Round 2",
        title: "Basic Coding & Pattern Programming",
        duration: "120 mins",
        details: "5 coding problems in C/C++/Java. Matrix rotations, string manipulations, number series, pattern printing.",
        tips: "Do not use built-in string reverse or sort methods. Implement clean logic from scratch."
      },
      {
        round: "Round 3",
        title: "Advanced Problem Solving",
        duration: "180 mins",
        details: "Complex algorithmic challenges like Sudoku Solver, Railway Reservation mini-engine, or Taxi Booking simulation.",
        tips: "Write clean modular code with functions and structured data models."
      },
      {
        round: "Round 4",
        title: "Technical & HR Interview",
        duration: "45 mins",
        details: "Live code walkthrough, core CS fundamentals (OOP, DBMS, OS), project review, and cultural fitment.",
        tips: "Be transparent about your thought process while debugging live code."
      }
    ],
    sampleQuestions: [
      "Print pattern: Spiral number matrix of N x N.",
      "Check if a string is a substring of another without using strstr().",
      "Design a mini Snake and Ladder game in pure console C/Java.",
      "Evaluate algebraic expression string containing brackets (+, -, *, /)."
    ]
  },
  {
    id: "tcs",
    name: "Tata Consultancy Services (TCS)",
    slug: "tcs",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Tata_Consultancy_Services_Logo.svg/320px-Tata_Consultancy_Services_Logo.svg.png",
    tagline: "TCS NQT • Ninja & Digital Cadre",
    packageRange: "₹3.6 LPA (Ninja) / ₹7.2 LPA (Digital) / ₹9.0 LPA (Prime)",
    eligibility: "BE/B.Tech (All Branches) • 60% throughout 10th, 12th, and UG",
    description: "TCS National Qualifier Test (NQT) assesses Foundation cognitive skills and Advanced coding logic.",
    rounds: [
      {
        round: "Round 1",
        title: "TCS NQT Cognitive & Tech Assessment",
        duration: "120 mins",
        details: "Section A: Numerical, Verbal, Reasoning Ability. Section B: Advanced Quantitative + 2 Hands-on Coding questions.",
        tips: "Practice TCS-specific question types like Probability, Data Sufficiency, and Array sorting."
      },
      {
        round: "Round 2",
        title: "Technical Interview (TR)",
        duration: "30-45 mins",
        details: "Questions on Data Structures, SQL queries (Joins, Indexing), Software Engineering, and final year projects.",
        tips: "Prepare 2 favorite subjects thoroughly (e.g., DBMS and DSA)."
      },
      {
        round: "Round 3",
        title: "Managerial & HR Interview (MR/HR)",
        duration: "20 mins",
        details: "Scenario-based conflict resolution, willingness to relocate, work shift flexibility.",
        tips: "Demonstrate strong communication and adaptability."
      }
    ],
    sampleQuestions: [
      "Given a series 1, 2, 1, 3, 2, 5, 3, 7... find the Nth term.",
      "Given an array of integers, segregate 0s, 1s, and 2s in one pass (Dutch National Flag).",
      "SQL query to find the 2nd highest salary department-wise."
    ]
  },
  {
    id: "infosys",
    name: "Infosys",
    slug: "infosys",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Infosys_logo.svg/320px-Infosys_logo.svg.png",
    tagline: "Systems Engineer (SE) & Specialist Programmer (SP)",
    packageRange: "₹3.6 LPA (SE) / ₹6.5 LPA (DSE) / ₹9.5 LPA (SP)",
    eligibility: "65% or 6.5 CGPA in graduation • No active backlogs",
    description: "Infosys recruitment tests logical reasoning, critical thinking, pseudo-code analysis, and dynamic programming.",
    rounds: [
      {
        round: "Round 1",
        title: "Online Test (HackWithInfy / InfyTQ / Campus)",
        duration: "100 mins",
        details: "Reasoning Ability (15 Qs), Technical Ability / Pseudo-code (10 Qs), Numerical Ability (10 Qs), Verbal (20 Qs), Puzzle Solving (4 Qs).",
        tips: "Time allocation is crucial; puzzle solving tests pattern deduction under strict timers."
      },
      {
        round: "Round 2",
        title: "Technical + HR Composite Interview",
        duration: "35 mins",
        details: "OOP concepts in Java/Python, Exception handling, Web fundamentals, and project discussions.",
        tips: "Explain your college projects with clear architectural diagrams."
      }
    ],
    sampleQuestions: [
      "Find the longest palindrome subsequence using dynamic programming.",
      "Pseudo-code recursive trace with static variable increments.",
      "Design an interface in Java for multiple payment gateways."
    ]
  },
  {
    id: "cognizant",
    name: "Cognizant Technology Solutions (CTS)",
    slug: "cognizant",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Cognizant_logo_2022.svg/320px-Cognizant_logo_2022.svg.png",
    tagline: "GenC, GenC Elevate & GenC Next",
    packageRange: "₹4.0 LPA (GenC) / ₹4.5 LPA (Elevate) / ₹6.75 LPA (Next)",
    eligibility: "60% aggregate in 10th, 12th, and Diploma/UG • Max 1 standing backlog allowed at test time",
    description: "Cognizant recruitment uses AMCAT or Superset platforms focusing on quantitative reasoning and domain skill evaluation.",
    rounds: [
      {
        round: "Round 1",
        title: "Cognitive & Technical Assessment",
        duration: "100 mins",
        details: "Automata Fix (debugging code snippets) + Data Interpretation + Verbal Ability.",
        tips: "Automata Fix requires finding logical bugs in 7 pre-written code snippets in 20 minutes."
      },
      {
        round: "Round 2",
        title: "Technical Interview",
        duration: "30 mins",
        details: "Core branch subjects, Cloud basics, Git commands, and basic SQL.",
        tips: "Highlight hands-on certifications like AWS or Python."
      }
    ],
    sampleQuestions: [
      "Fix bug in binary search implementation that causes infinite loop.",
      "Write SQL query to find employees who joined in the last 6 months with salary > ₹50,000.",
      "Explain difference between Process and Thread in OS."
    ]
  },
  {
    id: "amazon",
    name: "Amazon",
    slug: "amazon",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/320px-Amazon_logo.svg.png",
    tagline: "Software Development Engineer (SDE-1)",
    packageRange: "₹28.0 LPA – ₹44.0 LPA",
    eligibility: "Open to CSE/IT/ECE/AI&DS • Strong DSA proficiency",
    description: "Amazon assessment evaluates deep proficiency in Data Structures & Algorithms, System Design principles, and 16 Leadership Principles.",
    rounds: [
      {
        round: "Round 1",
        title: "Online Assessment (OA 1 & OA 2)",
        duration: "90 mins",
        details: "2 LeetCode Medium/Hard algorithmic questions + Work Simulation / Leadership survey.",
        tips: "Always test edge cases (empty arrays, large constraints up to 10^5, negative numbers)."
      },
      {
        round: "Round 2-4",
        title: "Virtual Onsite Technical Interviews",
        duration: "3 x 60 mins",
        details: "DSA Problem Solving (Trees, Graphs, DP, Heaps) + 20 mins of Leadership Principle behavioral questions per round.",
        tips: "Format behavioral answers using the STAR method (Situation, Task, Action, Result)."
      }
    ],
    sampleQuestions: [
      "Course Schedule (Topological sort with cycle detection).",
      "LRU Cache implementation with O(1) get and put.",
      "Merge K Sorted Linked Lists using Min-Heap."
    ]
  }
];
