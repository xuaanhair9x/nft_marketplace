import { useState, useEffect } from 'react'
import { formatEther } from "ethers"
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';
import Alert from "react-bootstrap/Alert";
import InputGroup from 'react-bootstrap/InputGroup';
import { parseEther } from "ethers"
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Items from './Items';
import Info from '../MyAccountPage/Info'; 

const AuctionPlatformPage = ({ auctionPlatform, nft, account }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [item, setItem] = useState(null)
  const [show, setShow] = useState(false);
  const [price, setPrice] = useState(0);

  let navigate = useNavigate();

  const loadMarketplaceItems = async () => {

    setItem({
      itemId: 0,
      totalPrice: 0,
      seller: "",
      name: "",
      description: "",
      image: "",
      attributes: [],
      highestBidder: "",
      highestBid: 0
    })

    // Load all unsold items
    const itemCount = await auctionPlatform.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await auctionPlatform.items(i)
      console.log(item);
      if (!item.ended) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        const response = await fetch(uri)
        const metadata = await response.json()

        // Add item to items array
        items.push({
          itemId: item.itemId,
          timeRemain: parseInt(item.endAt) - Date.now()/1000,
          seller: item.seller,
          highestBidder: item.highestBidder,
          highestBid: item.highestBid,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          attributes: metadata.attributes,
          endAt: item.endAt,
          isOwner: item.seller.toLowerCase() === account ? true : false,
        })
      }
    }
    setLoading(false)
    setItems(items)
  } 

  const playABid = async (item) => {
    if (parseInt(item.endAt) < Date.now()/1000) {
      alert("End auction for this NFT")
      return
    }
    const bidPrice = parseEther(price.toString())
    await (await auctionPlatform.bid(item.itemId, { value: bidPrice })).wait()
    navigate("/my-account-page");
  }

  const endBid = async (item) => {
    if (parseInt(item.endAt) > Date.now()/1000) {
      alert("The auction is currently in progress.")
      return
    }
    await (await auctionPlatform.end(item.itemId)).wait()
    navigate("/my-account-page");
  }

  const withdrawMoney = async (item) => {
    await (await auctionPlatform.withdrawBidding(item.itemId)).wait()
    navigate("/my-account-page");
  }

  function quickView(item) {
      setItem(item)
      setShow(true)
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  if (items == null) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  
  return (
    <div className="flex justify-center">
      {items.length > 0 ?
        <div className="px-5 container">
        <Modal show={show} fullscreen={true} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>NFT Detail</Modal.Title>
        </Modal.Header>
          <Modal.Body>
          <div className="row">
          <div role="main" className="col-lg-6">
            <Info item={item} />
          </div>
          <div role="main" className="col-lg-6">
            <div className="content">
              <h1>{item.name}</h1>  
              <h3>Seller: {item.seller.substring(0, 10)} ... {item.seller.slice(-6)} </h3>
              <p>Highest Bidder: {item.highestBidder}</p>
              <p>Highest Bid: {formatEther(item.highestBid)} ETH</p>
              <p>Time remain: {item.timeRemain / 60} minute</p>
              <InputGroup className="mb-3">
                <Form.Control
                    type="number"
                    placeholder="Price ETH"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={(e) => setPrice(e.target.value)} />
              </InputGroup>  
                  <div className='d-grid'>
                    <Button variant="primary" onClick={() => playABid(item)} size="lg">
                      Play a bid
                    </Button>
                  </div>
                  <div className='d-grid mt-3'>
                    <Button variant="primary" onClick={() => endBid(item)} size="lg">
                      End Bid
                    </Button>
                  </div>
            </div>
          </div>
        </div>
          </Modal.Body>
        </Modal>
          <h1>Auction Platform</h1>
          <Items items={items} quickView={quickView}/>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default AuctionPlatformPage