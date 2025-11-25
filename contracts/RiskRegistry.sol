// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RiskRegistry
 * @dev On-chain data labeling contract for storing and managing smart contract risk assessments.
 * 
 * This contract serves as a public registry where:
 * - Owner and authorized writers can publish/update risk scores
 * - Anyone can read risk scores for any smart contract address
 * - Risk scores are immutable once written (can only be updated by owner)
 * 
 * Use Cases:
 * - Security scanners publishing risk analysis results
 * - AI engines storing contract safety scores
 * - Auditing tools storing verification results
 * - Risk management systems maintaining contract ratings
 */

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract RiskRegistry is Ownable, ReentrancyGuard {
    
    // ============ STATE VARIABLES ============
    
    /// Maximum allowed length for a risk score string (prevents storage bloat)
    uint256 public constant MAX_RISK_SCORE_LENGTH = 256;
    
    /// Maps contract addresses to their risk scores
    /// Example: 0x123...abc => "SAFE", "HIGH_RISK", "score: 82", etc.
    mapping(address => string) private riskScores;
    
    /// Maps addresses to authorization status for writing scores
    /// Authorized writers can publish new risk scores without being owner
    mapping(address => bool) private authorizedWriters;
    
    /// Tracks which contracts have existing risk scores
    /// Used to prevent accidental overwrites
    mapping(address => bool) private scoreExists;
    
    // ============ EVENTS ============
    
    /**
     * Emitted when a new risk score is written to the registry
     */
    event RiskScoreWritten(
        address indexed targetContract,
        string riskScore,
        address indexed writer,
        uint256 timestamp
    );
    
    /**
     * Emitted when an existing risk score is updated (owner only)
     */
    event RiskScoreUpdated(
        address indexed targetContract,
        string oldScore,
        string newScore,
        uint256 timestamp
    );
    
    /**
     * Emitted when a risk score is removed from registry
     */
    event RiskScoreRemoved(
        address indexed targetContract,
        string previousScore,
        uint256 timestamp
    );
    
    /**
     * Emitted when an address is authorized/deauthorized to write scores
     */
    event WriterAuthorized(
        address indexed writer,
        bool isAuthorized,
        uint256 timestamp
    );
    
    // ============ MODIFIERS ============
    
    /**
     * Ensures only owner or authorized writers can call the function
     */
    modifier onlyWriters() {
        require(
            msg.sender == owner() || authorizedWriters[msg.sender],
            "RiskRegistry: Only owner or authorized writers can perform this action"
        );
        _;
    }
    
    /**
     * Validates that a risk score is not empty and within size limits
     */
    modifier validScore(string memory _score) {
        require(
            bytes(_score).length > 0,
            "RiskRegistry: Risk score cannot be empty"
        );
        require(
            bytes(_score).length <= MAX_RISK_SCORE_LENGTH,
            "RiskRegistry: Risk score exceeds maximum length"
        );
        _;
    }
    
    // ============ WRITE FUNCTIONS ============
    
    /**
     * @dev Write a new risk score for a contract address
     * @param _targetContract Address of the smart contract being scored
     * @param _riskScore The risk assessment result (string format)
     * 
     * Requirements:
     * - Caller must be owner or authorized writer
     * - Risk score cannot be empty
     * - Risk score cannot exceed MAX_RISK_SCORE_LENGTH
     * - Score cannot already exist for this contract (prevents accidental overwrites)
     * 
     * Example scores:
     * - "SAFE"
     * - "HIGH_RISK"
     * - "MALICIOUS"
     * - "score: 85/100"
     * - "MEDIUM_RISK_REENTRANCY"
     */
    function writeRiskScore(
        address _targetContract,
        string memory _riskScore
    ) 
        external 
        onlyWriters 
        validScore(_riskScore)
        nonReentrant
    {
        // Prevent accidental overwrites - scores are immutable once written
        require(
            !scoreExists[_targetContract],
            "RiskRegistry: Score already exists for this contract. Use updateRiskScore (owner only) to modify."
        );
        
        // Store the new risk score
        riskScores[_targetContract] = _riskScore;
        scoreExists[_targetContract] = true;
        
        // Emit event for off-chain tracking and indexing
        emit RiskScoreWritten(_targetContract, _riskScore, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Update an existing risk score (owner only)
     * @param _targetContract Address of the smart contract being updated
     * @param _newRiskScore The new risk assessment
     * 
     * Requirements:
     * - Caller must be owner (security critical)
     * - Score must already exist
     * - New score must be valid
     * 
     * Use Case: Correcting inaccurate assessments or updating as new info emerges
     */
    function updateRiskScore(
        address _targetContract,
        string memory _newRiskScore
    ) 
        external 
        onlyOwner 
        validScore(_newRiskScore)
        nonReentrant
    {
        require(
            scoreExists[_targetContract],
            "RiskRegistry: No score exists for this contract"
        );
        
        // Store old score for event emission
        string memory oldScore = riskScores[_targetContract];
        
        // Update with new score
        riskScores[_targetContract] = _newRiskScore;
        
        // Emit event documenting the update
        emit RiskScoreUpdated(_targetContract, oldScore, _newRiskScore, block.timestamp);
    }
    
    /**
     * @dev Remove a risk score from registry (owner only, emergency use)
     * @param _targetContract Address of the contract whose score should be removed
     * 
     * Requirements:
     * - Caller must be owner
     * - Score must exist
     * 
     * Use Case: Emergency removal of incorrect or malicious scores
     */
    function removeRiskScore(address _targetContract)
        external
        onlyOwner
        nonReentrant
    {
        require(
            scoreExists[_targetContract],
            "RiskRegistry: No score exists for this contract"
        );
        
        string memory previousScore = riskScores[_targetContract];
        
        // Remove the score and mark as non-existent
        delete riskScores[_targetContract];
        scoreExists[_targetContract] = false;
        
        // Emit event for transparency
        emit RiskScoreRemoved(_targetContract, previousScore, block.timestamp);
    }
    
    // ============ WRITER MANAGEMENT ============
    
    /**
     * @dev Authorize an address to write risk scores (owner only)
     * @param _writer Address to authorize
     * 
     * Use Case: Give write permissions to AI bots, backend services, or authorized verifiers
     */
    function authorizeWriter(address _writer)
        external
        onlyOwner
    {
        require(_writer != address(0), "RiskRegistry: Invalid writer address");
        require(!authorizedWriters[_writer], "RiskRegistry: Writer already authorized");
        
        authorizedWriters[_writer] = true;
        emit WriterAuthorized(_writer, true, block.timestamp);
    }
    
    /**
     * @dev Revoke write permissions from an address (owner only)
     * @param _writer Address to revoke permissions from
     */
    function revokeWriter(address _writer)
        external
        onlyOwner
    {
        require(authorizedWriters[_writer], "RiskRegistry: Writer not currently authorized");
        
        authorizedWriters[_writer] = false;
        emit WriterAuthorized(_writer, false, block.timestamp);
    }
    
    // ============ READ FUNCTIONS (PUBLIC) ============
    
    /**
     * @dev Read the risk score for any contract address
     * @param _targetContract Address of the contract to check
     * @return Risk score string, or empty string if no score exists
     * 
     * Note: This is a public read function - anyone can call it
     * Use Cases:
     * - Wallets checking if a contract is safe before interaction
     * - dApps displaying risk warnings
     * - Block explorers showing security info
     * - Automated systems making decisions
     */
    function getRiskScore(address _targetContract)
        external
        view
        returns (string memory)
    {
        if (!scoreExists[_targetContract]) {
            return "";
        }
        return riskScores[_targetContract];
    }
    
    /**
     * @dev Check if a risk score exists for a contract
     * @param _targetContract Address to check
     * @return True if score exists, false otherwise
     */
    function hasRiskScore(address _targetContract)
        external
        view
        returns (bool)
    {
        return scoreExists[_targetContract];
    }
    
    /**
     * @dev Check if an address is authorized to write scores
     * @param _writer Address to check
     * @return True if authorized, false otherwise
     */
    function isWriterAuthorized(address _writer)
        external
        view
        returns (bool)
    {
        return authorizedWriters[_writer];
    }
}
