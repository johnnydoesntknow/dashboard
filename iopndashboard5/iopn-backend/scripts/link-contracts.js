import { ethers } from 'ethers'
import dotenv from 'dotenv'
dotenv.config()

const provider = new ethers.JsonRpcProvider('https://val1.iopn.pectra.zeeve.net/')
const wallet = new ethers.Wallet(process.env.BACKEND_WALLET_PRIVATE_KEY, provider)

async function linkContracts() {
  console.log('Linking contracts...')
  
  // Set contracts on OriginNFT
  const originNFT = new ethers.Contract(
    '0xB70B4DAb3F51A7ED2e353f84ccFaE1e0DA69E6bE',
    ['function setContracts(address, address, address) external'],
    wallet
  )
  
  const tx = await originNFT.setContracts(
    '0x4dF5eCA74b41a7e5C30731c815558107a9ADd185', // RepManager
    '0x1EA6C6547634bE2f4dc8996886C355857C587DAd', // BadgeManager  
    '0x4cb9374a0bbb8633593F65AB8B5A03bCa926762B'  // Marketplace
  )
  
  console.log('Transaction:', tx.hash)
  await tx.wait()
  console.log('✅ Contracts linked!')
}

linkContracts().catch(console.error)