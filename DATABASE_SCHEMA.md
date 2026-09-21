# 🍃 TechVerse — Full MongoDB Database Schema & Architecture

This document contains the complete, production-ready **MongoDB Database Schema** for the **TechVerse (VCET Educational Platform)**.

---

## 📌 Database Structure Overview (`techverse_db`)

```
techverse_db
│
├── 👥 users             → Students, Teachers, and Admins (RBAC)
├── 🏛️ departments       → The 7 VCET Branches (CSE, AI&DS, ECE, IT, EEE, MECH, CIVIL)
├── 🏫 classes           → Department + Year + Section separation (e.g. II CSE - A)
├── 📚 subjects          → Semester-wise curriculum & 5-unit syllabus
├── 📁 resources         → Notes, PDFs, question banks, lab manuals, and software
├── 📢 announcements     → College-wide circulars, hackathons, and placement alerts
├── 🎓 courses           → Self-paced skill courses (Python, Java, Cloud, AI/ML)
├── 📖 course_modules    → Step-by-step video & reading modules per course
├── 📈 enrollments       → Student course progress, streaks, and completion state
├── 📝 daily_tests       → Module-wise daily tests & quizzes
├── 🧪 test_attempts     → Student test scores, answers, and pass/fail logs
├── ⭐ points            → Gamified points (streaks, daily tests, bonuses)
├── 📜 certificates      → Auto-generated verifiable completion certificates
├── 👀 visitors          → Aggregated campus visitor & telemetry statistics
└── 📝 audit_logs        → Administrative action history & security audit trail
```

---

## 1. 👥 `users` Collection

Stores all students, faculty members, and administrators in a single unified collection with strict role-based fields.

