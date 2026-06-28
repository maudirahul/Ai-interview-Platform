// utils/constants.js

const STACKS = [
  { 
    role: "mern_stack_developer", 
    roleLabel: "MERN Stack Developer",
    coreTopics: [
      "Vanilla JavaScript (Closures, Event Loop, Async/Await, Scopes, ES6+)",
      "React.js Ecosystem (Hooks, Virtual DOM, Context API, Lifecycle)",
      "Node.js & Express.js Runtimes (Middleware architecture, Event Emitters)",
      "MongoDB Database Design (Indexing, Aggregation Pipelines, Mongoose Modeling)"
    ]
  },
  { 
    role: "react_developer", 
    roleLabel: "React Developer",
    coreTopics: [
      "Core JavaScript & Web APIs (DOM manipulation, Asynchronous events)",
      "React Architecture & Advanced Hooks (useState, useEffect, useMemo, useCallback)",
      "State Management Paradigms (Redux Toolkit, Context API, Custom Hooks)",
      "Frontend Performance Optimization (Lazy loading, Code splitting, Component profiling)"
    ]
  },
  { 
    role: "nodejs_developer", 
    roleLabel: "Node.js Developer",
    coreTopics: [
      "Advanced JavaScript (V8 Engine mechanics, Prototypes, Garbage Collection)",
      "Node.js Core Internals (Event Loop, Worker Threads, Streams, Buffer, File System)",
      "Express.js & REST API Architecture (Security wrappers, Rate limiting, Error handling)",
      "Database Integrations & ODM/ORM optimization (SQL/NoSQL connectivity patterns)"
    ]
  },
  { 
    role: "python_developer", 
    roleLabel: "Python Developer",
    coreTopics: [
      "Python Language Fundamentals (Decorators, Generators, Context Managers, OOP)",
      "Web Framework Architectures (Django MVC, Flask/FastAPI REST layers)",
      "Database Modeling & Object-Relational Mapping (SQLAlchemy, Django ORM, Migrations)",
      "Concurrency & Testing Frameworks (Asyncio, Threading, Pytest setups)"
    ]
  },
  { 
    role: "fullstack_developer", 
    roleLabel: "Full Stack Developer",
    coreTopics: [
      "Full-stack JavaScript/Web Foundations (Event driven structures, Browser lifecycle)",
      "Frontend Single Page Applications (React components, Styling layers, State control)",
      "Backend API Engineering & Services (Authentication frameworks, REST/GraphQL systems)",
      "Database Management Systems & Caching (Relational SQL patterns vs NoSQL scaling, Redis)"
    ]
  },
  { 
    role: "java_developer", 
    roleLabel: "Java Developer",
    coreTopics: [
      "Core Java & Functional Programming (Generics, Collections, Streams API, Lambda expressions)",
      "Object-Oriented Design & Principles (SOLID, Design Patterns, Memory allocation)",
      "Spring Boot Framework (Dependency Injection, Spring Security, Spring Data JPA)",
      "Concurrency & Enterprise Architecture (Multithreading internals, JVM Tuning, REST services)"
    ]
  },
  { 
    role: "ai_ml", 
    roleLabel: "AI ML Engineer",
    coreTopics: [
      "Python Infrastructure & Numerical Computing Math (Linear algebra, Probability vectors)",
      "Data Science Operations & Pipeline Engineering (Pandas, NumPy, Scikit-learn pipelines)",
      "Supervised & Unsupervised Learning Frameworks (Feature Selection, Model Tuning, Validation)",
      "Deep Learning Architectures & Processing (TensorFlow/PyTorch, Neural Networks, NLP foundations)"
    ]
  },
  {
    role: "plsql_developer",
    roleLabel: "PL/SQL Developer",
    coreTopics: [
      "PL/SQL Language Fundamentals (Anonymous blocks, Stored Procedures, Functions, Packages, Triggers)",
      "Advanced SQL & Query Optimization (Execution plans, Indexes, Partitioning, Analytic functions, CTEs)",
      "Cursors & Collections (Implicit/Explicit cursors, REF CURSOR, Bulk COLLECT, FORALL, Associative Arrays)",
      "Oracle Database Internals & Performance Tuning (Undo/Redo management, Locking mechanisms, DBMS packages, Exception handling)"
    ]
  },
];

const LEVELS = ["fresher", "mid", "senior"];

// How many questions per category per level per session
const QUESTION_MIX = {
  fresher: {
    dsa: 2,
    cs_fundamentals: 1,
    system_design: 1,
    role_specific: 3,
    behavioral: 2,
    communication: 1,
  },
  mid: {
    dsa: 2,
    cs_fundamentals: 1,
    system_design: 2,
    role_specific: 3,
    behavioral: 1,
    communication: 1,
  },
  senior: {
    dsa: 1,
    cs_fundamentals: 1,
    system_design: 3,
    role_specific: 3,
    behavioral: 1,
    communication: 1,
  },
};

// Minimum questions needed in DB per category
// 4x the session mix so users don't see repeats easily
const QUESTION_BANK_TARGET = {
  fresher: {
    dsa: 12,
    cs_fundamentals: 8,
    system_design: 4,
    role_specific: 12,
    behavioral: 8,
    communication: 4,
  },
  mid: {
    dsa: 8,
    cs_fundamentals: 4,
    system_design: 8,
    role_specific: 12,
    behavioral: 8,
    communication: 4,
  },
  senior: {
    dsa: 4,
    cs_fundamentals: 4,
    system_design: 12,
    role_specific: 12,
    behavioral: 8,
    communication: 4,
  },
};

// Time limits in seconds per category
const TIME_LIMITS = {
  dsa: 180,
  cs_fundamentals: 120,
  system_design: 300,
  role_specific: 150,
  behavioral: 180,
  communication: 120,
};

// Integrity score deductions
const INTEGRITY_DEDUCTIONS = {
  lookAway: 5,
  phoneDetected: 10,
  multiplePerson: 15,
};

// Grade thresholds
const GRADE_THRESHOLDS = [
  { min: 95, grade: "A+" },
  { min: 85, grade: "A" },
  { min: 75, grade: "B+" },
  { min: 65, grade: "B" },
  { min: 55, grade: "C+" },
  { min: 45, grade: "C" },
  { min: 35, grade: "D" },
  { min: 0, grade: "F" },
];

module.exports = {
  STACKS,
  LEVELS,
  QUESTION_MIX,
  QUESTION_BANK_TARGET,
  TIME_LIMITS,
  INTEGRITY_DEDUCTIONS,
  GRADE_THRESHOLDS,
};