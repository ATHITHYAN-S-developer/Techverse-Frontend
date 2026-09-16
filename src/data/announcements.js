/**
 * VCET Institutional Announcements Data
 * Live announcements are dynamically fetched from MongoDB (/api/announcements).
 * Provided below are default fallback circulars formatted for the VCET Notice Board.
 */
export const ANNOUNCEMENTS = [
  {
    id: "ann-sih-2026",
    _id: "ann-sih-2026",
    title: "Smart India Hackathon 2026",
    description: "Explore opportunities to build innovative solutions for real-world problems. Internal team registrations and problem statement selections are now open for all engineering streams.",
    content: "Explore opportunities to build innovative solutions for real-world problems. Internal team registrations and problem statement selections are now open for all engineering streams. Selected teams will receive institutional mentorship, hardware prototype funding, and direct sponsorship for the national grand finale.",
    category: "Hackathon",
    priority: "urgent",
    isPinned: true,
    department: "All Departments",
    departmentId: { code: "ALL", name: "All Departments" },
    publishDate: "2026-09-20",
    date: "20 SEP 2026",
    deadline: "28 SEP 2026",
    authorName: "R&D Cell / VCET Hackathon Club",
    linkText: "Register Team",
    linkUrl: "#"
  },
  {
    id: "ann-placement-2026",
    _id: "ann-placement-2026",
    title: "Campus Recruitment Drive 2026",
    description: "Registration is now open for eligible students. Top tier IT and product companies visiting VCET campus for software developer & analyst roles.",
    content: "Registration is now open for eligible 2027 passing out batch students. Ensure your placement profile, resume, and CGPA certifications are updated on the placement portal prior to the pre-placement talk.",
    category: "Placement",
    priority: "high",
    isPinned: false,
    department: "CSE",
    departmentId: { code: "CSE", name: "Computer Science & Engineering" },
    publishDate: "2026-09-18",
    date: "18 SEP 2026",
    deadline: "22 SEP 2026",
    authorName: "Training & Placement Cell",
    linkText: "Apply Now",
    linkUrl: "#"
  },
  {
    id: "ann-exam-2026",
    _id: "ann-exam-2026",
    title: "End Semester Examination Schedule",
    description: "Nov/Dec 2026 End Semester theory and practical timetable published. Hall tickets will be issued through department coordinators.",
    content: "The Controller of Examinations (COE) has released the master timetable for Nov/Dec 2026 End Semester Examinations. Students must check seating arrangements and ensure attendance criteria are satisfied before hall ticket collection.",
    category: "Exam",
    priority: "high",
    isPinned: false,
    department: "All Departments",
    departmentId: { code: "ALL", name: "All Departments" },
    publishDate: "2026-09-24",
    date: "24 SEP 2026",
    deadline: "15 OCT 2026",
    authorName: "Controller of Examinations",
    linkText: "Download Timetable",
    linkUrl: "#"
  },
  {
    id: "ann-techfest-2026",
    _id: "ann-techfest-2026",
    title: "Tech Fest 2026 - Registration Open",
    description: "Annual National Level Technical Symposium featuring paper presentation, code debug, robotics, and paper presentation.",
    content: "VCET invites students across departments to participate in Tech Fest 2026. Register your project demonstrations, AI paper presentations, and algorithmic coding challenges.",
    category: "Event",
    priority: "normal",
    isPinned: false,
    department: "ECE",
    departmentId: { code: "ECE", name: "Electronics & Communication" },
    publishDate: "2026-09-25",
    date: "25 SEP 2026",
    deadline: "05 OCT 2026",
    authorName: "VCET Student Council",
    linkText: "Symposium Portal",
    linkUrl: "#"
  },
  {
    id: "ann-academic-assignment",
    _id: "ann-academic-assignment",
    title: "Assignment Notification & Mini Project Phase-1",
    description: "Submission deadline for Phase 1 Machine Learning & Cloud Computing mini projects extended for AI&DS students.",
    content: "All final year AI&DS students are notified that Phase-1 documentation and GitHub repository links for Machine Learning mini projects must be submitted to the respective lab faculty.",
    category: "Academic",
    priority: "normal",
    isPinned: false,
    department: "AI&DS",
    departmentId: { code: "AI&DS", name: "Artificial Intelligence & Data Science" },
    publishDate: "2026-09-15",
    date: "15 SEP 2026",
    deadline: "20 SEP 2026",
    authorName: "Department HOD Office",
    linkText: "Submit Project",
    linkUrl: "#"
  },
  {
    id: "ann-general-buspass",
    _id: "ann-general-buspass",
    title: "Hostel & Transport Pass Renewal Circular",
    description: "Odd semester college bus pass application and hostel room allocation renewal for 2026-27 academic session.",
    content: "Students utilizing institutional transport facility must renew their route pass at the Administrative Block before 30th September. Hostel residents are requested to clear mess dues and collect updated room RFID passes.",
    category: "General",
    priority: "normal",
    isPinned: false,
    department: "All Departments",
    departmentId: { code: "ALL", name: "All Departments" },
    publishDate: "2026-09-12",
    date: "12 SEP 2026",
    deadline: "30 SEP 2026",
    authorName: "Administrative Office",
    linkText: "Pay Fees Online",
    linkUrl: "#"
  }
];

export default ANNOUNCEMENTS;

