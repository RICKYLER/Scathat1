#!/usr/bin/env python3
"""
Simple dataset conversion script for LLM fine-tuning
Converts raw Solidity code samples to instruction format
"""

import json
import os
from pathlib import Path

def convert_to_instruction_format(input_dir, output_file):
    """
    Convert raw Solidity datasets to instruction format for LLM fine-tuning
    
    Args:
        input_dir: Directory containing raw JSONL datasets
        output_file: Output file for instruction-formatted data
    """
    instruction_data = []
    
    # Process all JSONL files in input directory
    for file_path in Path(input_dir).glob("*.jsonl"):
        print(f"Processing {file_path.name}")
        
        with open(file_path, 'r') as f:
            for line in f:
                try:
                    data = json.loads(line)
                    
                    # Create instruction format
                    instruction = {
                        "instruction": "Analyze this Solidity smart contract for security vulnerabilities, code quality issues, and provide a risk assessment.",
                        "input": data.get("source_code", ""),
                        "output": create_output_format(data)
                    }
                    
                    instruction_data.append(instruction)
                    
                except json.JSONDecodeError:
                    print(f"Skipping invalid JSON in {file_path}")
    
    # Save instruction-formatted data
    with open(output_file, 'w') as f:
        for item in instruction_data:
            f.write(json.dumps(item) + '\n')
    
    print(f"Converted {len(instruction_data)} examples to {output_file}")

def create_output_format(data):
    """Create standardized output format for LLM training with comprehensive analysis"""
    vulnerabilities = data.get("vulnerabilities", [])
    risk_score = data.get("risk_score", 0)
    summary = data.get("summary", "")
    
    # Enhanced output format with structured analysis
    output_lines = [
        "SECURITY ANALYSIS:",
        "",
        "VULNERABILITIES:",
    ]
    
    if vulnerabilities:
        output_lines.extend([f"- {vuln}" for vuln in vulnerabilities])
    else:
        output_lines.append("- No critical vulnerabilities detected")
    
    output_lines.extend([
        "",
        "RISK ASSESSMENT:",
        f"- Overall Risk Score: {risk_score}/100",
        f"- Severity: {'CRITICAL' if risk_score >= 80 else 'HIGH' if risk_score >= 60 else 'MEDIUM' if risk_score >= 40 else 'LOW'}",
        "",
        "RECOMMENDATIONS:",
        *generate_recommendations(vulnerabilities),
        "",
        "SUMMARY:",
        summary
    ])
    
    return '\n'.join(output_lines)

def generate_recommendations(vulnerabilities):
    """Generate specific recommendations based on vulnerabilities"""
    recommendations = []
    
    vuln_patterns = {
        "reentrancy": "Use checks-effects-interactions pattern and consider using ReentrancyGuard",
        "overflow": "Use SafeMath library or Solidity 0.8+ built-in overflow protection",
        "access control": "Implement proper role-based access control with modifiers",
        "unchecked calls": "Always check return values of external calls",
        "gas limit": "Optimize loops and avoid unbounded operations"
    }
    
    for vuln in vulnerabilities:
        vuln_lower = vuln.lower()
        for pattern, recommendation in vuln_patterns.items():
            if pattern in vuln_lower:
                recommendations.append(f"- {recommendation}")
    
    if not recommendations:
        recommendations = ["- Code follows security best practices", "- Regular security audits recommended"]
    
    return recommendations

if __name__ == "__main__":
    # Example usage
    input_dir = "../datasets/raw"
    output_file = "../datasets/processed/instruction_data.jsonl"
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    convert_to_instruction_format(input_dir, output_file)