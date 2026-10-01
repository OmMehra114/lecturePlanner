# 🎓 AI Lecture Planner & Syllabus Scheduler

An intelligent, full-stack web application designed for university professors, educators, and academic coordinators. It automatically parses course syllabi (from PDF, Word DOCX, TXT, JSON, or pasted text), intelligently balances required lecture hours across sequential topics, applies semester calendar constraints (teaching days, Friday policies, national holidays, and custom vacation breaks), and renders a responsive, editable schedule table with multi-format exports.

---

## ✨ Features

- 🧠 **AI Syllabus Parser**: Automatically parses unstructured syllabi into structured units and sequential sub-topics with key concepts, powered by Groq (`openai/gpt-oss-120b`) or Google Gemini.
- ⚖️ **Deterministic Hour Balancing**: Automatically normalizes hours so the sum of all scheduled lectures strictly matches the course target hours.
- 📅 **Advanced Calendar Constraint Engine**:
  - Configurable semester bounds (Start Date & End Date).
  - Selectable weekly lecture days (e.g. Mon/Wed/Fri, Tue/Thu, or Mon-Fri).
  - Friday inclusion/exclusion rules.
  - National & academic holiday presets + custom vacation/exam breaks.
  - Overflow detection when syllabus lectures exceed semester bounds.
- ✏️ **Interactive Schedule Editor**:
  - Live inline editing of topic titles, units, and hours.
  - Real-time date recalculation upon any modification.
  - Row re-ordering (Move Up / Down), row addition, and deletion.
  - Lecture completion tracking checkboxes.
  - Instant search & filter bar.
- 📥 **Multi-Format Export & Sharing**:
  - Excel (`.xlsx`)
  - CSV (`.csv`)
  - JSON schema export
  - Print-optimized formatted PDF (`window.print()` with custom print stylesheets)
- 💾 **Persistent Workspace**:
  - Save, reopen, and delete lecture plans across sessions.
- 🚀 **1-Click Demo Presets**:
  - Preloaded syllabi for Software Engineering, Database Management Systems, and Machine Learning.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: React 19, Tailwind CSS v4, Lucide Icons
- **Date Engine**: `date-fns`
- **File Parsers**: `pdf-parse`, `mammoth` (DOCX), text/JSON
- **Spreadsheet Generation**: `xlsx`
- **AI Integration**: OpenAI SDK (connected to Groq Cloud) & Google Generative AI

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js (v18.17+ or v20+) installed.

### 2. Environment Variables
Create or verify `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
# Optional:
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Installation & Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
lecture-planner/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/route.js     # AI parsing & scheduling API
│   │   │   └── schedules/            # CRUD persistence endpoints
│   │   ├── globals.css               # Design tokens & print stylesheets
│   │   ├── layout.js                 # App root layout & SEO metadata
│   │   └── page.js                   # Main application orchestrator
│   ├── components/
│   │   ├── CourseForm.jsx            # Multi-step course & calendar wizard
│   │   ├── HolidayModal.jsx          # Holiday & vacation break manager
│   │   ├── Navbar.jsx                # Header with brand & saved plan access
│   │   ├── SamplePresets.js          # Demo course syllabi
│   │   ├── SavedPlansModal.jsx       # Saved lecture plans drawer
│   │   └── ScheduleTable.jsx         # Interactive schedule editor & export table
│   └── lib/
│       ├── ai.js                     # Groq/Gemini LLM prompt & normalizer
│       ├── exportUtils.js            # XLSX, CSV, JSON export helpers
│       ├── fileParser.js             # PDF, DOCX, TXT parser
│       ├── holidays.js               # Holiday calculator & presets
│       ├── scheduler.js              # Calendar date assignment engine
│       ├── schema.js                 # Zod validation schemas
│       └── storage.js                # Persistent JSON storage engine
├── data/
│   └── schedules.json                # Stored lecture plans
└── package.json
```

---

## 📄 License
MIT License. Built for academic educators and curriculum planners.
