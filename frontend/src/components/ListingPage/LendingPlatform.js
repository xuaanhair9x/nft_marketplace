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

const LendingPlatformPage = ({ lendingPlatform, nft, account }) => {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [item, setItem] = useState(null)
  const [show, setShow] = useState(false);

  let navigate = useNavigate();

  const loadMarketplaceItems = async () => {

    setItem({
      itemId: 0,
      totalPrice: 0,
      seller: "",
      name: "",
      description: "",
      image: "",
      attributes: []
    })

    // Load all unsold items
    const itemCount = await lendingPlatform.itemCount()
    let items = []
    console.log("itemCount", itemCount);
    for (let i = 1; i <= itemCount; i++) {
      const item = await lendingPlatform.items(i)
      console.log(item);
      if (!item.rented) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        const response = await fetch(uri)
        const metadata = await response.json()

        const totalPrice = await lendingPlatform.getTotalPrice(item.itemId)

        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          attributes: metadata.attributes,
          isOwner: item.seller.toLowerCase() === account ? true : false,
        })
      }
    }
    setLoading(false)
    setItems(items)
  } 

  
  const lendItem = async (item) => {
    await (await lendingPlatform.rentItem(item.itemId, { value: item.totalPrice })).wait()
    navigate("/my-account-page");
  }

  const withdrawNft = async (item) => {
    await (await lendingPlatform.withdrawNft(item.itemId)).wait()
    navigate("/my-account-page");
  }

  function quickView(item) {
      setItem(item)
      setShow(true)
  }

  useEffect(() => {
    loadMarketplaceItems()
  }, [])

  if (loading) return (
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
              <h3>Seller: {item.seller} </h3>
              { item.isOwner == false ?
                  <div className='d-grid'>
                    <Button variant="primary" onClick={() => lendItem(item)} size="lg">
                      Lend for {formatEther(item.totalPrice)} ETH
                    </Button>
                  </div> : 
                  <div className='d-grid'>
                    <Button variant="success" size="lg" onClick={() => withdrawNft(item)}>
                      Withdraw NFT
                    </Button>
                  </div>
              }      
            </div>
          </div>
        </div>
          </Modal.Body>
        </Modal>
          <h1>Lending platform</h1>
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
export default LendingPlatformPage