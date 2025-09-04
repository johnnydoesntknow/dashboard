const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your-api-key'

export const nftAPI = {
  // Generate NFT images using AI
  async generateImages(prompt, category = 'developer') {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      },
      body: JSON.stringify({ prompt, category })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to generate images')
    }
    
    const data = await response.json()
    // Convert filenames to full URLs
    return data.images.map(filename => `${API_BASE_URL}/images/${filename}`)
  },

  // Upload selected image to IPFS and get metadata
  async uploadToIPFS(filename, name, description) {
    const response = await fetch(`${API_BASE_URL}/upload/ipfs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      },
      body: JSON.stringify({ filename, name, description })
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to upload to IPFS')
    }
    
    return response.json()
  },

  // Check backend health
  async checkHealth() {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.json()
  }
}