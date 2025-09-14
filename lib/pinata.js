import axios from 'axios'

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

export async function uploadToPinata(file, metadata = {}) {
  const formData = new FormData()
  formData.append('file', file)
  
  const pinataMetadata = JSON.stringify({
    name: metadata.name || 'IOPn NFT',
    keyvalues: metadata
  })
  formData.append('pinataMetadata', pinataMetadata)

  const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    }
  })
  
  return `ipfs://${res.data.IpfsHash}`
}

export async function uploadJSONToPinata(json, name) {
  const res = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    pinataContent: json,
    pinataMetadata: { name }
  }, {
    headers: {
      'pinata_api_key': PINATA_API_KEY,
      'pinata_secret_api_key': PINATA_SECRET_KEY
    }
  })
  
  return `ipfs://${res.data.IpfsHash}`
}