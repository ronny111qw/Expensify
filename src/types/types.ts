// src/types/types.ts

export interface RateInputs {
    skillLevel: string
    industry: string
    location: string
    experience: string
    annualIncome: string
    businessCosts: string
    taxRate: string
    nonBillableHours: string
  }
  
  export interface Transaction {
    id: string
    type: 'income' | 'expense'
    amount: number
    date: string
    category?: string
    description?: string
  }
  
  export interface MarketRate {
    month: string
    webDev: number
    mobileDev: number
    dataScience: number
  }
  
  export const SKILL_LEVEL_MULTIPLIERS = {
    beginner: 0.8,
    intermediate: 1,
    expert: 1.3
  }
  
  export const CATEGORIES = {
    income: ['Client Project', 'Consultation', 'Training', 'Other'],
    expense: ['Software', 'Hardware', 'Marketing', 'Office', 'Training', 'Other']
  }
  
  export const EXPERIENCE_MULTIPLIER = 0.05
  export const MIN_RATE = 15
  export const DEFAULT_WORKING_WEEKS = 48