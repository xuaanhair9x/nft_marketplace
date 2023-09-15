import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Action from './Action';
import { useNavigate } from "react-router-dom";
import { parseEther } from "ethers"

export default function Actions(props) {
    const [item, setItem] = useState(null)
    const [priceMkp, setPriceMkp] = useState(null)
    console.log("export default function Actions(props)", props);

    let navigate = useNavigate(); 
    const init = () => {
        setItem(props.item)
    }
    useEffect(() => {
        init()
      }, [])
    
    const listOnMkp = async (price) => {
        await(await item.nft.setApprovalForAll(await props.marketplace.getAddress(), true)).wait()
        const listingPrice = parseEther(price.toString())
        await(await props.marketplace.makeItem(await item.nft.getAddress(), item.tokenId.toString(), listingPrice)).wait();
        navigate("/market-place");
    }

    const listOnAP = async (price) => {
        await(await item.nft.setApprovalForAll(await props.auctionPlatform.getAddress(), true)).wait()
        const listingPrice = parseEther(price.toString())
        await(await props.auctionPlatform.makeItem(await item.nft.getAddress(), item.tokenId.toString(), listingPrice)).wait();
        navigate("/auction");
    }

    const listOnLP = async (price) => {
      await(await item.nft.setApprovalForAll(await props.lendingPlatform.getAddress(), true)).wait()
      const listingPrice = parseEther(price.toString())
      const now = new Date();
      const sevenMinutesLater = new Date(now.getTime() + 7 * 60 * 1000);
      const timestamp = Math.floor(sevenMinutesLater.getTime() / 1000);
      console.log("item.tokenId.toString()", item.tokenId.toString());
      console.log("listingPrice", listingPrice);
      console.log("timestamp.toString()", timestamp.toString());
      console.log("item.nft.getAddress()", item.nft.getAddress());
      await(await props.lendingPlatform.makeItem(await item.nft.getAddress(), item.tokenId.toString(), listingPrice, timestamp.toString())).wait();
      navigate("/lending-platform");
    }
 
    const upgradeNft = async () => {
      console.log(props.nft);
      console.log(item.tokenId.toString() );
      const totalPrice = await props.nftDynamic.getRemainTimeForUpgrade(item.tokenId)
      console.log(totalPrice)
      await(await props.nftDynamic.upgradeNft(item.tokenId.toString())).wait();
    }

    return (
        <Accordion defaultActiveKey="1" flush>
        { props.item.lend ? (
          <Accordion.Item eventKey="0">
            <Action listNft={listOnLP} title={"List on Lending Platform"}/>
          </Accordion.Item>
        ) : null }
        <Accordion.Item eventKey="1">
          <Action listNft={listOnAP} title={"List on Auction Platform"}/>
        </Accordion.Item>
        <Accordion.Item eventKey="2">
          <Action listNft={listOnMkp} title={"List on Marketplace"}/>
        </Accordion.Item>
        { props.item.dynamic ? (
          <Accordion.Item eventKey="3">
            <Button variant="primary" size="lg" onClick={() => upgradeNft()}>
                    Upgrade Nft
            </Button>
          </Accordion.Item>
        ) : null }
      </Accordion>   
    );
};