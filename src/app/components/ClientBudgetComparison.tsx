"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function ClientBudgetComparison() {
  const [clientBudget, setClientBudget] = useState<string>('')
  const [projectHours, setProjectHours] = useState<string>('')
  const [comparison, setComparison] = useState<string | null>(null)

  const compareBudget = () => {
    const budget = parseFloat(clientBudget)
    const hours = parseFloat(projectHours)
    if (!isNaN(budget) && !isNaN(hours) && hours > 0) {
      const hourlyRate = budget / hours
      if (hourlyRate < 50) {
        setComparison(`The client's budget of $${budget} for ${hours} hours results in an hourly rate of $${hourlyRate.toFixed(2)}. This is below average market rates.`)
      } else if (hourlyRate >= 50 && hourlyRate < 100) {
        setComparison(`The client's budget of $${budget} for ${hours} hours results in an hourly rate of $${hourlyRate.toFixed(2)}. This is within average market rates.`)
      } else {
        setComparison(`The client's budget of $${budget} for ${hours} hours results in an hourly rate of $${hourlyRate.toFixed(2)}. This is above average market rates.`)
      }
    } else {
      setComparison('Please enter valid numbers for budget and project hours.')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Budget Comparison</CardTitle>
        <CardDescription>Compare client's budget with market rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientBudget">Client's Budget ($)</Label>
            <Input
              id="clientBudget"
              type="number"
              value={clientBudget}
              onChange={(e) => setClientBudget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectHours">Estimated Project Hours</Label>
            <Input
              id="projectHours"
              type="number"
              value={projectHours}
              onChange={(e) => setProjectHours(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <Button onClick={compareBudget}>Compare Budget</Button>
        {comparison && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Budget Comparison</AlertTitle>
            <AlertDescription>{comparison}</AlertDescription>
          </Alert>
        )}
      </CardFooter>
    </Card>
  )
}