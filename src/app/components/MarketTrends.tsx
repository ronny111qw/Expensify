"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, DollarSign, Calendar, Map, LoaderIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleGenerativeAI } from "@google/generative-ai"

interface TrendData {
  month: string
  webDev: number
  mobileDev: number
  dataScience: number
  uiDesign: number
  devOps: number
}

interface MarketRateResponse {
  rates: {
    [key: string]: number
  }
  trends: string[]
  insights: string[]
}

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')


const RATE_LIMITS = {
  min: 20,   // Minimum realistic hourly rate
  max: 250,  // Maximum realistic hourly rate
  defaults: {
    webDev: 75,
    mobileDev: 85,
    dataScience: 95,
    uiDesign: 70,
    devOps: 90
  }
};

const normalizeRate = (rate: number): number => {
  // If rate is unrealistically high (likely in thousands/year), convert to hourly
  if (rate > RATE_LIMITS.max) {
    // Assume it's yearly salary, convert to hourly
    // Based on 2080 working hours per year (40 hours * 52 weeks)
    rate = rate / 2080;
  }
  
  // Ensure rate is within realistic bounds
  rate = Math.min(Math.max(rate, RATE_LIMITS.min), RATE_LIMITS.max);
  
  // Round to nearest dollar
  return Math.round(rate);
};

const extractJSONFromText = (text: string): MarketRateResponse => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Normalize all rates
      const normalizedRates = Object.entries(parsed.rates).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: normalizeRate(Number(value))
      }), {} as Record<string, number>);

      return {
        ...parsed,
        rates: normalizedRates
      };
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {
      rates: RATE_LIMITS.defaults,
      trends: [
        "Increasing demand for full-stack developers",
        "Growing emphasis on AI/ML skills",
        "Remote work continuing to influence rates"
      ],
      insights: [
        "High demand for experienced DevOps engineers",
        "UI/UX skills becoming more valuable",
        "Data Science rates showing steady growth"
      ]
    };
  }
};


