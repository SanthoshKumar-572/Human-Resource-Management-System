# 💼 Dayflow — Enterprise Human Resource Management System (HRMS)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-hr--management--ft28.onrender.com-00C853?style=for-the-badge&logo=render&logoColor=white)](https://hr-management-ft28.onrender.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/Database-Aiven%20Cloud%20MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

**Dayflow** is a full-stack, enterprise-grade Human Resource Management System (HRMS) designed to streamline shift coverage, attendance logs, leave request workflows, employee profile management, and payroll insights. 

Built with **React 19**, **TypeScript**, **Express.js**, and an **Aiven Cloud MySQL** database backend deployed live on **Render**.

---

## 🌐 Live Application Link
👉 **Live Hosted URL:** [https://hr-management-ft28.onrender.com](https://hr-management-ft28.onrender.com)

---

## 🖼️ Interface Screenshots

### 📊 Admin Portal — Real-time Dashboard & Employee Directory
Manage active shift coverage, employee directories, pending leave approvals, and schedule reviews in real time.
![Admin Dashboard](docs/images/admin_dashboard.png)

---

### ⏱️ Employee Portal — Shift Check-In & Time Off Tracker
One-click shift check-in/check-out with active session timers, daily meeting agenda flow, and leave balance metrics.
![Employee Dashboard](docs/images/employee_dashboard.png)

---

### 🗄️ Database Management — MySQL Workbench Integration
Production database tables (`users`, `attendance`, `leave_requests`) hosted on Aiven Cloud MySQL and managed via MySQL Workbench.
![MySQL Workbench](docs/images/mysql_workbench.png)

---

## ✨ Key Features

- **🛡️ Role-Based Access Control (RBAC):** Tailored dashboards and controls for both **Admins** and **Employees**.
- **⏱️ Attendance Tracking:** Check-in & check-out with automatic timestamps, active session timers, and attendance history logs.
- **🌴 Leave & PTO Management:** Submit paid, sick, or unpaid leave requests with real-time status updates and admin commentary.
- **👥 Employee Directory:** Complete workforce directory with shift assignments, department filtering, and employee profiles.
- **💵 Payroll Overview:** Salary details, pay slip breakdowns, and annual compensation summaries.
- **☁️ Cloud Database Persistence:** Fully connected to **Aiven Cloud MySQL** with connection pooling and SSL encryption.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4 + Lucide Icons
- **State Management:** Zustand with local persistence & API synchronization
- **UI Components:** Motion / Framer Motion animations

### **Backend**
- **Server:** Node.js + Express.js (TypeScript)
- **Database Driver:** `mysql2/promise`
- **ORM / Queries:** Prepared SQL statements with schema migrations & auto-seeding

### **Database & Hosting**
- **Database:** Aiven Cloud MySQL (SSL enabled)
- **Hosting Platform:** Render (Web Service with static SPA catch-all serving)

---

## 📁 Repository Structure

```
├── docs/
│   └── images/               # Screenshots for README documentation
│       ├── admin_dashboard.png
│       ├── employee_dashboard.png
│       └── mysql_workbench.png
├── server/
│   ├── db.ts                 # MySQL pool configuration & SSL setup
│   ├── index.ts              # Express REST API routes & static file server
│   ├── initDb.ts             # Database schema initialization & migrations
│   └── schema.sql            # Core database table definitions
├── src/
│   ├── components/           # Reusable UI components & layouts
│   ├── pages/                # Admin & Employee portal pages
│   ├── store/                # Zustand store with fallback state logic
│   ├── App.tsx               # Main App router
│   └── main.tsx              # Application entry point
├── render.yaml               # Render Web Service deployment manifest
├── package.json              # Project dependencies & scripts
└── vite.config.ts            # Vite build setup & API proxy
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MySQL** (Local MySQL Server or Cloud MySQL instance like Aiven / AWS RDS)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/SanthoshKumar-572/Human-Resource-Management-System.git
cd Human-Resource-Management-System
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Set Up Environment Variables
Create a `.env` file in the root directory:
```env
PORT=5000
DB_HOST=your-mysql-host.com
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=defaultdb
# Or use full DATABASE_URL string:
# DATABASE_URL=mysql://user:password@host:port/dbname?ssl-mode=REQUIRED
```

### 4️⃣ Initialize Database Tables
```bash
npm run db:init
```

### 5️⃣ Run the Application
Start the development server and Express API:
```bash
# Terminal 1: Run Express Backend
npm run server

# Terminal 2: Run Frontend Vite Dev Server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & DB connection status |
| `POST` | `/api/auth/login` | User authentication / login |
| `GET` | `/api/users` | Fetch all workforce employees |
| `POST` | `/api/users` | Add a new employee |
| `PUT` | `/api/users/:id` | Update employee profile/salary |
| `GET` | `/api/attendance` | Fetch attendance records |
| `POST` | `/api/attendance/check-in` | Record employee check-in |
| `POST` | `/api/attendance/check-out` | Record employee check-out |
| `GET` | `/api/leave` | Fetch all leave requests |
| `POST` | `/api/leave` | Submit a new leave request |
| `PATCH` | `/api/leave/:id` | Approve/Reject leave request |

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by [Santhosh Kumar](https://github.com/SanthoshKumar-572)
