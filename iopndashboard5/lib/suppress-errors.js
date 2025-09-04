"use client"

// Suppress specific console errors in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const originalError = console.error
  const originalWarn = console.warn
  
  console.error = (...args) => {
    // Suppress Coinbase CCA metrics errors
    if (args[0]?.toString?.().includes('cca-lite.coinbase.com')) {
      return
    }
    // Suppress Lit dev mode warning
    if (args[0]?.toString?.().includes('Lit is in dev mode')) {
      return
    }
    originalError.apply(console, args)
  }
  
  console.warn = (...args) => {
    // Suppress Lit dev mode warning
    if (args[0]?.toString?.().includes('Lit is in dev mode')) {
      return
    }
    originalWarn.apply(console, args)
  }
}

// Block Coinbase Analytics
if (typeof window !== 'undefined') {
  // Override fetch for Coinbase metrics
  const originalFetch = window.fetch
  window.fetch = function(...args) {
    const url = args[0]?.toString?.() || ''
    if (url.includes('cca-lite.coinbase.com')) {
      // Return a fake successful response instead of rejecting
      return Promise.resolve(new Response('{}', {
        status: 200,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' })
      }))
    }
    return originalFetch.apply(this, args)
  }
  
  // Block XMLHttpRequest to Coinbase
  const originalXHROpen = XMLHttpRequest.prototype.open
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (url?.includes?.('cca-lite.coinbase.com')) {
      // Don't open the connection at all
      this.send = function() {} // Override send to do nothing
      return
    }
    return originalXHROpen.apply(this, [method, url, ...rest])
  }
}