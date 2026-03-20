# 🍛 Annapurna Mess — Digital Attendance Management System

> **Ghar jaisa khana. Digital hisaab.**  
> A full-stack MERN web application built to replace the manual register book system at Annapurna Mess, Pune.

![Live](https://img.shields.io/badge/Live-annapurna--mess.vercel.app-green?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Railway-purple?style=for-the-badge)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)

---

## 🌐 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend | [annapurna-mess.vercel.app](https://annapurna-mess.vercel.app) |
| ⚙️ Backend API | [annapurna-mess-production.up.railway.app](https://annapurna-mess-production.up.railway.app) |
| 📦 GitHub Repo | [github.com/bramhagulavani/annapurna-mess](https://github.com/bramhagulavani/annapurna-mess) |

---

## 📖 About The Project

Annapurna Mess is a student mess in Pune. The mess aunty was tired of manually managing the attendance register book every day — tracking who came for lunch, who came for dinner, and managing monthly subscriptions.

This project was built as a commitment to solve that real-world problem using the MERN stack.

### 🔑 Key Features

#### For Students
- 🔐 Secure login with JWT authentication
- ✅ One-tap lunch & dinner attendance marking
- 📅 Monthly attendance history with calendar view
- 🍽️ Weekly menu with today's meal preview
- ⏰ Live mess timings with Open/Closed status
- 📊 Remaining meal count tracker
- ℹ️ About, Contact & Notices section

#### For Admin (Mess Aunty)
- 📊 Live dashboard — today's lunch & dinner headcount
- 👨‍🎓 Student management — add, search, activate/deactivate
- 💳 Subscription management — Lunch Only / Dinner Only / Both plans
- 📋 Today's attendance list with timestamps
- 📈 Monthly reports per student
- ✏️ Manual attendance override

### 🔄 Carry-Forward System
Unlike traditional mess systems where absent days are wasted, this system works on a **meal-count basis**:
- Student gets 30 meals per plan
- A meal is only deducted when the student actually marks attendance
- If student doesn't come → meal count stays the same → automatically carry-forwarded
- No meal is ever wasted!

### 💰 Subscription Plans
| Plan | Meals | Price |
|------|-------|-------|
| Lunch Only | 30 lunches | ₹1500 |
| Dinner Only | 30 dinners | ₹1500 |
| Both (Lunch + Dinner) | 30 lunches + 30 dinners | ₹3000 |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcryptjs |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

---

## 📁 Project Structure

```
annapurna-mess/
│
├── 📁 client/                          # React Frontend
│   ├── 📁 public/
│   │   └── mess.jpg                    # Mess photo (login background)
│   ├── 📁 src/
│   │   ├── 📁 context/
│   │   │   └── AuthContext.jsx         # JWT auth state management
│   │   ├── 📁 services/
│   │   │   └── api.js                  # Axios instance + interceptors
│   │   ├── 📁 pages/
│   │   │   ├── 📁 auth/
│   │   │   │   └── Login.jsx           # Login page
│   │   │   ├── 📁 student/
│   │   │   │   ├── Home.jsx            # Mark attendance + menu + timings
│   │   │   │   └── History.jsx         # Calendar attendance history
│   │   │   └── 📁 admin/
│   │   │       ├── Dashboard.jsx       # Live stats dashboard
│   │   │       ├── Students.jsx        # Student management + subscriptions
│   │   │       ├── Attendance.jsx      # Today's attendance list
│   │   │       └── Reports.jsx         # Monthly reports
│   │   ├── App.jsx                     # Routes + Protected routes
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Tailwind imports
│   ├── .env.production                 # Production environment variables
│   ├── vite.config.js                  # Vite + Tailwind + proxy config
│   └── package.json
│
├── 📁 server/                          # Node.js Backend
│   ├── 📁 config/
│   │   └── db.js                       # MongoDB Atlas connection
│   ├── 📁 models/
│   │   ├── User.js                     # Student/Admin schema + bcrypt hook
│   │   ├── Attendance.js               # Attendance records schema
│   │   └── Subscription.js             # Meal plan + remaining count schema
│   ├── 📁 controllers/
│   │   ├── auth.controller.js          # Register, Login, GetMe, ChangePassword
│   │   ├── attendance.controller.js    # Mark meal, Get history, Today status
│   │   └── admin.controller.js         # Dashboard, Students, Subscriptions, Reports
│   ├── 📁 middleware/
│   │   └── authMiddleware.js           # verifyToken + isAdmin middleware
│   ├── 📁 routes/
│   │   ├── auth.routes.js              # /api/auth/*
│   │   ├── attendance.routes.js        # /api/attendance/*
│   │   └── admin.routes.js             # /api/admin/*
│   ├── .env                            # Environment variables (git ignored)
│   ├── .env.example                    # Environment variables template
│   ├── index.js                        # Express server entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the repository
```bash
git clone https://github.com/bramhagulavani/annapurna-mess.git
cd annapurna-mess
```

### 2. Setup Backend
```bash
cd server
npm install
cp .env.example .env
```

Fill in your `.env`:
```env
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/annapurna-mess
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4000
```

Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

App runs at `http://localhost:4000`

### 4. Create Admin Account
Use Thunder Client or Postman:
```
POST http://localhost:8000/api/auth/register

{
  "name": "Annapurna Admin",
  "rollNumber": "ADMIN001",
  "email": "admin@annapurna.com",
  "password": "admin123",
  "role": "admin"
}
```

---

## 🔗 API Reference

### Auth Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | 🔒 Token |
| PUT | `/api/auth/change-password` | Change password | 🔒 Token |

### Attendance Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/attendance/mark` | Mark lunch/dinner | 🔒 Student |
| GET | `/api/attendance/today` | Today's status | 🔒 Student |
| GET | `/api/attendance/mine` | Monthly history | 🔒 Student |

### Admin Routes
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/dashboard` | Dashboard stats | 🔒 Admin |
| GET | `/api/admin/students` | All students | 🔒 Admin |
| POST | `/api/admin/students` | Add student | 🔒 Admin |
| PUT | `/api/admin/students/:id/toggle` | Activate/deactivate | 🔒 Admin |
| POST | `/api/admin/subscriptions` | Add/renew plan | 🔒 Admin |
| GET | `/api/admin/attendance/today` | Today's list | 🔒 Admin |
| POST | `/api/admin/attendance/manual` | Manual mark | 🔒 Admin |
| GET | `/api/admin/attendance/report` | Monthly report | 🔒 Admin |

---

## 🗄️ Database Schema

### User
```js
{
  name, rollNumber, email, password (hashed),
  phone, role: ['student', 'admin'], isActive
}
```

### Subscription
```js
{
  student, planType: ['lunch-only', 'dinner-only', 'both'],
  mealPrice, totalLunchMeals, totalDinnerMeals,
  remainingLunchMeals, remainingDinnerMeals,
  startDate, expectedEndDate, isActive, notes
}
```

### Attendance
```js
{
  student, date, meal: ['lunch', 'dinner'],
  status: ['present', 'absent'],
  markedBy: ['self', 'admin']
}
```

---

## 🚢 Deployment

### Backend → Railway
1. Connect GitHub repo
2. Set Root Directory → `server`
3. Add environment variables
4. Deploy!

### Frontend → Vercel
1. Connect GitHub repo
2. Set Root Directory → `client`
3. Add `VITE_API_URL` environment variable
4. Deploy!

---

## 👨‍💻 Author

**Bramha Gulavani**  
BTech Student, Pune  
GitHub: [@bramhagulavani](https://github.com/bramhagulavani)

---

## 🙏 Special Thanks

Built with ❤️ for **Annapurna Mess** and the mess aunty who inspired this project by being tired of managing the register book! 🍛

---

*© 2026 Annapurna Mess · Crafted by Bramha Gulavani & the Annapurna Team*