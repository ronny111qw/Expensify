'use client'
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
                <TabsTrigger value="calculator" className="flex items-center text-xs sm:text-sm p-2">
                  <Calculator className="mr-1 h-4 w-4" />
                  <span>Calc</span>
                </TabsTrigger>
                <TabsTrigger value="trends" className="flex items-center text-xs sm:text-sm p-2">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  <span>Trends</span>
                </TabsTrigger>
                <TabsTrigger value="budget" className="flex items-center text-xs sm:text-sm p-2">
                  <DollarSign className="mr-1 h-4 w-4" />
                  <span>Budget</span>
                </TabsTrigger>
                <TabsTrigger value="tracker" className="flex items-center text-xs sm:text-sm p-2">
                  <LineChart className="mr-1 h-4 w-4" />
                  <span>Income</span>
                </TabsTrigger>
                <TabsTrigger value="tips" className="flex items-center text-xs sm:text-sm p-2">
                  <Globe className="mr-1 h-4 w-4" />
                  <span>Tips</span>
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
