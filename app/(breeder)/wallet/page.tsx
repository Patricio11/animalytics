"use client";

import { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Download,
  Search,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/currency";
import { formatDate, formatTime } from "@/lib/utils/date-time";
import { getTransactionTypeName, isCredit } from "@/lib/utils/wallet";

// Mock data - TODO: Replace with real data from API
const mockWallet = {
  balances: {
    USD: 125000, // $1,250.00 in cents
    EUR: 85000,  // €850.00
    GBP: 62000,  // £620.00
    ZAR: 15000,  // R150.00
  },
  totalEarnings: 350000, // $3,500.00
  totalWithdrawals: 175000, // $1,750.00
  totalTransactions: 42,
  pendingBalance: {
    USD: 25000, // $250.00 in escrow
  },
};

const mockTransactions = [
  {
    id: 'tx1',
    type: 'escrow_release' as const,
    amount: 50000,
    currency: 'USD' as const,
    fee: 5000,
    status: 'completed' as const,
    description: 'Sale of Golden Retriever puppy',
    reference: 'ORDER-12345',
    createdAt: new Date('2025-01-08T14:30:00'),
  },
  {
    id: 'tx2',
    type: 'withdrawal' as const,
    amount: 100000,
    currency: 'USD' as const,
    fee: 100,
    status: 'completed' as const,
    description: 'Bank transfer payout',
    reference: 'PAYOUT-789',
    createdAt: new Date('2025-01-07T09:15:00'),
  },
  {
    id: 'tx3',
    type: 'escrow_hold' as const,
    amount: 25000,
    currency: 'USD' as const,
    fee: 0,
    status: 'pending' as const,
    description: 'Stud service fee (pending)',
    reference: 'ORDER-12346',
    createdAt: new Date('2025-01-09T11:20:00'),
  },
  {
    id: 'tx4',
    type: 'payment' as const,
    amount: 15000,
    currency: 'USD' as const,
    fee: 450,
    status: 'completed' as const,
    description: 'Marketplace listing fee',
    reference: 'FEE-456',
    createdAt: new Date('2025-01-06T16:45:00'),
  },
  {
    id: 'tx5',
    type: 'refund' as const,
    amount: 5000,
    currency: 'USD' as const,
    fee: 0,
    status: 'completed' as const,
    description: 'Cancelled transaction refund',
    reference: 'REFUND-123',
    createdAt: new Date('2025-01-05T13:10:00'),
  },
];

export default function WalletPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'ZAR'>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');

  const filteredTransactions = mockTransactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' ||
                       (filterType === 'credit' && isCredit(tx.type)) ||
                       (filterType === 'debit' && !isCredit(tx.type));
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-chart-3 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-chart-2 text-chart-2"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground mt-2">
            Manage your earnings, withdrawals, and transaction history
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="hover-elevate">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-gradient-brand hover:opacity-90 shadow-card">
            <Plus className="w-4 h-4 mr-2" />
            Request Payout
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Available Balance */}
        <Card className="shadow-card bg-gradient-brand text-white border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(mockWallet.balances[selectedCurrency], selectedCurrency)}
            </div>
            <p className="text-xs text-white/80 mt-2">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        {/* Pending Balance */}
        <Card className="shadow-card hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Pending Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(mockWallet.pendingBalance[selectedCurrency] || 0, selectedCurrency)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              In escrow
            </p>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="shadow-card hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-3">
              {formatCurrency(mockWallet.totalEarnings, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All time
            </p>
          </CardContent>
        </Card>

        {/* Total Withdrawals */}
        <Card className="shadow-card hover-elevate">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center text-muted-foreground">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Total Withdrawals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(mockWallet.totalWithdrawals, 'USD')}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Selector */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Currency Balances
          </CardTitle>
          <CardDescription>View your balance in different currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(mockWallet.balances).map(([currency, balance]) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency as any)}
                className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                  selectedCurrency === currency
                    ? 'border-primary bg-gradient-subtle shadow-card'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="text-sm text-muted-foreground mb-1">{currency}</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(balance, currency as any)}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription className="mt-2">
                View and filter your transaction history
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-base px-3 py-1">
              {mockWallet.totalTransactions} transactions
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Money In</SelectItem>
                <SelectItem value="debit">Money Out</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Transactions List */}
          <div className="space-y-3">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions found</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-surface hover:bg-accent/50 transition-colors hover-elevate"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      isCredit(transaction.type)
                        ? 'bg-chart-3/10 text-chart-3'
                        : 'bg-chart-1/10 text-chart-1'
                    }`}>
                      {isCredit(transaction.type) ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{transaction.description}</p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{getTransactionTypeName(transaction.type)}</span>
                        <span>•</span>
                        <span>{transaction.reference}</span>
                        <span>•</span>
                        <span>{formatDate(transaction.createdAt)} at {formatTime(transaction.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      isCredit(transaction.type) ? 'text-chart-3' : 'text-foreground'
                    }`}>
                      {isCredit(transaction.type) ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    {transaction.fee > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Fee: {formatCurrency(transaction.fee, transaction.currency)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
