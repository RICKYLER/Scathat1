"""
Deployment Tests for Bytecode Detector
"""

import unittest
import os
import sys

# Add deployment directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

class TestDeployment(unittest.TestCase):
    
    def test_model_exists(self):
        """Test that model file exists"""
        self.assertTrue(os.path.exists("models/bytecode_detector_enhanced.pth"))
    
    def test_config_exists(self):
        """Test that config file exists"""
        self.assertTrue(os.path.exists("config/deployment_config.json"))
    
    def test_api_files_exist(self):
        """Test that API files exist"""
        self.assertTrue(os.path.exists("api/main.py"))
        self.assertTrue(os.path.exists("Dockerfile"))
    
    def test_requirements_exist(self):
        """Test that requirements file exists"""
        self.assertTrue(os.path.exists("requirements.txt"))

if __name__ == "__main__":
    unittest.main()
