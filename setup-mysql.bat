@echo off
echo.
echo ==========================================
echo   GuardAid MySQL Setup - Complete Guide
echo ==========================================
echo.

echo 🔧 STEP 1: Install MySQL Server
echo.
echo Please ensure MySQL is installed and running:
echo - Download from: https://dev.mysql.com/downloads/mysql/
echo - Or use MySQL Installer for Windows
echo.
pause

echo.
echo 🔧 STEP 2: Configure Database
echo.
echo Please set your MySQL root password if you haven't already
echo You can use MySQL Workbench or command line
echo.

echo.
echo 🔧 STEP 3: Update Backend Configuration
echo.
echo Edit backend\.env file and set your MySQL password:
echo DB_PASSWORD=your_mysql_password
echo.
pause

echo.
echo 🔧 STEP 4: Start Backend Server
echo.
cd backend
echo Installing backend dependencies...
call npm install
echo.
echo Starting backend server...
echo This will create the database and tables automatically
call npm run dev
echo.

echo Backend setup complete!
pause