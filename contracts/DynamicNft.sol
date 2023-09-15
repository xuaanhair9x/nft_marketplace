// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DynamicNft is ERC721URIStorage {

    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;

    uint public immutable interval;

    string[] IpfsUri = [
        "http://localhost:3333/read/?meta=3a5d14c26110788fdaf1d4a994855e5eb7a5b41826e218e0618eeabfc9d5eaaf.json",
        "http://localhost:3333/read/?meta=afb9b8214040b6d0c9108a90d806b634db3727dff42eaa439c8fd41e2679ab2c.json",
        "http://localhost:3333/read/?meta=c9ff75b4b7c6095ed8c6da9ae9ca3f88e337662ac035f59b8449cc5e471a9c3c.json"
    ];
    
    mapping(uint => uint) public nftStage;
    mapping(uint => uint) public lastTimeStamp;

    constructor (string memory name_, string memory symbol_, uint _interval) ERC721(name_,symbol_) {
        interval = _interval;
    }

    function mint() external returns(uint) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, IpfsUri[0]);
        nftStage[tokenId] = 0;
        lastTimeStamp[tokenId] = block.timestamp;
        return(tokenId);
    }

    function upgradeNft(uint64 _tokenId) external {
        require(nftStage[_tokenId] < 2,"no longer upgrade.");
        require((block.timestamp - lastTimeStamp[_tokenId]) > interval, "still early to upgrade a nft.");
        nftStage[_tokenId]++;
        lastTimeStamp[_tokenId] = block.timestamp;
        _setTokenURI(_tokenId, IpfsUri[nftStage[_tokenId]]);
    }

    function getRemainTimeForUpgrade(uint64 _tokenId) view public returns(uint) {
        uint passTime = block.timestamp - lastTimeStamp[_tokenId];
        if (passTime < interval) {
            return interval - passTime;
        }
        return 0;
    }
}