"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface Transaction {
  type: 'income' | 'expense'
  amount: number
  date: string
}

export default function IncomeExpenseTracker() {
  const [income, setIncome] = useState<string>('')
  const [expenses, setExpenses] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const addTransaction = (type: 'income' | 'expense') => {
    const amount = type === 'income' ? parseFloat(income) : parseFloat(expenses)
    if (amount) {
      setTransactions([...transactions, { type, amount, date: new Date().toISOString().split('T')[0] }])
      type === 'income' ? setIncome('') : setExpenses('')
    }
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  const pieData = [
    { name: 'Income', value: totalIncome },
    { name: 'Expenses', value: totalExpenses },
  ]

  const COLORS = ['#0088FE', '#FF8042']

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income and Expense Tracker</CardTitle>
        <CardDescription>Track your freelance income and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="income">Income ($)</Label>
            <Input
              id="income"
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
            <Button onClick={() => addTransaction('income')} className="w-full">Add Income</Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expenses">Expenses ($)</Label>
            <Input
              id="expenses"
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
            <Button onClick={() => addTransaction('expense')} variant="destructive" className="w-full">Add Expense</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Transactions</h3>
            <ul className="space-y-1">
              {transactions.map((t, index) => (
                <li key={index} className={`text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.date}: ${t.amount} ({t.type})
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={200}>
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
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}