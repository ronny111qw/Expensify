import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Trash2, AlertCircle, Download, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  date: string
  description: string
  category: string
  currency: string
}

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investments', 'Rental', 'Other Income'],
  expense: ['Housing', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Utilities', 'Shopping', 'Other Expenses']
}

const COLORS = {
  income: '#10B981',
  expense: '#EF4444',
  categories: ['#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#65A30D', '#0D9488', '#6366F1']
}

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
]

export default function IncomeExpenseTracker() {
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    description: '',
    category: CATEGORIES.income[0],
    date: new Date(),
    currency: 'USD'
  })
  const [defaultCurrency] = useState('USD')
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transactions')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })
  const [error, setError] = useState<string | null>(null)
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCurrency, setSelectedCurrency] = useState('all')

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions))
  }, [transactions])

  const formatAmount = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency)
    if (!currencyInfo) return `${amount.toFixed(2)}`

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      category: name === 'type' ? CATEGORIES[value as 'income' | 'expense'][0] : prev.category
    }))
  }

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions]

    // Filter by period
    const now = new Date()
    switch (filterPeriod) {
      case 'week':
        filtered = filtered.filter(t => {
          const date = new Date(t.date)
          return (now.getTime() - date.getTime()) / (1000 * 3600 * 24) <= 7
        })
        break
      case 'month':
        filtered = filtered.filter(t => {
          const date = new Date(t.date)
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })
        break
      case 'year':
        filtered = filtered.filter(t => {
          const date = new Date(t.date)
          return date.getFullYear() === now.getFullYear()
        })
        break
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Filter by currency
    if (selectedCurrency !== 'all') {
      filtered = filtered.filter(t => t.currency === selectedCurrency)
    }

    return filtered
  }, [transactions, filterPeriod, searchTerm, selectedCategory, selectedCurrency])

  const addTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseFloat(formData.amount)
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (!formData.description.trim()) {
      setError('Please enter a description')
      return
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      type: formData.type,
      amount,
      description: formData.description,
      category: formData.category,
      date: formData.date.toISOString().split('T')[0],
      currency: formData.currency
    }

    setTransactions(prev => [newTransaction, ...prev])
    setFormData({
      type: 'income',
      amount: '',
      description: '',
      category: CATEGORIES.income[0],
      date: new Date(),
      currency: defaultCurrency
    })
    setError(null)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency']
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        [t.date, t.type, t.category, `"${t.description}"`, t.amount, t.currency].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const calculateTotalsByCurrency = (type: 'income' | 'expense') => {
    const totals: Record<string, number> = {}
    filteredTransactions
      .filter(t => t.type === type)
      .forEach(t => {
        totals[t.currency] = (totals[t.currency] || 0) + t.amount
      })
    return totals
  }

  const totalIncomeByCurrency = calculateTotalsByCurrency('income')
  const totalExpensesByCurrency = calculateTotalsByCurrency('expense')

  const pieData = Object.keys(totalIncomeByCurrency).map(currency => ({
    name: `Income (${currency})`,
    value: totalIncomeByCurrency[currency]
  })).concat(
    Object.keys(totalExpensesByCurrency).map(currency => ({
      name: `Expenses (${currency})`,
      value: totalExpensesByCurrency[currency]
    }))
  )

  const categoryData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}
    filteredTransactions.forEach(t => {
      if (!data[t.currency]) {
        data[t.currency] = {}
      }
      data[t.currency][t.category] = (data[t.currency][t.category] || 0) + t.amount
    })
    
    return Object.entries(data).flatMap(([currency, categories]) =>
      Object.entries(categories).map(([name, value]) => ({
        name: `${name} (${currency})`,
        value
      }))
    )
  }, [filteredTransactions])

  const monthlyData = useMemo(() => {
    const data: Record<string, Record<string, { income: number; expenses: number }>> = {}
    filteredTransactions.forEach(t => {
      const monthYear = t.date.substring(0, 7)
      if (!data[monthYear]) {
        data[monthYear] = {}
      }
      if (!data[monthYear][t.currency]) {
        data[monthYear][t.currency] = { income: 0, expenses: 0 }
      }
      if (t.type === 'income') {
        data[monthYear][t.currency].income += t.amount
      } else {
        data[monthYear][t.currency].expenses += t.amount
      }
    })

    return Object.entries(data)
      .sort()
      .flatMap(([date, currencies]) =>
        Object.entries(currencies).map(([currency, values]) => ({
          date: format(new Date(date), 'MMM yyyy'),
          [`income (${currency})`]: values.income,
          [`expenses (${currency})`]: values.expenses,
          currency
        }))
      )
  }, [filteredTransactions])

  // Custom tooltip formatters
  const customPieTooltipFormatter = (value: number, name: string | number) => {
    if (typeof name === 'string') {
      const currencyMatch = name.match(/\((.*?)\)/);
      const currency = currencyMatch ? currencyMatch[1].trim() : 'USD';
      return [formatAmount(value, currency), name];
    }
    return [formatAmount(value, 'USD'), name.toString()];
  };

  const customCategoryTooltipFormatter = (value: number, name: string | number) => {
    if (typeof name === 'string') {
      const currencyMatch = name.match(/\((.*?)\)/);
      const currency = currencyMatch ? currencyMatch[1].trim() : 'USD';
      return [formatAmount(value, currency), name];
    }
    return [formatAmount(value, 'USD'), name.toString()];
  };

  const renderPieChartCell = (entry: { name: string | number; value: number }, index: number) => {
    const entryName = typeof entry.name === 'string' ? entry.name : '';
    return (
      <Cell 
        key={`cell-${index}`} 
        fill={entryName.includes('Income') ? COLORS.income : COLORS.expense}
      />
    );
  };

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Financial Dashboard</CardTitle>
        <CardDescription className="text-sm sm:text-base">Comprehensive view of your income and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList className="flex flex-wrap justify-start gap-2">
            <TabsTrigger value="transactions" className="flex-grow sm:flex-grow-0">Transactions</TabsTrigger>
            <TabsTrigger value="overview" className="flex-grow sm:flex-grow-0">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-grow sm:flex-grow-0">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(totalIncomeByCurrency).map(currency => (
                <div key={currency} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-green-600">
                        Total Income ({currency})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">
                        {formatAmount(totalIncomeByCurrency[currency], currency)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-red-600">
                        Total Expenses ({currency})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">
                        {formatAmount(totalExpensesByCurrency[currency] || 0, currency)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-blue-600">
                        Net Balance ({currency})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xl sm:text-2xl font-bold">
                        {formatAmount(
                          (totalIncomeByCurrency[currency] || 0) - (totalExpensesByCurrency[currency] || 0),
                          currency
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {Array.from(new Set(monthlyData.map(d => d.currency))).map((currency, index) => (
                          <React.Fragment key={currency}>
                            <Bar
                              dataKey={`income (${currency})`}
                              fill={COLORS.income}
                              name={`Income (${currency})`}
                              stackId={index}
                            />
                            <Bar
                              dataKey={`expenses (${currency})`}
                              fill={COLORS.expense}
                              name={`Expenses (${currency})`}
                              stackId={index}
                            />
                          </React.Fragment>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS.categories[index % COLORS.categories.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={customCategoryTooltipFormatter} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <form onSubmit={addTransaction} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            type: value as 'income' | 'expense',
                            category: CATEGORIES[value as 'income' | 'expense'][0]
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">Income</SelectItem>
                            <SelectItem value="expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            category: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES[formData.type].map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          name="amount"
                          type="number"
                          value={formData.amount}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData(prev => ({
                            ...prev,
                            currency: value
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                      />
                    </div>

                    <div>
                      <Label>Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(formData.date, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.date}
                            onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full"
                      variant={formData.type === 'income' ? 'default' : 'destructive'}
                    >
                      Add {formData.type}
                    </Button>
                  </form>
                </div>

                <div className="flex-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Time Period</Label>
                        <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Time</SelectItem>
                            <SelectItem value="week">Last Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Category</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {[...CATEGORIES.income, ...CATEGORIES.expense].map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Currency</Label>
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Currencies</SelectItem>
                            {CURRENCIES.map(currency => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.symbol} {currency.name} ({currency.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Search</Label>
                        <Input
                          placeholder="Search transactions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={exportToCSV}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export to CSV
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="rounded-md border">
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-base sm:text-lg">Transaction History</h3>
                  <div className="space-y-2">
                    {filteredTransactions.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No transactions found
                      </div>
                    ) : (
                      filteredTransactions.map((t) => (
                        <div 
                          key={t.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                            <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <div>
                              <div className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatAmount(t.amount, t.currency)}
                              </div>
                              <div className="text-sm text-gray-600">
                                {t.description}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:space-x-4">
                            <div className="text-left sm:text-right">
                              <div className="text-sm font-medium">{t.category}</div>
                              <div className="text-xs text-gray-500">{format(new Date(t.date), 'PP')}</div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteTransaction(t.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">Income vs Expenses</CardTitle>
                      <PieChartIcon className="h-4 w-4 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => renderPieChartCell(entry, index))}
                          </Pie>
                          <Tooltip formatter={customPieTooltipFormatter} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">Category Analysis</CardTitle>
                      <BarChartIcon className="h-4 w-4 text-gray-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] sm:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip formatter={customCategoryTooltipFormatter} />
                          <Bar dataKey="value" fill="#8884d8">
                            {categoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS.categories[index % COLORS.categories.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}