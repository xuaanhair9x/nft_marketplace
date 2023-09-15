import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import MintNftBasic from './BasicNft';
import MintDynamicNft from './DynamicNft';

function MintingPage({nft, nftLendable, nftDynamic}) {
    console.log("MintingPage: nftRentable:", nftLendable)
    console.log("MintingPage: nft:", nft)
    console.log("MintingPage: nft:", nftDynamic)
    return (
        <div>
            <h1>Mint NFT</h1>
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
            <Row>
                <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                    <Nav.Link eventKey="first">Basic NFT</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                    <Nav.Link eventKey="second">Rentable NFT</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                    <Nav.Link eventKey="third">Dynamic NFT</Nav.Link>
                    </Nav.Item>
                </Nav>
                </Col>
                <Col sm={9}>
                <Tab.Content>
                    <Tab.Pane eventKey="first">
                        <MintNftBasic nft={nft}></MintNftBasic>
                    </Tab.Pane>
                    <Tab.Pane eventKey="second">
                        <MintNftBasic nft={nftLendable}></MintNftBasic>
                    </Tab.Pane>
                    <Tab.Pane eventKey="third">
                        <MintDynamicNft nft={nftDynamic}></MintDynamicNft>
                    </Tab.Pane>
                </Tab.Content>
                </Col>
            </Row>
            </Tab.Container>
        </div>
      );
}

export default MintingPage;