<div align="center">

# 🏢 Enterprise Procurement System

### *Enterprise Source-to-Pay (S2P) Platform*

<p align="center">
A scalable enterprise procurement management system built using
React, Spring Boot, PostgreSQL, and modern enterprise architecture.
</p>

![Java](https://img.shields.io/badge/Java-17-red?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql)
![GitHub](https://img.shields.io/badge/GitHub-Version_Control-black?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)

</div>

---

# 📖 Overview

The **Enterprise Procurement System** is a centralized Source-to-Pay (S2P) application designed to automate procurement
operations inside an organization.

The platform enables employees to submit purchase requests, automatically routes them through configurable approval
workflows, generates purchase orders, manages suppliers, tracks procurement activities, and records every transaction
for auditing and reporting.

The project follows real-world enterprise software architecture and is being developed as part of the **Infosys
Springboard Internship**.

---

# 🎯 Project Objectives

- Automate procurement workflow
- Centralize master data management
- Implement configurable approval rules
- Generate purchase orders automatically
- Maintain supplier information
- Record audit logs
- Build scalable REST APIs
- Follow enterprise software architecture
- Support future reporting and analytics

---

# 🏗 System Architecture

```text
                    React Frontend
                           │
                           ▼
                   Spring Boot REST API
                           │
                           ▼
                  Business Service Layer
                           │
                           ▼
                 Spring Data JPA / Hibernate
                           │
                           ▼
                     PostgreSQL Database
```

---

# 🔄 Business Workflow

```text
Admin

↓

Create Master Data

↓

Employee Login

↓

Purchase Requisition

↓

Approval Rule Engine

↓

Manager Approval

↓

Finance Approval

↓

Purchase Order Generated

↓

Supplier Receives PO

↓

Delivery Tracking

↓

Audit Log

↓

Reports & Analytics
```

---

# 🗂 Database Workflow

```text
Cost Center
      │
      ▼
Department
      │
      ▼
Users
      │
      ▼
Requisition
      │
      ▼
Approval Rule
      │
      ▼
Purchase Order
      │
      ▼
Audit Log
```

---

# 🗄 Database Design

### Master Data

- 🏢 Cost Centers
- 🏬 Departments
- 📂 Categories
- 🚚 Suppliers
- 👤 Users
- ✅ Approval Rules

### Transaction Data

- 📄 Purchase Requisitions
- 📦 Purchase Orders

### System Logs

- 📜 Audit Logs

---

# 📊 ER Diagram

> ER Diagram designed using **dbdiagram.io**

```
Cost Centers
      │
      ▼
Departments
      │
      ├──────────────┐
      ▼              ▼
Users         Approval Rules
      │              ▲
      ▼              │
Requisitions─────────┘
      │
      ▼
Purchase Orders
      ▲
      │
Suppliers

Categories ───────────┘
```

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Axios
- React Router

## Backend

- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate
- Maven

## Database

- PostgreSQL
- pgAdmin
- Flyway

## Security

- Spring Security
- JWT Authentication
- BCrypt Password Encoder

## API

- REST API
- Swagger / OpenAPI

## Testing

- Postman

## Design

- Draw.io
- dbdiagram.io
- Figma

## Deployment

- Vercel
- Render
- AWS
- Neon PostgreSQL
- Docker

---

# 📁 Project Structure

```
enterprise-procurement-system

│
├── frontend/
│
├── backend/
│
├── database/
│   ├── schema/
│   ├── sample-data/
│   └── migrations/
│
├── docs/
│
├── architecture/
│
├── assets/
│
├── diagrams/
│
└── README.md
```

---

# 👥 Team Modules

| Module                       | Responsibility                        |
|------------------------------|---------------------------------------|
| Master Data & Approval Rules | Database, ER Diagram, Approval Engine |
| Requisition Workflow         | Purchase Request Module               |
| Purchase Order Management    | PO Generation                         |
| Frontend                     | React UI Development                  |
| Reports & Security           | Authentication, Reports, Audit        |

---

# 👨‍💻 My Contribution

Responsible for the **Master Data & Approval Rules** module.

Completed:

- Database Design
- ER Diagram
- PostgreSQL Schema
- Master Data Modeling
- Entity Relationships
- Approval Rule Design
- GitHub Repository Setup

Upcoming:

- Spring Boot JPA Entities
- Master Data REST APIs
- Approval Engine Integration
- Database Migration using Flyway

---

# 🔐 Approval Rule Engine

Instead of hardcoding approval logic inside Java:

```java
if(amount > 50000)
```

Approval policies are stored in the database.

Example:

| Department | Category | Amount              | Approver |
|------------|----------|---------------------|----------|
| IT         | Laptop   | ₹0 - ₹50,000        | Manager  |
| IT         | Laptop   | ₹50,001 - ₹2,00,000 | Finance  |

Benefits

- No code changes
- Dynamic business rules
- Easy maintenance
- Enterprise scalability

---

# 🚀 Development Workflow

```text
Requirement Analysis

↓

Business Workflow

↓

Architecture Design

↓

Database Design

↓

Backend APIs

↓

Frontend

↓

Integration

↓

Testing

↓

Deployment
```

---

# 🌿 Git Workflow

```
main

develop

feature/master-data

feature/requisition

feature/purchase-order

feature/frontend

feature/security
```

---

# 📌 Current Progress

- [x] Requirement Analysis
- [x] Business Workflow
- [x] High-Level Architecture
- [x] ER Diagram
- [x] PostgreSQL Schema
- [x] Team Role Distribution
- [x] Technology Research
- [ ] Spring Boot Backend
- [ ] REST APIs
- [ ] React Frontend
- [ ] Integration
- [ ] Deployment

---

# 🎯 Future Enhancements

- Email Notifications
- Vendor Portal
- Inventory Integration
- Purchase Analytics Dashboard
- AI-based Procurement Insights
- Multi-level Dynamic Approval Workflow

---

# 📄 License

This project is developed for educational purposes as part of the **Infosys Springboard Internship**.

---

<div align="center">

### ⭐ If you found this project interesting, consider giving it a star.

Made with ❤️ using React, Spring Boot & PostgreSQL

</div>
