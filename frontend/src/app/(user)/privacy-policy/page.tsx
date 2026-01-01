import { RiDatabaseLine, RiUserSearchLine, RiLockPasswordLine, RiSecurePaymentLine, RiShareLine, RiFingerprintLine, RiShieldKeyholeLine, RiUserSettingsLine, RiHistoryLine, RiMailSendLine } from "react-icons/ri";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-primary pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-b border-white/10 pb-10">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Privacy <span className="text-secondary">Policy</span>
                    </h1>
                    <p className="text-gray-400 leading-relaxed max-w-4xl text-lg">
                        At Topupio.com, we respect your privacy and are committed to protecting your personal data.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-12">
                    {/* 1. Information We Collect */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiDatabaseLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">1. Information We Collect</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>We may collect:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Name, email address, phone number</li>
                                    <li>Payment confirmation details (not card data)</li>
                                    <li>Game IDs, User IDs, or login credentials (only when required for top-ups)</li>
                                    <li>IP address, device, and browser data</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 2. How We Use Your Information */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiUserSearchLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">2. How We Use Your Information</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>Your information is used to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Process and deliver orders</li>
                                    <li>Verify transactions and prevent fraud</li>
                                    <li>Provide customer support</li>
                                    <li>Improve our website and services</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 3. Game Account Information */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiLockPasswordLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">3. Game Account Information</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>For services requiring in-game login:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Login details are used only to complete the order</li>
                                    <li>Credentials are not stored permanently</li>
                                    <li>Access is limited strictly to top-up fulfillment</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 4. Payment Security */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiSecurePaymentLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">4. Payment Security</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>Payments are handled by secure third-party gateways</p>
                                <p>We do not store card, UPI PIN, or banking details</p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Data Sharing */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiShareLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">5. Data Sharing</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>We do not sell or rent your personal data.</p>
                                <p>We may share limited information only with:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Payment processors</li>
                                    <li>Fraud prevention services</li>
                                    <li>Legal authorities if required by law</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 6. Cookies */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiFingerprintLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">6. Cookies</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>We use cookies to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Improve site functionality</li>
                                    <li>Analyze traffic</li>
                                    <li>Enhance user experience</li>
                                </ul>
                                <p>You can disable cookies in your browser settings.</p>
                            </div>
                        </div>
                    </section>

                    {/* 7. Data Protection */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiShieldKeyholeLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">7. Data Protection</h2>
                            <div className="text-gray-400 leading-relaxed">
                                <p>We implement reasonable security measures to protect your data. However, no system is 100% secure.</p>
                            </div>
                        </div>
                    </section>

                    {/* 8. Your Rights */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiUserSettingsLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">8. Your Rights</h2>
                            <div className="text-gray-400 space-y-3 leading-relaxed">
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Request access to your data</li>
                                    <li>Request correction or deletion (where legally possible)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 9. Policy Updates */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiHistoryLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">9. Policy Updates</h2>
                            <div className="text-gray-400 leading-relaxed">
                                <p>This Privacy Policy may be updated from time to time. Changes will be posted on this page.</p>
                            </div>
                        </div>
                    </section>

                    {/* 10. Contact */}
                    <section className="flex gap-6">
                        <div className="shrink-0 mt-1">
                            <RiMailSendLine className="text-secondary" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4 text-secondary">10. Contact</h2>
                            <div className="text-gray-400 leading-relaxed">
                                <p>For privacy-related concerns, contact: <span className="text-white">support@topupio.com</span></p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
