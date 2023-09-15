import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import Navigation from './components/Navbar';
import HomeMarketPlace from './components/ListingPage/MarketPlace.js'
import AuctionPlatformPage from './components/ListingPage/AuctionPlatform.js'
import LendingPlatformPage from './components/ListingPage/LendingPlatform.js'
// import MintNftRentable from './components/nftRentable/MintNft.js'
import MintingPage from './components/MintingPage/MintingPage.js'
import MyAccountPage from './components/MyAccountPage/MyAccountPage.js'
// import ListOnMarketPlace from './components/ListOnMarketPlace.js'
// import ListOnAuctionPlatform from './components/ListOnAuctionPlatform.js'
// import AuctionDetailPage from "./components/AuctionDetailPage";

import MarketplaceContract from './contracts/Marketplace.json'
import NFTContract from './contracts/NFT.json'
import ERC4907Contract from './contracts/ERC4907.json'
import NFTDynamicContract from './contracts/DynamicNft.json'
import AuctionPlatformContract from './contracts/AuctionPlatform.json'
import LendingPlatformContract from './contracts/LendingPlatform.json'

import { useState } from 'react'
import { Spinner } from 'react-bootstrap'
import { Contract, BrowserProvider } from 'ethers';

import './App.css';

import 'bootstrap/dist/css/bootstrap.css';
import ListOnMarketPlace from "./components/ListOnMarketPlace.js";


function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [nftLendable, setNFTLendable] = useState({})
  const [nftDynamic, setNftDynamic] = useState({})
  const [marketplace, setMarketplace] = useState({})
  const [auctionPlatform, setAuctionPlatform] = useState({})
  const [lendingPlatform, setLendingPlatform] = useState({})

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new BrowserProvider(window.ethereum)

    if (typeof provider !== 'undefined') {
      // Metamask installed.
      window.ethereum.request({method: 'eth_requestAccounts'}).then( accounts => {
        setAccount(accounts[0])
        console.log("selected account: ", accounts[0]);
      }).catch((err) => {
        console.log(err);
        return;
      });
    }
        // Set signer
    const signer = await provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
    loadContracts(signer)
  }
  const loadContracts = async (signer) => {
    let contract;

    contract = new Contract(
      Object.values(MarketplaceContract.networks)[0].address,
      MarketplaceContract.abi, signer
      );
    setMarketplace(contract)

    contract = new Contract(Object.values(
      NFTContract.networks)[0].address, 
      NFTContract.abi, signer
      );
    setNFT(contract)

    contract = new Contract( 
      Object.values(ERC4907Contract.networks)[0].address, 
      ERC4907Contract.abi, 
      signer
      )
    console.log("setNFTLendable", contract.getAddress());
    setNFTLendable(contract)

    contract = new Contract(
      Object.values(AuctionPlatformContract.networks)[0].address, 
      AuctionPlatformContract.abi, 
      signer
      )
    setAuctionPlatform(contract)

    contract = new Contract(
      Object.values(LendingPlatformContract.networks)[0].address, 
      LendingPlatformContract.abi, signer
      )
    setLendingPlatform(contract)

    contract = new Contract(
      Object.values(NFTDynamicContract.networks)[0].address, 
      NFTDynamicContract.abi, signer
      )
    setNftDynamic(contract)


    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <>
          <Navigation web3Handler={web3Handler} account={account} />
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>

              <Route path="/market-place" element = {
                <HomeMarketPlace 
                marketplace={marketplace} 
                nftBasic={nft} 
                account={account}
                nftLendable={nftLendable} 
                nftDynamic={nftDynamic}
                />
              } /> 

              <Route path="/mint-nft" element = {
                <MintingPage nft={nft} nftLendable={nftLendable} nftDynamic={nftDynamic}/>
              } />

              <Route path="/my-account-page" element = {
                <MyAccountPage 
                  account={account} 
                  nftBasic={nft} 
                  nftLendable={nftLendable}
                  nftDynamic={nftDynamic}
                  marketplace={marketplace} 
                  auctionPlatform ={auctionPlatform}
                  lendingPlatform = {lendingPlatform}
                />
              } />

               <Route path="/auction" element = {
                <AuctionPlatformPage auctionPlatform={auctionPlatform} nft={nft} account={account} />
              } />

              <Route path="/lending-platform" element = {
                <LendingPlatformPage lendingPlatform={lendingPlatform} nft={nft} account={account} />
              } />

            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>

  );
}

export default App;