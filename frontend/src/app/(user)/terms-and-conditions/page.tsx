import { RiInformationLine, RiShieldCheckLine, RiTruckLine, RiAccountBoxLine, RiMoneyDollarCircleLine, RiSpamLine, RiHammerLine, RiRefreshLine, RiMailLine } from "react-icons/ri";

export default function TermsAndConditions() {
    return (
        <div className="min-h-screen bg-muted pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-b border-border pb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Terms and <span className="text-secondary">Conditions</span>
                    </h1>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                        Welcome to Topupio.com. By accessing or using our website and services, you agree to be bound by the following Terms and Conditions. Please read them carefully before making any purchase.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-10">
                    {/* 1. About Us */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiInformationLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">1. About Us</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>Topupio.com is an online digital store that sells:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Mobile and PC game in-game currencies and items</li>
                                    <li>Digital gift cards and vouchers</li>
                                    <li>Digital subscriptions and accounts</li>
                                </ul>
                                <p>All products sold on this website are digital goods.</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Eligibility */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiShieldCheckLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">2. Eligibility</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>You must be 18 years or older to use this website.</p>
                                <p>By using our services, you confirm that the information you provide is accurate and complete.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Digital Products & Delivery */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiTruckLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">3. Digital Products & Delivery</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>All products sold on Topupio.com are digital and non-physical.</p>
                                <p>Delivery is usually instant or within a few minutes, but in some cases may take longer due to verification, technical issues, or high demand.</p>
                                <p>No physical shipment will be made.</p>
                            </div>
                        </div>
                    </section>

                    {/* 4. In-Game Login Top-Ups */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiAccountBoxLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">4. In-Game Login Top-Ups</h2>
                            <div className="text-muted-foreground space-y-4 leading-relaxed">
                                <p>Some services require you to provide in-game login credentials (such as Player ID, User ID, or game account login).</p>
                                <div className="space-y-2">
                                    <p>By placing such an order, you agree that:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>You are the rightful owner of the game account.</li>
                                        <li>The login details provided are correct and active.</li>
                                        <li>You have not enabled temporary locks or security restrictions during the top-up process.</li>
                                        <li>Topupio.com will only access the account for order fulfillment and will not change passwords or personal details.</li>
                                    </ul>
                                </div>
                                <div className="space-y-2">
                                    <p>We are not responsible for delays or failures caused by:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Incorrect login details</li>
                                        <li>Account bans, suspensions, or restrictions</li>
                                        <li>Game server maintenance or policy changes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. Pricing & Payments */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiMoneyDollarCircleLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">5. Pricing & Payments</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>All prices are displayed in Indian Rupees (INR) unless stated otherwise.</p>
                                <p>Prices may change at any time without prior notice.</p>
                                <p>Payments are processed via secure third-party payment gateways.</p>
                                <p>We do not store your card or payment information.</p>
                            </div>
                        </div>
                    </section>

                    {/* 6. Order Verification */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiShieldCheckLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">6. Order Verification</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>To prevent fraud, we may:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Request additional verification</li>
                                    <li>Temporarily hold or cancel suspicious orders</li>
                                    <li>Refund payments if verification fails</li>
                                </ul>
                                <p>This is done to protect both the customer and our platform.</p>
                            </div>
                        </div>
                    </section>

                    {/* 7. Prohibited Use */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiSpamLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">7. Prohibited Use</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>You agree not to:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Use the website for illegal activities</li>
                                    <li>Attempt fraud, chargebacks, or abuse of offers</li>
                                    <li>Resell our services without permission</li>
                                </ul>
                                <p>Violation may result in account suspension or permanent ban.</p>
                            </div>
                        </div>
                    </section>

                    {/* 8. Limitation of Liability */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiHammerLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">8. Limitation of Liability</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>Topupio.com shall not be liable for:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Game account bans or penalties imposed by game publishers</li>
                                    <li>Losses caused by incorrect information provided by the user</li>
                                    <li>Delays caused by third-party platforms, payment gateways, or game servers</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 9. Changes to Terms */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiRefreshLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">9. Changes to Terms</h2>
                            <div className="text-muted-foreground leading-relaxed">
                                <p>We reserve the right to update these Terms at any time. Continued use of the website means you accept the revised Terms.</p>
                            </div>
                        </div>
                    </section>

                    {/* 10. Contact */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiMailLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">10. Contact</h2>
                            <div className="text-muted-foreground space-y-2 leading-relaxed">
                                <p>For any questions, please contact us via:</p>
                                <ul className="list-none space-y-1">
                                    <li>Email: <span className="text-secondary font-medium">support@topupio.com</span></li>
                                    <li>WhatsApp / Telegram support (as listed on the website)</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
