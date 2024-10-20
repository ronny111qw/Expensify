"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from 'lucide-react'

export default function RateOptimizationTips() {
  const tips: string[] = [
    "Build a strong portfolio showcasing your best work",
    "Gain relevant certifications in your field",
    "Specialize in high-demand niches",
    "Improve your soft skills, especially communication",
    "Network and build relationships with potential clients",
    "Offer value-added services to justify higher rates",
    "Stay updated with the latest industry trends and technologies",
    "Gather and showcase client testimonials and case studies",
    "Develop a personal brand to stand out in the market",
    "Continuously track and analyze your performance metrics"
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Optimization Tips</CardTitle>
        <CardDescription>Strategies to increase your freelance rates</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {tips.map((tip, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" size={20} />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <Card className="mt-6 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Pro Tip</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Regularly reassess your rates based on your growing experience and the value you provide.
              Don&apos;t be afraid to incrementally increase your rates for new clients as your skills improve.
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}