### A. Student Document
```json
{
  "_id": "student_001",
  "role": "student",
  "registerNumber": "732924CSE001",
  "name": "Athithya S",
  "departmentId": "cse",
  "year": 2,
  "semester": 3,
  "section": "A",
  "passwordHash": "$2b$10$e8V...hashed_password",
  "isActive": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

### B. Teacher Document
```json
{
  "_id": "teacher_001",
  "role": "teacher",
  "staffId": "VCETFAC102",
  "name": "Dr. K. Ramesh",
  "departmentId": "cse",
  "designation": "Associate Professor",
  "passwordHash": "$2b$10$x7L...hashed_password",
  "isActive": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

### C. Admin Document
```json
{
  "_id": "admin_001",
  "role": "admin",
  "username": "admin_vcet",
  "name": "TechVerse Administrator",
  "passwordHash": "$2b$10$w9Q...hashed_password",
  "isActive": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

> **💡 Account Suspension Rule:**  
> When an admin blocks a user, `"isActive": false` is set. The backend authentication middleware rejects all token generation and protected API requests immediately.

---

## 2. 🏛️ `departments` Collection

The 7 official engineering branches of VCET.

```json
{
  "_id": "cse",
  "code": "CSE",
  "name": "Computer Science & Engineering",
  "icon": "Cpu",
  "description": "Core computing, programming and software development.",
  "isActive": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

**Standard Department IDs:** `cse`, `aids`, `ece`, `it`, `eee`, `mech`, `civil`.

---

## 3. 🏫 `classes` Collection

Organizes students by academic year and section within each department.

```json
{
  "_id": "cse-2-a",
  "departmentId": "cse",
  "year": 2,
  "semester": 3,
  "section": "A",
  "className": "II CSE - A",
  "isActive": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

---

## 4. 📚 `subjects` Collection

Semester-wise academic subjects belonging to a department with 5-unit syllabus outlines.

```json
{
  "_id": "cse-dsa",
  "departmentId": "cse",
  "code": "22CST31",
  "name": "Data Structures & Algorithms",
  "semester": 3,
  "credits": 4,
  "units": [
    {
      "unitNumber": 1,
      "title": "Linear Data Structures",
      "topics": ["Stacks", "Queues", "Linked Lists"]
    },
    {
      "unitNumber": 2,
      "title": "Trees & Binary Search Trees",
      "topics": ["AVL Trees", "B-Trees", "Tree Traversals"]
    },
    {
      "unitNumber": 3,
      "title": "Graph Algorithms",
      "topics": ["BFS", "DFS", "Dijkstra", "Prim's"]
    },
    {
      "unitNumber": 4,
      "title": "Sorting & Searching",
      "topics": ["Quick Sort", "Merge Sort", "Binary Search"]
    },
    {
      "unitNumber": 5,
      "title": "Algorithm Design Paradigms",
      "topics": ["Greedy Algorithms", "Dynamic Programming"]
    }
  ],
  "isActive": true,
  "createdBy": "teacher_001",
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

---

## 5. 📁 `resources` Collection

Stores verified notes, question banks, previous semester question papers, lab manuals, and software tools.

```json
{
  "_id": "resource_001",
  "departmentId": "cse",
  "subjectId": "cse-dsa",
  "title": "DSA Unit 1 Complete Notes",
  "description": "Complete study material and handwritten notes for Unit 1.",
  "type": "notes",
  "fileUrl": "https://storage.vcet.ac.in/notes/dsa-unit1.pdf",
  "downloadUrl": "https://storage.vcet.ac.in/notes/dsa-unit1.pdf",
  "uploadedBy": "teacher_001",
  "isPublished": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

**Supported Resource Types:** `notes`, `question_bank`, `previous_paper`, `software`, `simulator`, `lab_manual`, `video`, `link`.

---

## 6. 📢 `announcements` Collection

Institutional notice board for college-wide circulars, exams, placement alerts, and hackathons.

```json
{
  "_id": "announcement_001",
  "title": "Smart India Hackathon 2026 Registration",
  "content": "All engineering students are requested to submit project abstracts for SIH 2026 internal screening...",
  "category": "Hackathon",
  "priority": "urgent",
  "isPinned": true,
  "targetAudience": "all",
  "departmentId": "all",
  "createdBy": "teacher_001",
  "createdAt": "2026-09-13T15:30:00Z",
  "updatedAt": "2026-09-13T15:30:00Z"
}
```

**Announcement Categories:** `Academic`, `Placement`, `Exam`, `Hackathon`, `Event`, `General`.

---

## 7. 🎓 `courses` Collection

Self-paced technical and programming certification courses accessible across all departments.

```json
{
  "_id": "course_python",
  "title": "Python Programming Masterclass",
  "slug": "python-programming",
  "description": "Learn Python from foundational syntax to advanced object-oriented design and data science.",
  "category": "Programming",
  "level": "Beginner",
  "durationDays": 30,
  "thumbnailUrl": "https://storage.vcet.ac.in/courses/python.jpg",
  "totalModules": 10,
  "totalTests": 10,
  "passingPercentage": 60,
  "certificateEnabled": true,
  "isPublished": true,
  "createdBy": "admin_001",
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

---

## 8. 📖 `course_modules` Collection

Individual chapters and lessons within each course.

```json
{
  "_id": "python-module-01",
  "courseId": "course_python",
  "moduleNumber": 1,
  "title": "Python Basics & Control Flow",
  "description": "Introduction to variables, data types, conditional statements, and loops.",
  "videoUrl": "https://storage.vcet.ac.in/videos/py-mod1.mp4",
  "content": "# Python Basics Markdown Content...",
  "resourceUrls": [
    "https://storage.vcet.ac.in/docs/py-basics-cheatsheet.pdf"
  ],
  "estimatedMinutes": 30,
  "isPublished": true,
  "createdAt": "2026-09-13T10:00:00Z",
  "updatedAt": "2026-09-13T10:00:00Z"
}
```

---

## 9. 📈 `enrollments` Collection

Tracks each student's course progress, active streak, points accumulated, and completion state.

```json
{
  "_id": "enrollment_001",
  "studentId": "student_001",
  "courseId": "course_python",
  "progressPercentage": 40,
  "completedModules": 4,
  "totalModules": 10,
  "currentModule": 5,
  "status": "in_progress",
  "currentStreak": 7,
  "longestStreak": 12,
  "totalPoints": 420,
  "startedAt": "2026-09-01T10:00:00Z",
  "lastActivityAt": "2026-09-13T10:00:00Z",
  "completedAt": null
}
```

---

## 10. 📝 `daily_tests` Collection

Quizzes and module-end tests linked to each course day/module.

```json
{
  "_id": "python-day-01-test",
  "courseId": "course_python",
  "moduleId": "python-module-01",
  "day": 1,
  "title": "Python Basics Daily Quiz",
  "questions": [
    {
      "question": "Which keyword is used to define a function in Python?",
      "options": ["function", "def", "func", "define"],
      "correctAnswer": 1,
      "points": 2
    },
    {
      "question": "What is the output of type([]) in Python?",
      "options": ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "<class 'set'>"],
      "correctAnswer": 1,
      "points": 2
    }
  ],
  "passingPercentage": 60,
  "bonusPoints": 10,
  "isPublished": true,
  "createdAt": "2026-09-13T10:00:00Z"
}
```

---

## 11. 🧪 `test_attempts` Collection

Stores student test submissions, grading results, points awarded, and timestamps.

```json
{
  "_id": "attempt_001",
  "studentId": "student_001",
  "testId": "python-day-01-test",
  "courseId": "course_python",
  "score": 8,
  "totalMarks": 10,
  "percentage": 80,
  "passed": true,
  "pointsEarned": 10,
  "attemptNumber": 1,
  "attemptedAt": "2026-09-13T18:00:00Z"
}
```

---

## 12. ⭐ `points` Collection

Gamified reward system tracking student engagement, test passes, and daily streaks.

```json
{
  "_id": "point_001",
  "studentId": "student_001",
  "courseId": "course_python",
  "type": "daily_test",
  "points": 10,
  "description": "Passed Python Day 1 Assessment",
  "createdAt": "2026-09-13T18:00:00Z"
}
```

### Point Allocation Matrix
| Activity | Points Awarded |
| :--- | :--- |
| Daily Test Passed | `+10 Points` |
| 7-Day Active Streak | `+50 Points` |
| 14-Day Active Streak | `+100 Points` |
| 30-Day Active Streak | `+250 Points` |
| Perfect Score (100%) | `+25 Bonus Points` |
| Full Course Completion | `+500 Points` |

---

## 13. 📜 `certificates` Collection

Automatically generated upon successful course completion with unique verification codes.

```json
{
  "_id": "certificate_001",
  "certificateNumber": "TV-PY-2026-0001",
  "studentId": "student_001",
  "courseId": "course_python",
  "studentName": "Athithya S",
  "courseName": "Python Programming Masterclass",
  "score": 87,
  "verificationCode": "TV8F92K1",
  "certificateUrl": "https://storage.vcet.ac.in/certificates/TV-PY-2026-0001.pdf",
  "issuedAt": "2026-10-01T10:00:00Z"
}
```

---

## 14. 👀 `visitors` Collection

Aggregated campus visitor analytics and route metrics without storing intrusive personal data.

```json
{
  "_id": "2026-09-13",
  "date": "2026-09-13",
  "totalVisits": 458,
  "uniqueVisitors": 321,
  "resourceViews": 540,
  "courseViews": 186,
  "announcementViews": 95
}
```

---

## 15. 📝 `audit_logs` Collection

Comprehensive audit trail for admin tracking of all system modifications.

```json
{
  "_id": "log_001",
  "userId": "teacher_001",
  "role": "teacher",
  "action": "CREATE",
  "resourceType": "announcement",
  "resourceId": "announcement_001",
  "departmentId": "cse",
  "timestamp": "2026-09-13T15:30:00Z"
}
```

```json
{
  "_id": "log_002",
  "userId": "teacher_001",
  "role": "teacher",
  "action": "DELETE",
  "resourceType": "resource",
  "resourceId": "resource_001",
  "departmentId": "cse",
  "timestamp": "2026-09-13T16:15:00Z"
}
```

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| Feature / Action | Admin | Teacher / Faculty | Student |
| :--- | :---: | :---: | :---: |
| **Manage Students (CRUD / Status)** | ✅ | ❌ | ❌ |
| **Add / Block / Delete Teachers** | ✅ | ❌ | ❌ |
| **Manage Departments & Classes** | ✅ | ❌ | ❌ |
| **CRUD Subjects & Syllabus** | ✅ | ✅ *(Own Dept Only)* | ❌ |
| **Upload / Delete Resources** | ✅ | ✅ *(Own Dept Only)* | ❌ |
| **Read & Download E-Resources** | ✅ | ✅ | ✅ |
| **View Announcements** | ✅ | ✅ | ✅ |
| **Publish / Manage Announcements** | ✅ | ✅ *(Own Posts)* | ❌ |
| **Create Courses & Modules** | ✅ | ✅ *(Assigned Courses)* | ❌ |
| **Enroll in Courses & Learn** | ✅ | ❌ | ✅ |
| **Take Daily Tests & Earn Points** | ❌ | ❌ | ✅ |
| **Earn Verifiable Certificates** | ❌ | ❌ | ✅ |
| **View Visitor Analytics** | ✅ | ❌ | ❌ |
| **View Admin Audit Logs** | ✅ | ❌ | ❌ |

---

## 🧠 System Architecture & Workflow

```
                         🍃 TECHVERSE
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
          👑 ADMIN         👨‍🏫 TEACHER       👨‍🎓 STUDENT
             │                │                │
        Full Control     Department CRUD    Read/Download
             │          (Own Department)    Take Tests
             │                │             Earn Points
             └───────────────┬┴────────────────┘
                             │
                    🏛️ COLLEGE SYSTEM
                             │
       ┌─────────────┬───────┼─────────┬─────────────┐
       ▼             ▼       ▼         ▼             ▼
   Departments    Classes  Subjects  Resources  Announcements
                                                       │
                                                       ▼
                                                Common Notice Board
---

## 📁 Recommended Node.js + Express + Mongoose Backend Structure

```
backend/
│
├── models/
│   ├── User.js
│   ├── Department.js
│   ├── Class.js
│   ├── Subject.js
│   ├── Resource.js
│   ├── Announcement.js
│   ├── Course.js
│   ├── CourseModule.js
│   ├── Enrollment.js
│   ├── DailyTest.js
│   ├── TestAttempt.js
│   ├── Point.js
│   ├── Certificate.js
│   ├── Visitor.js
│   └── AuditLog.js
│
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── departments.js
│   ├── subjects.js
│   ├── resources.js
│   ├── announcements.js
│   ├── courses.js
│   ├── tests.js
│   ├── certificates.js
│   └── analytics.js
│
├── middleware/
│   ├── auth.js              // JWT verification
│   ├── role.js              // Admin / Teacher / Student checks
│   └── departmentAccess.js  // Enforces teacher department scope
│
└── server.js
```

---

### 📄 License & Institutional Accreditation
© 2026 **Velalar College of Engineering and Technology (Autonomous)**. Developed for **TechVerse Platform**.
