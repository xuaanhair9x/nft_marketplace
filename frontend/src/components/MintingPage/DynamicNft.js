import { useState } from 'react'
import { parseEther } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";

const simulationServiceHost = 'http://127.0.0.1:3333/write/';

const MintDynamicNft = ({ nft }) => {
  let navigate = useNavigate();
  const mintNft = async () => {
    // mint nft 
    try {
      await(await nft.mint()).wait();
      navigate("/my-account-page");
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <div className="d-grid px-0">
                <Button onClick={mintNft} variant="primary" size="lg">
                  Mint NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
}

export default MintDynamicNft