export default function MarketTrends() {
  const [trends, setTrends] = useState<TrendData[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m')
  const [selectedLocation, setSelectedLocation] = useState('global')
  const [selectedChart, setSelectedChart] = useState('line')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [marketInsights, setMarketInsights] = useState<string[]>([])
  
  const fetchMarketRates = async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Provide realistic hourly rates (not annual salaries) for different tech roles in ${location}.
        Rates should be in USD per hour, typically ranging from $20 to $250 per hour.
        Include only the following JSON data without any additional text or formatting:
        {
          "rates": {
            "webDev": <hourly_rate>,
            "mobileDev": <hourly_rate>,
            "dataScience": <hourly_rate>,
            "uiDesign": <hourly_rate>,
            "devOps": <hourly_rate>
          },
          "trends": [
            "<trend1>",
            "<trend2>",
            "<trend3>"
          ],
          "insights": [
            "<insight1>",
            "<insight2>",
            "<insight3>"
          ]
        }
      `.trim();

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const data = extractJSONFromText(text);
      
      // Log normalized rates for debugging
      console.log('Normalized rates:', data.rates);
      
      const historicalData = generateHistoricalData(data.rates);
      setTrends(historicalData);
      setMarketInsights(data.insights);
      
    } catch (err) {
      console.error('Error fetching market rates:', err);
      setError('Failed to fetch market rates. Using fallback data.');
      const fallbackData = generateFallbackData();
      setTrends(fallbackData);
      setMarketInsights([
        "High demand for experienced DevOps engineers",
        "UI/UX skills becoming more valuable",
        "Data Science rates showing steady growth"
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add rate validation info to the UI
  const renderRateValidationInfo = () => (
    <div className="mt-2 text-sm text-muted-foreground">
      <p>
        * Hourly rates are normalized to ensure realistic values between ${RATE_LIMITS.min} and ${RATE_LIMITS.max}.
      </p>
    </div>
  );

  const generateHistoricalData = (currentRates: { [key: string]: number }) => {
    const months = selectedTimeframe === '12m' ? 12 : 6
    const data: TrendData[] = []
    
    for (let i = 0; i < months; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() - (months - i - 1))
      
      const monthData: any = {
        month: month.toLocaleString('default', { month: 'short' }),
      }
      
      // Generate historical rates with some variation
      Object.entries(currentRates).forEach(([key, currentRate]) => {
        const volatility = 0.05 // 5% maximum change
        const trend = 0.02 // 2% upward trend per month
        const randomChange = (Math.random() - 0.5) * 2 * volatility
        const trendChange = trend * i
        
        monthData[key] = Math.round(currentRate * (0.9 + randomChange + trendChange))
      })
      
      data.push(monthData as TrendData)
    }
    
    return data
  }

  const generateFallbackData = () => {
    const baseRates = {
      webDev: 75,
      mobileDev: 80,
      dataScience: 90,
      uiDesign: 70,
      devOps: 95
    }
    return generateHistoricalData(baseRates)
  }

  useEffect(() => {
    fetchMarketRates(selectedLocation)
  }, [selectedLocation, selectedTimeframe])

  const chartColors = {
    webDev: "#8884d8",
    mobileDev: "#82ca9d",
    dataScience: "#ffc658",
    uiDesign: "#ff7c43",
    devOps: "#52b6ca"
  }

  const formatCurrency = (value: number) => {
    return `$${value}/hr`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const ChartComponent = selectedChart === 'line' ? LineChart : AreaChart
    
    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={trends}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            tick={{ fill: 'currentColor' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Object.entries(chartColors).map(([key, color]) => {
            const Component = selectedChart === 'line' ? Line : Area
            return (
              <Component
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                fill={selectedChart === 'area' ? `${color}40` : undefined}
                name={key.split(/(?=[A-Z])/).join(' ')}
              />
            )
          })}
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  const calculateAverages = () => {
    if (trends.length === 0) return null

    const latest = trends[trends.length - 1]
    const first = trends[0]
    
    const categories = Object.keys(chartColors)
    return categories.map(category => {
      const currentRate = latest[category as keyof TrendData]
      const initialRate = first[category as keyof TrendData]
      const change = ((currentRate - initialRate) / initialRate) * 100
      
      return {
        category,
        rate: currentRate,
        change: change.toFixed(1)
      }
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Market Trends
              {loading && <LoaderIcon className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription>
              Real-time freelance market rates powered by Gemini AI
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[140px]">
                <Map className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="north-america">North America</SelectItem>
                <SelectItem value="europe">Europe</SelectItem>
                <SelectItem value="asia">Asia</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="12m">12 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="insights">Market Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chart" className="space-y-4">
            <div className="flex justify-end space-x-2">
              <Button
                variant={selectedChart === 'line' ? 'default' : 'outline'}
                onClick={() => setSelectedChart('line')}
                size="sm"
              >
                Line
              </Button>
              <Button
                variant={selectedChart === 'area' ? 'default' : 'outline'}
                onClick={() => setSelectedChart('area')}
                size="sm"
              >
                Area
              </Button>
            </div>
            {renderChart()}
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {calculateAverages()?.map(({ category, rate, change }) => (
                <Card key={category}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {category.split(/(?=[A-Z])/).join(' ')}
                    </CardTitle>
                    <CardDescription>
                      Current Rate: {formatCurrency(rate)}
                      <span className={`ml-2 ${parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({change}%)
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
            <CardContent className="pt-6">
  <div className="space-y-4">
    {Array.isArray(marketInsights) && marketInsights.length > 0 ? (
      marketInsights.map((insight, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
          <p>{insight}</p>
        </div>
      ))
    ) : (
      <p>No insights available.</p> // Fallback message or loading indicator
    )}
  </div>
</CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-sm text-muted-foreground">
          <p>
            * Rates are based on real-time market analysis powered by Gemini AI and may vary based on factors 
            such as experience, skills, and specific project requirements.
          </p>
          {renderRateValidationInfo()}
        </div>
      </CardContent>
    </Card>
  )
}