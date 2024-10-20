"use client"

import React from 'react'
import { Calculator, TrendingUp, DollarSign, LineChart, Globe } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RateCalculator from '@/app/components/RateCalculator'
import MarketTrends from '@/app/components/MarketTrends'
import ClientBudgetComparison from '@/app/components/ClientBudgetComparison'
import IncomeExpenseTracker from '@/app/components/IncomeExpenseTracker'
import RateOptimizationTips from '@/app/components/RateOptimizationTips'

export default function Component() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="container mx-auto p-4">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-3xl sm:text-4xl">Expensify</CardTitle>
            <CardDescription className="text-sm sm:text-base">Calculate rates, track income, and optimize your freelance business</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="calculator" className="space-y-4">
              <TabsList className="flex flex-wrap justify-start gap-2">
                <TabsTrigger value="calculator" className="flex items-center text-xs sm:text-sm">
                  <Calculator className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Calculator</span>
                  <span className="sm:hidden">Calc</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center text-xs sm:text-sm">
                  <TrendingUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Market Trends</span>
                  <span className="sm:hidden">Trends</span>
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center text-xs sm:text-sm">
                  <DollarSign className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Budget Comparison</span>
                  <span className="sm:hidden">Budget</span>
                </TabsTrigger>
                <TabsTrigger value="tracker" className="flex items-center text-xs sm:text-sm">
                  <LineChart className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Income Tracker</span>
                  <span className="sm:hidden">Income</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center text-xs sm:text-sm">
                  <Globe className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Optimization Tips</span>
                  <span className="sm:hidden">Tips</span>
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