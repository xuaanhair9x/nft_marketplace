import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export default function Action(props) {
    const [item, setItem] = useState(null)
    const [price, setPrice] = useState(0)
    const [title, setTitle] = useState("");

    console.log(props)
    
    const init = () => {
        setItem(props.item)
        setTitle(props.title)
    }
    useEffect(() => {
        init()
      }, [])
      
    function handleClick() {
        props.listNft(price)
    }

    return (
        <>
        <Accordion.Header> {title} </Accordion.Header>
        <Accordion.Body>
            <InputGroup className="mb-3">
                <Form.Control
                    type="number"
                    placeholder="Price ETH"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                    onChange={(e) => setPrice(e.target.value)} />
            </InputGroup>
            <div className="d-grid gap-2">
                <Button variant="primary" size="lg" onClick={() => handleClick()}>
                    List item
                </Button>
            </div>
        </Accordion.Body>
        </>
    );
};