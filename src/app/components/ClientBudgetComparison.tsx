"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, DollarSign, Clock, Calculator, Info, TrendingUp } from 'lucide-react'

interface CurrencyInfo {
  symbol: string
  name: string
  rate: number
  regionSpecificRates: {
    veryLow: number
    belowAverage: number
    average: number
    aboveAverage: number
  }
}

export default function ClientBudgetComparison() {
  const [clientBudget, setClientBudget] = useState<string>('')
  const [projectHours, setProjectHours] = useState<string>('')
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD')
  const [comparison, setComparison] = useState<{
    message: string;
    type: 'error' | 'warning' | 'success';
    details?: {
      originalRate: number;
      usdEquivalent: number;
    };
  } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const currencies: Record<string, CurrencyInfo> = {
    USD: {
      symbol: '$',
      name: 'US Dollar',
      rate: 1,
      regionSpecificRates: {
        veryLow: 25,
        belowAverage: 50,
        average: 100,
        aboveAverage: 150
      }
    },
    EUR: {
      symbol: '€',
      name: 'Euro',
      rate: 0.91,
      regionSpecificRates: {
        veryLow: 23,
        belowAverage: 45,
        average: 90,
        aboveAverage: 135
      }
    },
    GBP: {
      symbol: '£',
      name: 'British Pound',
      rate: 0.79,
      regionSpecificRates: {
        veryLow: 20,
        belowAverage: 40,
        average: 80,
        aboveAverage: 120
      }
    },
    INR: {
      symbol: '₹',
      name: 'Indian Rupee',
      rate: 83.25,
      regionSpecificRates: {
        veryLow: 500,
        belowAverage: 1000,
        average: 2000,
        aboveAverage: 3000
      }
    },
    AUD: {
      symbol: 'A$',
      name: 'Australian Dollar',
      rate: 1.53,
      regionSpecificRates: {
        veryLow: 38,
        belowAverage: 76,
        average: 153,
        aboveAverage: 230
      }
    },
    CAD: {
      symbol: 'C$',
      name: 'Canadian Dollar',
      rate: 1.36,
      regionSpecificRates: {
        veryLow: 34,
        belowAverage: 68,
        average: 136,
        aboveAverage: 204
      }
    },
    JPY: {
      symbol: '¥',
      name: 'Japanese Yen',
      rate: 154.45,
      regionSpecificRates: {
        veryLow: 2700,
        belowAverage: 5400,
        average: 10800,
        aboveAverage: 16200
      }
    }
  }

  const getRateCategory = (hourlyRate: number, currency: string) => {
    const currencyInfo = currencies[currency]
    const { regionSpecificRates } = currencyInfo

    if (hourlyRate < regionSpecificRates.veryLow) 
      return { message: 'Very Low', color: 'text-red-500', icon: '⚠️' }
    if (hourlyRate < regionSpecificRates.belowAverage) 
      return { message: 'Below Average', color: 'text-orange-500', icon: '⚠️' }
    if (hourlyRate < regionSpecificRates.average) 
      return { message: 'Average', color: 'text-green-500', icon: '✓' }
    if (hourlyRate < regionSpecificRates.aboveAverage) 
      return { message: 'Above Average', color: 'text-blue-500', icon: '★' }
    return { message: 'Premium', color: 'text-purple-500', icon: '★★' }
  }

  const validateInputs = () => {
    const budget = parseFloat(clientBudget)
    const hours = parseFloat(projectHours)

    if (!clientBudget || !projectHours) {
      return 'Please fill in all fields.'
    }
    if (isNaN(budget) || budget <= 0) {
      return 'Please enter a valid budget amount.'
    }
    if (isNaN(hours) || hours <= 0) {
      return 'Please enter a valid number of hours.'
    }
    return null
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const getUSDEquivalent = (amount: number, currency: string) => {
    return amount / currencies[currency].rate
  }

  const compareBudget = () => {
    setIsCalculating(true)
    const validationError = validateInputs()
    
    if (validationError) {
      setComparison({
        message: validationError,
        type: 'error'
      })
      setIsCalculating(false)
      return
    }

    const budget = parseFloat(clientBudget)
    const hours = parseFloat(projectHours)
    const hourlyRate = budget / hours
    const rateCategory = getRateCategory(hourlyRate, selectedCurrency)
    const currencyInfo = currencies[selectedCurrency]
    const usdEquivalent = getUSDEquivalent(hourlyRate, selectedCurrency)

    setTimeout(() => {
      setComparison({
        message: `
          Budget: ${formatCurrency(budget, selectedCurrency)}
          Hours: ${hours}
          Hourly Rate: ${formatCurrency(hourlyRate, selectedCurrency)}
          USD Equivalent Rate: ${formatCurrency(usdEquivalent, 'USD')}
          Category: ${rateCategory.icon} ${rateCategory.message}
          
          ${hourlyRate < currencyInfo.regionSpecificRates.belowAverage 
            ? `Consider discussing scope or budget adjustments with the client. The current rate is below average for ${currencyInfo.name} regions.` 
            : hourlyRate > currencyInfo.regionSpecificRates.aboveAverage 
            ? `Ensure deliverables match premium expectations. This is a high-tier rate in ${currencyInfo.name} regions.` 
            : `This is a reasonable market rate for ${currencyInfo.name} regions.`}
        `,
        type: hourlyRate < currencyInfo.regionSpecificRates.belowAverage ? 'warning' : 'success',
        details: {
          originalRate: hourlyRate,
          usdEquivalent: usdEquivalent
        }
      })
      setIsCalculating(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      compareBudget()
    }
  }

  useEffect(() => {
    // Auto-detect user's currency based on browser locale
    try {
      const userLocale = navigator.language
      const userCurrency = new Intl.NumberFormat(userLocale, { 
        style: 'currency', 
        currency: 'USD' 
      }).resolvedOptions().currency

      if (currencies[userCurrency]) {
        setSelectedCurrency(userCurrency)
      }
    } catch (error) {
      console.error('Failed to detect user currency:', error)
    }
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calculator className="h-5 w-5 sm:h-6 sm:w-6" />
          Client Budget Comparison
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Rates are adjusted for regional markets</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">Compare client's budget with regional market rates and get instant feedback</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Currency
            </Label>
            <Select
              value={selectedCurrency}
              onValueChange={(value) => {
                setSelectedCurrency(value)
                setComparison(null)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencies).map(([code, { symbol, name }]) => (
                  <SelectItem key={code} value={code}>
                    {symbol} {code} - {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientBudget" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Client's Budget ({currencies[selectedCurrency].symbol})
            </Label>
            <Input
              id="clientBudget"
              type="number"
              value={clientBudget}
              onChange={(e) => setClientBudget(e.target.value)}
              onKeyPress={handleKeyPress}
              className="focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter amount in ${selectedCurrency}`}
              min="0"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="projectHours" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Estimated Project Hours
            </Label>
            <Input
              id="projectHours"
              type="number"
              value={projectHours}
              onChange={(e) => setProjectHours(e.target.value)}
              onKeyPress={handleKeyPress}
              className="focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project hours"
              min="0"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <Button 
          onClick={compareBudget}
          disabled={isCalculating}
          className="w-full sm:w-auto"
        >
          {isCalculating ? 'Calculating...' : 'Compare Budget'}
        </Button>
        {comparison && (
          <Alert className={`mt-4 w-full ${
            comparison.type === 'error' ? 'bg-red-50 border-red-200' :
            comparison.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          }`}>
            <AlertCircle className={`h-4 w-4 ${
              comparison.type === 'error' ? 'text-red-500' :
              comparison.type === 'warning' ? 'text-yellow-500' :
              'text-green-500'
            }`} />
            <AlertTitle>Budget Analysis</AlertTitle>
            <AlertDescription className="whitespace-pre-line text-sm sm:text-base">
              {comparison.message}
            </AlertDescription>
          </Alert>
        )}
      </CardFooter>
      <div className="mt-6 text-xs sm:text-sm mb-6 text-center px-4">
        <p>
          * Actual rates may vary based on specific project scope, experience, and market conditions.
        </p>
      </div>
    </Card>
  )
}