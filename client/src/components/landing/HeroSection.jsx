import React, { useState, useEffect } from "react"
import { X, Check, ArrowRight, Clock, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GodRays, MeshGradient } from "@paper-design/shaders-react"
import { useNavigate } from "react-router-dom"

export default function HeroSection({ onOpenBooking }) {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(false)
  const [formStep, setFormStep] = useState("idle")

  const handleExpand = () => setIsExpanded(true)
  
  const handleClose = () => {
    setIsExpanded(false)
    // Reset form after a brief delay so the user doesn't see it reset while closing
    setTimeout(() => setFormStep("idle"), 500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormStep("submitting")
    // Simulate API call
    setTimeout(() => {
      setFormStep("success")
      setTimeout(() => {
          handleClose()
      }, 2000)
    }, 1500)
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => { document.body.style.overflow = "unset" }
  }, [isExpanded])

  return (
    <>
      <header className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-teal-700 px-4 sm:px-6 py-12 sm:py-20 transition-colors duration-300 w-full">
        
        {/* Mesh Gradient Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <MeshGradient
            speed={0.6}
            colors={["#26CECE", "#1AA8A8", "#0d5c5c", "#178282"]}
            distortion={0.8}
            swirl={0.1}
            grainMixer={0.15}
            grainOverlay={0}
            style={{ height: "100%", width: "100%" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 text-center mt-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full border border-teal-200/30 bg-teal-900/30 px-4 py-1.5 text-sm font-medium text-teal-50 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
            AI Agents that sell while you sleep.
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl drop-shadow-lg"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Your business loses money every minute it goes <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-200 to-white">
              without answering.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-teal-50/90 max-w-2xl px-4 leading-relaxed font-medium drop-shadow-md"
          >
            Bitlance brings AI Voice Bots and WhatsApp Agents that respond in 0.4 seconds, qualify your leads, and book appointments — 24/7, with zero human involvement.
          </motion.p>

          <AnimatePresence initial={false}>
            {!isExpanded && (
              <motion.div className="inline-block relative mt-8 group">
                {/* Glowing drop shadow behind button */}
                <div className="absolute -inset-1 bg-white/20 rounded-[100px] blur-md opacity-30 group-hover:opacity-60 transition duration-500"></div>
                
                {/* The expanding background element */}
                <motion.div
                  style={{ borderRadius: "100px" }}
                  layout
                  layoutId="cta-card"
                  className="absolute inset-0 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.1)]"
                />
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  layout={false}
                  onClick={handleExpand}
                  className="relative flex items-center gap-3 h-16 px-10 py-4 text-lg font-bold text-teal-800 tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Get My Free Audit
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 flex flex-col items-center gap-4 text-sm"
          >
            <p className="text-teal-100/70" style={{ fontFamily: "'DM Mono', monospace" }}>
              or just curious about the platform? - "Check out out of the box"
            </p>
            <p className="text-white font-medium">
              Or chat with us on WhatsApp — we respond in under 30 seconds.
            </p>
          </motion.div>
        </div>
      </header>

      {/* 
        Expanded Modal Overlay 
      */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
            <motion.div
              layoutId="cta-card"
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              style={{ borderRadius: "24px" }}
              layout
              className="relative flex h-full w-full overflow-hidden bg-teal-700 sm:rounded-[24px] shadow-2xl"
            >
              {/* Mesh Gradient Background inside Modal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 pointer-events-none"
              >
                <MeshGradient
                  speed={0.6}
                  colors={["#26CECE", "#1AA8A8", "#0d5c5c", "#178282"]} // Teal palette
                  distortion={0.8}
                  swirl={0.1}
                  grainMixer={0.15}
                  grainOverlay={0}
                  style={{ height: "100%", width: "100%" }}
                />
              </motion.div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleClose}
                className="absolute right-4 top-4 sm:right-8 sm:top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </motion.button>

              {/* Modal Content */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto overflow-y-auto lg:overflow-hidden"
              >
                {/* Left Side: Testimonials & Info */}
                <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-16 gap-8 text-white">
                  <div className="space-y-4">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                      Ready to automate?
                    </h2>
                    <p className="text-teal-50 text-lg max-w-md">
                      Join forward-thinking Indian businesses building the future with Bitlance AI.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Zap className="w-6 h-6 text-teal-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">0.4s Lightning Response</h3>
                        <p className="text-teal-100/90 text-sm leading-relaxed mt-1">
                          Engage leads instantly over WhatsApp and Voice before your competitors do.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                        <Clock className="w-6 h-6 text-teal-200" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Available 24/7</h3>
                        <p className="text-teal-100/90 text-sm leading-relaxed mt-1">
                          Never miss a lead. Our agents work around the clock without sick days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-8 border-t border-white/20">
                    <figure>
                      <blockquote className="text-xl font-medium leading-relaxed mb-6">
                        "Bitlance transformed how we handle enquiries. We went from dropping leads during peak hours to booking appointments automatically 24/7."
                      </blockquote>
                      <figcaption className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-teal-400 to-blue-500 flex items-center justify-center text-lg font-bold text-white">
                          A
                        </div>
                        <div>
                          <div className="font-semibold">Alok Kumar</div>
                          <div className="text-sm text-teal-100">Lotlite Real Estate</div>
                        </div>
                      </figcaption>
                    </figure>
                  </div>
                </div>

                {/* Right Side: Form */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-12 lg:p-16 bg-black/10 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none">
                  <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    
                    {formStep === "success" ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center h-[400px] space-y-6"
                      >
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                          <Check className="w-10 h-10 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                          <p className="text-teal-50">Our team will be in touch shortly to schedule your free AI audit.</p>
                        </div>
                        <button 
                          onClick={handleClose}
                          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Return to Homepage
                        </button>
                      </motion.div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-white">Get a Free AI Audit</h3>
                          <p className="text-sm text-teal-100">Fill out the form below and we'll contact you.</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="name" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                              Full Name
                            </label>
                            <input
                              required
                              type="text"
                              id="name"
                              placeholder="John Doe"
                              className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                              Work Email
                            </label>
                            <input
                              required
                              type="email"
                              id="email"
                              placeholder="john@company.com"
                              className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="company" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                                Phone
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                defaultValue="+91 "
                                placeholder="+91 9876543210"
                                className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="service" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                                Interest
                              </label>
                              <select
                                id="service"
                                className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                              >
                                <option className="bg-teal-900 text-white">Voice Bot</option>
                                <option className="bg-teal-900 text-white">WhatsApp Agent</option>
                                <option className="bg-teal-900 text-white">GEO Content Agent</option>
                                <option className="bg-teal-900 text-white">Not Sure Yet</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="message" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                              Needs
                            </label>
                            <textarea
                              id="message"
                              rows="3"
                              placeholder="Tell us about your business..."
                              className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none text-sm"
                            />
                          </div>
                        </div>

                        <button
                          disabled={formStep === "submitting"}
                          type="submit"
                          className="w-full flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-teal-800 font-bold hover:bg-teal-50 focus:ring-4 focus:ring-teal-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                          {formStep === "submitting" ? (
                             <span className="flex items-center gap-2">
                               <span className="h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></span>
                               Sending...
                             </span>
                          ) : "Submit Request"}
                        </button>
                        
                        <p className="text-xs text-center text-teal-100/60 mt-4">
                          By submitting, you agree to our Terms of Service and Privacy Policy.
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
