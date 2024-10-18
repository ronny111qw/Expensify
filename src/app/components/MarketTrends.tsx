"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface TrendData {
  month: string
  webDev: number
  mobileDev: number
  dataScience: number
}

export default function MarketTrends() {
  const [trends, setTrends] = useState<TrendData[]>([])

  useEffect(() => {
    const mockTrends: TrendData[] = [
      { month: 'Jan', webDev: 75, mobileDev: 80, dataScience: 90 },
      { month: 'Feb', webDev: 78, mobileDev: 82, dataScience: 92 },
      { month: 'Mar', webDev: 80, mobileDev: 85, dataScience: 95 },
      { month: 'Apr', webDev: 82, mobileDev: 88, dataScience: 98 },
      { month: 'May', webDev: 85, mobileDev: 90, dataScience: 100 },
      { month: 'Jun', webDev: 88, mobileDev: 92, dataScience: 105 },
    ]
    setTrends(mockTrends)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Trends</CardTitle>
        <CardDescription>Average hourly rates for different freelance categories over the past 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="webDev" stroke="#8884d8" name="Web Development" />
            <Line type="monotone" dataKey="mobileDev" stroke="#82ca9d" name="Mobile Development" />
            <Line type="monotone" dataKey="dataScience" stroke="#ffc658" name="Data Science" />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-4 text-sm text-muted-foreground">
          Use this information to ensure your rates are competitive in the current market.
        </p>
      </CardContent>
    </Card>
  )
}