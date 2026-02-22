import { RiCheckboxCircleLine, RiCloseCircleLine, RiErrorWarningLine, RiBankCardLine, RiShieldFlashLine, RiTimerLine, RiCustomerService2Line } from "react-icons/ri";

export default function RefundPolicy() {
    return (
        <div className="min-h-screen bg-muted pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-b border-border pb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Refund & <span className="text-secondary">Cancellation</span>
                    </h1>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                        Because Topupio.com sells digital goods, refunds are limited and subject to the conditions below.
                    </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-10">
                    {/* 1. No Refund After Successful Delivery */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiCloseCircleLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">1. No Refund After Successful Delivery</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>Once a digital product is:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Successfully delivered</li>
                                    <li>Redeemed</li>
                                    <li>Applied to a game account</li>
                                </ul>
                                <p className="text-red-500 font-semibold">❌ No refund or cancellation is possible.</p>
                            </div>
                        </div>
                    </section>

                    {/* 2. Refund Eligibility */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiCheckboxCircleLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">2. Refund Eligibility</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>You may be eligible for a refund if:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>The top-up failed and was not delivered</li>
                                    <li>The digital code is invalid or unused</li>
                                    <li>Payment was deducted but the order was not processed</li>
                                </ul>
                                <p className="italic text-muted-foreground">All refund requests must be made within 24 hours of purchase.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. In-Game Login Top-Up Refunds */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiErrorWarningLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">3. In-Game Login Top-Up Refunds</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>Refunds will not be provided if:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Incorrect login details were provided</li>
                                    <li>Account restrictions, bans, or locks prevented top-up</li>
                                    <li>The game publisher changed policies or servers were unavailable</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* 4. Refund Method */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiBankCardLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">4. Refund Method</h2>
                            <div className="text-muted-foreground space-y-2 leading-relaxed">
                                <p>Approved refunds will be issued to the original payment method</p>
                                <p>Processing time: 5–7 business days (depends on payment gateway)</p>
                            </div>
                        </div>
                    </section>

                    {/* 5. Fraud & Abuse */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiShieldFlashLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">5. Fraud & Abuse</h2>
                            <div className="text-muted-foreground space-y-3 leading-relaxed">
                                <p>Orders suspected of:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Fraud</li>
                                    <li>Chargeback abuse</li>
                                    <li>Policy violations</li>
                                </ul>
                                <p>May be cancelled without refund.</p>
                            </div>
                        </div>
                    </section>

                    {/* 6. Order Cancellation */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiTimerLine className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">6. Order Cancellation</h2>
                            <div className="text-muted-foreground space-y-2 leading-relaxed">
                                <p>Orders cannot be cancelled once processing has started</p>
                                <p className="font-medium text-foreground italic">Please double-check product, game, region, and account details before payment</p>
                            </div>
                        </div>
                    </section>

                    {/* 7. Contact for Refunds */}
                    <section className="flex gap-5">
                        <div className="shrink-0 mt-1">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
                                <RiCustomerService2Line className="text-secondary" size={20} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground mb-3">7. Contact for Refunds</h2>
                            <div className="text-muted-foreground space-y-2 leading-relaxed">
                                <p>For refund requests:</p>
                                <ul className="list-none space-y-1">
                                    <li>Email: <span className="text-secondary font-medium">support@topupio.com</span></li>
                                    <li>Include Order ID and reason</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
