/**
 * Master Resources Dataset - TechVerse (VCET Tech Hub)
 * Organized across 4 Key Technology & Learning Domains:
 * 1. Aptitude Preparation Apps (#aptitude)
 * 2. Apps for Tech Updates (#updates)
 * 3. Websites to Improve Tech Knowledge (#technology)
 * 4. Tech YouTube Channels (#youtube)
 */

export const CATEGORIES = [
  "All",
  "AI",
  "Programming",
  "Cybersecurity",
  "Cloud",
  "Career",
  "Aptitude",
  "Technology News",
  "Research",
];

export const RESOURCES = [
  // ==========================================
  // 1. APTITUDE PREPARATION APPS (#aptitude)
  // ==========================================
  {
    id: "indiabix",
    name: "IndiaBIX",
    description:
      "Comprehensive quantitative aptitude, verbal reasoning, logical deduction, data interpretation, and programming MCQs with step-by-step solutions.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Web / Android",
    url: "https://www.indiabix.com",
    tags: ["Quantitative", "Reasoning", "Verbal", "MCQs", "Placements"],
    featured: true,
  },
  {
    id: "pocket-aptitude",
    name: "Pocket Aptitude",
    description:
      "Lightweight mobile practice tool featuring over 1,800 quantitative questions, practice formulas, and offline mock tests for campus drives.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Android / iOS",
    url: "https://play.google.com/store/apps/details?id=com.pocket.aptitude",
    tags: ["Mobile App", "Formulas", "Offline Practice", "Mock Tests"],
    featured: true,
  },
  {
    id: "prepinsta",
    name: "PrepInsta",
    description:
      "Company-specific placement papers, coding challenges, syllabus breakdowns, and cognitive aptitude prep for TCS, Infosys, Wipro, CTS, and Amazon.",
    category: "Career",
    type: "aptitude",
    platform: "Web / App",
    url: "https://prepinsta.com",
    tags: ["Company Prep", "TCS NQT", "Cognizant", "Interview Questions"],
    featured: true,
  },
  {
    id: "careerride",
    name: "CareerRide",
    description:
      "Topic-wise aptitude tutorials, general knowledge tests, technical interview Q&A, group discussion topics, and HR interview guidance.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Web",
    url: "https://www.careerride.com",
    tags: ["Aptitude", "GD Topics", "HR Questions", "Placement Papers"],
  },
  {
    id: "gfg-aptitude",
    name: "GeeksforGeeks Aptitude",
    description:
      "Dedicated computer science and mathematical aptitude section curated by GfG covering algorithms, combinatorics, probability, and puzzle logic.",
    category: "Programming",
    type: "aptitude",
    platform: "Web",
    url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/",
    tags: ["Math", "Puzzles", "Logic", "Algorithms", "CS Theory"],
  },
  {
    id: "smartkeeda",
    name: "Smartkeeda",
    description:
      "Advanced test series, sectional speed quizzes, detailed performance analytics, and difficulty-rated questions for banking and engineering exams.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Web / Android",
    url: "https://www.smartkeeda.com",
    tags: ["Speed Tests", "Analytics", "Sectional Quizzes", "Exams"],
  },

  // ==========================================
  // 2. APPS FOR TECH UPDATES (#updates)
  // ==========================================
  {
    id: "daily-dev",
    name: "daily.dev",
    description:
      "All-in-one developer homepage delivering custom newsfeeds across 600+ sources covering web frameworks, DevOps, AI models, and open-source releases.",
    category: "Technology News",
    type: "updates",
    platform: "Browser Extension / Mobile",
    url: "https://daily.dev",
    tags: ["Developer News", "Open Source", "Feed", "Community"],
    featured: true,
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    description:
      "Premier venture capital, startup funding, AI breakthroughs, consumer hardware reviews, and Silicon Valley industry analysis dispatches.",
    category: "Technology News",
    type: "updates",
    platform: "Web / App",
    url: "https://techcrunch.com",
    tags: ["Startups", "Venture Capital", "AI Industry", "Tech News"],
    featured: true,
  },
  {
    id: "hacker-news",
    name: "Hacker News (Y Combinator)",
    description:
      "High-signal tech and entrepreneurial community discussions focused on computer science, distributed systems, mathematics, and startup engineering.",
    category: "Technology News",
    type: "updates",
    platform: "Web",
    url: "https://news.ycombinator.com",
    tags: ["Y Combinator", "Engineering", "Discussions", "Computer Science"],
  },
  {
    id: "tldr-tech",
    name: "TLDR Tech",
    description:
      "Curated 5-minute daily newsletter summarizing the most important stories in big tech, scientific breakthroughs, and software engineering.",
    category: "Technology News",
    type: "updates",
    platform: "Newsletter / Web",
    url: "https://tldr.tech",
    tags: ["Newsletter", "Quick Reads", "Daily Brief", "Tech News"],
  },
  {
    id: "the-verge",
    name: "The Verge",
    description:
      "Modern multimedia coverage exploring where technology intersects with science, art, consumer gadgets, and digital culture.",
    category: "Technology News",
    type: "updates",
    platform: "Web / App",
    url: "https://www.theverge.com",
    tags: ["Hardware", "Gadgets", "AI", "Policy"],
  },
  {
    id: "product-hunt",
    name: "Product Hunt",
    description:
      "Daily showcase of the newest technology tools, developer utilities, mobile applications, and AI agent innovations launched worldwide.",
    category: "Technology News",
    type: "updates",
    platform: "Web / Android / iOS",
    url: "https://www.producthunt.com",
    tags: ["New Products", "AI Tools", "Startups", "Innovation"],
  },

  // ==========================================
  // 3. TECHNOLOGY WEBSITES (#technology)
  // ==========================================
  {
    id: "google-ai-studio",
    name: "Google AI Studio",
    description:
      "Fastest way to prototype and build production applications with Google Gemini models. Experiment with multimodal prompts, tune parameters, and export code.",
    category: "AI",
    type: "technology",
    platform: "Web Platform",
    url: "https://aistudio.google.com",
    tags: ["AI", "Gemini", "Multimodal", "API", "Development"],
    featured: true,
  },
  {
    id: "tryhackme",
    name: "TryHackMe",
    description:
      "Hands-on browser-based cybersecurity and ethical hacking training platform designed with gamified virtual machines and guided lab pathways.",
    category: "Cybersecurity",
    type: "technology",
    platform: "Web Platform",
    url: "https://tryhackme.com",
    tags: ["Cybersecurity", "Ethical Hacking", "Networking", "Hands-on Labs"],
    featured: true,
  },
  {
    id: "wired",
    name: "WIRED",
    description:
      "Long-form reporting and cultural analysis covering the frontier of science, artificial intelligence, biotechnology, cybersecurity, and digital business.",
    category: "Research",
    type: "technology",
    platform: "Web",
    url: "https://www.wired.com",
    tags: ["Tech Journalism", "Science", "AI", "Cybersecurity"],
  },
  {
    id: "techradar",
    name: "TechRadar",
    description:
      "Global technology news, expert buying guides, in-depth hardware benchmarks, and comprehensive computing software reviews.",
    category: "Technology News",
    type: "technology",
    platform: "Web",
    url: "https://www.techradar.com",
    tags: ["Hardware", "Reviews", "Software", "Benchmarks"],
  },
  {
    id: "mit-tech-review",
    name: "MIT Technology Review",
    description:
      "Authoritative world-class journalism examining commercial, political, and societal impacts of emerging tech and scientific breakthroughs.",
    category: "Research",
    type: "technology",
    platform: "Web",
    url: "https://www.technologyreview.com",
    tags: ["MIT", "Deep Tech", "Biotech", "AI Research"],
    featured: true,
  },
  {
    id: "anthropic-blog",
    name: "Anthropic Research & Blog",
    description:
      "Frontier research dispatches and safety alignment papers from the creators of Claude. Explore constitutional AI and interpretability research.",
    category: "AI",
    type: "technology",
    platform: "Web",
    url: "https://www.anthropic.com/research",
    tags: ["AI", "Claude", "LLMs", "AI Safety", "Research"],
  },
  {
    id: "openai-blog",
    name: "OpenAI Research",
    description:
      "Official publication gateway for GPT model architectures, Sora video generation, robotics, reasoning models, and AI alignment methodologies.",
    category: "AI",
    type: "technology",
    platform: "Web",
    url: "https://openai.com/news",
    tags: ["AI", "GPT", "Reasoning", "Machine Learning", "Research"],
  },
  {
    id: "freecodecamp",
    name: "freeCodeCamp",
    description:
      "Free interactive curriculum covering responsive web design, algorithms, Python, machine learning, and relational databases with verified certifications.",
    category: "Programming",
    type: "technology",
    platform: "Web",
    url: "https://www.freecodecamp.org",
    tags: ["Programming", "Web Dev", "Python", "Certifications"],
  },
  {
    id: "cloud-skills-boost",
    name: "Google Cloud Skills Boost",
    description:
      "Hands-on labs and certification learning pathways for Google Cloud, Kubernetes, BigQuery data analytics, and generative AI infrastructure.",
    category: "Cloud",
    type: "technology",
    platform: "Web Platform",
    url: "https://www.cloudskillsboost.google",
    tags: ["Cloud", "GCP", "Kubernetes", "DevOps", "Labs"],
  },

  // ==========================================
  // 4. YOUTUBE CHANNELS (#youtube)
  // ==========================================
  {
    id: "matt-wolfe",
    name: "Matt Wolfe",
    description:
      "Curated weekly AI breakdowns, tool roundups, generative art showcases, and approachable deep-dives into consumer technology.",
    category: "AI",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@mreflow",
    tags: ["AI Tools", "AI News", "Generative AI", "Weekly Wrap"],
    featured: true,
  },
  {
    id: "ai-explained",
    name: "AI Explained",
    description:
      "Rigorous technical analyses of frontier LLMs, benchmark evaluations, reasoning capabilities, and peer-reviewed research papers.",
    category: "Research",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@aiexplained-official/videos",
    tags: ["AI Benchmarks", "Research Papers", "LLMs", "Analysis"],
    featured: true,
  },
  {
    id: "two-minute-papers",
    name: "Two Minute Papers",
    description:
      "Host Dr. Károly Zsolnai-Fehér covers cutting-edge computer graphics, neural physics simulators, robotics, and generative vision papers in short, visual videos.",
    category: "Research",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/channel/UCbfYPyITQ-7l4upoX8nvctg",
    tags: ["Computer Graphics", "AI Research", "Simulations", "Physics"],
    featured: true,
  },
  {
    id: "deeplearning-ai",
    name: "DeepLearningAI",
    description:
      "Founded by AI pioneer Andrew Ng. Offers world-class tutorials, developer fireside chats, and foundational coursework in deep learning and machine learning.",
    category: "AI",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/c/deeplearningai",
    tags: ["Andrew Ng", "Machine Learning", "Neural Networks", "Education"],
    featured: true,
  },
  {
    id: "the-ai-advantage",
    name: "The AI Advantage",
    description:
      "Actionable productivity workflows, prompt engineering frameworks, and practical generative AI tutorials for students and knowledge workers.",
    category: "AI",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@aiadvantage",
    tags: ["Prompt Engineering", "Workflows", "Productivity", "ChatGPT"],
  },
  {
    id: "mattvidpro-ai",
    name: "MattVidPro AI",
    description:
      "Fast-paced news, generative video comparisons (Sora, Kling, Runway), and hands-on experiments testing the boundaries of multimodal creative models.",
    category: "AI",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@MattVidPro",
    tags: ["AI Video", "Image Generation", "Creative AI", "Comparisons"],
  },
  {
    id: "fireship",
    name: "Fireship",
    description:
      "High-intensity code tutorials, 100 Seconds of Code summaries, software engineering paradigms, and sharp tech news delivered with humor and speed.",
    category: "Programming",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/@Fireship",
    tags: ["100 Seconds of Code", "Web Dev", "Full Stack", "Tech News"],
    featured: true,
  },
  {
    id: "anastasi-in-tech",
    name: "Anastasi In Tech",
    description:
      "Semiconductor manufacturing physics, extreme ultraviolet (EUV) lithography, AI chip architectures, and quantum computing hardware engineering explained.",
    category: "Research",
    type: "youtube",
    platform: "YouTube",
    url: "https://www.youtube.com/c/AnastasiInTech",
    tags: ["Hardware", "Semiconductors", "Chips", "ASML", "Physics"],
  },
];
