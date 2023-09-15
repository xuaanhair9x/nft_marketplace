import { useState, useEffect } from 'react'
import { formatEther } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";

const NFTAuctionPlatform = ({ marketAuction, nft, account }) => {

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  let navigate = useNavigate(); 

  const loadMarketAuctionItems = async () => {
    // Load all unsold items
    const itemCount = await marketAuction.itemCount()
    let items = []
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketAuction.items(i)
      if (!item.ended) {

        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId)
        const response = await fetch(uri)
        const metadata = await response.json()

        // Add item to items array
        items.push({
          highestBid: item.highestBid,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image
        })
      }
    }
    setLoading(false)
    setItems(items)
  }

  const detailPage = (index) => {
    console.log(123123);
    localStorage.setItem('indexItem', index);
    navigate('/nft-auction-detail-page')
  }

  useEffect(() => {
    loadMarketAuctionItems()
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
          <Row xs={1} md={2} lg={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                      {item.description.slice(0, 40)} ...
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                      <div className='d-grid'>
                        <Button variant="primary" size="lg" onClick={() => detailPage(item.itemId)}>
                          Detail page
                        </Button>
                      </div> 
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
        : (
          <main style={{ padding: "1rem 0" }}>
            <h2>No listed assets</h2>
          </main>
        )}
    </div>
  );
}
export default NFTAuctionPlatform