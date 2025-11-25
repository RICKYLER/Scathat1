// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRiskRegistry
 * @dev Interface for the RiskRegistry contract
 * 
 * This interface allows other contracts and external services to interact with
 * the RiskRegistry in a standardized way.
 * 
 * Typical Usage:
 * - Other smart contracts checking risk scores
 * - Frontend dApps querying contract safety
 * - Automated systems making decisions based on risk
 */

interface IRiskRegistry {
    
    // ============ WRITE FUNCTIONS ============
    
    /**
     * Write a new risk score for a target contract
     */
    function writeRiskScore(address _targetContract, string memory _riskScore) external;
    
    /**
     * Update an existing risk score (owner only)
     */
    function updateRiskScore(address _targetContract, string memory _newRiskScore) external;
    
    /**
     * Remove a risk score from registry
     */
    function removeRiskScore(address _targetContract) external;
    
    /**
     * Authorize an address to write scores
     */
    function authorizeWriter(address _writer) external;
    
    /**
     * Revoke write permissions from an address
     */
    function revokeWriter(address _writer) external;
    
    // ============ READ FUNCTIONS ============
    
    /**
     * Get the risk score for a contract
     */
    function getRiskScore(address _targetContract) external view returns (string memory);
    
    /**
     * Check if a score exists for a contract
     */
    function hasRiskScore(address _targetContract) external view returns (bool);
    
    /**
     * Check if an address is authorized to write
     */
    function isWriterAuthorized(address _writer) external view returns (bool);
    
    // ============ EVENTS ============
    
    event RiskScoreWritten(address indexed targetContract, string riskScore, address indexed writer, uint256 timestamp);
    event RiskScoreUpdated(address indexed targetContract, string oldScore, string newScore, uint256 timestamp);
    event RiskScoreRemoved(address indexed targetContract, string previousScore, uint256 timestamp);
    event WriterAuthorized(address indexed writer, bool isAuthorized, uint256 timestamp);
}
