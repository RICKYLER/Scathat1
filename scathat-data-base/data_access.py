#!/usr/bin/env python3
"""
Data Access Layer for Scathat Database
Simple CRUD operations for all database tables
"""

from typing import Dict, List, Optional, Any
from .database import Database

class ContractMetadataDAO:
    """Data Access Object for contract_metadata table"""
    
    @staticmethod
    def save_contract_metadata(contract_data: Dict[str, Any]) -> int:
        """Save or update contract metadata"""
        query = """
            INSERT INTO contract_metadata (
                contract_address, contract_name, compiler_version, 
                optimization_enabled, creation_block, creator_address,
                source_code_hash, bytecode_hash
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (contract_address) 
            DO UPDATE SET
                contract_name = EXCLUDED.contract_name,
                compiler_version = EXCLUDED.compiler_version,
                optimization_enabled = EXCLUDED.optimization_enabled,
                creation_block = EXCLUDED.creation_block,
                creator_address = EXCLUDED.creator_address,
                source_code_hash = EXCLUDED.source_code_hash,
                bytecode_hash = EXCLUDED.bytecode_hash,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
        """
        
        params = (
            contract_data['contract_address'],
            contract_data.get('contract_name'),
            contract_data.get('compiler_version'),
            contract_data.get('optimization_enabled', False),
            contract_data.get('creation_block'),
            contract_data.get('creator_address'),
            contract_data.get('source_code_hash'),
            contract_data.get('bytecode_hash')
        )
        
        db = Database()
        try:
            result = db.execute_query(query, params)
            return result[0]['id'] if result else None
        finally:
            db.close()
    
    @staticmethod
    def get_contract_metadata(contract_address: str) -> Optional[Dict]:
        """Get contract metadata by address"""
        query = "SELECT * FROM contract_metadata WHERE contract_address = %s"
        db = Database()
        try:
            result = db.execute_query(query, (contract_address,))
            return result[0] if result else None
        finally:
            db.close()

class AnalysisHistoryDAO:
    """Data Access Object for analysis_history table"""
    
    @staticmethod
    def save_analysis_result(analysis_data: Dict[str, Any]) -> int:
        """Save analysis result"""
        query = """
            INSERT INTO analysis_history (
                contract_address, analysis_type, risk_score, risk_level,
                code_analysis_score, bytecode_analysis_score, behavior_analysis_score,
                aggregated_score, analysis_details, analyzed_by, analysis_duration
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        params = (
            analysis_data['contract_address'],
            analysis_data['analysis_type'],
            analysis_data.get('risk_score', 0.0),
            analysis_data.get('risk_level'),
            analysis_data.get('code_analysis_score'),
            analysis_data.get('bytecode_analysis_score'),
            analysis_data.get('behavior_analysis_score'),
            analysis_data.get('aggregated_score'),
            analysis_data.get('analysis_details'),
            analysis_data.get('analyzed_by'),
            analysis_data.get('analysis_duration')
        )
        
        db = Database()
        try:
            result = db.execute_query(query, params)
            return result[0]['id'] if result else None
        finally:
            db.close()
    
    @staticmethod
    def get_analysis_history(contract_address: str, limit: int = 10) -> List[Dict]:
        """Get analysis history for a contract"""
        query = """
            SELECT * FROM analysis_history 
            WHERE contract_address = %s 
            ORDER BY created_at DESC 
            LIMIT %s
        """
        db = Database()
        try:
            return db.execute_query(query, (contract_address, limit))
        finally:
            db.close()

class RiskScoreDAO:
    """Data Access Object for risk_score_records table"""
    
    @staticmethod
    def save_risk_score(risk_data: Dict[str, Any]) -> int:
        """Save risk score record"""
        query = """
            INSERT INTO risk_score_records (
                contract_address, overall_risk_score, code_risk_score,
                bytecode_risk_score, behavior_risk_score, confidence_score, risk_level
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        params = (
            risk_data['contract_address'],
            risk_data['overall_risk_score'],
            risk_data.get('code_risk_score'),
            risk_data.get('bytecode_risk_score'),
            risk_data.get('behavior_risk_score'),
            risk_data.get('confidence_score'),
            risk_data.get('risk_level')
        )
        
        db = Database()
        try:
            result = db.execute_query(query, params)
            return result[0]['id'] if result else None
        finally:
            db.close()
    
    @staticmethod
    def get_risk_score_history(contract_address: str, days: int = 30) -> List[Dict]:
        """Get risk score history for a contract"""
        query = """
            SELECT * FROM risk_score_records 
            WHERE contract_address = %s 
            AND timestamp >= CURRENT_TIMESTAMP - INTERVAL '%s days'
            ORDER BY timestamp DESC
        """
        db = Database()
        try:
            return db.execute_query(query, (contract_address, days))
        finally:
            db.close()

class UserLogsDAO:
    """Data Access Object for user_logs table (anonymized)"""
    
    @staticmethod
    def log_user_action(log_data: Dict[str, Any]) -> int:
        """Log anonymized user action"""
        query = """
            INSERT INTO user_logs (
                session_id, user_action, contract_address, analysis_type,
                ip_hash, user_agent_hash, duration_ms, success, error_message
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """
        
        params = (
            log_data['session_id'],
            log_data['user_action'],
            log_data.get('contract_address'),
            log_data.get('analysis_type'),
            log_data.get('ip_hash'),
            log_data.get('user_agent_hash'),
            log_data.get('duration_ms'),
            log_data.get('success', True),
            log_data.get('error_message')
        )
        
        db = Database()
        try:
            result = db.execute_query(query, params)
            return result[0]['id'] if result else None
        finally:
            db.close()
    
    @staticmethod
    def get_user_actions(session_id: str) -> List[Dict]:
        """Get user actions for a session"""
        query = "SELECT * FROM user_logs WHERE session_id = %s ORDER BY created_at DESC"
        db = Database()
        try:
            return db.execute_query(query, (session_id,))
        finally:
            db.close()

class OnchainRegistryDAO:
    """Data Access Object for onchain_registry table"""
    
    @staticmethod
    def index_registry_event(event_data: Dict[str, Any]) -> int:
        """Index on-chain registry event"""
        query = """
            INSERT INTO onchain_registry (
                contract_address, registry_type, block_number,
                transaction_hash, event_name, event_data
            ) VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (contract_address, registry_type, block_number) 
            DO NOTHING
            RETURNING id
        """
        
        params = (
            event_data['contract_address'],
            event_data['registry_type'],
            event_data['block_number'],
            event_data['transaction_hash'],
            event_data.get('event_name'),
            event_data.get('event_data')
        )
        
        db = Database()
        try:
            result = db.execute_query(query, params)
            return result[0]['id'] if result else None
        finally:
            db.close()
    
    @staticmethod
    def get_registry_events(contract_address: str, registry_type: str = None) -> List[Dict]:
        """Get registry events for a contract"""
        if registry_type:
            query = """
                SELECT * FROM onchain_registry 
                WHERE contract_address = %s AND registry_type = %s
                ORDER BY block_number DESC
            """
            params = (contract_address, registry_type)
        else:
            query = """
                SELECT * FROM onchain_registry 
                WHERE contract_address = %s
                ORDER BY block_number DESC
            """
            params = (contract_address,)
        
        db = Database()
        try:
            return db.execute_query(query, params)
        finally:
            db.close()