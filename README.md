# 🍰 Dulce Zone Confectionery 

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white)
![GraphQL](https://img.shields.io/badge/-GraphQL-E10098?style=for-the-badge&logo=graphql&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=for-the-badge&logo=Stripe&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A premium, full-stack e-commerce and course-booking web application built for a high-end confectionery brand. This project features a decoupled architecture with a dynamic React frontend and a robust Django/GraphQL backend, complete with real-time inventory management and bank-grade payment processing.

## ✨ Key Features

* **Mobile-First Responsive UI:** Sleek, modern frontend built with React, ensuring a flawless shopping experience across all desktop and mobile devices.
* **GraphQL API:** Highly efficient data fetching to seamlessly deliver product catalogs, course schedules, and handle complex checkout mutations.
* **Secure Payment Gateway:** Full integration with the Stripe API for secure, tokenized credit card processing.
* **Real-Time Inventory Management:** PostgreSQL database strictly controls stock numbers and course seating to prevent overbooking.
* **Automated SMTP Email System:** Instantly generates and delivers branded, custom HTML receipts to customers while simultaneously triggering VIP alerts to the business owner upon successful transactions.
* **Secure Merchant Portal:** Leveraging Django's native admin panel to provide non-technical business owners with a custom dashboard to manage pricing, inventory, and order fulfillment.

## 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Apollo Client (GraphQL State Management)
* Modern CSS Flexbox & Grid

**Backend:**
* Python / Django
* Graphene-Django (GraphQL Implementation)
* PostgreSQL (Relational Database)
* Django Core Mail (SMTP Email Automation)
* Stripe Python SDK

**DevOps:**
* Docker & Docker Compose
* Git Version Control

## 🚀 Local Setup & Installation

To run this application on your local machine, you will need two terminal windows running concurrently.

### 1. Start the Backend (API & Database)
Navigate to the backend directory and spin up the Docker containers:
```bash
cd backend
docker-compose up

The GraphQL endpoint will be available at http://localhost:8000/graphql/
The Merchant Portal is accessible at http://localhost:8000/admin/

2. Start the Frontend (User Interface)
Open a new terminal, navigate to the frontend directory, install dependencies, and start the development server:

cd frontend
npm install
npm run dev

The application will be live at http://localhost:5173

📂 Project Architecture

dulce-confectionery/
├── backend/                  # Django & PostgreSQL Environment
│   ├── business/             # Core app: Models, Admin, schema.py, HTML templates
│   ├── core/                 # Django settings, URL routing
│   ├── Dockerfile            
│   ├── docker-compose.yml    # Database and web server orchestration
│   └── manage.py
├── frontend/                 # React UI Environment
│   ├── src/                  
│   │   ├── components/       # Reusable UI elements
│   │   ├── pages/            # View views (Shop, Academy, Checkout)
│   │   └── App.jsx           # Apollo Provider & Routing
│   ├── package.json
│   └── vite.config.js
└── README.md

## 📸 Application Gallery

**Mobile-First Shopping Experience & Automated Email Receipts**

<div align="center">
  <img src="screenshots/mobile-shop.png" alt="Mobile Shop View" width="30%">
  <img src="screenshots/mobile-course.png" alt="Mobile Course View" width="30%">
  <img src="screenshots/email-receipt.png" alt="Automated Email Receipt" width="30%">
</div>

---

