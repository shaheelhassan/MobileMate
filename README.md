# MobileMate — Mobile Shop Management System with Predictive AI

> [!NOTE]
> **Project Status:** This project is currently **under active development**. Feedback, suggestions, issues, and contributions are warmly appreciated!

An end-to-end MERN-stack management system with a dedicated **Python FastAPI Predictive Machine Learning Microservice** for mobile shop inventory, POS sales & invoicing, customer records, repair job tracking, shop branding, and AI analytics.

## Tech Stack

- **Frontend:** React 19 (Vite), React Router, Context API, Axios, Tailwind CSS, Chart.js
- **Backend:** Node.js, Express.js, JWT authentication, bcrypt.js
- **AI Microservice:** Python 3.12, FastAPI, scikit-learn, pandas, joblib
- **Database:** MongoDB with Mongoose (Local MongoDB or MongoDB Atlas)
- **Extras:** jsPDF (invoice generation), Chart.js (sales/report analytics)

## Project Structure

```
MobileMate/
├── server/            # Express + MongoDB API Gateway
│   ├── config/        # DB connection
│   ├── models/        # Mongoose schemas
│   ├── controllers/   # Route logic
│   ├── routes/        # Express routers
│   ├── middleware/    # Auth, roles, error handling
│   ├── seed/          # Seed scripts
│   └── server.js
├── client/            # React (Vite) frontend
│   └── src/
│       ├── pages/       # Route-level pages (Inventory, POS/Sales, Dashboard, etc.)
│       ├── components/  # Sidebar, Topbar, layout, shared UI
│       ├── context/     # AuthContext, ToastContext, SettingsContext
│       └── api/         # Axios instance
└── ai-service/        # Python FastAPI ML microservice
    ├── app/           # FastAPI application
    ├── models/        # Trained scikit-learn models
    └── scripts/       # Training pipeline
```

## Features & Modules

- **Auth:** Staff-only login (no public signup), JWT, role-based route protection (Admin, Manager, Cashier)
- **Inventory:** Product CRUD, categories, live stock levels, low-stock alerts, IMEI/SKU tracking, and direct 1-click **Sell in POS** linkage
- **Sales / POS (Linked):** Fast cart checkout, stock auto-deduction, multiple payment methods (Cash, Card, Mobile Wallet, Bank Transfer), downloadable PDF invoices, and complete searchable Sales Invoices History
- **Suppliers & Purchases:** Supplier CRUD, stock-in purchases that auto-increase inventory
- **Customers:** Customer CRUD + purchase & repair ticket history
- **Repairs:** Job status tracking (`received` → `in-progress` → `completed` → `delivered`), cost estimation
- **Predictive AI Assistant:** 14-day sales forecasting, stockout risk estimator, repair pricing
- **Reports & Analytics:** Dashboard KPIs, sales trends, top-selling products, stock valuation
- **Staff Management (Admin only):** Create/manage manager and cashier accounts
- **Settings & Branding:** Company logo upload, shop profile, and custom invoice footer

## Local Setup

### 1. Backend

```bash
cd server
npm install
node seed/seedData.js  # populates database with initial data
npm run dev            # starts on http://localhost:5050
```

### 2. Python AI Service

```bash
cd ai-service
pip install -r requirements.txt
python scripts/train.py
python -m uvicorn app.main:app --port 8000
```

### 3. Frontend Client

```bash
cd client
npm install
npm run dev            # starts on http://localhost:5173
```

### Default Login Credentials

- **Email:** `admin@mobilemate.com`
- **Password:** `Admin@123`

---

## 🤝 Contributing & Feedback

This project is actively evolving. Any contributions, pull requests, feature requests, and bug reports are highly appreciated!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
