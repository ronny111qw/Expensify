'use client'

import { useState, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, DollarSign, TrendingUp, Users, BarChart4, Menu } from 'lucide-react'

const FeatureCard = ({ icon: Icon, title, description }) => (
  <Card className="bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg transition-transform transform hover:scale-105 h-full">
    <CardHeader className="flex items-center space-x-3">
      <Icon className="w-10 h-10 text-primary" />
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription className="text-sm">{description}</CardDescription>
    </CardContent>
  </Card>
)

const AnimatedSection = ({ children }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      transition={{ duration: 0.5 }}
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Signed up with email:', email)
    setEmail('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <header className="container mx-auto px-4 py-4 sm:py-8">
        <nav className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Expensify</h1>
          <div className="hidden sm:flex space-x-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="ghost">About</Button>
            <Button className="bg-primary text-white hover:bg-primary-dark">Get Started</Button>
          </div>
          <div className="sm:hidden">
            <Button variant="ghost" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu />
            </Button>
          </div>
        </nav>
        {menuOpen && (
          <div className="mt-4 flex flex-col space-y-2 sm:hidden">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">Pricing</Button>
            <Button variant="ghost">About</Button>
            <Button className="bg-primary text-white hover:bg-primary-dark">Get Started</Button>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-16">
        <AnimatedSection>
          <section className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Calculate Your Worth
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8">
              Set competitive freelance rates with data-driven insights
            </p>
            <Button size="lg" className="text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-6 bg-primary text-white hover:bg-primary-dark">
              Try It Now <ArrowRight className="ml-2" />
            </Button>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="grid md:grid-cols-2 gap-8 mb-12 sm:mb-16">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Why Use Expensify</h3>
              <p className="text-base sm:text-lg text-muted-foreground mb-4">
                Our Platform considers multiple factors to suggest the perfect rate for your freelance services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Industry standards and current market trends</li>
                <li>Your experience level and skill set</li>
                <li>Geographic location and cost of living</li>
                <li>Project complexity and duration</li>
                <li>Your financial goals and business expenses</li>
              </ul>
            </div>
            <div className="relative mt-8 md:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-lg transform rotate-3"></div>
              <Card className="relative z-10 shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Rate Estimate</CardTitle>
                  <CardDescription>Get a ballpark figure in seconds</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input id="experience" type="number" placeholder="e.g., 5" />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" type="text" placeholder="e.g., Web Development" />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-white hover:bg-primary-dark">Calculate</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={DollarSign}
                title="Advanced Rate Calculator"
                description="Calculate your ideal freelance rate based on your skills, experience, and expenses."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Real-time Market Trends"
                description="Stay informed with AI-powered insights on freelance market rates and demands."
              />
              <FeatureCard
                icon={Users}
                title="Client Budget Analyzer"
                description="Evaluate client budgets against market rates and your personal financial goals."
              />
              <FeatureCard
                icon={BarChart4}
                title="Comprehensive Income Tracker"
                description="Monitor your freelance income and expenses with powerful visualization tools."
              />
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">What Our Users Say</h3>
            <Tabs defaultValue="testimonial1" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="testimonial1">Sarah K.</TabsTrigger>
                <TabsTrigger value="testimonial2">Michael R.</TabsTrigger>
                <TabsTrigger value="testimonial3">Emily T.</TabsTrigger>
              </TabsList>
              <TabsContent value="testimonial1">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Sarah K.</CardTitle>
                    <CardDescription>Graphic Designer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    "FreelanceRateCalc helped me realize I was undercharging for my services. After adjusting my rates, I'm earning 30% more without losing clients!"
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="testimonial2">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Michael R.</CardTitle>
                    <CardDescription>Web Developer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    "The market insights provided by this tool are invaluable. I feel much more confident in my pricing decisions now."
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="testimonial3">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Emily T.</CardTitle>
                    <CardDescription>Content Writer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    "I love the easy-to-use interface! It’s made managing my freelance income and rates a breeze."
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </AnimatedSection>

        <AnimatedSection>
          <section className="text-center mb-12 sm:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Stay Updated</h3>
            <p className="text-lg sm:text-xl text-muted-foreground mb-4">Join our mailing list to receive the latest tips and resources for freelancers.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-l-lg border-primary focus:ring focus:ring-primary/50"
              />
              <Button type="submit" className="bg-primary text-white rounded-r-lg hover:bg-primary-dark">Subscribe</Button>
            </form>
          </section>
        </AnimatedSection>
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p className="text-sm">© 2024 Expensify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
