"use client"

import React, { useState } from 'react'
import { Calculator, TrendingUp, DollarSign, LineChart, Globe } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RateCalculator from './components/RateCalculator'
import MarketTrends from './components/MarketTrends'
import ClientBudgetComparison from './components/ClientBudgetComparison'
import IncomeExpenseTracker from './components/IncomeExpenseTracker'
import RateOptimizationTips from './components/RateOptimizationTips'

export default function Component() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Freelancer Rate Calculator</h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Freelancer Tools</CardTitle>
            <CardDescription>Calculate rates, track income, and optimize your freelance business</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calculator" className="space-y-4">
              <TabsList>
                <TabsTrigger value="calculator" className="flex items-center">
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculator
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Market Trends
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Budget Comparison
                </TabsTrigger>
                <TabsTrigger value="tracker" className="flex items-center">
                  <LineChart className="mr-2 h-4 w-4" />
                  Income Tracker
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center">
                  <Globe className="mr-2 h-4 w-4" />
                  Optimization Tips
                </TabsTrigger>
              </TabsList>
              <TabsContent value="calculator">
                <RateCalculator />
              </TabsContent>
              <TabsContent value="trends">
                <MarketTrends />
              </TabsContent>
              <TabsContent value="budget">
                <ClientBudgetComparison />
              </TabsContent>
              <TabsContent value="tracker">
                <IncomeExpenseTracker />
              </TabsContent>
              <TabsContent value="tips">
                <RateOptimizationTips />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}