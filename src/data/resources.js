/**
 * VCET Tech Hub - Master Resources Catalog
 * Easy to extend: simply add a new object to the array.
 * Data-driven architecture handles automatic rendering in the corresponding section.
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
  // 1. APTITUDE APPS & PLATFORMS (#aptitude)
  // ==========================================
  {
    id: "indiabix",
    name: "IndiaBIX",
    description:
      "Comprehensive aptitude practice covering quantitative aptitude, logical reasoning, verbal ability, and technical interview questions with step-by-step solutions.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Web / Android",
    url: "https://www.indiabix.com",
    tags: ["Aptitude", "Quantitative", "Logical Reasoning", "Placements"],
    featured: true,
  },
  {
    id: "pocket-aptitude",
    name: "Pocket Aptitude",
    description:
      "A fast, lightweight mobile training app featuring over 2,500 quantitative questions, practice formulas, and timed mock tests for competitive and placement tests.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Android / iOS",
    url: "https://play.google.com/store/apps/details?id=com.sanket.pocketaptitude",
    tags: ["Aptitude", "Mobile App", "Quantitative", "Formulas"],
  },
  {
    id: "prepinsta",
    name: "PrepInsta",
    description:
      "Dedicated placement preparation repository tailored for top tech companies (TCS, Infosys, Wipro, Cognizant, Accenture) with previous year papers and mock tests.",
    category: "Career",
    type: "aptitude",
    platform: "Web / Android / iOS",
    url: "https://prepinsta.com",
    tags: ["Placements", "Company Specific", "Aptitude", "Coding"],
    featured: true,
  },
  {
    id: "careerride",
    name: "CareerRide",
    description:
      "Curated practice hub with topic-wise aptitude questions, GD discussions, HR interview preparation, and placement papers for campus recruitment drives.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Web",
    url: "https://www.careerride.com",
    tags: ["Aptitude", "Interviews", "Group Discussion", "Reasoning"],
  },
  {
    id: "gfg-aptitude",
    name: "GeeksforGeeks Aptitude",
    description:
      "High-yield quantitative analysis, logical deduction drills, puzzles, and verbal proficiency modules crafted by seasoned software engineers.",
    category: "Programming",
    type: "aptitude",
    platform: "Web / Mobile",
    url: "https://www.geeksforgeeks.org/aptitude-questions-and-answers/",
    tags: ["Aptitude", "Puzzles", "Logic", "Computer Science"],
  },
  {
    id: "smartkeeda",
    name: "Smartkeeda",
    description:
      "Adaptive online test series engine with detailed question-by-question analytics, speed metrics, and topic-wise diagnostic breakdowns.",
    category: "Aptitude",
    type: "aptitude",
    platform: "Web / Android",
    url: "https://www.smartkeeda.com",
    tags: ["Mock Tests", "Analytics", "Quantitative", "Speed Drills"],
  },

  // ==========================================
  // 2. UPDATES APPS & NEWS FEEDS (#updates)
  // ==========================================
  {
    id: "daily-dev",
    name: "daily.dev",
    description:
      "All-in-one developer homepage delivering tailored engineering articles, open-source trends, framework releases, and dev community discussions.",
    category: "Technology News",
    type: "updates",
    platform: "Web / Chrome / Mobile",
    url: "https://daily.dev",
    tags: ["Developer News", "AI", "Open Source", "Coding"],
    featured: true,
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    description:
      "Premier global reporting on tech startups, venture capital funding, AI developments, and product launches across the innovation economy.",
    category: "Technology News",
    type: "updates",
    platform: "Web / Android / iOS",
    url: "https://techcrunch.com",
    tags: ["Startups", "Funding", "AI News", "Industry"],
  },
  {
    id: "hacker-news",
    name: "Hacker News (Y Combinator)",
    description:
      "Intellectually rigorous tech forum highlighting breakthroughs in computer science, software design, cybersecurity, and startup mechanics.",
    category: "Technology News",
    type: "updates",
    platform: "Web",
    url: "https://news.ycombinator.com",
    tags: ["Tech News", "Computer Science", "Startups", "Community"],
  },
  {
    id: "tldr-tech",
    name: "TLDR Tech",
    description:
      "Bite-sized, curated daily newsletter summarizing the most critical tech headlines, AI breakthroughs, and engineering stories in under 5 minutes.",
    category: "Technology News",
    type: "updates",
    platform: "Web / Email",
    url: "https://tldr.tech",
    tags: ["Curated", "AI", "Software", "Daily Brief"],
    featured: true,
  },
  {
    id: "the-verge",
    name: "The Verge",
    description:
      "In-depth technology journalism, hardware teardowns, consumer electronics, and reporting on how technology intersects with modern society.",
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
