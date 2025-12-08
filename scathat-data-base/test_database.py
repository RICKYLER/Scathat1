#!/usr/bin/env python3
"""
Test Script for Scathat Database
Demonstrates all database operations with sample data
"""

import json
from datetime import datetime, timedelta
from database import create_tables
from data_access import (
    ContractMetadataDAO, AnalysisHistoryDAO, 
    RiskScoreDAO, UserLogsDAO, OnchainRegistryDAO
)

def test_contract_metadata():
    """Test contract metadata operations"""
    print("=== Testing Contract Metadata ===\n")
    
    # Sample contract data
    contract_data = {
        'contract_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        'contract_name': 'USDT',
        'compiler_version': 'v0.4.26',
        'optimization_enabled': True,
        'creation_block': 4634748,
        'creator_address': '0x1Ba5BcC3D9fC47b8F7912EEc5f32e6d9B88e6eE9',
        'source_code_hash': 'a1b2c3d4e5f67890abcdef1234567890',
        'bytecode_hash': 'f1e2d3c4b5a6978fedcba9876543210'
    }
    
    # Save contract metadata
    contract_id = ContractMetadataDAO.save_contract_metadata(contract_data)
    print(f"✓ Saved contract metadata with ID: {contract_id}")
    
    # Retrieve contract metadata
    metadata = ContractMetadataDAO.get_contract_metadata(contract_data['contract_address'])
    print(f"✓ Retrieved contract: {metadata['contract_name']} at {metadata['contract_address']}")
    
    return contract_data['contract_address']

def test_analysis_history(contract_address):
    """Test analysis history operations"""
    print("\n=== Testing Analysis History ===\n")
    
    # Sample analysis data
    analysis_data = {
        'contract_address': contract_address,
        'analysis_type': 'full_scan',
        'risk_score': 0.15,
        'risk_level': 'low',
        'code_analysis_score': 0.12,
        'bytecode_analysis_score': 0.18,
        'behavior_analysis_score': 0.10,
        'aggregated_score': 0.15,
        'analysis_details': {
            'vulnerabilities_found': 2,
            'warnings': 5,
            'gas_optimizations': 3
        },
        'analyzed_by': 'automated_scanner',
        'analysis_duration': timedelta(minutes=2, seconds=30)
    }
    
    # Save analysis result
    analysis_id = AnalysisHistoryDAO.save_analysis_result(analysis_data)
    print(f"✓ Saved analysis result with ID: {analysis_id}")
    
    # Retrieve analysis history
    history = AnalysisHistoryDAO.get_analysis_history(contract_address)
    print(f"✓ Retrieved {len(history)} analysis records")
    
    return analysis_id

def test_risk_scores(contract_address):
    """Test risk score operations"""
    print("\n=== Testing Risk Scores ===\n")
    
    # Sample risk data
    risk_data = {
        'contract_address': contract_address,
        'overall_risk_score': 0.15,
        'code_risk_score': 0.12,
        'bytecode_risk_score': 0.18,
        'behavior_risk_score': 0.10,
        'confidence_score': 0.92,
        'risk_level': 'low'
    }
    
    # Save risk score
    risk_id = RiskScoreDAO.save_risk_score(risk_data)
    print(f"✓ Saved risk score with ID: {risk_id}")
    
    # Retrieve risk history
    risk_history = RiskScoreDAO.get_risk_score_history(contract_address)
    print(f"✓ Retrieved {len(risk_history)} risk score records")
    
    return risk_id

def test_user_logs():
    """Test user logs operations (anonymized)"""
    print("\n=== Testing User Logs ===\n")
    
    # Sample log data
    log_data = {
        'session_id': 'session_12345',
        'user_action': 'contract_scan',
        'contract_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        'analysis_type': 'quick_scan',
        'ip_hash': 'hashed_ip_abc123',
        'user_agent_hash': 'hashed_ua_def456',
        'duration_ms': 1500,
        'success': True,
        'error_message': None
    }
    
    # Save user log
    log_id = UserLogsDAO.log_user_action(log_data)
    print(f"✓ Saved user log with ID: {log_id}")
    
    # Retrieve user actions
    user_actions = UserLogsDAO.get_user_actions('session_12345')
    print(f"✓ Retrieved {len(user_actions)} user actions")
    
    return log_id

def test_onchain_registry():
    """Test on-chain registry operations"""
    print("\n=== Testing On-chain Registry ===\n")
    
    # Sample registry event
    event_data = {
        'contract_address': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        'registry_type': 'token_registry',
        'block_number': 17654321,
        'transaction_hash': '0xabc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
        'event_name': 'TokenRegistered',
        'event_data': {
            'token_name': 'USDT',
            'token_symbol': 'USDT',
            'decimals': 6,
            'total_supply': '1000000000000000000'
        }
    }
    
    # Index registry event
    event_id = OnchainRegistryDAO.index_registry_event(event_data)
    print(f"✓ Indexed registry event with ID: {event_id}")
    
    # Retrieve registry events
    events = OnchainRegistryDAO.get_registry_events(event_data['contract_address'])
    print(f"✓ Retrieved {len(events)} registry events")
    
    return event_id

def demonstrate_all_operations():
    """Demonstrate all database operations"""
    print("Scathat Database - Demonstration")
    print("=" * 50)
    
    # Create tables first
    print("Creating database tables...")
    create_tables()
    
    # Test all operations
    contract_address = test_contract_metadata()
    test_analysis_history(contract_address)
    test_risk_scores(contract_address)
    test_user_logs()
    test_onchain_registry()
    
    print("\n" + "=" * 50)
    print("✅ All database operations completed successfully!")
    print("\nDatabase Schema Overview:")
    print("- contract_metadata: Contract details and metadata")
    print("- analysis_history: Analysis results and timestamps")
    print("- risk_score_records: Risk score tracking over time")
    print("- user_logs: Anonymized user activity logs")
    print("- onchain_registry: On-chain event indexing")
    print("\nAll data is properly related through contract_address foreign keys.")

if __name__ == "__main__":
    demonstrate_all_operations()