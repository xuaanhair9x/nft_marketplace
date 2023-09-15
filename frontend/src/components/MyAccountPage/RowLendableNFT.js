import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { parseEther } from "ethers"
import Modal from 'react-bootstrap/Modal';
import Item from './Item';
import Actions from './Actions';
import Info from './Info';

export default function RowLendableNFT(props, { nft, account, marketplace, auctionPlatform}) {
  const [nftLended, setNftLended] =useState([])
  const [loading, setLoading] = useState(true)
  const [show, setShow] = useState(false);
  const [item, setItem] = useState(null)

  let navigate = useNavigate(); 

  const loadNftLended = async () => {
    const { nft, nftLendable, account, ...other } = props;

    console.log(123123);
    const updateUserFilter = nftLendable.filters.UpdateUser(null, account, null)
    const results = await nftLendable.queryFilter(updateUserFilter)
    const nfts = await Promise.all(results.map(async i => {
      i = i.args
      const uri = await nftLendable.tokenURI(i.tokenId)
      const response = await fetch(uri)
      let metadata = await response.json()
      let owner = await nftLendable.ownerOf(i.tokenId);
      let timeRemain = (parseInt(i.expires) - Date.now()/1000);
      let nftData = {
        timeRemain: timeRemain > 0 ? timeRemain : 0,
        name: metadata.name, 
        attributes: metadata.attributes,
        image: metadata.image,
        nft: nftLendable,
        tokenId: i.tokenId.toString(),
        owner: owner,
        description: metadata.description,
      }
      console.log(nftData)
      return nftData 
    }))
    let listNft = []
    // const newNfts = nfts.filter(item => 
    //   { 
    //     if (listNft.includes(item.tokenId)) {
    //       return false
    //     }
    //   })
    setNftLended(nfts)
    setLoading(false)
  }
  const init = () => {
    setItem({
      timeRemain: 0,
      itemId: 0,
      name: "",
      description: "",
      image: "",
      attributes: []
    })
  }

  useEffect(() => {
    init()
    loadNftLended()
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
                  <h4>Owner: {item.owner}</h4>
                  <p>Time Remain: {item.timeRemain} </p>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>  
        <h3>NFTs are lend from Platform </h3>
        <Item nfts={nftLended} handleShowDetail={handleShowDetail}/>
  </div>
  );
}
