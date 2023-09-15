const { assert, count } = require("console");
const { expect } = require("chai"); 
const truffleAssert = require('truffle-assertions');
const Web3 = require("web3");

const {parseEther, formatEther} = require('ethers');

const toWei = (num) => parseEther(num.toString())
const fromWei = (num) => formatEther(num)

const NFT = artifacts.require("NFT")
const Marketplace = artifacts.require("Marketplace")
const web3 = new Web3 ('http://127.0.0.1:9545/');

contract('NFT', (accounts) => {
    let deployer = accounts[0];
    let addr1 = accounts[1];
    let addr2 = accounts[2];
    let addr3 = accounts[3];
    let feePercent = 1;
    let URI = "sample URI"

    describe("Deployment", function () {
        let nft;
        let marketplace;
        beforeEach(async function () {
            // To deploy our contracts
            nft = await NFT.new();
            marketplace = await Marketplace.new(feePercent);

            // addr1 mints an nft
            await nft.mint(URI, {from: addr1});
            // addr1 approves marketplace to spend nft
            await nft.setApprovalForAll(marketplace.address, true, { from: addr1 });
        });
        it("Should track name and symbol of the nft collection", async function () {
            // This test asserts the owner variable stored in the contract to be equal
            // to our Signer's owner.
            const nftName = "DApp NFT"
            const nftSymbol = "DAPP"
            assert(await nft.name() == nftName);
            assert(await nft.symbol()== nftSymbol);
        });
    
        it("Should track feeAccount and feePercent of the marketplace", async function () {
            let feePercentOnchain =  await marketplace.feePercent();
            assert(await marketplace.feeAccount() == deployer);
            assert(feePercentOnchain.toNumber() == feePercent);
        });
    });

    describe("Minting NFTs", function () {
        let nft;
        let marketplace;
        beforeEach(async function () {
            // To deploy our contracts
            nft = await NFT.new();
            marketplace = await Marketplace.new(feePercent);
        });

        it("Should track each minted NFT", async function () {    
            // addr1 mints an nft
            await nft.mint(URI, {from: addr1});
            let tokenCountOnchain = await nft.tokenCount();
            let balance = await nft.balanceOf(addr1);
            let uri = await nft.tokenURI(1);
            assert(tokenCountOnchain.toNumber() == 1);
            assert(balance.toNumber() == 1);
            assert(uri == URI);
    
            // addr2 mints an nft
            await nft.mint(URI, {from: addr2});
            tokenCountOnchain = await nft.tokenCount();
            balance = await nft.balanceOf(addr1);
            uri = await nft.tokenURI(2);

            assert(tokenCountOnchain.toNumber() == 2);
            assert(balance.toNumber() == 1);
            assert(uri == URI);
        });
    });

    describe("Making marketplace items", (accounts) => {
        let price = 1
        let result 
        let nft;
        let marketplace;

        beforeEach(async function () {
            // To deploy our contracts
            nft = await NFT.new();
            marketplace = await Marketplace.new(feePercent);

            // addr1 mints an nft
            await nft.mint(URI, {from: addr1});
            // addr1 approves marketplace to spend nft
            await nft.setApprovalForAll(marketplace.address, true, { from: addr1 });
        });

        it("Should track newly created item, transfer NFT from seller to marketplace and emit Offered event", async function () {
            // addr1 mints an nft
            await marketplace.makeItem(nft.address, 1 , toWei(price), {from: addr1});
            assert(await nft.ownerOf(1) == marketplace.address);
            assert(await marketplace.itemCount() == 1);

            const item = await marketplace.items(1);
            assert(item.itemId == 1);
            assert(item.nft == nft.address);
            assert(item.tokenId == 1);
            assert(item.price == toWei(price));
            assert(item.sold == false);
        });

        it("Should fail if price is set to zero", async function () {
            await truffleAssert.reverts(marketplace.makeItem(nft.address, 1, 0, {from: addr1}), "Price must be greater than zero");
        });
    });

    describe("Purchasing marketplace items", function () { 
        let price = 2
        let fee = (feePercent/100) * price
        let totalPriceInWei
        let nft;
        let marketplace;

        beforeEach(async function () {
            // To deploy our contracts
            nft = await NFT.new();
            marketplace = await Marketplace.new(feePercent);

            // addr1 mints an nft
            await nft.mint(URI, {from: addr1});
            // addr1 approves marketplace to spend tokens
            await nft.setApprovalForAll(marketplace.address, true, { from: addr1 });
            // addr1 makes their nft a marketplace item.
            await marketplace.makeItem(nft.address, 1 , toWei(price), {from: addr1});
        });
        it("Should update item as sold, pay seller, transfer NFT to buyer, charge fees and emit a Bought event", async function () {
            const sellerInitalEthBal = await web3.eth.getBalance(addr1);
            const feeAccountInitialEthBal = await web3.eth.getBalance(deployer);
            // fetch items total price (market fees + item price)
            totalPriceInWei = await marketplace.getTotalPrice(1);

            // addr 2 purchases item.
            await marketplace.purchaseItem(1, {value: totalPriceInWei, from: addr2});


            const sellerFinalEthBal = await web3.eth.getBalance(addr1);
            const feeAccountFinalEthBal = await web3.eth.getBalance(deployer);

            // Item should be marked as sold
            assert((await marketplace.items(1)).sold == true);

            // Seller should receive payment for the price of the NFT sold.
            assert(+fromWei(sellerFinalEthBal) == +price + +fromWei(sellerInitalEthBal));

            // feeAccount should receive fee
            assert(+fromWei(feeAccountFinalEthBal) == +fee + +fromWei(feeAccountInitialEthBal));

            // The buyer should now own the nft
            assert(await nft.ownerOf(1) == addr2);
          });
        it("Should fail for invalid item ids, sold items and when not enough ether is paid", async function () {
            // fails for invalid item ids
            await truffleAssert.reverts(marketplace.purchaseItem(2, {value: totalPriceInWei, from: addr2}), "item doesn't exist");
            await truffleAssert.reverts(marketplace.purchaseItem(0, {value: totalPriceInWei, from: addr2}), "item doesn't exist");

            // Fails when not enough ether is paid with the transaction. 
            // In this instance, fails when buyer only sends enough ether to cover the price of the nft
            // not the additional market fee.
            //console.log(fromWei(totalPriceInWei), "   ", toWei(price));
            await truffleAssert.reverts(marketplace.purchaseItem(1, {value: Number(toWei(price)), from: addr2}), "not enough ether to cover item price and market fee");

            // addr2 purchases item 1
            await marketplace.purchaseItem(1, {value: totalPriceInWei, from: addr2});

            // addr3 tries purchasing item 1 after its been sold 
            await truffleAssert.reverts(marketplace.purchaseItem(1, {value: totalPriceInWei, from: addr3}), "item already sold");
        });
    });

    describe("Purchasing marketplace items", function () { 
        let price = 2
        let fee = (feePercent/100) * price
        let totalPriceInWei
        let nft;
        let marketplace;

        beforeEach(async function () {
            // To deploy our contracts
            nft = await NFT.new();
            marketplace = await Marketplace.new(feePercent);

            // addr1 mints an nft
            await nft.mint(URI, {from: addr1});
            // addr1 approves marketplace to spend tokens
            await nft.setApprovalForAll(marketplace.address, true, { from: addr1 });
            // addr1 makes their nft a marketplace item.
            await marketplace.makeItem(nft.address, 1 , toWei(price), {from: addr1});
        });

        it("Redeem Nft from market place.", async function () {
            await truffleAssert.reverts(marketplace.redeemNft(1, {from: addr2}), "Not owner");
            await marketplace.redeemNft(1, {from: addr1});
            await truffleAssert.reverts(marketplace.redeemNft(1, {from: addr1}), "item already sold");
        });
    });
});
