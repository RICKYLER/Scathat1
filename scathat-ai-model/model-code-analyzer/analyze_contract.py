#!/usr/bin/env python3
"""
Simple inference script for Solidity contract analysis using fine-tuned LLM
"""

from transformers import AutoTokenizer, AutoModelForCausalLM
import re

def load_model(model_path):
    """Load fine-tuned model and tokenizer"""
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(model_path)
    return tokenizer, model

def analyze_contract(tokenizer, model, solidity_code):
    """
    Analyze Solidity contract for vulnerabilities and risk
    
    Args:
        tokenizer: Loaded tokenizer
        model: Loaded fine-tuned model
        solidity_code: Solidity source code to analyze
    
    Returns:
        Dictionary with vulnerabilities, risk_score, and summary
    """
    
    # Create prompt
    prompt = f"""### Instruction:
Analyze this Solidity smart contract for security vulnerabilities, code quality issues, and provide a risk assessment.

### Input:
{solidity_code}

### Response:
"""
    
    # Generate response
    inputs = tokenizer.encode(prompt, return_tensors="pt", max_length=1024, truncation=True)
    
    outputs = model.generate(
        inputs,
        max_length=2048,
        num_return_sequences=1,
        temperature=0.1,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Extract the response part (after "### Response:")
    response_text = response.split("### Response:")[-1].strip()
    
    # Parse the structured output
    return parse_llm_output(response_text)

def parse_llm_output(output_text):
    """Parse the structured output from LLM"""
    
    result = {
        "vulnerabilities": [],
        "risk_score": 0,
        "summary": ""
    }
    
    # Extract vulnerabilities
    vuln_match = re.search(r'VULNERABILITIES:(.*?)(?:RISK_SCORE:|SUMMARY:|$)', output_text, re.DOTALL)
    if vuln_match:
        vuln_text = vuln_match.group(1).strip()
        result["vulnerabilities"] = [line.strip("- ").strip() for line in vuln_text.split('\n') if line.strip()]
    
    # Extract risk score
    risk_match = re.search(r'RISK_SCORE:\s*(\d+)', output_text)
    if risk_match:
        result["risk_score"] = int(risk_match.group(1))
    
    # Extract summary
    summary_match = re.search(r'SUMMARY:(.*?)$', output_text, re.DOTALL)
    if summary_match:
        result["summary"] = summary_match.group(1).strip()
    
    return result

def calculate_risk_score(vulnerabilities):
    """Calculate risk score based on vulnerabilities found"""
    
    risk_mapping = {
        "reentrancy": 90,
        "overflow": 70,
        "access control": 60,
        "unchecked calls": 50,
        "gas limit": 40,
        "code quality": 20
    }
    
    max_risk = 0
    for vuln in vulnerabilities:
        for pattern, score in risk_mapping.items():
            if pattern in vuln.lower():
                max_risk = max(max_risk, score)
    
    return max_risk if max_risk > 0 else 10  # Default low risk

if __name__ == "__main__":
    # Example usage
    model_path = "./fine_tuned_model"
    
    # Example Solidity contract
    example_contract = """
pragma solidity ^0.8.0;

contract Vulnerable {
    mapping(address => uint) balances;
    
    function withdraw() public {
        uint amount = balances[msg.sender];
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        balances[msg.sender] = 0;
    }
}
"""
    
    # Load model
    print("Loading model...")
    tokenizer, model = load_model(model_path)
    
    # Analyze contract
    print("Analyzing contract...")
    analysis = analyze_contract(tokenizer, model, example_contract)
    
    # Display results
    print("\n=== ANALYSIS RESULTS ===")
    print(f"Vulnerabilities: {analysis['vulnerabilities']}")
    print(f"Risk Score: {analysis['risk_score']}")
    print(f"Summary: {analysis['summary']}")