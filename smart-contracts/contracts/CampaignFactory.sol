// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CampaignToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CampaignFactory is ReentrancyGuard {
    enum CampaignStatus {
        UPCOMING,
        ACTIVE,
        FUNDED,
        FAILED
    }

    struct InvestorInfo {
        uint256 amountInvested;
        uint256 tokensPurchased;
    }

    struct Campaign {
        address creator;
        uint256 goalAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 totalTokenSupply;
        uint256 mintedSupply;
        uint256 pricePerToken;
        uint256 amountRaised;
        string tokenName;
        string tokenSymbol;
        address tokenAddress;
        string metadataCID;
    }

    uint256 public nextCampaignId;
    mapping(uint256 => Campaign) public campaigns;
    // investor_portfolio: wallet_address -> campaign_id -> struct
    mapping(address => mapping(uint256 => InvestorInfo)) public investorInfo;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string tokenName,
        string tokenSymbol,
        uint256 goalAmount,
        uint256 startTime,
        uint256 endTime
    );

    event CampaignMetadataUpdated(
        uint256 indexed campaignId,
        string newCID
    );

    event Invested(
        uint256 indexed campaignId,
        address indexed investor,
        uint256 amountInvested,
        uint256 tokensPurchased
    );

    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount
    );

    event Refunded(
        uint256 indexed campaignId,
        address indexed investor,
        uint256 amountRefuned,
        uint256 tokensBurned
    );

    function createCampaign(
        uint256 goalAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 totalTokenSupply,
        string calldata tokenName,
        string calldata tokenSymbol,
        string calldata metadataCID
    ) external returns (uint256) {
        require(startTime > block.timestamp, "Result: Start time must be in future");
        require(endTime > startTime, "Result: End time must be after start time");
        require(goalAmount > 0, "Result: Goal amount must be > 0");
        require(totalTokenSupply > 0, "Result: Total supply must be > 0");

        uint256 campaignId = nextCampaignId++;

        // Deploy Token
        CampaignToken token = new CampaignToken(tokenName, tokenSymbol, address(this));

        // Calculate Price: goalAmount / totalTokenSupply (in wei per token check)
        // Warning: precision issues if goalAmount < totalTokenSupply. Assuming appropriate scaling (e.g. 18 decimals)
        // We will assume tokens have 18 decimals and goalAmount is in wei.
        // Price per 1 whole token (1e18 units) = goalAmount * 1e18 / totalTokenSupply
        // Simple division for pricePerTokenUnit
        uint256 pricePerToken = (goalAmount * 1e18) / totalTokenSupply; 
        // NOTE: This logic assumes totalTokenSupply includes decimals or is raw count? 
        // Usually totalTokenSupply is passed as raw units (e.g. 1000 * 10**18).
        // Let's assume totalTokenSupply is in WEI units (18 decimals).
        
        Campaign storage c = campaigns[campaignId];
        c.creator = msg.sender;
        c.goalAmount = goalAmount;
        c.startTime = startTime;
        c.endTime = endTime;
        c.totalTokenSupply = totalTokenSupply;
        c.mintedSupply = 0;
        c.pricePerToken = pricePerToken;
        c.amountRaised = 0;
        c.tokenName = tokenName;
        c.tokenSymbol = tokenSymbol;
        c.tokenAddress = address(token);
        c.metadataCID = metadataCID;

        emit CampaignCreated(campaignId, msg.sender, tokenName, tokenSymbol, goalAmount, startTime, endTime);

        return campaignId;
    }

    function updateCampaignMetadata(uint256 campaignId, string calldata newCID) external {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "Result: Only creator can update");
        require(_getStatus(campaignId) == CampaignStatus.UPCOMING, "Result: Cannot update if not upcoming");
        
        c.metadataCID = newCID;
        emit CampaignMetadataUpdated(campaignId, newCID);
    }

    function invest(uint256 campaignId, uint256 tokenAmount) external payable nonReentrant {
        Campaign storage c = campaigns[campaignId];
        CampaignStatus status = _getStatus(campaignId);
        
        require(status == CampaignStatus.ACTIVE, "Result: Campaign not active");
        require(c.mintedSupply + tokenAmount <= c.totalTokenSupply, "Result: Exceeds total supply");

        // Calculate cost
        // pricePerToken is price for 1e18 token units (1 whole token).
        // Cost = (tokenAmount * pricePerToken) / 1e18;
        uint256 cost = (tokenAmount * c.pricePerToken) / 1e18;
        
        require(msg.value >= cost, "Result: Insufficient ETH sent");

        // Refund excess if any
        if (msg.value > cost) {
            payable(msg.sender).transfer(msg.value - cost);
        }

        c.amountRaised += cost;
        c.mintedSupply += tokenAmount;

        investorInfo[msg.sender][campaignId].amountInvested += cost;
        investorInfo[msg.sender][campaignId].tokensPurchased += tokenAmount;

        CampaignToken(c.tokenAddress).mint(msg.sender, tokenAmount);

        emit Invested(campaignId, msg.sender, cost, tokenAmount);
    }

    function withdraw(uint256 campaignId) external nonReentrant {
        Campaign storage c = campaigns[campaignId];
        require(msg.sender == c.creator, "Result: Only creator can withdraw");
        require(_getStatus(campaignId) == CampaignStatus.FUNDED, "Result: Campaign must be funded");
        
        uint256 amount = c.amountRaised;
        require(amount > 0, "Result: Nothing to withdraw");
        
        c.amountRaised = 0; // Prevent re-entrancy attack vector (though unlikely with nonReentrant)
        payable(msg.sender).transfer(amount);
        
        emit FundsWithdrawn(campaignId, msg.sender, amount);
    }

    function refund(uint256 campaignId) external nonReentrant {
         Campaign storage c = campaigns[campaignId];
         require(_getStatus(campaignId) == CampaignStatus.FAILED, "Result: Campaign must be failed");
         
         InvestorInfo storage info = investorInfo[msg.sender][campaignId];
         uint256 amount = info.amountInvested;
         uint256 tokens = info.tokensPurchased;
         
         require(amount > 0, "Result: No funds to refund");
         
         // Update state before transfer
         info.amountInvested = 0;
         info.tokensPurchased = 0;
         
         // Burn tokens from investor
         CampaignToken(c.tokenAddress).burn(msg.sender, tokens);
         
         payable(msg.sender).transfer(amount);
         
         emit Refunded(campaignId, msg.sender, amount, tokens);
    }

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return campaigns[campaignId];
    }

    function _getStatus(uint256 campaignId) internal view returns (CampaignStatus) {
        Campaign storage c = campaigns[campaignId];
        if (c.amountRaised >= c.goalAmount) {
            return CampaignStatus.FUNDED;
        }
        if (block.timestamp < c.startTime) {
            return CampaignStatus.UPCOMING;
        }
        if (block.timestamp >= c.startTime && block.timestamp <= c.endTime) {
            return CampaignStatus.ACTIVE;
        }
        return CampaignStatus.FAILED;
    }
    
    // External wrapper for getStatus if needed by frontend
    function getStatus(uint256 campaignId) external view returns (CampaignStatus) {
        return _getStatus(campaignId);
    }
}
