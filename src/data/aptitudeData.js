/**
 * TechVerse Placement Aptitude Hub Data
 * Concept guides, formulas, shortcuts, and practice question sets.
 */

export const APTITUDE_CATEGORIES = [
  {
    id: "quant-percentages",
    title: "Percentages & Profit/Loss",
    domain: "Quantitative Aptitude",
    icon: "Percent",
    formulaCount: 8,
    questionCount: 45,
    concepts: [
      "Percentage represents parts per hundred: x% = x/100.",
      "Cost Price (CP) is the purchase price; Selling Price (SP) is the sale price.",
      "Profit = SP - CP (if SP > CP); Loss = CP - SP (if CP > SP).",
      "Profit % = (Profit / CP) * 100; Loss % = (Loss / CP) * 100."
    ],
    formulas: [
      { name: "Multiplying Factor for Increase", expr: "SP = CP * (1 + P%/100)" },
      { name: "Multiplying Factor for Decrease", expr: "SP = CP * (1 - L%/100)" },
      { name: "Successive Discount", expr: "Net Discount = (d1 + d2 - (d1 * d2)/100) %" }
    ],
    examples: [
      {
        q: "An article is sold for ₹840 at a profit of 20%. Find the Cost Price.",
        solution: "SP = CP * 1.20 => 840 = CP * 1.20 => CP = 840 / 1.2 = ₹700."
      }
    ],
    practiceQuestions: [
      {
        id: "pq-1",
        q: "A shopkeeper marks an item 40% above CP and offers a discount of 25%. What is his profit percentage?",
        options: ["5%", "10%", "15%", "20%"],
        correct: 0,
        explanation: "Let CP = 100. Marked Price = 140. Discount = 25% of 140 = 35. SP = 105. Profit = 5%."
      },
      {
        id: "pq-2",
        q: "If the price of petrol increases by 25%, by how much percent must consumption be reduced to keep expenditure constant?",
        options: ["15%", "20%", "25%", "30%"],
        correct: 1,
        explanation: "Reduction % = (r / (100 + r)) * 100 = (25 / 125) * 100 = 20%."
      }
    ]
  },
  {
    id: "quant-time-work",
    title: "Time & Work / Pipes & Cisterns",
    domain: "Quantitative Aptitude",
    icon: "Clock",
    formulaCount: 6,
    questionCount: 40,
    concepts: [
      "If a person completes a work in N days, 1 day's work = 1/N.",
      "Total Work = Efficiency * Time.",
      "Inlet pipe fills (+) work, Outlet pipe drains (-) work."
    ],
    formulas: [
      { name: "Two Workers Together", expr: "Time = (A * B) / (A + B)" },
      { name: "Men-Days-Hours Equivalence", expr: "(M1 * D1 * H1) / W1 = (M2 * D2 * H2) / W2" }
    ],
    examples: [
      {
        q: "Pipe A fills a tank in 6 hrs and Pipe B empties it in 9 hrs. How long to fill together?",
        solution: "Net Rate = 1/6 - 1/9 = (3 - 2)/18 = 1/18. Time = 18 hours."
      }
    ],
    practiceQuestions: [
      {
        id: "pq-3",
        q: "12 men can finish a road project in 16 days. How many men are needed to finish in 8 days?",
        options: ["18", "20", "24", "32"],
        correct: 2,
        explanation: "M1 * D1 = M2 * D2 => 12 * 16 = M2 * 8 => M2 = 24 men."
      }
    ]
  },
  {
    id: "quant-speed-distance",
    title: "Speed, Distance & Trains",
    domain: "Quantitative Aptitude",
    icon: "Zap",
    formulaCount: 7,
    questionCount: 38,
    concepts: [
      "Distance = Speed * Time.",
      "Conversion: 1 km/h = 5/18 m/s; 1 m/s = 18/5 km/h.",
      "Relative Speed: Opposite directions = S1 + S2; Same direction = |S1 - S2|."
    ],
    formulas: [
      { name: "Average Speed (Equal Distances)", expr: "Avg Speed = (2 * S1 * S2) / (S1 + S2)" },
      { name: "Train Crossing Moving Object", expr: "Time = (Length of Train + Length of Object) / Relative Speed" }
    ],
    examples: [
      {
        q: "A person travels from A to B at 40 km/h and returns at 60 km/h. Find average speed.",
        solution: "Avg Speed = (2 * 40 * 60) / (40 + 60) = 4800 / 100 = 48 km/h."
      }
    ],
    practiceQuestions: [
      {
        id: "pq-4",
        q: "Two trains 140m and 160m long run in opposite directions at 60 km/h and 48 km/h. When will they cross each other?",
        options: ["8s", "10s", "12s", "15s"],
        correct: 1,
        explanation: "Total length = 300m. Relative Speed = 108 km/h = 108 * 5/18 = 30 m/s. Time = 300/30 = 10 seconds."
      }
    ]
  },
  {
    id: "logical-blood-relations",
    title: "Blood Relations & Direction Sense",
    domain: "Logical Reasoning",
    icon: "Compass",
    formulaCount: 4,
    questionCount: 30,
    concepts: [
      "Draw family tree diagrams with gender notation (+ for Male, - for Female, = for Married).",
      "Direction Compass: North is UP, South is DOWN, East is RIGHT, West is LEFT.",
      "Pythagorean Theorem: Shortest distance = √(Δx² + Δy²)."
    ],
    formulas: [
      { name: "Displacement", expr: "d = √(east_west_diff² + north_south_diff²)" }
    ],
    examples: [
      {
        q: "Pointing to a photograph, Ramesh said, 'He is the son of the only son of my mother.' How is the person related to Ramesh?",
        solution: "Mother's only son is Ramesh himself. Hence, the person is Ramesh's son."
      }
    ],
    practiceQuestions: [
      {
        id: "pq-5",
        q: "A man walks 6 km North, turns right and walks 8 km. How far is he from his initial starting point?",
        options: ["10 km", "12 km", "14 km", "16 km"],
        correct: 0,
        explanation: "Distance = √(6² + 8²) = √(36 + 64) = √100 = 10 km."
      }
    ]
  }
];
