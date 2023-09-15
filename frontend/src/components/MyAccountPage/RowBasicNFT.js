import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { parseEther } from "ethers"
import Modal from 'react-bootstrap/Modal';
import Item from './Item';
import Actions from './Actions';
import Info from './Info';

export default function RowBasicNFT(props) {
  const [nfts, setNfts] = useState([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null)

  let navigate = useNavigate(); 
  const loadNfts = async () => {
    const { nft, nftLendable, account, ...other } = props;

    let transferFilter = nft.filters.Transfer(null, account, null)
    let results = await nft.queryFilter(transferFilter)
    let nfts = await Promise.all(results.map(async i => {
        i = i.args
        const uri = await nft.tokenURI(i.tokenId)
        const response = await fetch(uri)
        let metadata = await response.json()
        let owner = await nft.ownerOf(i.tokenId);
        let nftData = {
          name: metadata.name, 
          attributes: metadata.attributes,
          image: metadata.image,
          nft: nft,
          tokenId: i.tokenId.toString(),
          owner: owner,
          description: metadata.description,
          basic: true,
          lend: false,
          dynamic:false,
        }
        return nftData 
    }))
    let listNft = [];
    let basicNft = nfts.filter(item => 
        { 
          if (listNft.includes(item.tokenId)) {
            return false
          } else {
            listNft.push(item.tokenId)
            return item.owner.toLowerCase() == account
          }
        }
    )
  
    transferFilter = nftLendable.filters.Transfer(null, account, null)
    results = await nftLendable.queryFilter(transferFilter)
    nfts = await Promise.all(results.map(async i => {
        i = i.args
        const uri = await nftLendable.tokenURI(i.tokenId)
        const response = await fetch(uri)
        let metadata = await response.json()
        let owner = await nftLendable.ownerOf(i.tokenId);
        let nftData = {
          name: metadata.name, 
          attributes: metadata.attributes,
          image: metadata.image,
          nft: nftLendable,
          tokenId: i.tokenId.toString(),
          owner: owner,
          description: metadata.description,
          basic: false,
          lend: true,
          dynamic:false,
        }
        return nftData 
    }))

    listNft = [];
    let lendNft = nfts.filter(item => 
        { 
          if (listNft.includes(item.tokenId)) {
            return false
          } else {
            listNft.push(item.tokenId)
            return item.owner.toLowerCase() == account
          }
        }
    )
    setLoading(false)
    setNfts([...basicNft, ...lendNft])
  }
  const init = () => {
    setItem({
      itemId: 0,
      name: "",
      description: "",
      image: "",
      attributes: []
    })

    loadNfts()
  }

  useEffect(() => {
    init()
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
