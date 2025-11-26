#!/usr/bin/env python3
"""
Integration test runner for Scathat backend services.

This script runs all integration tests and provides a summary report.
"""

import subprocess
import sys
import os

def run_tests():
    """Run all integration tests and return results."""
    
    # Change to the project directory
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(project_dir)
    
    print("🚀 Running Scathat Integration Tests")
    print("=" * 50)
    
    # Test files to run
    test_files = [
        "tests/integration/test_services_integration.py",
        "tests/integration/test_explorer_service.py",
        "tests/integration/test_venice_service.py",
        "tests/integration/test_web3_service.py",
        "tests/integration/test_agentkit_service.py"
    ]
    
    results = {}
    
    for test_file in test_files:
        print(f"\n📋 Running {test_file}")
        print("-" * 40)
        
        try:
            # Run the test file
            result = subprocess.run(
                [sys.executable, "-m", "pytest", test_file, "-v"],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            # Store results
            results[test_file] = {
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "success": result.returncode == 0
            }
            
            # Print individual test results
            if result.returncode == 0:
                print("✅ PASSED")
            else:
                print("❌ FAILED")
                print(result.stdout)
                if result.stderr:
                    print("STDERR:", result.stderr)
                    
        except subprocess.TimeoutExpired:
            print(f"⏰ TIMEOUT: {test_file} took too long")
            results[test_file] = {
                "returncode": -1,
                "stdout": "",
                "stderr": "Test timeout",
                "success": False
            }
        except Exception as e:
            print(f"💥 ERROR: {test_file} - {e}")
            results[test_file] = {
                "returncode": -1,
                "stdout": "",
                "stderr": str(e),
                "success": False
            }
    
    return results

def generate_report(results):
    """Generate a test summary report."""
    
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY REPORT")
    print("=" * 50)
    
    total_tests = len(results)
    passed_tests = sum(1 for result in results.values() if result["success"])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")
    
    if failed_tests > 0:
        print("\n❌ FAILED TESTS:")
        for test_file, result in results.items():
            if not result["success"]:
                print(f"  - {test_file}")
                if result["stderr"]:
                    print(f"    Error: {result['stderr']}")
    
    if passed_tests == total_tests:
        print("\n🎉 ALL INTEGRATION TESTS PASSED!")
        return True
    else:
        print(f"\n⚠️  {failed_tests} test(s) failed. Please check the logs.")
        return False

def main():
    """Main function to run tests and generate report."""
    
    # Check if pytest is available
    try:
        import pytest
    except ImportError:
        print("❌ pytest is not installed. Please install testing dependencies:")
        print("   pip install pytest pytest-asyncio requests fastapi httpx aiohttp")
        sys.exit(1)
    
    # Run tests
    results = run_tests()
    
    # Generate report
    success = generate_report(results)
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()