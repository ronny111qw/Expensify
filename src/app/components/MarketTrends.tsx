"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart,} from 'recharts'
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
  [key: string]: string | number
}

interface MarketRateResponse {
  rates: {
    [key: string]: number
  }
  trends: string[]
  insights: string[]
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

const getApiKey = () => process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Initialize genAI inside the component to ensure it's using the latest API key
let genAI: GoogleGenerativeAI;

const RATE_LIMITS = {
  min: 20,
  max: 250,
  defaults: {
    webDev: 75,
    mobileDev: 85,
    dataScience: 95,
    uiDesign: 70,
    devOps: 90
  }
};

const normalizeRate = (rate: number): number => {
  if (rate > RATE_LIMITS.max) {
    rate = rate / 2080;
  }
  rate = Math.min(Math.max(rate, RATE_LIMITS.min), RATE_LIMITS.max);
  return Math.round(rate);
};

const extractJSONFromText = (text: string): MarketRateResponse => {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
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

const generateLocationSpecificInsights = (location: string): string[] => {
  switch (location.toLowerCase()) {
    case 'north-america':
      return [
        "Strong demand for cloud-native development skills",
        "Cybersecurity expertise commanding premium rates",
        "Growing market for AI/ML specialists"
      ];
    case 'europe':
      return [
        "Increasing rates for GDPR-compliant development",
        "High demand for multilingual development teams",
        "Growing blockchain development market"
      ];
    case 'asia':
      return [
        "Rising demand for mobile payment integration expertise",
        "Growing market for cross-border e-commerce solutions",
        "Increasing rates for cloud migration specialists"
      ];
    default:
      return [
        "Remote work driving global rate standardization",
        "Increasing demand for full-stack development skills",
        "Growing emphasis on cross-cultural collaboration"
      ];
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

  const generateHistoricalData = useCallback((currentRates: { [key: string]: number }): TrendData[] => {
    const months = selectedTimeframe === '12m' ? 12 : 6
    const data: TrendData[] = []
    
    for (let i = 0; i < months; i++) {
      const month = new Date()
      month.setMonth(month.getMonth() - (months - i - 1))
      
      const monthData: TrendData = {
        month: month.toLocaleString('default', { month: 'short' }),
        webDev: 0,
        mobileDev: 0,
        dataScience: 0,
        uiDesign: 0,
        devOps: 0
      }
      
      Object.entries(currentRates).forEach(([key, currentRate]) => {
        const volatility = 0.05
        const trend = 0.02
        const randomChange = (Math.random() - 0.5) * 2 * volatility
        const trendChange = trend * i
        
        monthData[key] = Math.round(currentRate * (0.9 + randomChange + trendChange))
      })
      
      data.push(monthData)
    }
    
    return data
  }, [selectedTimeframe])

  useEffect(() => {
    genAI = new GoogleGenerativeAI(getApiKey());
  }, []);

  const fetchMarketRates = useCallback(async (location: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if the API key is available
      if (!getApiKey()) {
        throw new Error('API key is not available');
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Provide realistic hourly rates (not annual salaries) for different tech roles in ${location}.
        Also include relevant market insights specific to ${location}.
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
      const historicalData = generateHistoricalData(data.rates);
      setTrends(historicalData);
      
      const locationInsights = generateLocationSpecificInsights(location);
      const combinedInsights = [...(data.insights || []), ...locationInsights]
        .filter((insight, index, self) => self.indexOf(insight) === index)
        .slice(0, 5);
      
      setMarketInsights(combinedInsights);
      
    } catch (err) {
      console.error('Error fetching market rates:', err);
      setError('Failed to fetch market rates. Using fallback data.');
      const fallbackData = generateHistoricalData(RATE_LIMITS.defaults);
      setTrends(fallbackData);
      
      const fallbackInsights = generateLocationSpecificInsights(location);
      setMarketInsights(fallbackInsights);
    } finally {
      setLoading(false);
    }
  }, [generateHistoricalData])


  useEffect(() => {
    fetchMarketRates(selectedLocation)
  }, [selectedLocation, selectedTimeframe, fetchMarketRates])

  const chartColors: Record<string, string> = {
    webDev: "#8884d8",
    mobileDev: "#82ca9d",
    dataScience: "#ffc658",
    uiDesign: "#ff7c43",
    devOps: "#52b6ca"
  }

  const formatCurrency = (value: number) => {
    return `$${value}/hr`
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg">
          <p className="font-bold mb-2">{label}</p>
          {payload.map((entry) => (
            <p key={entry.name} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const calculateAverages = () => {
    if (trends.length === 0) return null

    const latest = trends[trends.length - 1]
    const first = trends[0]
    
    const categories = Object.keys(chartColors)
    return categories.map(category => {
      const currentRate = latest[category] as number
      const initialRate = first[category] as number
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
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
              Market Trends
              {loading && <LoaderIcon className="h-4 w-4 animate-spin" />}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Real-time freelance market rates powered by AI
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full sm:w-[140px]">
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
              <SelectTrigger className="w-full sm:w-[140px]">
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
          <TabsList className="flex flex-wrap justify-start gap-2">
            <TabsTrigger value="chart" className="flex-grow sm:flex-grow-0">Chart</TabsTrigger>
            <TabsTrigger value="summary" className="flex-grow sm:flex-grow-0">Summary</TabsTrigger>
            <TabsTrigger value="insights" className="flex-grow sm:flex-grow-0">Market Insights</TabsTrigger>
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
            <div className="h-[300px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {selectedChart === 'line' ? (
                  <LineChart data={trends}>
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
                    {Object.entries(chartColors).map(([key, color]) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        name={key.split(/(?=[A-Z])/).join(' ')}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                ) : (
                  <AreaChart data={trends}>
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
                    {Object.entries(chartColors).map(([key, color]) => (
                      <Area
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        fill={`${color}40`}
                        name={key.split(/(?=[A-Z])/).join(' ')}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {calculateAverages()?.map(({ category, rate, change }) => (
                <Card key={category}>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {category.split(/(?=[A-Z])/).join(' ')}
                    </CardTitle>
                    <CardDescription className="text-sm">
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
                  {marketInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2 bg-secondary/5 p-3 rounded-lg">
                      <div className="h-2 w-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                      <p className="text-sm sm:text-base">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-xs sm:text-sm text-muted-foreground">
          <p>
            * Rates are based on real-time market analysis powered by AI and may vary based on factors 
            such as experience, skills, and specific project requirements.
          </p>
          
        </div>
      </CardContent>
    </Card>
  )
}