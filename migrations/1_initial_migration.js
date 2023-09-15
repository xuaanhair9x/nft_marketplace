const NFT = artifacts.require("NFT")
const Marketplace = artifacts.require("Marketplace")
const AuctionPlatform = artifacts.require("AuctionPlatform")
const ERC4907 = artifacts.require("ERC4907")
const LendingPlatform = artifacts.require("LendingPlatform")
const DynamicNft = artifacts.require("DynamicNft")

module.exports = function (deployer) {
    deployer.deploy(NFT);
    deployer.deploy(Marketplace, 3);
    deployer.deploy(AuctionPlatform, 3);
    deployer.deploy(ERC4907);
    deployer.deploy(LendingPlatform, 3);
    deployer.deploy(DynamicNft, "wow lu gach", "wow lu gach", 100);
};

