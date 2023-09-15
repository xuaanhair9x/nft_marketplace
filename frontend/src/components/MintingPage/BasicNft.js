import { useState } from 'react'
import { parseEther } from "ethers"
import { Row, Form, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";

const simulationServiceHost = 'http://127.0.0.1:3333/write/';

const MintNftBasic = ({ nft }) => {
  let navigate = useNavigate();

  const [image, setImage] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [inputFields, setInputFields] = useState([
    { trail_type: '', value: '' }
  ])

  const createNFT = async () => {

    if (!image || !name || !description) return

    try {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json'},
          body: JSON.stringify({
            "image": image, 
            "name" :name, 
            "description": description,
            "attributes": inputFields
          })
        };
      console.log(requestOptions.body)
      fetch(simulationServiceHost, requestOptions)
        .then(response => response.json())
        .then(data => mintNft(data.path))
        .catch(err => {
          console.log('Error :-S', err)
        });     
    } catch(error) {
      console.log("ipfs uri upload error: ", error)
    }
  }

  const mintNft = async (uri) => {
    console.log("nft:", nft)
    // mint nft 
    try {
      let idToken = await(await nft.mint(uri)).wait();
      navigate("/my-account-page");
    } catch (error) {
      console.log(error);
    }
  }

  const handleFormChange = (index, event) => {
    let data = [...inputFields];
    data[index][event.target.name] = event.target.value;
    setInputFields(data);
  }

  const addFields = () => {
    let newfield = { trail_type: '', value: '' }
    setInputFields([...inputFields, newfield])
  }

  const removeFields = (index) => {
    let data = [...inputFields];
    data.splice(index, 1)
    setInputFields(data)
  }

  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control onChange={(e) => setImage(e.target.value)} size="lg" required type="text" placeholder="Image Url" />
              <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
              <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
                {inputFields.map((input, index) => {
                    return (
                      <div key={index} className="form-row">
                        <input
                          className="form-group col-md-4"
                          name='trail_type'
                          placeholder='Trail Type'
                          size="sm"
                          value={input.name}
                          onChange={event => handleFormChange(index, event)}
                        />
                        <input
                          className="form-group col-md-4"
                          name='value'
                          placeholder='Value'
                          value={input.age}
                          onChange={event => handleFormChange(index, event)}
                        />
                        <button onClick={() => removeFields(index)}>Remove</button>
                      </div>
                    )
                  })}
                  <div className="form-row"> 
                    <button className="form-group col-md-9" onClick={addFields}>Add More..</button>
                  </div>
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
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

export default MintNftBasic