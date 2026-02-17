import React from 'react';
import { Mail, MapPin, Phone, FileText, CheckCircle, AlertTriangle, Shield, RefreshCw } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-10 text-white">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
                        <FileText className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
                        Terms and Conditions
                    </h1>
                    <p className="text-blue-100 text-lg">For AI Tools Purchasing</p>
                </div>

                <div className="p-8 md:p-12 space-y-8 text-gray-700 dark:text-gray-300">
                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg leading-relaxed mb-6">
                            Welcome to <strong>Bitlance Tech Hub</strong> (“Company,” “we,” “us,” or “our”). These Terms and Conditions (“Terms”) govern your access to and use of our AI tools, services, websites, and software (collectively, “Services”). By purchasing or using any of our Services, you agree to be bound by these Terms.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <CheckCircle className="w-5 h-5" />
                            </span>
                            1. Eligibility
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            By using our Services, you represent that you are at least 18 years old and have the legal capacity to enter into a binding contract. If you are using the Services on behalf of an organization, you represent that you have authority to bind that organization.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <FileText className="w-5 h-5" />
                            </span>
                            2. Purchases and Payments
                        </h2>
                        <ul className="list-disc pl-14 space-y-2 marker:text-blue-500">
                            <li>All purchases of AI tools or subscriptions are subject to applicable fees as displayed at the time of purchase.</li>
                            <li>Payments are processed via third-party providers (e.g., Stripe, Razorpay).</li>
                            <li>You agree to provide accurate billing information and authorize us to charge applicable fees.</li>
                            <li>All fees are non-refundable unless otherwise stated in a specific refund policy.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <Shield className="w-5 h-5" />
                            </span>
                            3. License and Usage Rights
                        </h2>
                        <ul className="list-disc pl-14 space-y-2 marker:text-blue-500">
                            <li>You are granted a limited, non-exclusive, non-transferable license to use the AI tools solely for your internal or commercial use.</li>
                            <li>You agree not to resell, sublicense, or redistribute the tools.</li>
                            <li>You agree not to reverse-engineer, copy, or modify the tools without our permission.</li>
                            <li>You agree not to use the tools for unlawful purposes (e.g., fraud, discrimination, deepfake generation, etc.).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <CheckCircle className="w-5 h-5" />
                            </span>
                            4. Account and Access
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            You are responsible for maintaining the confidentiality of your credentials and all activities under your account. We reserve the right to suspend or terminate access if you violate these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <AlertTriangle className="w-5 h-5" />
                            </span>
                            5. Intellectual Property
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            All content, software, models, and documentation provided through our Services are the intellectual property of Bitlance Tech Hub or our licensors. No ownership rights are transferred to you under these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <RefreshCw className="w-5 h-5" />
                            </span>
                            6. Service Availability and Updates
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            We strive to maintain reliable access to our AI tools but do not guarantee uninterrupted availability. We may perform updates, modify features, or discontinue services with or without prior notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <Shield className="w-5 h-5" />
                            </span>
                            7. Data Usage and Privacy
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            By using our tools, you may provide input data and receive output data. We handle all user data in accordance with our Privacy Policy. You retain ownership of your input data; we may use anonymized outputs to improve our models unless you opt out where applicable.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <RefreshCw className="w-5 h-5" />
                            </span>
                            8. Refunds and Cancellations
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            Refunds are only issued in accordance with our Refund Policy. For subscription-based products, you may cancel any time, but access continues until the end of the billing cycle.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <AlertTriangle className="w-5 h-5" />
                            </span>
                            9. Limitation of Liability
                        </h2>
                        <p className="ml-10 mb-2 font-medium">To the maximum extent permitted by law:</p>
                        <ul className="list-disc pl-14 space-y-2 marker:text-blue-500">
                            <li>We shall not be liable for any indirect, incidental, consequential, or punitive damages.</li>
                            <li>Our total liability under these Terms shall not exceed the total amount paid by you in the last 3 months.</li>
                            <li>Use of the AI tools is at your own risk, especially in sensitive decision-making contexts.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <Shield className="w-5 h-5" />
                            </span>
                            10. Indemnification
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            You agree to indemnify, defend, and hold harmless Bitlance Tech Hub, its affiliates, and employees from any claims or liabilities arising out of your misuse of the Services or violation of these Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <FileText className="w-5 h-5" />
                            </span>
                            11. Governing Law and Dispute Resolution
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            These Terms are governed by the laws of India. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-lg text-blue-600 dark:text-blue-400">
                                <RefreshCw className="w-5 h-5" />
                            </span>
                            12. Changes to These Terms
                        </h2>
                        <p className="ml-10 leading-relaxed">
                            We may revise these Terms at any time. Material changes will be notified via email or posted on our site. Continued use of the Services after changes constitutes acceptance.
                        </p>
                    </section>

                    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mt-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Contact Us</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email Us</p>
                                    <a href="mailto:ceo@bitlancetechhub.com" className="text-lg font-medium hover:text-blue-600 transition-colors">
                                        ceo@bitlancetechhub.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Visit Us</p>
                                    <p className="text-lg font-medium">
                                        Blue Ridge Town Pune, Phase 1, Hinjawadi Rajiv Gandhi Infotech Park, Hinjawadi, Pune, Pimpri-Chinchwad, Maharashtra 411057
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg text-blue-600 dark:text-blue-400 mt-1">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Call Us</p>
                                    <a href="tel:7391025059" className="text-lg font-medium hover:text-blue-600 transition-colors">
                                        7391025059
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
