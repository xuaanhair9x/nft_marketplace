// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuctionPlatform is ReentrancyGuard, Ownable {

    // Variables
    uint public immutable feePercent; // the fee percentage on sales 
    uint public itemCount; 
    mapping(uint => mapping(address => uint)) public bids;

    struct Item {
        uint itemId;
        IERC721 nft;
        uint tokenId;
        address payable seller;
        address highestBidder;
        uint highestBid;
        uint endAt;
        bool ended;
    }

    // itemId -> Item
    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        address highestBidder,
        uint endAt,
        bool ended
    );

    event Bid(
        uint itemId,
        address indexed nft,
        uint tokenId,
        address indexed highestBidder,
        uint highestBid
    );

    event End(address indexed winner, uint indexed itemId, uint amount);
    event WithdrawBidding(address indexed bidder, uint indexed itemId, uint amount);
    event Withdraw(address indexed feeAccount, uint amount);

    constructor(uint _feePercent) {
        feePercent = _feePercent;
    }

    // Make item to offer on the marketplace
    function makeItem(IERC721 _nft, uint _tokenId, uint _startPrice) external nonReentrant {
        require(_nft.ownerOf(_tokenId) == msg.sender,"Invalid owner.");
        require(_startPrice > 0, "Price must be greater than zero");
        // increment itemCount
        itemCount ++;
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            payable(msg.sender),
            address(0),
            _startPrice,
            block.timestamp + 7 minutes, 
            false
        );

        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            msg.sender,
            block.timestamp + 7 minutes,
            false
        );
    }

    function bid(uint _itemId) external payable nonReentrant {
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(block.timestamp < item.endAt, "ended");
        require(!item.ended, "end auction");
        require(msg.value > item.highestBid, "value < highest");

        if (item.highestBidder != address(0)) {
            bids[_itemId][item.highestBidder] += item.highestBid;
        }

        item.highestBidder = payable(msg.sender);
        item.highestBid = msg.value;

        // emit Bid event
        emit Bid(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.highestBidder,
            item.highestBid
        );
    }

    function end(uint _itemId) external {
        Item storage item = items[_itemId];
        require(block.timestamp >= item.endAt, "not ended");
        require(!item.ended, "ended");

        item.ended = true;
        if (item.highestBidder != address(0)) {
            item.nft.safeTransferFrom(address(this), item.highestBidder, item.tokenId);
            item.seller.transfer(item.highestBid - item.highestBid*feePercent/100);
        } else {
            item.nft.safeTransferFrom(address(this), item.seller, item.tokenId);
        }

        emit End(item.highestBidder, _itemId, item.highestBid);
    }

    function withdrawBidding(uint _itemId) external {
        uint bal = bids[_itemId][msg.sender];
        require(bal > 0, "No money");
        bids[_itemId][msg.sender] = 0;
        payable(msg.sender).transfer(bal);
        emit WithdrawBidding(msg.sender, _itemId,  bal);
    }

    function withdraw() external onlyOwner {
        uint bal = getBalance();
        require(bal > 0, "No money");
        payable(msg.sender).transfer(bal);

        emit Withdraw(msg.sender, bal);
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }
}