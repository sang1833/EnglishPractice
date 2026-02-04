# Study4Clone (EnglishPractice)

A comprehensive IELTS Mock Test Platform featuring a modern user interface, a powerful admin dashboard, and a robust .NET backend.

## 🚀 Technical Stack

### **Frontend Client (`S4C_FE`)**
- **Framework**: Angular 21 (Latest)
- **Features**: IELTS Simulations (Listening, Reading, Writing), Statistics, User History.

### **Admin Dashboard (`S4C_Admin`)**
- **Framework**: Angular 21
- **Features**: User Management, Exam Creation (JSON Import/Wizard), System Statistics.

### **Backend (`S4C_BE`)**
- **Framework**: .NET 10 (ASP.NET Core Web API)
- **Database**: PostgreSQL 15 (Dockerized) / SQL Server (Dev)
- **Architecture**: Domain-Driven Design (DDD) with Clean Architecture.
    - `Study4Clone.Api`: API Endpoints
    - `Study4Clone.Application`: Business Logic / Use Cases
    - `Study4Clone.Domain`: Enterprise Entities
    - `Study4Clone.Infrastructure`: DB Context, External Services
---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v22.x or higher
- **npm**: v11.x or higher
- **.NET SDK**: .NET 10 Preview (or compatible)
- **Docker Desktop**: For containerized deployment

### Option 1: Fast Start (Docker)
Run the entire stack (FE, Admin, BE, DB) with a single command:

```bash
# Build and start all services
docker-compose up -d --build
```
- **Client**: http://localhost or http://localhost:4200 (via Gateway or direct)
- **Admin**: http://localhost/admin? or http://localhost:4201
- **API**: http://localhost:8080/swagger

*(Note: Check `docker-compose.yml` for exact exposed ports)*


## 📂 Project Structure

```bash
e:\Code\SideProject\Study4Clone\
├── S4C_FE/           # Frontend Client Application
├── S4C_Admin/        # Admin Dashboard Application
├── S4C_BE/           # Backend Solution (.NET)
│   ├── src/          # Source Code (Api, Application, Domain, Infra)
│   ├── tests/        # Unit and Integration Tests
├── docker-compose.yml # Docker Orchestration
├── nginx-gateway.conf # Nginx Configuration
└── README.md         # Project Documentation
```

### Option 2: Manual Development Setup

#### 1. Database Setup
Ensure you have a PostgreSQL instance running or update `appsettings.json` in `S4C_BE/src/Study4Clone.Api` to point to your local SQL Server/Postgres instance.

#### 2. Backend API
```bash
cd S4C_BE/src/Study4Clone.Api
dotnet restore
dotnet run
```
*The API will start on default ports (e.g., http://localhost:5041).*

#### 3. Client Frontend (`S4C_FE`)
```bash
cd S4C_FE
npm install
npm start
```
*Access at http://localhost:4200*

#### 4. Admin Dashboard (`S4C_Admin`)
```bash
cd S4C_Admin
npm install
npm start
```
*Access at http://localhost:4201*

---

## 🔧 Configuration

### Environment Variables
- **Frontend**: Check `src/environments/environment.ts` and `environment.development.ts` for API endpoints.
- **Backend**: Check `appsettings.json` and `appsettings.Development.json` for Connection Strings and JWT Settings.

---

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
