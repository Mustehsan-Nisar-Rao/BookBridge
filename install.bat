@echo off
REM BookBridge Installation Script for Windows

echo.
echo ╔════════════════════════════════════════╗
echo ║   BookBridge Installation Script       ║
echo ║   Windows Version                      ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please download from https://nodejs.org
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  MySQL client not found. Make sure MySQL Server is installed and accessible.
)

echo ✓ Node.js: 
node --version
echo ✓ npm: 
npm --version
echo.

REM Database setup
echo Setting up database...
set /p db_password="Enter MySQL root password: "

mysql -u root -p%db_password% < database\schema.sql
if errorlevel 1 (
    echo ❌ Database setup failed. Check your MySQL credentials.
    pause
    exit /b 1
) else (
    echo ✓ Database created successfully
)

REM Backend setup
echo.
echo Setting up backend...
cd backend

if not exist .env (
    copy .env.example .env
    echo ✓ .env file created. Edit backend\.env with your configuration
)

call npm install
if errorlevel 1 (
    echo ❌ Backend setup failed
    pause
    exit /b 1
) else (
    echo ✓ Backend dependencies installed
)

cd ..

REM Frontend setup
echo.
echo Setting up frontend...
cd frontend

if not exist .env (
    copy .env.example .env
    echo ✓ .env file created
)

call npm install
if errorlevel 1 (
    echo ❌ Frontend setup failed
    pause
    exit /b 1
) else (
    echo ✓ Frontend dependencies installed
)

cd ..

echo.
echo ╔════════════════════════════════════════╗
echo ║   ✓ Installation Complete!             ║
echo ╚════════════════════════════════════════╝
echo.
echo Next steps:
echo 1. Edit backend\.env and frontend\.env
echo 2. Open two terminals
echo 3. Terminal 1: cd backend ^&^& npm run dev
echo 4. Terminal 2: cd frontend ^&^& npm start
echo.

pause
