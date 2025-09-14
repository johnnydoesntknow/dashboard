// components/balance-display.js
"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBalance } from '@/hooks/use-balance'
import { useTheme } from 'next-themes'
import { 
  Coins, 
  RefreshCw, 
  Plus, 
  Minus, 
  Send, 
  TrendingUp, 
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react'

export function BalanceDisplay({ compact = false, showActions = true }) {
  const { balance, loading, refreshing, refreshBalance, addBalance, subtractBalance, transferBalance } = useBalance()
  const { theme } = useTheme()
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showSpendDialog, setShowSpendDialog] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferRecipient, setTransferRecipient] = useState('')
  const [addAmount, setAddAmount] = useState('')
  const [addReason, setAddReason] = useState('')
  const [spendAmount, setSpendAmount] = useState('')
  const [spendReason, setSpendReason] = useState('')

  const formatBalance = (value) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleTransfer = async () => {
    const amount = parseInt(transferAmount)
    if (amount > 0 && transferRecipient) {
      const success = await transferBalance(transferRecipient, amount, 'Token Transfer')
      if (success) {
        setShowTransferDialog(false)
        setTransferAmount('')
        setTransferRecipient('')
      }
    }
  }

  const handleAdd = async () => {
    const amount = parseInt(addAmount)
    if (amount > 0) {
      const success = await addBalance(amount, addReason || 'Manual Addition', 'admin')
      if (success) {
        setShowAddDialog(false)
        setAddAmount('')
        setAddReason('')
      }
    }
  }

  const handleSpend = async () => {
    const amount = parseInt(spendAmount)
    if (amount > 0) {
      const success = await subtractBalance(amount, spendReason || 'Manual Spending', 'user')
      if (success) {
        setShowSpendDialog(false)
        setSpendAmount('')
        setSpendReason('')
      }
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Coins className={`h-4 w-4 ${theme === 'dark' ? 'text-bright-aqua' : 'text-brand-blue'}`} />
          <span className={`font-medium ${loading ? 'opacity-50' : ''}`}>
            {formatBalance(balance)}
          </span>
        </div>
        {showActions && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={refreshBalance}
            disabled={refreshing}
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={`${theme === 'dark' ? 'holo-card' : ''} card-hover`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Token Balance</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={refreshBalance}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tokens
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSpendDialog(true)}>
                  <Minus className="h-4 w-4 mr-2" />
                  Spend Tokens
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-gradient-to-br from-bright-aqua/20 to-royal-purple/20' 
                : 'bg-gradient-to-br from-blue-100 to-purple-100'
            }`}>
              <Wallet className={`h-5 w-5 ${
                theme === 'dark' ? 'text-bright-aqua' : 'text-brand-blue'
              }`} />
            </div>
            <div>
              <div className={`text-2xl font-bold ${loading ? 'opacity-50' : ''}`}>
                {formatBalance(balance)}
              </div>
              <p className="text-xs text-muted-foreground">Available Tokens</p>
            </div>
          </div>
          
          {balance > 0 && (
            <Badge variant="outline" className={
              theme === 'dark' 
                ? 'border-bright-aqua/50 text-bright-aqua' 
                : 'border-brand-blue/50 text-brand-blue'
            }>
              Active
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        {showActions && balance > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransferDialog(true)}
              className="flex items-center gap-1"
            >
              <ArrowUpRight className="h-3 w-3" />
              Send
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSpendDialog(true)}
              className="flex items-center gap-1"
            >
              <ArrowDownRight className="h-3 w-3" />
              Spend
            </Button>
          </div>
        )}
      </CardContent>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Tokens</DialogTitle>
            <DialogDescription>
              Send tokens to another user by their Discord ID or wallet address
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient (Discord ID or Wallet)</Label>
              <Input
                id="recipient"
                value={transferRecipient}
                onChange={(e) => setTransferRecipient(e.target.value)}
                placeholder="e.g. 123456789 or 0x..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Enter amount to transfer"
                min="1"
                max={balance}
              />
              <p className="text-xs text-muted-foreground">
                Available: {formatBalance(balance)} tokens
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTransfer}
              disabled={!transferRecipient || !transferAmount || parseInt(transferAmount) <= 0 || parseInt(transferAmount) > balance}
            >
              Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tokens Dialog (Admin) */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tokens</DialogTitle>
            <DialogDescription>
              Add tokens to your balance (Admin function)
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-amount">Amount</Label>
              <Input
                id="add-amount"
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Enter amount to add"
                min="1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-reason">Reason (Optional)</Label>
              <Input
                id="add-reason"
                value={addReason}
                onChange={(e) => setAddReason(e.target.value)}
                placeholder="e.g. Event reward, Bonus"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={!addAmount || parseInt(addAmount) <= 0}
            >
              Add Tokens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Spend Tokens Dialog */}
      <Dialog open={showSpendDialog} onOpenChange={setShowSpendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Spend Tokens</DialogTitle>
            <DialogDescription>
              Spend tokens from your balance
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="spend-amount">Amount</Label>
              <Input
                id="spend-amount"
                type="number"
                value={spendAmount}
                onChange={(e) => setSpendAmount(e.target.value)}
                placeholder="Enter amount to spend"
                min="1"
                max={balance}
              />
              <p className="text-xs text-muted-foreground">
                Available: {formatBalance(balance)} tokens
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="spend-reason">Reason (Optional)</Label>
              <Input
                id="spend-reason"
                value={spendReason}
                onChange={(e) => setSpendReason(e.target.value)}
                placeholder="e.g. Badge purchase, Service"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSpendDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSpend}
              disabled={!spendAmount || parseInt(spendAmount) <= 0 || parseInt(spendAmount) > balance}
            >
              Spend Tokens
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}