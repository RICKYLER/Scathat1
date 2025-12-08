#!/bin/bash
# Simple PostgreSQL Setup Script for Scathat
# This script helps set up the PostgreSQL database for development

echo "Scathat PostgreSQL Setup"
echo "======================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Please install it first:"
    echo "- macOS: brew install postgresql"
    echo "- Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "- Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo "PostgreSQL found: $(psql --version)"

# Create database and user (you might need to run this as postgres user)
echo ""
echo "To set up the database, run these commands as postgres user:"
echo "============================================================"
echo "sudo -u postgres psql -c \"CREATE DATABASE scathat_db;\""
echo "sudo -u postgres psql -c \"CREATE USER scathat_user WITH PASSWORD 'scathat_pass';\""
echo "sudo -u postgres psql -c \"GRANT ALL PRIVILEGES ON DATABASE scathat_db TO scathat_user;\""
echo "sudo -u postgres psql -c \"ALTER USER scathat_user CREATEDB;\""
echo ""

echo "After setting up the database, run:"
echo "=================================="
echo "cd /Users/rackerjoyjugalbot/Scathat/scathat-data-base"
echo "cp .env.example .env"
echo "python3 -m pip install -r requirements.txt"
echo "python3 database.py  # This will create the tables"
echo "python3 test_database.py  # Test the database operations"

echo ""
echo "Development Quick Start:"
echo "======================="
echo "1. Install PostgreSQL and create database/user"
echo "2. Copy .env.example to .env and configure credentials"
echo "3. Install Python dependencies: pip install -r requirements.txt"
echo "4. Create tables: python3 database.py"
echo "5. Test: python3 test_database.py"

echo ""
echo "For production, consider using environment variables or a proper secrets manager."