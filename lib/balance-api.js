// lib/balance-api.js
// Service layer for interacting with the balance management API

const BALANCE_API_URL = process.env.NEXT_PUBLIC_BALANCE_API_URL || 'http://localhost:8000'
const BALANCE_API_KEY = process.env.NEXT_PUBLIC_BALANCE_API_KEY || 'your-balance-api-key'

export class BalanceAPIError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'BalanceAPIError'
    this.status = status
  }
}

export const balanceAPI = {
  // Helper method for API calls
  async _request(endpoint, options = {}) {
    const response = await fetch(`${BALANCE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': BALANCE_API_KEY,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new BalanceAPIError(
        error.detail || `Request failed with status ${response.status}`,
        response.status
      )
    }

    return response.json()
  },

  // Get user balance
  async getBalance(userId) {
    try {
      const data = await this._request(`/balance/${userId}`)
      return data.balance || 0
    } catch (error) {
      console.error('Error fetching balance:', error)
      if (error.status === 404) {
        return 0 // User not found, return 0 balance
      }
      throw error
    }
  },

  // Add tokens to user balance
  async addBalance(userId, amount, reason = 'Manual addition', source = 'dashboard') {
    if (amount <= 0) {
      throw new BalanceAPIError('Amount must be positive', 400)
    }

    const data = await this._request('/balance/add', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        amount,
        reason,
        source
      })
    })

    return {
      success: data.status === 'success',
      newBalance: data.new_balance,
      change: data.change
    }
  },

  // Subtract tokens from user balance
  async subtractBalance(userId, amount, reason = 'Manual deduction', source = 'dashboard') {
    if (amount <= 0) {
      throw new BalanceAPIError('Amount must be positive', 400)
    }

    const data = await this._request('/balance/subtract', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        amount,
        reason,
        source
      })
    })

    return {
      success: data.status === 'success',
      newBalance: data.new_balance,
      change: data.change
    }
  },

  // Transfer tokens between users
  async transferBalance(fromUserId, toUserId, amount, reason = 'Transfer') {
    if (amount <= 0) {
      throw new BalanceAPIError('Amount must be positive', 400)
    }

    try {
      // First subtract from sender
      await this.subtractBalance(fromUserId, amount, `${reason} to user ${toUserId}`, 'transfer')
      
      // Then add to receiver
      const result = await this.addBalance(toUserId, amount, `${reason} from user ${fromUserId}`, 'transfer')
      
      return {
        success: true,
        amount,
        fromUser: fromUserId,
        toUser: toUserId
      }
    } catch (error) {
      // If adding to receiver fails, try to refund sender
      if (error.message.includes('subtract')) {
        // Subtraction failed, no need to refund
        throw error
      } else {
        // Addition failed, refund sender
        try {
          await this.addBalance(fromUserId, amount, 'Transfer refund', 'system')
        } catch (refundError) {
          console.error('Failed to refund transfer:', refundError)
        }
        throw new BalanceAPIError('Transfer failed and was rolled back', 500)
      }
    }
  },

  // Batch operations
  async batchAddBalance(operations) {
    const results = []
    const errors = []

    for (const op of operations) {
      try {
        const result = await this.addBalance(op.userId, op.amount, op.reason, op.source)
        results.push({ userId: op.userId, ...result })
      } catch (error) {
        errors.push({ userId: op.userId, error: error.message })
      }
    }

    return { results, errors }
  },

  // Helper to convert Discord ID to numeric user ID if needed
  parseUserId(userIdentifier) {
    // If it's already a number, return it
    if (typeof userIdentifier === 'number') {
      return userIdentifier
    }
    
    // If it's a string that looks like a Discord ID, convert to number
    if (typeof userIdentifier === 'string' && /^\d+$/.test(userIdentifier)) {
      return parseInt(userIdentifier, 10)
    }
    
    // Otherwise, hash the string to get a consistent numeric ID
    let hash = 0
    for (let i = 0; i < userIdentifier.length; i++) {
      const char = userIdentifier.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}