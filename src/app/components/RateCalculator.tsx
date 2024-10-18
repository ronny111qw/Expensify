"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function RateCalculator() {
  const [skillLevel, setSkillLevel] = useState<string>('')
  const [industry, setIndustry] = useState<string>('')
  const [location, setLocation] = useState<string>('')
  const [experience, setExperience] = useState<string>('')
  const [annualIncome, setAnnualIncome] = useState<string>('')
  const [businessCosts, setBusinessCosts] = useState<string>('')
  const [taxRate, setTaxRate] = useState<string>('')
  const [nonBillableHours, setNonBillableHours] = useState<string>('')
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null)

  const calculateRate = () => {
    const desiredIncome = parseFloat(annualIncome) || 0
    const costs = parseFloat(businessCosts) || 0
    const tax = (parseFloat(taxRate) || 0) / 100
    const nonBillable = parseFloat(nonBillableHours) || 0

    const totalCosts = desiredIncome + costs + (desiredIncome * tax)
    const billableHours = (52 * 40) - (52 * nonBillable)

    const hourlyRate = totalCosts / billableHours
    setCalculatedRate(Math.round(hourlyRate * 100) / 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Calculator</CardTitle>
        <CardDescription>Calculate your ideal freelance rate based on your skills and expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="skillLevel">Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger id="skillLevel">
                <SelectValue placeholder="Select Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g., Web Development" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., New York, USA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Years of Experience</Label>
            <Input id="experience" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualIncome">Desired Annual Income ($)</Label>
            <Input id="annualIncome" type="number" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessCosts">Annual Business Costs ($)</Label>
            <Input id="businessCosts" type="number" value={businessCosts} onChange={(e) => setBusinessCosts(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input id="taxRate" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nonBillableHours">Non-Billable Hours per Week</Label>
            <Input id="nonBillableHours" type="number" value={nonBillableHours} onChange={(e) => setNonBillableHours(e.target.value)} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={calculateRate}>Calculate Rate</Button>
        {calculatedRate !== null && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Suggested Hourly Rate:</p>
            <p className="text-2xl font-bold text-primary">${calculatedRate}/hour</p>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}