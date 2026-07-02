import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Clock, ChevronDown, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { MeshGradient } from '@paper-design/shaders-react';
import { supabase } from '../../services/supabaseClient';
import { trackContactFormSubmit, trackContactFormSuccess, trackContactFormError, trackFormStart } from '../../lib/analytics';

const ContactPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ name: '', email: '', phone: '+91 ', service: 'Voice Bot', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formStartedTracked, setFormStartedTracked] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleFocus = () => {
        if (!formStartedTracked) {
            trackFormStart('Free AI Audit Form');
            setFormStartedTracked(true);
        }
    };

    const handleClose = () => {
        navigate(-1); // Go back to previous page
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        trackContactFormSubmit();

        try {
            // Send request to backend
            const response = await fetch('/api/leads/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    service: form.service,
                    message: form.message
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit contact form');
            }

            setSubmitted(true);
            trackContactFormSuccess();
        } catch (err) {
            console.error('Submission Error:', err);
            trackContactFormError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen z-0 flex items-center justify-center bg-teal-700 overflow-hidden relative">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none">
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

            {/* Modal Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 flex flex-col lg:flex-row w-full max-w-7xl mx-auto pt-24 pb-12 px-4"
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

                  <div className="pt-4 mt-2 space-y-3">
                    <a href="tel:+917391025059" className="flex items-center gap-3 hover:text-teal-200 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-teal-300" />
                      </div>
                      <span className="text-teal-50 text-sm font-medium">+91 7391025059</span>
                    </a>
                    <a href="mailto:ceo@bitlancetechhub.com" className="flex items-center gap-3 hover:text-teal-200 transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-teal-300" />
                      </div>
                      <span className="text-teal-50 text-sm font-medium">ceo@bitlancetechhub.com</span>
                    </a>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-teal-300" />
                      </div>
                      <span className="text-teal-50 text-sm font-medium">Blue Ridge Town, Phase 1, Pune</span>
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
                    
                    {submitted ? (
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
                          className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
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
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              onFocus={handleFocus}
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
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              onFocus={handleFocus}
                              placeholder="john@company.com"
                              className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="phone" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                                Phone
                              </label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                onFocus={handleFocus}
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
                                name="service"
                                value={form.service}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-sm appearance-none cursor-pointer"
                              >
                                <option className="bg-teal-900 text-white" value="Voice Bot">Voice Bot</option>
                                <option className="bg-teal-900 text-white" value="WhatsApp Agent">WhatsApp Agent</option>
                                <option className="bg-teal-900 text-white" value="GEO Content Agent">GEO Content Agent</option>
                                <option className="bg-teal-900 text-white" value="Not Sure Yet">Not Sure Yet</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label htmlFor="message" className="block text-xs font-medium text-teal-100 mb-1.5 uppercase tracking-wider">
                              Needs
                            </label>
                            <textarea
                              id="message"
                              name="message"
                              value={form.message}
                              onChange={handleChange}
                              onFocus={handleFocus}
                              rows="3"
                              placeholder="Tell us about your business..."
                              className="w-full px-4 py-3 rounded-lg bg-teal-950/40 border border-teal-300/20 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none text-sm"
                            />
                          </div>
                        </div>

                        <button
                          disabled={submitting}
                          type="submit"
                          className="w-full flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-teal-800 font-bold hover:bg-teal-50 focus:ring-4 focus:ring-teal-500/30 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                          {submitting ? (
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
        </div>
    );
};

export default ContactPage;
