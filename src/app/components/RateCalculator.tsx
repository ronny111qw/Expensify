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
    selectedSkills: string[];
  };
  results: {
    hourly: number;
    daily: number;
    monthly: number;
    currency: string;
  };
  date: string;
}

// Industry-specific data with base rates and multipliers
const industryData = {
  "web_development": {
    baseRate: 75,
    multiplier: 1.2,
    description: "Web development rates typically higher due to technical complexity",
    skills: ["Frontend", "Backend", "Full Stack", "DevOps", "CMS"]
  },
  "mobile_development": {
    baseRate: 85,
    multiplier: 1.3,
    description: "Mobile development commands premium rates due to platform expertise",
    skills: ["iOS", "Android", "Cross-Platform", "Native", "Hybrid"]
  },
  "ui_ux_design": {
    baseRate: 65,
    multiplier: 1.1,
    description: "UI/UX design rates reflect creative and technical skills",
    skills: ["UI Design", "UX Research", "Prototyping", "Design Systems", "User Testing"]
  },
  "graphic_design": {
    baseRate: 55,
    multiplier: 1.0,
    description: "Graphic design rates vary based on complexity and experience",
    skills: ["Brand Design", "Print", "Digital", "Motion Graphics", "Illustration"]
  },
  "content_writing": {
    baseRate: 45,
    multiplier: 0.9,
    description: "Content writing rates depend on expertise and research depth",
    skills: ["Technical Writing", "Creative Writing", "Copywriting", "SEO Writing", "Editing"]
  },
  "digital_marketing": {
    baseRate: 65,
    multiplier: 1.1,
    description: "Digital marketing rates reflect ROI potential",
    skills: ["SEO", "PPC", "Social Media", "Email Marketing", "Analytics"]
  },
  "consulting": {
    baseRate: 150,
    multiplier: 1.5,
    description: "Consulting commands premium rates due to expertise value",
    skills: ["Strategy", "Technical", "Business", "Financial", "Operations"]
  },
  "photography": {
    baseRate: 75,
    multiplier: 1.0,
    description: "Photography rates vary by specialization and equipment",
    skills: ["Portrait", "Commercial", "Event", "Product", "Aerial"]
  },
  "video_production": {
    baseRate: 85,
    multiplier: 1.2,
    description: "Video production rates reflect equipment and expertise",
    skills: ["Filming", "Editing", "Animation", "Color Grading", "Sound Design"]
  },
  "other": {
    baseRate: 60,
    multiplier: 1.0,
    description: "General freelance services",
    skills: ["Project Management", "Virtual Assistance", "Customer Service", "Data Entry", "Research"]
  }
}

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
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [industryInfo, setIndustryInfo] = useState<{
    baseRate: number;
    multiplier: number;
    description: string;
    skills: string[];
  } | null>(null)

  useEffect(() => {
    // Load saved calculations from localStorage
    const saved = localStorage.getItem('savedCalculations')
    if (saved) {
      setSavedCalculations(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (industry) {
      const info = industryData[industry as keyof typeof industryData]
      setIndustryInfo(info)
      setSelectedSkills([])
    }
  }, [industry])

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
      return amount.toFixed(2);
    }
  
    const curr = currencies[currencyCode as keyof typeof currencies];
    return `${curr.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  const calculateRate = () => {
    if (!validateInputs()) return

    const desiredIncome = parseFloat(annualIncome) || 0
    const costs = parseFloat(businessCosts) || 0
    const tax = (parseFloat(taxRate) || 0) / 100
    const nonBillable = parseFloat(nonBillableHours) || 0

    // Get industry-specific multiplier
    const industryMultiplier = industryData[industry as keyof typeof industryData]?.multiplier || 1.0

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

    // Selected skills bonus (each additional skill adds 5% to the rate)
    const skillsBonus = 1 + (selectedSkills.length * 0.05)

    const hourlyRate = (totalCosts / billableHours) * 
                      skillMultiplier * 
                      experienceMultiplier * 
                      locationMultiplier * 
                      industryMultiplier *
                      skillsBonus

    const monthly = hourlyRate * (160 - (nonBillable * 4))
    const daily = hourlyRate * 8

    setCalculatedRate(Math.round(hourlyRate * 100) / 100)
    setMonthlyRate(Math.round(monthly * 100) / 100)
    setDailyRate(Math.round(daily * 100) / 100)

    const newHistory = [...rateHistory, {
      date: new Date().toLocaleDateString(),
      rate: Math.round(hourlyRate * 100) / 100,
      currency
    }].slice(-10)
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
        currency,
        selectedSkills
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
    setSelectedSkills(calc.inputs.selectedSkills)
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
    setSelectedSkills([])
    setCalculatedRate(null)
    setMonthlyRate(null)
    setDailyRate(null)
    setErrors({})
  }

  const deleteCalculation = (index: number) => {
    const updatedCalculations = savedCalculations.filter((_, i) => i !== index)
    setSavedCalculations(updatedCalculations)
    localStorage.setItem('savedCalculations', JSON.stringify(updatedCalculations))
  }

  const exportToCSV = () => {
    if (savedCalculations.length === 0) return

    const headers = ['Date', 'Hourly Rate', 'Daily Rate', 'Monthly Rate', 'Currency', 'Skill Level', 'Industry', 'Location', 'Selected Skills']
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
          calc.inputs.location,
          calc.inputs.selectedSkills.join(';')
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'rate_calculations.csv'
    link.click()
  }

  const renderIndustrySection = () => {
    if (!industryInfo) return null;

    return (
      <div className="col-span-2 mt-4 p-4 bg-secondary/5 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Industry Information</h3>
        <p className="text-sm text-muted-foreground mb-2">{industryInfo.description}</p>
        <div className="space-y-2">
          <p className="text-sm font-medium">Base Rate: {formatCurrency(industryInfo.baseRate, currency)}</p>
          <div>
            <Label className="text-sm font-medium">Select Relevant Skills:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {industryInfo.skills.map((skill) => (
                <Button
                  key={skill}
                  variant={selectedSkills.includes(skill) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedSkills(prev =>
                      prev.includes(skill)
                        ? prev.filter(s => s !== skill)
                        : [...prev, skill]
                    )
                  }}
                >
                  {skill}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Freelance Rate Calculator</CardTitle>
          <CardDescription>Calculate your optimal freelance rates based on industry standards and personal factors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger id="skillLevel">
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
              {errors.skillLevel && (
                <span className="text-sm text-red-500">{errors.skillLevel}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={(value) => {
                setIndustry(value);
                // Update selectedSkills when industry changes
                const industryInfo = industryData[value as keyof typeof industryData];
                if (industryInfo) {
                  setSelectedSkills([industryInfo.skills[0]]); // Set first skill as default
                }
              }}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(industryData).map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <span className="text-sm text-red-500">{errors.industry}</span>
              )}
            </div>

            

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
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
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Enter years of experience"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(currencies).map(([code, { name }]) => (
                    <SelectItem key={code} value={code}>{code} - {name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualIncome">Desired Annual Income</Label>
              <Input
                id="annualIncome"
                type="number"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value)}
                placeholder="Enter desired annual income"
              />
              {errors.annualIncome && (
                <span className="text-sm text-red-500">{errors.annualIncome}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessCosts">Annual Business Costs</Label>
              <Input
                id="businessCosts"
                type="number"
                value={businessCosts}
                onChange={(e) => setBusinessCosts(e.target.value)}
                placeholder="Enter annual business costs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="Enter tax rate percentage"
              />
              {errors.taxRate && (
                <span className="text-sm text-red-500">{errors.taxRate}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nonBillableHours">Non-Billable Hours per Week</Label>
              <Input
                id="nonBillableHours"
                type="number"
                value={nonBillableHours}
                onChange={(e) => setNonBillableHours(e.target.value)}
                placeholder="Enter non-billable hours"
              />
              {errors.nonBillableHours && (
                <span className="text-sm text-red-500">{errors.nonBillableHours}</span>
              )}
            </div>
          </div>

       
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-end">
            <Button variant="outline" onClick={resetForm} className="w-full sm:w-auto">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={calculateRate} className="w-full sm:w-auto">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Rate
            </Button>
          </div>

          {calculatedRate !== null && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Calculated Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-primary/5 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(calculatedRate, currency)}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Daily Rate (8 hours)</p>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(dailyRate!, currency)}</p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Monthly Rate</p>
                    <p className="text-xl sm:text-2xl font-bold">{formatCurrency(monthlyRate!, currency)}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Rate History</h3>
                  <div className="h-[200px] sm:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rateHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="rate" stroke="#2563eb" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4">
                  <Button onClick={saveCalculation} className="w-full sm:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Save Calculation
                  </Button>
                  {savedCalculations.length > 0 && (
                    <Button variant="outline" onClick={exportToCSV} className="w-full sm:w-auto">
                      <Download className="w-4 h-4 mr-2" />
                      Export to CSV
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {savedCalculations.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Saved Calculations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedCalculations.map((calc, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="w-full">
                          <h4 className="font-semibold">
                            {calc.inputs.industry.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(calc.date).toLocaleDateString()}
                          </p>
                          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-4">
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Hourly</p>
                              <p className="text-sm sm:text-base font-medium">
                                {formatCurrency(calc.results.hourly, calc.results.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Daily</p>
                              <p className="text-sm sm:text-base font-medium">
                                {formatCurrency(calc.results.daily, calc.results.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-muted-foreground">Monthly</p>
                              <p className="text-sm sm:text-base font-medium">
                                {formatCurrency(calc.results.monthly, calc.results.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              Skills: {calc.inputs.selectedSkills.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadCalculation(calc)}
                          >
                            <Info className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteCalculation(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Alert className="bg-secondary/10">
            <AlertDescription className="text-xs sm:text-sm text-muted-foreground">
              <Info className="w-4 h-4 inline-block mr-2" />
              Rates are calculated based on industry standards, location, experience, and your specific requirements.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  )
}