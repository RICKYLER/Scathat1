"""
Monitoring and Logging Configuration for Bytecode Detector

Provides comprehensive monitoring, logging, and performance tracking
for the production deployment.
"""

import logging
import time
import json
from datetime import datetime
from typing import Dict, Any, Optional
from dataclasses import dataclass
from prometheus_client import Counter, Gauge, Histogram, generate_latest
from fastapi import Response

# Prometheus metrics
REQUEST_COUNT = Counter(
    'bytecode_analyzer_requests_total', 
    'Total number of analysis requests',
    ['method', 'endpoint']
)

REQUEST_DURATION = Histogram(
    'bytecode_analyzer_request_duration_seconds',
    'Request duration in seconds',
    ['method', 'endpoint']
)

RISK_SCORE_GAUGE = Gauge(
    'bytecode_analyzer_risk_score',
    'Risk score distribution',
    ['risk_level']
)

PATTERN_SCORE_GAUGE = Gauge(
    'bytecode_analyzer_pattern_score',
    'Pattern score distribution',
    ['pattern_type']
)

ERROR_COUNT = Counter(
    'bytecode_analyzer_errors_total',
    'Total number of errors',
    ['error_type']
)

@dataclass
class MonitoringConfig:
    """Monitoring configuration"""
    enable_prometheus: bool = True
    log_level: str = "INFO"
    log_file: str = "logs/bytecode_detector.log"
    metrics_port: int = 9090
    
class PerformanceMonitor:
    """Performance monitoring and metrics collection"""
    
    def __init__(self, config: MonitoringConfig):
        self.config = config
        self.setup_logging()
        
    def setup_logging(self):
        """Configure structured logging"""
        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(self.config.log_file),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def track_request(self, method: str, endpoint: str):
        """Track API request"""
        REQUEST_COUNT.labels(method=method, endpoint=endpoint).inc()
        
    def track_duration(self, method: str, endpoint: str, duration: float):
        """Track request duration"""
        REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)
        
    def track_risk_score(self, risk_score: float):
        """Track risk score distribution"""
        risk_level = self._categorize_risk(risk_score)
        RISK_SCORE_GAUGE.labels(risk_level=risk_level).set(risk_score)
        
    def track_pattern_score(self, pattern_type: str, score: float):
        """Track pattern score distribution"""
        PATTERN_SCORE_GAUGE.labels(pattern_type=pattern_type).set(score)
        
    def track_error(self, error_type: str):
        """Track error occurrences"""
        ERROR_COUNT.labels(error_type=error_type).inc()
        
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk score into levels"""
        if risk_score < 0.2:
            return "low"
        elif risk_score < 0.4:
            return "medium_low"
        elif risk_score < 0.6:
            return "medium"
        elif risk_score < 0.8:
            return "medium_high"
        else:
            return "high"
    
    def log_analysis(self, 
                    bytecode_hash: str, 
                    risk_score: float, 
                    pattern_scores: Dict[str, float],
                    processing_time: float,
                    contract_address: Optional[str] = None):
        """Log analysis results in structured format"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "bytecode_hash": bytecode_hash,
            "contract_address": contract_address,
            "risk_score": risk_score,
            "pattern_scores": pattern_scores,
            "processing_time": processing_time,
            "risk_category": self._categorize_risk(risk_score)
        }
        
        self.logger.info(json.dumps(log_data))
        
        # Track metrics
        self.track_risk_score(risk_score)
        for pattern, score in pattern_scores.items():
            self.track_pattern_score(pattern, score)
    
    def log_error(self, error_type: str, error_message: str, context: Dict[str, Any] = None):
        """Log error with context"""
        error_data = {
            "timestamp": datetime.now().isoformat(),
            "error_type": error_type,
            "error_message": error_message,
            "context": context or {}
        }
        
        self.logger.error(json.dumps(error_data))
        self.track_error(error_type)

# Default monitoring instance
monitor = PerformanceMonitor(MonitoringConfig())

def get_metrics():
    """Get Prometheus metrics"""
    return Response(generate_latest(), media_type="text/plain")

def monitor_request(method: str, endpoint: str):
    """Decorator to monitor request duration"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            start_time = time.time()
            monitor.track_request(method, endpoint)
            
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                monitor.track_duration(method, endpoint, duration)
                return result
            except Exception as e:
                duration = time.time() - start_time
                monitor.track_duration(method, endpoint, duration)
                monitor.track_error("request_failure")
                raise
        return wrapper
    return decorator