#!/usr/bin/env python3
"""
Database Connection Utility for Scathat PostgreSQL Database
Simple, non-complex database operations for contract analysis data
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Database:
    """Simple PostgreSQL database connection and operations"""
    
    def __init__(self):
        """Initialize database connection"""
        self.connection = None
        self.connect()
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(
                host=os.getenv('DB_HOST', 'localhost'),
                database=os.getenv('DB_NAME', 'scathat_db'),
                user=os.getenv('DB_USER', 'scathat_user'),
                password=os.getenv('DB_PASSWORD', 'scathat_pass'),
                port=os.getenv('DB_PORT', '5432')
            )
            logger.info("Connected to PostgreSQL database")
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def execute_query(self, query: str, params: Optional[tuple] = None) -> List[Dict]:
        """Execute a SELECT query and return results"""
        try:
            with self.connection.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def execute_command(self, command: str, params: Optional[tuple] = None) -> int:
        """Execute an INSERT/UPDATE/DELETE command"""
        try:
            with self.connection.cursor() as cursor:
                cursor.execute(command, params)
                self.connection.commit()
                return cursor.rowcount
        except Exception as e:
            self.connection.rollback()
            logger.error(f"Command execution failed: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")

# Database schema creation
def create_tables():
    """Create all required database tables"""
    
    db = Database()
    
    # Contract Metadata Table
    contract_metadata_table = """
    CREATE TABLE IF NOT EXISTS contract_metadata (
        id SERIAL PRIMARY KEY,
        contract_address VARCHAR(42) UNIQUE NOT NULL,
        contract_name VARCHAR(255),
        compiler_version VARCHAR(50),
        optimization_enabled BOOLEAN DEFAULT FALSE,
        creation_block BIGINT,
        creator_address VARCHAR(42),
        source_code_hash VARCHAR(64),
        bytecode_hash VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    # Analysis History Table
    analysis_history_table = """
    CREATE TABLE IF NOT EXISTS analysis_history (
        id SERIAL PRIMARY KEY,
        contract_address VARCHAR(42) NOT NULL,
        analysis_type VARCHAR(50) NOT NULL,
        risk_score NUMERIC(5,4) DEFAULT 0.0,
        risk_level VARCHAR(20),
        code_analysis_score NUMERIC(5,4),
        bytecode_analysis_score NUMERIC(5,4),
        behavior_analysis_score NUMERIC(5,4),
        aggregated_score NUMERIC(5,4),
        analysis_details JSONB,
        analyzed_by VARCHAR(255),
        analysis_duration INTERVAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (contract_address) REFERENCES contract_metadata(contract_address)
    )
    """
    
    # Risk Score Records Table
    risk_score_records_table = """
    CREATE TABLE IF NOT EXISTS risk_score_records (
        id SERIAL PRIMARY KEY,
        contract_address VARCHAR(42) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        overall_risk_score NUMERIC(5,4) NOT NULL,
        code_risk_score NUMERIC(5,4),
        bytecode_risk_score NUMERIC(5,4),
        behavior_risk_score NUMERIC(5,4),
        confidence_score NUMERIC(5,4),
        risk_level VARCHAR(20),
        
        FOREIGN KEY (contract_address) REFERENCES contract_metadata(contract_address)
    )
    """
    
    # User Logs Table (Anonymized)
    user_logs_table = """
    CREATE TABLE IF NOT EXISTS user_logs (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        user_action VARCHAR(100) NOT NULL,
        contract_address VARCHAR(42),
        analysis_type VARCHAR(50),
        ip_hash VARCHAR(64),  -- Hashed IP for anonymity
        user_agent_hash VARCHAR(64),  -- Hashed user agent
        duration_ms INTEGER,
        success BOOLEAN DEFAULT TRUE,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    
    # On-chain Registry Indexing Table
    onchain_registry_table = """
    CREATE TABLE IF NOT EXISTS onchain_registry (
        id SERIAL PRIMARY KEY,
        contract_address VARCHAR(42) NOT NULL,
        registry_type VARCHAR(50) NOT NULL,
        block_number BIGINT NOT NULL,
        transaction_hash VARCHAR(66) NOT NULL,
        event_name VARCHAR(100),
        event_data JSONB,
        indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(contract_address, registry_type, block_number)
    )
    """
    
    tables = [
        contract_metadata_table,
        analysis_history_table, 
        risk_score_records_table,
        user_logs_table,
        onchain_registry_table
    ]
    
    try:
        for table_sql in tables:
            db.execute_command(table_sql)
        logger.info("All database tables created successfully")
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()