/**
 * Daily Assessments & Technical Mock Tests Data
 * Live tests are retrieved dynamically from MongoDB (/api/tests) with rich fallback items.
 */
export const DAILY_TESTS = [
  {
    id: "test-react-js-concepts",
    _id: "test-react-js-concepts",
    title: "Daily Tech Challenge: Modern JavaScript & React Concepts",
    description: "Assess your core skills in closures, event loops, React 19 hooks, and component rendering lifecycles.",
    durationMinutes: 15,
    timeLimitSeconds: 900,
    totalQuestions: 5,
    pointsReward: 15,
    passingPercentage: 60,
    maxViolations: 3,
    category: "Web Engineering",
    department: "CSE",
    difficulty: "Medium",
    questions: [
      {
        id: "q1",
        _id: "q1",
        question: "What is the primary benefit of React 19 Action Hooks (useActionState, useFormStatus)?",
        options: [
          "Automatic form submission state, pending states, and optimistic UI transitions",
          "Direct DOM mutation without virtual DOM reconciliation",
          "Replaces Redux and Zustand entirely for local caching",
          "Bypasses CORS policies in browser requests",
        ],
        correctAnswer: 0,
        explanation: "React 19 Actions automatically manage pending states, error boundaries, and form action handling without manual state boilerplate.",
      },
      {
        id: "q2",
        _id: "q2",
        question: "In JavaScript, what is the output of `typeof NaN`?",
        options: ["'undefined'", "'number'", "'object'", "'nan'"],
        correctAnswer: 1,
        explanation: "In JavaScript, NaN (Not-a-Number) is formally classified as a numeric type (typeof NaN === 'number').",
      },
      {
        id: "q3",
        _id: "q3",
        question: "Which hook should be used to avoid unnecessary recalculations of heavy computational results?",
        options: ["useCallback", "useMemo", "useRef", "useEffect"],
        correctAnswer: 1,
        explanation: "useMemo caches the result of a calculation between re-renders based on its dependency array.",
      },
    ],
  },
  {
    id: "python-mastery-challenge",
    _id: "python-mastery-challenge",
    title: "Daily Assessment: Python Algorithms & Data Structures",
    description: "Daily skill assessment on Python list comprehensions, generators, and complexity.",
    durationMinutes: 10,
    timeLimitSeconds: 600,
    totalQuestions: 3,
    pointsReward: 10,
    passingPercentage: 60,
    maxViolations: 3,
    category: "Programming",
    department: "CSE",
    difficulty: "Easy",
    questions: [
      {
        id: "pq1",
        _id: "pq1",
        question: "What is the average time complexity of searching a key in a Python dictionary (hash map)?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctAnswer: 0,
        explanation: "Python dictionaries use hash tables which provide O(1) average lookup time.",
      },
    ],
  },
];

export default DAILY_TESTS;
