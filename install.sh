#!/bin/bash

# BookBridge Installation Script
# This script automates the setup process

echo "╔════════════════════════════════════════╗"
echo "║   BookBridge Installation Script       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14+"
    exit 1
fi

if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL"
    exit 1
fi

echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo "✓ MySQL: $(mysql --version)"
echo ""

# Database setup
echo "Setting up database..."
read -p "Enter MySQL root password: " db_password

mysql -u root -p"$db_password" < database/schema.sql
if [ $? -eq 0 ]; then
    echo "✓ Database created successfully"
else
    echo "❌ Database setup failed"
    exit 1
fi

# Backend setup
echo ""
echo "Setting up backend..."
cd backend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created. Please edit backend/.env with your configuration"
fi

npm install
if [ $? -eq 0 ]; then
    echo "✓ Backend dependencies installed"
else
    echo "❌ Backend setup failed"
    exit 1
fi

cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend

if [ ! -f .env ]; then
    cp .env.example .env
    echo "✓ .env file created"
fi

npm install
if [ $? -eq 0 ]; then
    echo "✓ Frontend dependencies installed"
else
    echo "❌ Frontend setup failed"
    exit 1
fi

cd ..

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✓ Installation Complete!             ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and frontend/.env"
echo "2. Run backend: cd backend && npm run dev"
echo "3. Run frontend: cd frontend && npm start"
echo ""
