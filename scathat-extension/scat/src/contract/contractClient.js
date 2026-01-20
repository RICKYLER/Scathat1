// Smart contract client for interacting with ResultsRegistry
import { ethers } from './ethers.min.js';

class ContractClient {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAddress = '0x70f5a33cdB629E3d174e4976341EF7Fe2fA4D4F1';
        this.contractABI = [
            // Contract ABI will be loaded dynamically
        ];
    }

    // Initialize with Ethereum provider
    async initialize(ethereumProvider) {
        try {
            this.provider = new ethers.BrowserProvider(ethereumProvider);
            this.signer = await this.provider.getSigner();
            
            // Load contract ABI dynamically
            await this.loadContractABI();
            
            this.contract = new ethers.Contract(
                this.contractAddress,
                this.contractABI,
                this.signer
            );
            
            console.log('Contract client initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize contract client:', error);
            throw error;
        }
    }

    // Load contract ABI from the smart contract project
    async loadContractABI() {
        try {
            // Try to load ABI from configuration file first
            const configResponse = await fetch('/config/contract-config.json');
            if (configResponse.ok) {
                const config = await configResponse.json();
                if (config.RESULTS_REGISTRY_ABI) {
                    this.contractABI = JSON.parse(config.RESULTS_REGISTRY_ABI);
                    console.log('Contract ABI loaded from configuration');
                    return;
                }
            }
            
            // Fallback: Use the full ABI from the deployed contract
            // This includes all functions, events, and error definitions
            this.contractABI = [
                {"type":"constructor","stateMutability":"nonpayable","inputs":[]},
                {"type":"error","name":"OwnableInvalidOwner","inputs":[{"type":"address","name":"owner"}]},
                {"type":"error","name":"OwnableUnauthorizedAccount","inputs":[{"type":"address","name":"account"}]},
                {"type":"error","name":"ReentrancyGuardReentrantCall","inputs":[]},
                {"type":"event","anonymous":false,"name":"OwnershipTransferred","inputs":[{"type":"address","name":"previousOwner","indexed":true},{"type":"address","name":"newOwner","indexed":true}]},
                {"type":"event","anonymous":false,"name":"ScoreRecorded","inputs":[{"type":"address","name":"contractAddress","indexed":true},{"type":"string","name":"riskScore","indexed":false},{"type":"uint8","name":"riskLevel","indexed":false},{"type":"address","name":"recordedBy","indexed":true},{"type":"uint256","name":"timestamp","indexed":false}]},
                {"type":"event","anonymous":false,"name":"WriterAuthorizationChanged","inputs":[{"type":"address","name":"writer","indexed":true},{"type":"bool","name":"authorized","indexed":false},{"type":"address","name":"changedBy","indexed":true}]},
                {"type":"function","name":"MAX_RISK_SCORE_LENGTH","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"uint256","name":""}]},
                {"type":"function","name":"getRiskLevel","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"address","name":"_contractAddress"}],"outputs":[{"type":"uint8","name":""}]},
                {"type":"function","name":"getRiskScore","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"address","name":"_contractAddress"}],"outputs":[{"type":"string","name":""}]},
                {"type":"function","name":"hasRiskScore","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"address","name":"_contractAddress"}],"outputs":[{"type":"bool","name":""}]},
                {"type":"function","name":"isAuthorizedWriter","constant":true,"stateMutability":"view","payable":false,"inputs":[{"type":"address","name":"writer"}],"outputs":[{"type":"bool","name":""}]},
                {"type":"function","name":"owner","constant":true,"stateMutability":"view","payable":false,"inputs":[],"outputs":[{"type":"address","name":""}]},
                {"type":"function","name":"renounceOwnership","stateMutability":"nonpayable","payable":false,"inputs":[],"outputs":[]},
                {"type":"function","name":"setAuthorizedWriter","stateMutability":"nonpayable","payable":false,"inputs":[{"type":"address","name":"writer"},{"type":"bool","name":"authorized"}],"outputs":[]},
                {"type":"function","name":"transferOwnership","stateMutability":"nonpayable","payable":false,"inputs":[{"type":"address","name":"newOwner"}],"outputs":[]},
                {"type":"function","name":"updateRiskScore","stateMutability":"nonpayable","payable":false,"inputs":[{"type":"address","name":"_contractAddress"},{"type":"string","name":"_riskScore"},{"type":"uint8","name":"_riskLevel"}],"outputs":[]},
                {"type":"function","name":"writeRiskScore","stateMutability":"nonpayable","payable":false,"inputs":[{"type":"address","name":"_contractAddress"},{"type":"string","name":"_riskScore"},{"type":"uint8","name":"_riskLevel"}],"outputs":[]}
            ];
            
            console.log('Contract ABI loaded from fallback implementation');
        } catch (error) {
            console.error('Failed to load contract ABI:', error);
            throw error;
        }
    }

    // Check if current address is authorized to write to contract
    async isAuthorized() {
        try {
            const address = await this.signer.getAddress();
            return await this.contract.isAuthorizedWriter(address);
        } catch (error) {
            console.error('Authorization check failed:', error);
            return false;
        }
    }

    // Write risk score to contract (requires signature)
    async writeRiskScore(contractAddress, riskScore, riskLevel) {
        try {
            // Check authorization first
            const isAuthorized = await this.isAuthorized();
            if (!isAuthorized) {
                throw new Error('Wallet not authorized to write to contract');
            }

            // Send transaction (this will trigger wallet signature)
            const tx = await this.contract.writeRiskScore(
                contractAddress,
                riskScore,
                riskLevel
            );

            console.log('Transaction sent:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);
            
            return {
                success: true,
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber
            };
        } catch (error) {
            console.error('Failed to write risk score:', error);
            throw error;
        }
    }

    // Get risk score from contract
    async getRiskScore(contractAddress) {
        try {
            return await this.contract.getRiskScore(contractAddress);
        } catch (error) {
            console.error('Failed to get risk score:', error);
            throw error;
        }
    }

    // Sign a message with the wallet (for authentication)
    async signMessage(message) {
        try {
            const signature = await this.signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
        }
    }

    // Get current wallet address
    async getAddress() {
        try {
            return await this.signer.getAddress();
        } catch (error) {
            console.error('Failed to get address:', error);
            throw error;
        }
    }
}

export default new ContractClient();