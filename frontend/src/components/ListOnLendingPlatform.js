import { useEffect, useState } from 'react'
import { parseEther } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";

const ListOnLendingPlatform = ({ marketplace, nft }) => {
  const [price, setPrice] = useState(null)
  const [tokenId, setTokenId] = useState(null)

  let history = useNavigate();

  const pushNftToMkp = async () => {
    // approve marketplace to spend nft
    await(await nft.setApprovalForAll(await marketplace.getAddress(), true)).wait()
    // add nft to marketplace
    const listingPrice = parseEther(price.toString())
    console.log(listingPrice)
    console.log(tokenId.toString())

    await(await marketplace.makeItem(await nft.getAddress(), tokenId.toString(), listingPrice)).wait();
    history("/");
  }

  useEffect(() => {
    setTokenId(localStorage.getItem('TokenId'))
  })

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control value={tokenId} onChange={(e) => setTokenId(e.target.value)} size="lg" required type="number" placeholder="Token Id" />
              <Form.Control value={price} onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
              <div className="d-grid px-0">
                <Button onClick={pushNftToMkp} variant="primary" size="lg">
                   Upload NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ListOnLendingPlatform