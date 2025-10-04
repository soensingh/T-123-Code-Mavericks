# 🛡️ Women Safety Network - GuardAid

A comprehensive safety application designed specifically for women's safety, featuring real-time danger zone avoidance, role-based access control, and community-driven safety reporting.

## 🌟 Features

### 🔐 Role-Based Access Control
- **Woman**: Access to safety map, emergency alerts, route planning with danger zone avoidance
- **Volunteer**: Additional volunteer coordination hub and incident management
- **Admin**: Full administrative panel with zone management and system oversight

### 🗺️ Advanced Safety Routing
- **Intelligent Route Planning**: Automatically calculates routes that avoid reported danger zones
- **6-Way Alternative Routing**: Uses North, South, East, West, Northeast, and Southwest waypoint strategies
- **Visual Safety Feedback**: Color-coded routes (blue for safe, pink dashed for detoured)
- **Real-time Safety Scoring**: Shows percentage-based safety metrics for each route

### 🚨 Emergency & Reporting System
- **Incident Reporting**: Community-driven safety incident reporting
- **Emergency Alerts**: Quick access to emergency services
- **Zone Management**: Dynamic safe/danger zone creation and management
- **Real-time Notifications**: Instant alerts for safety incidents

### 🛠️ Technical Features
- **React + Vite**: Modern frontend with fast development and build
- **Leaflet Maps**: Interactive mapping with custom markers and zones
- **MySQL Database**: Robust backend data storage
- **OSRM Integration**: Real-world routing with OpenStreetMap data
- **Role-based Authentication**: Secure access control system

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/soensingh/T-123-Code-Mavericks.git
   cd T-123-Code-Mavericks
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   npm install
   cd ..
   ```

3. **Set up MySQL Database**
   ```bash
   # Run the MySQL setup script
   mysql -u root -p < mysql-setup.sql
   ```

4. **Configure Environment**
   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Start the application**
   ```bash
   # Start backend server (Terminal 1)
   cd backend
   node server.js
   
   # Start frontend development server (Terminal 2)
   npm run dev
   ```

6. **Access the application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5001`

## 🎯 Usage

### Quick Demo Access
- **Woman User**: Use demo login for immediate access to safety features
- **Volunteer**: Access volunteer coordination and incident management
- **Admin**: Full system administration and zone management

### Core Workflows
1. **Route Planning**: Set destination → System calculates safest route avoiding danger zones
2. **Incident Reporting**: Report safety incidents → Community gets notified → Zones updated
3. **Emergency Access**: Quick emergency button → Instant access to help services
4. **Zone Management**: Admins can create/modify safe and danger zones

## 🏗️ Architecture

```
├── src/
│   ├── components/        # React components
│   │   ├── SafetyMap.jsx     # Main mapping interface
│   │   ├── Dashboard.jsx     # Role-based dashboard
│   │   ├── Login.jsx         # Authentication
│   │   └── ...
│   ├── contexts/         # React context providers
│   ├── services/         # API services
│   └── config/          # Configuration files
├── backend/
│   ├── server.js        # Express.js server
│   └── package.json     # Backend dependencies
└── mysql-setup.sql      # Database schema
```

## 🛡️ Safety Algorithm

The core safety routing algorithm:
1. Calculate normal direct route using OSRM
2. Check route against known danger zones
3. If unsafe, generate 6 alternative waypoints
4. Test each alternative for safety score
5. Return safest route with visual indicators

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines and submit pull requests for any improvements.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the development team
- Check our documentation wiki

---

**Built with ❤️ for women's safety by Team Code Mavericks**
