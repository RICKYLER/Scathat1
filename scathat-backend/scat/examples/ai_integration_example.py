"""
AI Integration Example

Demonstrates integration of contract verification with AI analysis pipeline
for comprehensive on-chain security assessment with Base network.
"""

import os
import json
from services.ai_verification_integration import AIVerificationIntegration, integrate_with_ai_pipeline
from services.network_config import get_default_network

# Configuration
NETWORK_NAME = os.getenv('NETWORK_NAME', get_default_network())

# Example AI analysis results (simulating your AI model output)
AI_ANALYSIS_RESULTS = [
    {
        'address': '0x70f5a33cdB629E3d174e4976341EF7Fe2fA4D4F1',  # Your ResultsRegistry
        'risk_score': 0.85,  # High risk
        'confidence': 0.92,   # High confidence
        'model_version': 'bytecode-detector-v2',
        'analysis_timestamp': '2024-01-21T10:30:00Z'
    },
    {
        'address': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',  # WETH
        'risk_score': 0.15,  # Low risk  
        'confidence': 0.95,   # Very high confidence
        'model_version': 'bytecode-detector-v2',
        'analysis_timestamp': '2024-01-21T10:31:00Z',
        'expected_bytecode': '0x608060405260043610610...'  # Example expected bytecode
    },
    {
        'address': '0x0000000000000000000000000000000000000001',  # EOA
        'risk_score': 0.05,  # Very low risk
        'confidence': 0.98,   # Very high confidence
        'model_version': 'behavior-analyzer-v1',
        'analysis_timestamp': '2024-01-21T10:32:00Z'
    }
]

def demonstrate_ai_integration():
    """Demonstrate AI analysis integration with on-chain verification."""
    print("🤖 Scathat AI + Blockchain Integration Demo")
    print("=" * 60)
    print(f"📡 Network: {NETWORK_NAME}")
    print(f"🔗 Using integrated verification service")
    print()
    
    try:
        # Create integration service
        integration_service = AIVerificationIntegration(NETWORK_NAME)
        
        # Get network info
        network_info = integration_service.get_network_info()
        print(f"✅ Connected to {network_info['chain_name']} (Chain ID: {network_info['chain_id']})")
        print(f"📊 Block number: {network_info['block_number']}")
        print(f"⛽ Gas price: {network_info['gas_price']} wei")
        print()
        
        # Demonstrate individual contract analysis
        print("🧪 Individual Contract Analysis:")
        print("-" * 40)
        
        for ai_result in AI_ANALYSIS_RESULTS:
            comprehensive_result = integration_service.analyze_contract(
                contract_address=ai_result['address'],
                ai_risk_score=ai_result['risk_score'],
                ai_confidence=ai_result['confidence'],
                expected_bytecode=ai_result.get('expected_bytecode')
            )
            
            result_dict = comprehensive_result.to_dict()
            print(f"📋 Contract: {ai_result['address']}")
            print(f"   AI Risk: {result_dict['ai_risk_score']:.2f} (Confidence: {result_dict['ai_confidence']:.2f})")
            print(f"   Verification: {result_dict['verification_status']}")
            print(f"   Overall Risk: {result_dict['overall_risk_level']}")
            
            if result_dict['error_details']:
                print(f"   ❌ Error: {result_dict['error_details']}")
            else:
                print(f"   ✅ Security Analysis: {len(result_dict['security_analysis'])} checks passed")
                print(f"   ⛽ Gas Optimization: {result_dict['gas_optimization'].get('estimated_savings_percent', 0)}% potential savings")
            
            print()
        
        # Demonstrate batch processing (simulating your AI pipeline)
        print("🔄 Batch AI Pipeline Integration:")
        print("-" * 40)
        
        batch_results = integrate_with_ai_pipeline(AI_ANALYSIS_RESULTS)
        
        print(f"📊 Processed {len(batch_results)} contracts through AI pipeline")
        print(f"✅ Integration successful with comprehensive on-chain verification")
        print()
        
        # Show summary statistics
        risk_levels = [result['overall_risk_level'] for result in batch_results]
        risk_counts = {level: risk_levels.count(level) for level in set(risk_levels)}
        
        print("📈 Risk Distribution:")
        for level, count in risk_counts.items():
            print(f"   {level}: {count} contracts")
        
        print()
        print("🎯 Integration Features Demonstrated:")
        print("-" * 40)
        print("✅ Real-time on-chain contract verification")
        print("✅ AI risk score integration with verification status")  
        print("✅ Comprehensive security analysis combining multiple factors")
        print("✅ Gas optimization analysis for transaction efficiency")
        print("✅ Batch processing for high-throughput AI pipelines")
        print("✅ Base network integration with optimized configuration")
        print("✅ Error handling and graceful degradation")
        
        print()
        print("🚀 Next Steps for Production Integration:")
        print("-" * 40)
        print("1. Replace example AI results with your actual model output")
        print("2. Configure your private RPC endpoints in network_config.py")
        print("3. Set up environment variables for network selection")
        print("4. Integrate with your existing AI model deployment pipeline")
        print("5. Add monitoring and alerting for high-risk contracts")
        print("6. Implement caching for frequently analyzed contracts")
        
    except Exception as e:
        print(f"❌ Integration failed: {str(e)}")
        print("\n💡 Troubleshooting tips:")
        print("1. Check RPC URL connectivity")
        print("2. Verify network configuration")
        print("3. Ensure contract addresses are valid for the selected network")

if __name__ == "__main__":
    demonstrate_ai_integration()