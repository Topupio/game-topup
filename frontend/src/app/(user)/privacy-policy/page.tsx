import { RiDatabaseLine, RiUserSearchLine, RiLockPasswordLine, RiSecurePaymentLine, RiShareLine, RiFingerprintLine, RiShieldKeyholeLine, RiUserSettingsLine, RiHistoryLine, RiMailSendLine } from "react-icons/ri";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-b border-gray-200 pb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Privacy <span className="text-secondary">Policy</span>
                    </h1>
                    <p className="text-gray-500 leading-relaxed max-w-3xl">
                        At Topupio.com, we respect your privacy and are committed to protecting your personal data.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-10">
                    {/* 1. Information We Collect */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiDatabaseLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
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
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiUserSearchLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
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
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiLockPasswordLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Game Account Information</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
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
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiSecurePaymentLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Payment Security</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
                                <p>Payments are handled by secure third-party gateways</p>
                                <p>We do not store card, UPI PIN, or banking details</p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Data Sharing */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiShareLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Data Sharing</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
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
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiFingerprintLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Cookies</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
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
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiShieldKeyholeLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Data Protection</h2>
                            <div className="text-gray-600 leading-relaxed">
                                <p>We implement reasonable security measures to protect your data. However, no system is 100% secure.</p>
                            </div>
                        </div>
                    </section>

                    {/* 8. Your Rights */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiUserSettingsLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Your Rights</h2>
                            <div className="text-gray-600 space-y-3 leading-relaxed">
                                <p>You have the right to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Request access to your data</li>
                                    <li>Request correction or deletion (where legally possible)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 9. Policy Updates */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiHistoryLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Policy Updates</h2>
                            <div className="text-gray-600 leading-relaxed">
                                <p>This Privacy Policy may be updated from time to time. Changes will be posted on this page.</p>
                            </div>
                        </div>
                    </section>

                    {/* 10. Contact */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiMailSendLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Contact</h2>
                            <div className="text-gray-600 leading-relaxed">
                                <p>For privacy-related concerns, contact: <span className="text-secondary font-medium">support@topupio.com</span></p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
