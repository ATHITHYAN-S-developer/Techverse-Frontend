/**
 * TechVerse Technical Courses Catalog
 * Dynamic course catalog with rich initial courses matching backend seed.
 */

export const COURSES = [
  {
    id: "python-mastery",
    _id: "python-mastery",
    title: "Python Programming Masterclass",
    slug: "python-mastery",
    description: "Master Python fundamentals, OOP, data structures, and algorithms for engineering applications.",
    category: "Programming",
    level: "Beginner to Intermediate",
    instructor: "Dr. K. Sathish Kumar (CSE)",
    duration: "30 Days",
    totalModules: 5,
    totalTests: 5,
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    progress: 40,
  },
  {
    id: "fullstack-mern",
    _id: "fullstack-mern",
    title: "Full Stack Web Development (MERN)",
    slug: "fullstack-mern",
    description: "Build scalable modern web applications with React 19, Node.js, Express, and MongoDB.",
    category: "Web Development",
    level: "Intermediate",
    instructor: "Dr. S. K. Nandhakumar (CSE)",
    duration: "45 Days",
    totalModules: 6,
    totalTests: 6,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    progress: 25,
  },
  {
    id: "applied-ai-ml",
    _id: "applied-ai-ml",
    title: "Applied Machine Learning & Deep Learning",
    slug: "applied-ai-ml",
    description: "Hands-on machine learning with Scikit-learn, PyTorch, computer vision, and NLP.",
    category: "AI & Data Science",
    level: "Advanced",
    instructor: "Dr. M. Kavitha (AI&DS)",
    duration: "40 Days",
    totalModules: 5,
    totalTests: 5,
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60",
    progress: 0,
  }
];

export default COURSES;
