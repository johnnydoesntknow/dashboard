// Chain image URLs for custom networks
export const chainImages = {
  984: 'https://i.ibb.co/dN1sMhw/logo.jpg', // OPN Testnet
  985: 'https://i.ibb.co/dN1sMhw/logo.jpg', // OPN Mainnet (update ID if different)
}

// Helper to inject chain images into AppKit
export function injectChainImages() {
  if (typeof window !== 'undefined') {
    // Method 1: Try to inject via window object
    if (!window.__APPKIT_CHAIN_IMAGES__) {
      window.__APPKIT_CHAIN_IMAGES__ = {}
    }
    Object.assign(window.__APPKIT_CHAIN_IMAGES__, chainImages)

    // Method 2: Try to inject via localStorage
    try {
      const storedImages = localStorage.getItem('appkit-chain-images') || '{}'
      const images = JSON.parse(storedImages)
      Object.assign(images, chainImages)
      localStorage.setItem('appkit-chain-images', JSON.stringify(images))
    } catch (e) {
      console.warn('Could not store chain images in localStorage:', e)
    }

    // Method 3: Try to inject custom CSS for the network icons
    const style = document.createElement('style')
    style.textContent = `
      /* OPN Network Icons Override */
      [data-testid="network-984"],
      [data-testid="network-985"],
      [data-network-id="984"],
      [data-network-id="985"],
      w3m-network-image[alt*="OPN"],
      w3m-network-button img[alt*="OPN"],
      img[alt="OPN Testnet"],
      img[alt="OPN Mainnet"],
      img[alt="OP Mainnet"] {
        content: url('https://i.ibb.co/dN1sMhw/logo.jpg') !important;
      }
      
      /* Fallback using background image for OPN networks */
      [data-testid="network-984"]::before,
      [data-testid="network-985"]::before,
      [data-network-id="984"]::before,
      [data-network-id="985"]::before {
        content: '';
        display: block;
        width: 100%;
        height: 100%;
        background-image: url('https://i.ibb.co/dN1sMhw/logo.jpg');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
      }
      
      /* Fix for OP Mainnet text showing as OPN */
      w3m-network-button[data-network="984"] .network-name::after,
      w3m-network-button[data-network="985"] .network-name::after {
        content: 'OPN' !important;
      }
    `
    document.head.appendChild(style)
  }
}

// Auto-inject on module load
if (typeof window !== 'undefined') {
  injectChainImages()
}