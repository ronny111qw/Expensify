"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calculator, Info, Save, Download, RotateCcw, DollarSign, Trash2 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RateHistory {
  date: string;
  rate: number;
  currency: string;
}

interface SavedCalculation {
  inputs: {
    skillLevel: string;
    industry: string;
    location: string;
    experience: string;
    annualIncome: string;
    businessCosts: string;
    taxRate: string;
    nonBillableHours: string;
    currency: string;
  };
  results: {
    hourly: number;
    daily: number;
    monthly: number;
    currency: string;
  };
  date: string;
}

// Currency data with symbols and conversion rates (relative to USD)
const currencies = {
  USD: { symbol: '$', rate: 1, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.91, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  INR: { symbol: '₹', rate: 83.12, name: 'Indian Rupee' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', rate: 1.35, name: 'Canadian Dollar' },
  JPY: { symbol: '¥', rate: 114.75, name: 'Japanese Yen' },
  CNY: { symbol: '¥', rate: 7.23, name: 'Chinese Yuan' },
  BRL: { symbol: 'R$', rate: 4.97, name: 'Brazilian Real' },
  MXN: { symbol: 'Mex$', rate: 17.05, name: 'Mexican Peso' }
}

export default function RateCalculator() {
  const [skillLevel, setSkillLevel] = useState<string>('')
  const [industry, setIndustry] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [experience, setExperience] = useState<string>('')
  const [annualIncome, setAnnualIncome] = useState<string>('')
  const [businessCosts, setBusinessCosts] = useState<string>('')
  const [taxRate, setTaxRate] = useState<string>('')
  const [nonBillableHours, setNonBillableHours] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null)
  const [monthlyRate, setMonthlyRate] = useState<number | null>(null)
  const [dailyRate, setDailyRate] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [rateHistory, setRateHistory] = useState<RateHistory[]>([])
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([])

  const industries = [
    "Web Development",
    "Mobile Development",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "Consulting",
    "Photography",
    "Video Production",
    "Other"
  ]

  const locations = {
    "North America": 1.2,
    "Western Europe": 1.1,
    "Asia Pacific": 0.9,
    "Eastern Europe": 0.85,
    "Latin America": 0.8,
    "South Asia": 0.75,
    "Africa": 0.75,
    "Other": 1.0
  }

  useEffect(() => {
    // Load saved calculations from localStorage
    const saved = localStorage.getItem('savedCalculations')
    if (saved) {
      setSavedCalculations(JSON.parse(saved))
    }
  }, [])

  const validateInputs = () => {
    const newErrors: Record<string, string> = {}
    
    if (!skillLevel) newErrors.skillLevel = "Skill level is required"
    if (!industry) newErrors.industry = "Industry is required"
    if (!annualIncome) newErrors.annualIncome = "Desired annual income is required"
    if (parseFloat(annualIncome) < 0) newErrors.annualIncome = "Income cannot be negative"
    if (parseFloat(taxRate) < 0 || parseFloat(taxRate) > 100) newErrors.taxRate = "Tax rate must be between 0 and 100"
    if (parseFloat(nonBillableHours) < 0 || parseFloat(nonBillableHours) > 40) {
      newErrors.nonBillableHours = "Non-billable hours must be between 0 and 40"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    if (!currencies[currencyCode as keyof typeof currencies]) {
      console.error(`Invalid currency code: ${currencyCode}`);
      return amount.toFixed(2); // Fallback without currency symbol
    }
  
    const curr = currencies[currencyCode as keyof typeof currencies];
    return `${curr.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const calculateRate = () => {
    if (!validateInputs()) return

    const desiredIncome = parseFloat(annualIncome) || 0
    const costs = parseFloat(businessCosts) || 0
    const tax = (parseFloat(taxRate) || 0) / 100
    const nonBillable = parseFloat(nonBillableHours) || 0

    // Calculate total required income
    const totalCosts = desiredIncome + costs + (desiredIncome * tax)
    
    // Calculate actual billable hours
    const billableHours = (52 * 40) - (52 * nonBillable)

    // Skill level multiplier
    let skillMultiplier = 1
    switch (skillLevel) {
      case 'expert':
        skillMultiplier = 1.5
        break
      case 'intermediate':
        skillMultiplier = 1.25
        break
      case 'beginner':
        skillMultiplier = 1
        break
    }

    // Experience multiplier
    const experienceYears = parseFloat(experience) || 0
    const experienceMultiplier = 1 + (Math.min(experienceYears, 10) * 0.03)

    // Location multiplier
    const locationMultiplier = locations[location as keyof typeof locations] || 1.0

    const hourlyRate = (totalCosts / billableHours) * skillMultiplier * experienceMultiplier * locationMultiplier
    const monthly = hourlyRate * (160 - (nonBillable * 4)) // Adjusted for non-billable hours per month
    const daily = hourlyRate * 8

    setCalculatedRate(Math.round(hourlyRate * 100) / 100)
    setMonthlyRate(Math.round(monthly * 100) / 100)
    setDailyRate(Math.round(daily * 100) / 100)

    // Update rate history
    const newHistory = [...rateHistory, {
      date: new Date().toLocaleDateString(),
      rate: Math.round(hourlyRate * 100) / 100,
      currency
    }].slice(-10) // Keep only last 10 calculations
    setRateHistory(newHistory)
  }

  const saveCalculation = () => {
    if (calculatedRate === null) return

    const newCalculation: SavedCalculation = {
      inputs: {
        skillLevel,
        industry,
        location,
        experience,
        annualIncome,
        businessCosts,
        taxRate,
        nonBillableHours,
        currency
      },
      results: {
        hourly: calculatedRate,
        daily: dailyRate!,
        monthly: monthlyRate!,
        currency
      },
      date: new Date().toISOString()
    }

    const updatedCalculations = [...savedCalculations, newCalculation]
    setSavedCalculations(updatedCalculations)
    localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations))
  }

  const loadCalculation = (calc: SavedCalculation) => {
    setSkillLevel(calc.inputs.skillLevel)
    setIndustry(calc.inputs.industry)
    setLocation(calc.inputs.location)
    setExperience(calc.inputs.experience)
    setAnnualIncome(calc.inputs.annualIncome)
    setBusinessCosts(calc.inputs.businessCosts)
    setTaxRate(calc.inputs.taxRate)
    setNonBillableHours(calc.inputs.nonBillableHours)
    setCurrency(calc.inputs.currency)
    setCalculatedRate(calc.results.hourly)
    setDailyRate(calc.results.daily)
    setMonthlyRate(calc.results.monthly)
  }

  const resetForm = () => {
    setSkillLevel('')
    setIndustry('')
    setLocation('')
    setExperience('')
    setAnnualIncome('')
    setBusinessCosts('')
    setTaxRate('')
    setNonBillableHours('')
    setCurrency('USD')
    setCalculatedRate(null)
    setMonthlyRate(null)
    setDailyRate(null)
    setErrors({})
  }

  const exportToCSV = () => {
    if (savedCalculations.length === 0) return

    const headers = ['Date', 'Hourly Rate', 'Daily Rate', 'Monthly Rate', 'Currency', 'Skill Level', 'Industry', 'Location']
    const csvContent = [
      headers.join(','),
      ...savedCalculations.map(calc => 
        [
          new Date(calc.date).toLocaleDateString(),
          calc.results.hourly,
          calc.results.daily,
          calc.results.monthly,
          calc.results.currency,
          calc.inputs.skillLevel,
          calc.inputs.industry,
          calc.inputs.location
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'rate_calculations.csv'
    link.click()
  }

  const renderRateHistory = () => {
    if (rateHistory.length === 0) return null

    return (
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer>
          <LineChart data={rateHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value, name) => [`${formatCurrency(Number(value), currency)}`, 'Rate']} />
            <Line type="monotone" dataKey="rate" stroke="#2563eb" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    )
  }

  const renderRateCard = () => {
    if (calculatedRate === null) return null
    
    return (
      <div className="space-y-4 bg-secondary/10 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Hourly Rate</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(calculatedRate, currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Daily Rate</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(dailyRate!, currency)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Monthly Rate</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(monthlyRate!, currency)}</p>
          </div>
        </div>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These rates include your tax obligations and business costs while accounting for non-billable hours.
            Rates shown in {currencies[currency as keyof typeof currencies].name}.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const deleteCalculation = (index : number) => {
    const updatedCalculations = savedCalculations.filter((_, i) => i !== index)
    setSavedCalculations(updatedCalculations)
    localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations))
  }



  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          International Rate Calculator
        </CardTitle>
        <CardDescription>Calculate your ideal freelance rate in your local currency based on your skills, experience, and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencies).map(([code, { name, symbol }]) => (
                  <SelectItem key={code} value={code}>
                    {symbol} - {code} ({name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillLevel">Skill Level {errors.skillLevel && <span className="text-destructive text-sm">*</span>}</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger id="skillLevel" className={errors.skillLevel ? "border-destructive" : ""}>
                <SelectValue placeholder="Select Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
            {errors.skillLevel && <p className="text-destructive text-sm">{errors.skillLevel}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Industry {errors.industry && <span className="text-destructive text-sm">*</span>}</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry" className={errors.industry ? "border-destructive" : ""}>
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
              {industries.map((ind) => (
                  <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.industry && <p className="text-destructive text-sm">{errors.industry}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger id="location">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(locations).map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input 
              id="experience" 
              type="number" 
              min="0"
              max="50"
              value={experience} 
              onChange={(e) => setExperience(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="annualIncome">
              Desired Annual Income {errors.annualIncome && <span className="text-destructive text-sm">*</span>}
            </Label>
            <div className="relative">
              <Input 
                id="annualIncome" 
                type="number" 
                min="0"
                value={annualIncome} 
                onChange={(e) => setAnnualIncome(e.target.value)}
                className={`pl-8 ${errors.annualIncome ? "border-destructive" : ""}`}
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencies[currency as keyof typeof currencies].symbol}
              </span>
            </div>
            {errors.annualIncome && <p className="text-destructive text-sm">{errors.annualIncome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessCosts">Annual Business Costs</Label>
            <div className="relative">
              <Input 
                id="businessCosts" 
                type="number" 
                min="0"
                value={businessCosts} 
                onChange={(e) => setBusinessCosts(e.target.value)} 
                className="pl-8"
              />
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currencies[currency as keyof typeof currencies].symbol}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">
              Tax Rate (%) {errors.taxRate && <span className="text-destructive text-sm">*</span>}
            </Label>
            <Input 
              id="taxRate" 
              type="number" 
              min="0"
              max="100"
              value={taxRate} 
              onChange={(e) => setTaxRate(e.target.value)}
              className={errors.taxRate ? "border-destructive" : ""}
            />
            {errors.taxRate && <p className="text-destructive text-sm">{errors.taxRate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nonBillableHours">
              Non-Billable Hours per Week {errors.nonBillableHours && <span className="text-destructive text-sm">*</span>}
            </Label>
            <Input 
              id="nonBillableHours" 
              type="number" 
              min="0"
              max="40"
              value={nonBillableHours} 
              onChange={(e) => setNonBillableHours(e.target.value)}
              className={errors.nonBillableHours ? "border-destructive" : ""}
            />
            {errors.nonBillableHours && <p className="text-destructive text-sm">{errors.nonBillableHours}</p>}
          </div>
        </div>

        {/* Saved Calculations Section */}
        {savedCalculations.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Saved Calculations</h3>
            <div className="space-y-2">
              {savedCalculations.map((calc, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary/5 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(calc.date).toLocaleDateString()} - 
                      {formatCurrency(calc.results.hourly, calc.results.currency)}/hr
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {calc.inputs.industry} ({calc.inputs.skillLevel}) - {calc.results.currency}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadCalculation(calc)}
                  >
                    Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCalculation(index)}
                    className="hover:bg-red-100 hover:text-red-600"
                  >
                     <Trash2 className="w-4 h-4" />
                  </Button>

                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <div className="flex gap-2 w-full">
          <Button 
            onClick={calculateRate} 
            className="flex-1"
            size="lg"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculate Rate
          </Button>
          
          <Button
            onClick={saveCalculation}
            variant="outline"
            disabled={calculatedRate === null}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          <Button
            onClick={exportToCSV}
            variant="outline"
            disabled={savedCalculations.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button
            onClick={resetForm}
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        {renderRateCard()}
        {renderRateHistory()}

        {/* Market Rate Comparison */}
        {calculatedRate && (
          <div className="w-full p-4 bg-secondary/5 rounded-lg mt-4">
            <h3 className="text-lg font-semibold mb-2">Market Rate Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Industry Average</p>
                <p className="text-xl font-bold">
                  {formatCurrency(calculatedRate * 0.8, currency)} - {formatCurrency(calculatedRate * 1.2, currency)}
                </p>
                <p className="text-xs text-muted-foreground">per hour</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Your Position</p>
                <p className="text-xl font-bold text-green-600">
                  {calculatedRate > (calculatedRate * 0.8) ? 'Above Average' : 'Competitive'}
                </p>
                <p className="text-xs text-muted-foreground">market position</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <p className="text-sm text-muted-foreground">Potential Annual</p>
                <p className="text-xl font-bold">
                  {formatCurrency(calculatedRate * (40 - parseFloat(nonBillableHours)) * 52, currency)}
                </p>
                <p className="text-xs text-muted-foreground">maximum earnings</p>
              </div>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}