import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'

export default function Item(props) {
    const [nfts, setNfts] = useState([])

    const init = () => {
        setNfts(props.nfts)
    }
    useEffect(() => {
        init()
      }, [])
      
    function handleShowDetail(item) {
        props.handleShowDetail(item)
    }

    return (
        <Row xs={1} md={2} lg={4} className="g-4 py-5">
        {nfts.map((item, idx) => (
            <Col key={idx} className="overflow-hidden">
                <Card>
                <Card.Img variant="top" src={item.image} />
                <Card.Body color="secondary">
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Text>
                    {item.description.slice(0, 20) + "..."}
                    </Card.Text>
                </Card.Body>
                <Card.Footer>
                <div className='d-grid'>
                    <Button variant="primary" size="lg" onClick={() => handleShowDetail(item)}>
                        Detail page
                    </Button>
                </div>
                </Card.Footer>
                </Card>
            </Col>
        ))}
        </Row>
    );
};