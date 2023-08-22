// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IMockNFTMarketplace {
    function purchase(uint256 _tokenId) external payable;

    function getPrice() external view returns (uint256);

    function available(uint256 _tokenId) external view returns (bool);
}

interface ICryptoDevsNFT {
    function balanceOf(address owner) external view returns (uint256);

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) external view returns (uint256);
}

contract CryptoDevsDAO is Ownable {
    struct Proposal {
        // the Id of the token to purchase from the marketplace
        uint256 nftTokenId;
        // the UNIX timestamp until which this proposal is still active. After the deadline has been passed, the proposal can be executed.
        uint256 deadline;
        uint256 yayVotes;
        uint256 nayVotes;
        bool executed;
        mapping(uint256 => bool) voters;
    }

    enum Vote {
        YAY,
        NAY
    }

    mapping(uint256 => Proposal) public proposals;

    uint256 public numProposals;

    IMockNFTMarketplace marketplace;
    ICryptoDevsNFT nft;

    constructor(address _marketplace, address _nft) payable {
        marketplace = IMockNFTMarketplace(_marketplace);
        nft = ICryptoDevsNFT(_nft);
    }

    modifier onlyNFTHolder() {
        require(nft.balanceOf(msg.sender) > 0, "Not a DAO member");
        _;
    }

    modifier activeProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline > block.timestamp,
            "deadline exceeded"
        );
        _;
    }

    modifier inactiveProposalOnly(uint256 proposalIndex) {
        require(
            proposals[proposalIndex].deadline <= block.timestamp,
            "deadline is not exceeded"
        );

        require(
            proposals[proposalIndex].executed == false,
            "proposal is executed"
        );

        _;
    }

    function createProposal(
        uint256 _tokenId
    ) external onlyNFTHolder returns (uint256) {
        require(marketplace.available(_tokenId), "NFT is unavailable");

        Proposal storage proposal = proposals[numProposals];

        proposal.nftTokenId = _tokenId;
        proposal.deadline = block.timestamp + 5 minutes;
        numProposals++;

        return numProposals - 1;
    }

    function voteOnProposal(
        uint256 proposalIndex,
        Vote vote
    ) external onlyNFTHolder activeProposalOnly(proposalIndex) {
        Proposal storage proposal = proposals[proposalIndex];
        uint256 voterNFTBalance = nft.balanceOf(msg.sender);

        uint256 numVotes = 0;
        for (uint256 i = 0; i < voterNFTBalance; i++) {
            uint256 tokenId = nft.tokenOfOwnerByIndex(msg.sender, i);
            if (proposal.voters[tokenId] == false) {
                proposal.voters[tokenId] = true;
                numVotes++;
            }
        }

        require(numVotes > 0, "Already voted");

        if (vote == Vote.YAY) {
            proposal.yayVotes += numVotes;
        } else {
            proposal.nayVotes += numVotes;
        }
    }

    function executeProposal(
        uint256 proposalIndex
    ) external inactiveProposalOnly(proposalIndex) onlyNFTHolder {
        Proposal storage proposal = proposals[proposalIndex];

        if (proposal.yayVotes > proposal.nayVotes) {
            uint256 nftPrice = marketplace.getPrice();
            require(address(this).balance >= nftPrice, "Not enough funds");
            marketplace.purchase{value: nftPrice}(proposal.nftTokenId);
        }

        proposal.executed = true;
    }

    function withdraw() external onlyOwner {
        uint256 amount = address(this).balance;
        require(amount > 0, "contract balance is empty");
        (bool sent, ) = payable(owner()).call{value: amount}("");
        require(sent, "failed to transfer ether");
    }

    receive() external payable {}
    fallback() external payable{}
}
