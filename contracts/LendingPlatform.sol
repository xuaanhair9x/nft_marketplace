// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./INFTLending.sol";

contract LendingPlatform is ReentrancyGuard {

    // Variables
    address payable public immutable feeAccount; // the account that receives fees
    uint public immutable feePercent; // the fee percentage on sales 
    uint public itemCount; 

    struct Item {
        uint itemId;
        INFTLending nft;
        uint tokenId;
        uint price;
        address payable seller;
        uint64 period;
        bool rented;
    }

    // itemId -> Item
    mapping(uint => Item) public items;

    event Offered(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        uint period
    );
    event Rent(
        uint itemId,
        address indexed nft,
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    event WithdrawNft(
        uint itemId,
        address indexed nft,
        uint tokenId,
        address indexed seller
    );

    constructor(uint _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    // Make item to offer on the marketplace
    function makeItem(INFTLending _nft, uint _tokenId, uint _price, uint64 _period) external nonReentrant {
        require(_price > 0, "Price must be greater than zero");
        require(_nft.userOf(_tokenId) == address(0), "Nft is being rented.");
        // increment itemCount
        itemCount ++;
        // transfer nft
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        // add new item to items mapping
        items[itemCount] = Item (
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            _period,
            false
        );

        // emit Offered event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender,
            _period
        );
    }

    function rentItem(uint _itemId) external payable nonReentrant {
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId > 0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value >= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.rented, "item already rented");
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        item.rented = true;
        item.nft.setUser(item.tokenId, msg.sender, item.period);
        emit Rent(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    function withdrawNft(uint _itemId) external nonReentrant {
        Item storage item = items[_itemId];
        require(msg.sender == item.seller, "Not owner");
        require(item.nft.userOf(item.tokenId) == address(0), "item already is being rented");
        item.rented = true;
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        emit WithdrawNft(
            _itemId,
            address(item.nft),
            item.tokenId,
            msg.sender
        );
    }

    function getTotalPrice(uint _itemId) view public returns(uint){
        return((items[_itemId].price*(100 + feePercent))/100);
    }
}