"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Play,
  Menu,
  X,
  Truck,
  Plane,
  Ship,
  Shield,
  Clock,
  Award,
  Briefcase,
  DollarSign,
  ChevronRight,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@clerk/nextjs"

export default function Home() {
  const router = useRouter()
  const { isSignedIn, userId } = useAuth()
  const [isPlaying, setIsPlaying] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  // Handle scroll for header transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Function to handle auth button click
  const handleAuthClick = () => {
    if (isSignedIn) {
      router.push("/Dashboard") // Redirect to dashboard or profile page with correct capitalization
    } else {
      router.push("/sign-in") // Redirect to Clerk sign-in page
    }
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <main className="relative bg-background min-h-screen">
      {/* Header */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm" : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
          <Link href="/" className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FF5C28] rounded-md flex items-center justify-center">
              <Ship className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              GlobalRoute Navigator
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {["Home", "About", "Services", "Office", "Contact"].map((item, index) => (
              <Link
                key={index}
                href="#"
                className={cn(
                  "hover:text-primary transition-colors relative py-2",
                  index === 0 && "text-primary font-medium",
                )}
              >
                {item}
                {index === 0 && (
                  <motion.div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5C28]" layoutId="navIndicator" />
                )}
              </Link>
            ))}
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <Button
                className="hidden md:flex bg-[#FF5C28] text-white rounded-full px-6 shadow-lg shadow-primary/20"
                onClick={handleAuthClick}
              >
                My Account
              </Button>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="outline"
                  className="rounded-full px-6 border-[#FF5C28] text-[#FF5C28] hover:bg-[#FF5C28]/10"
                  onClick={() => router.push("/sign-in")}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-[#FF5C28] text-white rounded-full px-6 shadow-lg shadow-primary/20"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign Up
                </Button>
              </div>
            )}
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-t dark:border-gray-800"
          >
            <div className="px-6 py-4 space-y-4">
              {["Home", "About", "Services", "Office", "Contact"].map((item, index) => (
                <Link
                  key={index}
                  href="#"
                  className={cn(
                    "block py-2 hover:text-primary transition-colors",
                    index === 0 && "text-primary font-medium",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              {isSignedIn ? (
                <Button
                  className="w-full bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white rounded-full mt-4"
                  onClick={handleAuthClick}
                >
                  My Account
                </Button>
              ) : (
                <div className="space-y-2 mt-4">
                  <Button
                    variant="outline"
                    className="w-full border-[#FF5C28] text-[#FF5C28] hover:bg-[#FF5C28]/10 rounded-full"
                    onClick={() => router.push("/sign-in")}
                  >
                    Sign In
                  </Button>
                  <Button
                    className="w-full bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white rounded-full"
                    onClick={() => router.push("/sign-up")}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
              <div className="pt-2 border-t dark:border-gray-800">
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="mb-12 text-center"
        >
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium text-primary bg-[#FF5C28]/10 rounded-full">
            GLOBAL LOGISTICS SOLUTIONS
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight mx-auto">
            WE CAN{" "}
            <span className="text-primary relative">
              TRANSFER ANYTHING
              <svg
                className="absolute -bottom-2 left-0 w-full h-2 text-primary/30"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path d="M0,5 C50,0 150,0 200,5" stroke="currentColor" strokeWidth="3" fill="none" />
              </svg>
            </span>
            <br />
            TO WHEREVER YOU NEED IT.
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            Transport means the movement of goods and services from one place to another. We provide the
            utility of place and time, linking production, distribution, exchange and all related activities.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white rounded-full px-8 py-6 group shadow-lg shadow-primary/20">
            <Link href="/new">
              LEARN MORE
              </Link>
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="outline" className="rounded-full px-8 py-6 border-2  hover:bg-[#FF5C28]/90">
              GET A QUOTE
            </Button>
          </div>
        </motion.div>

        {/* Rest of the component remains unchanged */}
        {/* Hero Image with Stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.8, delay: 0.2 },
            },
          }}
          className="relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto"
        >
          <div className="aspect-[16/9] relative">
            <Image
              src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80"
              alt="Container Ship Port"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
              <motion.div whileHover={{ y: -5 }} className="text-white p-6 backdrop-blur-sm bg-black/30">
                <h3 className="text-3xl md:text-4xl font-bold">290k+</h3>
                <p className="text-sm text-white/80">Satisfied Customers</p>
              </motion.div>
              <motion.div whileHover={{ y: -5 }} className="text-white p-6 backdrop-blur-sm bg-black/30">
                <h3 className="text-3xl md:text-4xl font-bold">110k+</h3>
                <p className="text-sm text-white/80">Professional Workers</p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="text-white p-6 backdrop-blur-sm bg-black/30 flex flex-col justify-between h-full"
              >
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold">150+</h3>
                  <p className="text-sm text-white/80">Global Fleet</p>
                </div>
                <p className="text-xs text-white/80 mt-2">
                  We pride ourselves on providing the best transport and shipping service available all over the world.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-[#FF5C28]/10 rounded-full">
              OUR ADVANTAGES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Why Choose Us</h2>
            <div className="w-20 h-1 bg-[#FF5C28] mx-auto mt-6 rounded-full" />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10 }}
                className="bg-background rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-muted"
              >
                <div className="w-14 h-14 bg-[#FF5C28]/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
              <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-[#FF5C28]/10 rounded-full">
                ABOUT US
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Make Your Business More Profitable</h2>
              <p className="text-muted-foreground mb-6">
                We provide comprehensive logistics solutions that optimize your supply chain, reduce costs, and improve
                efficiency. Our global network ensures your goods reach their destination safely and on time.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Global network covering 150+ countries",
                  "24/7 customer support and package tracking",
                  "Custom solutions for businesses of all sizes",
                  "Eco-friendly shipping options",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#FF5C28]/20 flex items-center justify-center mt-1 flex-shrink-0">
                      <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>

              <Button className="bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white rounded-full px-8 shadow-lg shadow-primary/20">
                Learn More About Us
              </Button>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.6, delay: 0.2 },
                },
              }}
              className="relative"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&q=80"
                  alt="Logistics Operations"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />

                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-xl"
                      >
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </motion.div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-black">
                    <div className="aspect-video w-full">
                      <iframe
                        width="100%"
                        height="100%"
                        src=""
                        title="Logistics Video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#FF5C28]/10 rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#FF5C28]/5 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-primary bg-[#FF5C28]/10 rounded-full">
              OUR SERVICES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Manage Your Package
              <br />
              From Local To The World
            </h2>
            <div className="w-20 h-1 bg-[#FF5C28] mx-auto mt-6 rounded-full" />
          </motion.div>

          <Carousel className="w-full">
            <CarouselContent>
              {services.map((service, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                  <motion.div whileHover={{ y: -10 }} className="group cursor-pointer h-full">
                    <Card className="overflow-hidden border-none shadow-lg h-full">
                      <div className="relative h-64 overflow-hidden">
                        <Image
                          src={service.image || "/placeholder.svg"}
                          alt={service.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-sm">{service.description}</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                            {service.title}
                          </h3>
                          <div className="w-8 h-8 rounded-full bg-[#FF5C28]/10 flex items-center justify-center text-primary transform group-hover:bg-[#FF5C28] group-hover:text-white transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{service.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-8 gap-2">
              <CarouselPrevious className="static transform-none mx-2" />
              <CarouselNext className="static transform-none mx-2" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-background">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-7xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-[#FF5C28] shadow-2xl p-5">
            <div className="absolute top-0 left-0 w-full h-full">
              <svg
                className="absolute right-0 top-0 h-full w-1/2 translate-x-1/2 transform text-white/10"
                fill="currentColor"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polygon points="0,0 90,0 50,100 0,100" />
              </svg>
            </div>
            <div className="relative">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className=" text-3xl md:text-4xl font-bold text-white mb-4">
                    Let Us Deliver Your Package To Its Destination
                  </h2>
                  <p className="text-white/80 mb-8 max-w-md">
                    Join thousands of satisfied customers who trust us with their shipping needs. Get started today and
                    experience the difference.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button className="bg-black text-white hover:bg-white/20 rounded-full px-8 shadow-lg">
                      Contact Now
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-black border-white text-white hover:bg-white/20 rounded-full px-8"
                    >
                      Get a Quote
                    </Button>
                  </div>
                </div>
                <div className="lg:block ">
                  <Image
                    src="https://etimg.etb2bimg.com/thumb/msid-117588497,width-1200,height-900,resizemode-4/.jpg"
                    alt="Shipping illustration"
                    width={400}
                    height={300}
                    className="ml-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <Link href="/" className="text-2xl font-bold flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#FF5C28] rounded-md flex items-center justify-center">
                  <Ship className="w-5 h-5 text-white" />
                </div>
                <span className="text-white">GlobalRoute Navigator</span>
              </Link>
              <p className="text-gray-400 mb-6">Your trusted logistics partner for global shipping solutions.</p>
              <div className="flex gap-4">
                {["twitter", "facebook", "instagram", "linkedin"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#FF5C28] transition-colors"
                  >
                    <span className="sr-only">{social}</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-4">
                {["About", "Careers", "News", "Partners", "Sustainability"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#FF5C28] transition-colors"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-4">
                {["Help Center", "Safety", "Terms & Conditions", "Privacy Policy", "Contact Us"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-[#FF5C28] transition-colors"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-6">Newsletter</h4>
              <p className="text-gray-400 mb-4">Subscribe to our newsletter for updates</p>
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <Button className="w-full bg-[#FF5C28] hover:bg-[#FF5C28]/90 text-white">Subscribe</Button>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">© {new Date().getFullYear()} Shippod. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

const features = [
  {
    title: "Flexibility",
    description:
      "We adapt to your shipping needs with flexible solutions and customizable services for any cargo type.",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    title: "Reliability",
    description: "Count on us for consistent, dependable shipping services worldwide with guaranteed delivery times.",
    icon: <Clock className="w-6 h-6" />,
  },
  {
    title: "Expertise",
    description: "Our experienced team ensures professional handling of your shipments with specialized knowledge.",
    icon: <Briefcase className="w-6 h-6" />,
  },
  {
    title: "Experience",
    description: "25+ years of excellence in global logistics and shipping solutions across all continents.",
    icon: <Award className="w-6 h-6" />,
  },
  {
    title: "Value",
    description: "Competitive pricing without compromising on service quality, with transparent fee structures.",
    icon: <DollarSign className="w-6 h-6" />,
  },
  {
    title: "Safety",
    description: "Your cargo's safety is our top priority with advanced security measures and real-time monitoring.",
    icon: <Shield className="w-6 h-6" />,
  },
]

const services = [
  {
    title: "Air Transportation",
    description:
      "Fast and reliable air freight services for time-sensitive cargo with global reach and expedited delivery options.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80",
    icon: <Plane className="w-6 h-6" />,
  },
  {
    title: "Road Transportation",
    description:
      "Comprehensive ground shipping solutions across continents with flexible scheduling and door-to-door delivery.",
    image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&q=80",
    icon: <Truck className="w-6 h-6" />,
  },
  {
    title: "Water Transportation",
    description:
      "Cost-effective sea freight for large-scale shipping needs with options for container, bulk, and specialized cargo.",
    image: "https://ship4wd.com/wp-content/uploads/Image-2-2.jpg.webp",
    icon: <Ship className="w-6 h-6" />,
  },
]

