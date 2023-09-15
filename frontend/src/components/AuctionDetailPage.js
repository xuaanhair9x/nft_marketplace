import { useEffect, useState } from 'react'
import { parseEther } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import {Link, useNavigate} from "react-router-dom";
import { formatEther } from "ethers"
import InputGroup from 'react-bootstrap/InputGroup';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';
import Alert from "react-bootstrap/Alert";

const AuctionDetailPage = ({ marketAuction, nft }) => {
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [priceBid, setPriceBid] = useState(null)
  const [message, setMessage] = useState("")

  let history = useNavigate();

  const loadNft = async () => {
    const i = await marketAuction.items(localStorage.getItem('indexItem'))
    const uri = await nft.tokenURI(i.tokenId)
    const response = await fetch(uri)
    let metadata = await response.json()
    let data = {
      itemId: i.itemId,
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      attributes: metadata.attributes,
      highestBidder: i.highestBidder,
      highestBid: i.highestBid
    }
    setItem(data)
    setLoading(false)
  }


  useEffect(() => {
    loadNft()
  },[])

  const validate = async () => {
      setMessage("nothing")
      return false;
  };


  const bidNft = async () => {
    validate().then((val) => {
      console.log("asynchronous logging has val:", val)
      console.log(13123123)
    })
    if (!validate()) {
      console.log(11111);
        return
    }
    try {
      const price = parseEther(priceBid.toString())
      await(await marketAuction.bid( localStorage.getItem('indexItem'), {value: price})).wait()
    } catch (e) {
      console.log(e); // prints "This is error message"
    }
    console.log(22222);
    history("/auction");
  }

  const endBidNft = async() => {
    try {
      await(await marketAuction.end( localStorage.getItem('indexItem'))).wait();
    } catch (error) {
      console.error(error);
      // Expected output: ReferenceError: nonExistentFunction is not defined
      // (Note: the exact output may be browser-dependent)
    }
    history("/auction");
  }

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )
  return (
    <div className="container-fluid mt-5">
      { message != "" ? 
      <Alert variant="danger" style={{ width: "42rem" }}>
        <Alert.Heading>
          { message }
        </Alert.Heading>
      </Alert> : (<p></p>)
      }   
      <div className="row">
        <div role="main" className="col-lg-6">
          <div className="content mx-auto">
          <img
            src={item.image}
            className='img-thumbnail'
            alt='...'/>
                <Accordion defaultActiveKey="0" className="mt-3" flush>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>Description</Accordion.Header>
                    <Accordion.Body>{' '}{item.description}{' '}
                    </Accordion.Body>
                  </Accordion.Item>
                  <Accordion.Item eventKey="1">
                    <Accordion.Header>Trails</Accordion.Header>
                    <Accordion.Body>
                    <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Trail type</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.attributes.map((item, idx) => (
                             <tr>
                                <td>{idx}</td>
                                <td>{item.trail_type}</td>
                                <td>{item.value}</td>
                              </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
          </div>
        </div>
        <div role="main" className="col-lg-6">
          <div className="content">
            <h1>{item.name}</h1>  
            <span class="badge badge-pill badge-primary">Primary</span>
            <p>HighestBidder: {item.highestBidder.slice(0, 6)}</p>
            <p>HighestBid: { formatEther(item.highestBid) }</p>
            <InputGroup className="mb-3">
              <Form.Control
                type="number"
                placeholder="Bid price"
                aria-label="Username"
                aria-describedby="basic-addon1"
                onChange={(e) => setPriceBid(e.target.value)}
              />
            </InputGroup>
            <div className="d-grid gap-2">
              <Button variant="primary" size="lg" onClick={bidNft}>
                Play a Bid
              </Button>
              <Button variant="secondary" size="lg" onClick={endBidNft}>
                End Bid
              </Button>
            </div>          
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage