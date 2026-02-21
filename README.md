# 🍰 Dulce Zone Confectionery

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A **premium full-stack e-commerce and course-booking web application** built for a high-end confectionery brand.  
The platform uses a **decoupled architecture** with a modern React frontend and a powerful Django + GraphQL backend, featuring **real-time inventory control** and **secure, bank-grade payments**.

---

## ✨ Key Features

- **Mobile-First Responsive UI**  
  Sleek React interface optimized for both mobile and desktop users.

- **GraphQL API**  
  Efficient data fetching for products, courses, bookings, and checkout workflows.

- **Secure Payment Gateway**  
  Stripe integration with tokenized credit-card payments.

- **Real-Time Inventory Management**  
  PostgreSQL ensures accurate stock levels and prevents course overbooking.

- **Automated SMTP Email System**  
  Sends branded HTML receipts to customers and instant sales alerts to the business owner.

- **Secure Merchant Portal**  
  Django Admin customized for non-technical owners to manage products, pricing, orders, and courses.

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Apollo Client (GraphQL state management)
- Modern CSS (Flexbox & Grid)

### Backend
- Python / Django
- Graphene-Django (GraphQL)
- PostgreSQL
- Django Core Mail (SMTP automation)
- Stripe Python SDK

### DevOps
- Docker & Docker Compose
- Git version control

---

## 🚀 Local Setup & Installation

You will need **two terminal windows** running at the same time.

---

### 1️⃣ Start the Backend (API & Database)

```bash
cd backend
docker-compose up

GraphQL API: http://localhost:8000/graphql/

Merchant Admin Portal: http://localhost:8000/admin/

2️⃣ Start the Frontend (User Interface)
cd frontend
npm install
npm run dev

Application URL: http://localhost:5173

📂 Project Architecture
dulce-confectionery/
├── backend/                  # Django & PostgreSQL environment
│   ├── business/             # Core app (models, admin, schema, templates)
│   ├── core/                 # Settings & URL configuration
│   ├── Dockerfile
│   ├── docker-compose.yml    # API + database orchestration
│   └── manage.py
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Views (Shop, Academy, Checkout)
│   │   └── App.jsx           # Apollo provider & routing
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/              # README images (important!)
│   ├── mobile-shop.png
│   ├── mobile-course.png
│   └── email-receipt.png
│
└── README.md
📸 Application Gallery

Mobile-First Shopping Experience & Automated Email Receipts
![alt text](image.png)  ![alt text](image-1.png) ![alt text](image-2.png)

🔐 Security & Best Practices

Tokenized payments via Stripe (no card data stored)

Environment variables for secrets

Database-level inventory enforcement

Django admin access protected by authentication