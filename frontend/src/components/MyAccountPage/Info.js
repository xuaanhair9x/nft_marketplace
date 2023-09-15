import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Table from 'react-bootstrap/Table';
import InputGroup from 'react-bootstrap/InputGroup';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

export default function Info(props) {
    const [item, setItem] = useState(null)
    console.log(props.item)
    
    const init = () => {
        setItem(props.item)
    }
    useEffect(() => {
        init()
      }, [])
    if (item == null) {
        return
    }
    
    return (
        <div className="content mx-auto">
            <img
            src={item.image}
            className='img-thumbnail'
            alt='...'/>
            <Tabs
            defaultActiveKey="trails"
            id="uncontrolled-tab-example"
            className="mb-3">
            <Tab eventKey="description" title="Description">
                {' '}{item.description}{' '}
            </Tab>
            <Tab eventKey="trails" title="Trails">
                <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Trail type</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {item.attributes.map((item, idx) => (
                            <tr>
                                <td>{idx}</td>
                                <td>{item.trail_type}</td>
                                <td>{item.value}</td>
                            </tr>
                        ))}
                        </tbody>
                </Table>
            </Tab>
            </Tabs>
        </div>  
    );
};