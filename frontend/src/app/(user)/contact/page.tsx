import {
    RiWhatsappLine,
    RiPhoneLine,
    RiMapPinLine,
    RiTeamLine,
    RiEmotionHappyLine,
    RiTimeLine,
    RiFlashlightLine,
    RiShieldCheckLine,
    RiGlobalLine,
    RiCustomerService2Line,
    RiHeadphoneLine,
} from "react-icons/ri";
import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 border-b border-border pb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Contact <span className="text-secondary">Us</span>
                    </h1>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                        We&apos;re here to help you 24/7. Reach out to us for orders, refunds, and general inquiries.
                    </p>
                </div>

                <div className="space-y-10">
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatCard
                            icon={<RiTeamLine className="w-5 h-5" />}
                            value="100k+"
                            label="Happy Clients"
                        />
                        <StatCard
                            icon={<RiEmotionHappyLine className="w-5 h-5" />}
                            value="99%"
                            label="Satisfaction Rate"
                        />
                        <StatCard
                            icon={<RiTimeLine className="w-5 h-5" />}
                            value="24/7"
                            label="Support Available"
                        />
                    </div>

                    {/* Contact Card */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                                <RiHeadphoneLine className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-secondary">Get in Touch</h2>
                                <p className="text-sm text-muted-foreground">For orders, refunds, and general inquiries</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Phone */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
                                    <RiPhoneLine className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                    <Link
                                        href="tel:+919497110191"
                                        className="text-foreground font-semibold hover:text-secondary"
                                    >
                                        +91 9497110191
                                    </Link>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border">
                                <div className="w-10 h-10 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
                                    <RiWhatsappLine className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-1">WhatsApp</p>
                                    <p className="text-foreground font-semibold">+91 9497110191</p>
                                </div>
                                <Link
                                    href="https://wa.me/919497110191"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-success text-white text-sm font-semibold rounded-xl hover:opacity-90"
                                >
                                    Chat on WhatsApp
                                </Link>
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted border border-border">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
                                    <RiCustomerService2Line className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                    <Link
                                        href="mailto:support@topupio.com"
                                        className="text-foreground font-semibold hover:text-secondary"
                                    >
                                        support@topupio.com
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Card */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                                <RiMapPinLine className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Our Location</h2>
                                <p className="text-sm text-muted-foreground">Where we&apos;re based</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted border border-border">
                            <p className="text-secondary font-semibold text-lg">Kerala, India</p>
                            <p className="text-muted-foreground text-sm mt-1">Serving customers globally with local expertise</p>
                        </div>
                    </div>

                    {/* 24/7 Support Features */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
                        <h2 className="text-lg font-bold text-foreground text-center mb-2">24/7 Customer Support</h2>
                        <p className="text-sm text-muted-foreground text-center mb-8">
                            Our team is always ready to assist you with professional and friendly support
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <FeatureItem
                                icon={<RiFlashlightLine className="w-5 h-5" />}
                                title="Instant Response"
                                description="Quick answers within minutes"
                                colorClasses="bg-secondary/10 border border-secondary/20 text-secondary"
                            />
                            <FeatureItem
                                icon={<RiShieldCheckLine className="w-5 h-5" />}
                                title="Secure Service"
                                description="100% safe and trusted"
                                colorClasses="bg-success/10 border border-success/20 text-success"
                            />
                            <FeatureItem
                                icon={<RiGlobalLine className="w-5 h-5" />}
                                title="Global Support"
                                description="Available worldwide 24/7"
                                colorClasses="bg-tertiary/10 border border-tertiary/20 text-tertiary"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="bg-card rounded-2xl border border-border p-6 text-center shadow-soft">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mx-auto mb-3">
                {icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

function FeatureItem({ icon, title, description, colorClasses }: { icon: React.ReactNode; title: string; description: string; colorClasses: string }) {
    return (
        <div className="text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${colorClasses}`}>
                {icon}
            </div>
            <p className="font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
}
