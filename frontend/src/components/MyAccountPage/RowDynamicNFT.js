import { useState, useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Item from './Item';
import Actions from './Actions';
import Info from './Info';

export default function RowDynamicNFT(props) {
  const [nfts, setNfts] = useState([])
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  let navigate = useNavigate(); 
  const loadNfts = async () => {
    let transferFilter = props.nftDynamic.filters.Transfer(null, props.account, null)
    let results = await props.nftDynamic.queryFilter(transferFilter)
    let nfts = await Promise.all(results.map(async i => {
        i = i.args
        const uri = await props.nftDynamic.tokenURI(i.tokenId)
        const response = await fetch(uri)
        let metadata = await response.json()
        let owner = await props.nftDynamic.ownerOf(i.tokenId);
        let nftData = {
          name: metadata.name, 
          attributes: metadata.attributes,
          image: metadata.image,
          nft: props.nftDynamic,
          tokenId: i.tokenId.toString(),
          owner: owner,
          description: metadata.description,
          basic: false,
          lend: false,
          dynamic:true,
        }
        return nftData 
    }))

    let listNft = [];
    let nftFilter = nfts.filter(item => 
        { 
          if (listNft.includes(item.tokenId)) {
            return false
          } else {
            listNft.push(item.tokenId)
            return item.owner.toLowerCase() == props.account
          }
        }
    )
    setLoading(false)
    setNfts(nftFilter)
  }
  useEffect(() => {
    setItem({
      itemId: 0,
      name: "",
      description: "",
      image: "",
      attributes: []
    })

    loadNfts()
  }, [])

  function handleShowDetail(item) {
    setItem(item)
    setShow(true);
  }

  if (loading) return (
    <main style={{ padding: "1rem 0" }}>
      <h2>Loading...</h2>
    </main>
  )

  return (
    <div className="px-5 container">
    <h3>My NFTs</h3>
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
              <Actions item={item} {...props}/>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>  
    <Item nfts={nfts} handleShowDetail={handleShowDetail}/>
</div>
  );
}
