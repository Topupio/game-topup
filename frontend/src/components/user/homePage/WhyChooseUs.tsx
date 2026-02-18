import {
    RiShieldCheckFill,
    RiCustomerService2Fill,
    RiRefund2Fill,
    RiVerifiedBadgeFill,
} from "react-icons/ri";

const features = [
    {
        icon: RiShieldCheckFill,
        title: "100% Safe Transaction",
        description:
            "We ensure efficient, professional, and secure transactions with full protection of your data — 100% safe.",
    },
    {
        icon: RiCustomerService2Fill,
        title: "24/7 Customer Service",
        description:
            "Our reliable customer service team is available anytime, offering fast and convenient assistance before, during, and after your purchase.",
    },
    {
        icon: RiRefund2Fill,
        title: "Full Refund Guarantee",
        description:
            "We offer competitive prices and efficient delivery. If goods are undelivered or unusable, we promise a 100% refund and financial security.",
    },
];

export default function WhyChooseUs() {
    return (
        <div className="mt-16 lg:mt-24 mb-8">
            {/* Section Header */}
            <div className="flex flex-col items-center text-center sm:mb-6 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-2">
                    <RiVerifiedBadgeFill className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight">
                    Why Choose Us?
                </h2>
                <p className="text-gray-500 text-xs sm:text-sm font-normal">
                    Trusted by thousands of gamers worldwide
                </p>
            </div>

            {/* Cards Container */}
            <div className="bg-muted rounded-2xl p-4 sm:p-8 border border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 flex items-start gap-4"
                        >
                            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center text-secondary shrink-0">
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
