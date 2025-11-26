// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ResultsRegistry
 * @dev A secure smart contract for storing and retrieving risk assessment scores for smart contracts
 * @notice This contract allows authorized users to write and anyone to read risk scores for contract addresses
 * @dev Implements OpenZeppelin security standards including Ownable, ReentrancyGuard, and proper access control
 */
contract ResultsRegistry is Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // Risk level enum for AgentKit integration
    enum RiskLevel { Safe, Warning, Dangerous }
    
    // Mapping from a contract address to its risk score
    mapping(address => string) private _riskScores;
    
    // Mapping from a contract address to its risk level
    mapping(address => RiskLevel) private _riskLevels;
    
    // Mapping to track authorized writers (besides owner)
    mapping(address => bool) private _authorizedWriters;
    
    // Maximum length for risk score strings to prevent storage abuse
    uint256 public constant MAX_RISK_SCORE_LENGTH = 256;
    
    // Event to emit when a new score is recorded
    event ScoreRecorded(
        address indexed contractAddress, 
        string riskScore,
        RiskLevel riskLevel,
        address indexed recordedBy,
        uint256 timestamp
    );
    
    // Event to emit when a writer is authorized/revoked
    event WriterAuthorizationChanged(
        address indexed writer,
        bool authorized,
        address indexed changedBy
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Modifier to check if caller is authorized to write scores
     */
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || _authorizedWriters[msg.sender],
            "ResultsRegistry: caller is not authorized"
        );
        _;
    }
    
    /**
     * @dev Authorize or revoke a writer address
     * @param writer The address to authorize/revoke
     * @param authorized Whether to authorize (true) or revoke (false)
     */
    function setWriterAuthorization(address writer, bool authorized) 
        external 
        onlyOwner 
    {
        require(writer != address(0), "ResultsRegistry: invalid writer address");
        _authorizedWriters[writer] = authorized;
        emit WriterAuthorizationChanged(writer, authorized, msg.sender);
    }
    
    /**
     * @dev Check if an address is authorized to write scores
     * @param writer The address to check
     * @return bool True if authorized, false otherwise
     */
    function isAuthorizedWriter(address writer) external view returns (bool) {
        return writer == owner() || _authorizedWriters[writer];
    }

    /**
     * @dev Write the risk score for a given contract address
     * @param _contractAddress The address of the contract to store the risk score for
     * @param _riskScore The risk score string to store
     * @param _riskLevel The risk level enum for AgentKit integration
     * @notice Only callable by owner or authorized writers
     * @notice Implements reentrancy protection and comprehensive input validation
     */
    function writeRiskScore(
        address _contractAddress, 
        string memory _riskScore,
        RiskLevel _riskLevel
    ) 
        external 
        nonReentrant 
        onlyAuthorized 
    {
        // Comprehensive input validation
        require(_contractAddress != address(0), 
            "ResultsRegistry: invalid contract address");
        require(bytes(_riskScore).length > 0, 
            "ResultsRegistry: risk score cannot be empty");
        require(bytes(_riskScore).length <= MAX_RISK_SCORE_LENGTH, 
            string(abi.encodePacked(
                "ResultsRegistry: risk score exceeds maximum length of ", 
                MAX_RISK_SCORE_LENGTH.toString(),
                " characters"
            ))
        );
        
        // Prevent overwriting existing scores without explicit action
        require(
            bytes(_riskScores[_contractAddress]).length == 0,
            "ResultsRegistry: score already exists for this contract"
        );
        
        _riskScores[_contractAddress] = _riskScore;
        _riskLevels[_contractAddress] = _riskLevel;
        
        emit ScoreRecorded(
            _contractAddress, 
            _riskScore, 
            _riskLevel,
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @dev Update an existing risk score (only owner)
     * @param _contractAddress The address of the contract to update
     * @param _riskScore The new risk score string
     * @param _riskLevel The new risk level enum for AgentKit integration
     */
    function updateRiskScore(
        address _contractAddress, 
        string memory _riskScore,
        RiskLevel _riskLevel
    ) 
        external 
        nonReentrant 
        onlyOwner 
    {
        require(_contractAddress != address(0), 
            "ResultsRegistry: invalid contract address");
        require(bytes(_riskScore).length > 0, 
            "ResultsRegistry: risk score cannot be empty");
        require(bytes(_riskScore).length <= MAX_RISK_SCORE_LENGTH, 
            string(abi.encodePacked(
                "ResultsRegistry: risk score exceeds maximum length of ", 
                MAX_RISK_SCORE_LENGTH.toString(),
                " characters"
            ))
        );
        require(
            bytes(_riskScores[_contractAddress]).length > 0,
            "ResultsRegistry: no existing score to update"
        );
        
        _riskScores[_contractAddress] = _riskScore;
        _riskLevels[_contractAddress] = _riskLevel;
        
        emit ScoreRecorded(
            _contractAddress, 
            _riskScore, 
            _riskLevel,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @dev Read the risk score for a given contract address
     * @param _contractAddress The address of the contract to retrieve the risk score for
     * @return The risk score string for the given contract address
     */
    function getRiskScore(address _contractAddress) 
        external 
        view 
        returns (string memory) 
    {
        require(_contractAddress != address(0), 
            "ResultsRegistry: invalid contract address");
        
        string memory score = _riskScores[_contractAddress];
        require(bytes(score).length > 0, 
            "ResultsRegistry: no risk score found for this contract");
        
        return score;
    }
    
    /**
     * @dev Check if a risk score exists for a given contract address
     * @param _contractAddress The address to check
     * @return bool True if a score exists, false otherwise
     */
    function hasRiskScore(address _contractAddress) external view returns (bool) {
        return bytes(_riskScores[_contractAddress]).length > 0;
    }

    /**
     * @dev Get the risk level for a given contract address
     * @param _contractAddress The address of the contract to retrieve the risk level for
     * @return RiskLevel The risk level enum for the given contract address
     * @notice This function enables AgentKit to programmatically check risk levels
     */
    function getRiskLevel(address _contractAddress) 
        external 
        view 
        returns (RiskLevel) 
    {
        require(_contractAddress != address(0), 
            "ResultsRegistry: invalid contract address");
        require(bytes(_riskScores[_contractAddress]).length > 0, 
            "ResultsRegistry: no risk score found for this contract");
        
        return _riskLevels[_contractAddress];
    }
    
    /**
     * @dev Emergency function to remove a risk score (only owner)
     * @param _contractAddress The contract address to remove the score for
     */
    function removeRiskScore(address _contractAddress) external onlyOwner {
        require(_contractAddress != address(0), 
            "ResultsRegistry: invalid contract address");
        require(bytes(_riskScores[_contractAddress]).length > 0, 
            "ResultsRegistry: no score to remove");
        
        delete _riskScores[_contractAddress];
        delete _riskLevels[_contractAddress];
        
        emit ScoreRecorded(
            _contractAddress, 
            "", 
            RiskLevel.Safe, // Default to Safe when removing
            msg.sender,
            block.timestamp
        );
    }
}