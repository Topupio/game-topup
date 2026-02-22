"use client";

import { useState } from "react";
import {
    RiQuestionLine,
    RiTruckLine,
    RiBankCardLine,
    RiRefundLine,
    RiShieldKeyholeLine,
    RiCustomerService2Line,
    RiToolsLine,
    RiArrowDownSLine,
} from "react-icons/ri";

type FaqItem = { question: string; answer: string | string[] };

const faqData: { id: string; label: string; icon: React.ReactNode; items: FaqItem[] }[] = [
    {
        id: "general",
        label: "General",
        icon: <RiQuestionLine className="w-5 h-5" />,
        items: [
            {
                question: "What is Topupio.com?",
                answer: "Topupio.com is an online digital marketplace offering game top-ups, gift cards, and AI & subscription services with fast and reliable delivery.",
            },
            {
                question: "Is Topupio.com safe and legit?",
                answer: "Yes. We follow secure processes, verify orders carefully, and provide customer support to ensure a safe purchasing experience.",
            },
            {
                question: "What products do you sell?",
                answer: [
                    "UID Instant Top-Ups",
                    "Login-Based Top-Ups",
                    "Digital Gift Cards",
                    "AI Tools & Subscription Services",
                ],
            },
            {
                question: "Do you support international customers?",
                answer: "Yes, we support both Indian and global customers. Some products are region or server specific, so always choose the correct option while ordering.",
            },
            {
                question: "Will I get first-time top-up bonuses in games?",
                answer: "If the game provides first-time bonuses and your account is eligible, the bonus will be added automatically by the game system.",
            },
        ],
    },
    {
        id: "order-delivery",
        label: "Order & Delivery",
        icon: <RiTruckLine className="w-5 h-5" />,
        items: [
            {
                question: "How do I place an order?",
                answer: "Select your product, enter the required details, complete payment, and your order will be processed automatically or manually based on the product type.",
            },
            {
                question: "How fast is delivery?",
                answer: "UID Instant Top-Ups are usually delivered within minutes. Login Top-Ups and manual services may take longer depending on verification and availability.",
            },
            {
                question: "How can I track my order?",
                answer: "You can track your order using your Order ID. Always keep your Order ID for support purposes.",
            },
            {
                question: "Can I cancel or change my order after payment?",
                answer: "Once an order is processed or completed, it cannot be cancelled or changed. Contact support immediately if you notice an error before completion.",
            },
            {
                question: "What if I entered wrong details (UID, email, region)?",
                answer: "Contact support as soon as possible. If the order is not completed, it may be corrected. Completed orders cannot be changed.",
            },
            {
                question: "Order completed but I didn't receive anything. What should I do?",
                answer: "Wait a few minutes and refresh. If still not received, contact support with your Order ID and screenshots.",
            },
        ],
    },
    {
        id: "payment-pricing",
        label: "Payment & Pricing",
        icon: <RiBankCardLine className="w-5 h-5" />,
        items: [
            {
                question: "What payment methods are supported?",
                answer: "We support UPI, bank transfers, PayPal, and cryptocurrency. Available methods may vary by product and country.",
            },
            {
                question: "Are there any extra fees?",
                answer: "Some payment methods may include processing fees. The final amount is always shown before payment confirmation.",
            },
            {
                question: "Why did my payment fail?",
                answer: "Payments may fail due to bank restrictions, insufficient balance, security checks, or incorrect details. Try another payment method if needed.",
            },
            {
                question: "My money was deducted but order failed. What now?",
                answer: "Most failed payments are automatically reversed by banks within a few business days. If not, contact support with payment proof.",
            },
            {
                question: "Is crypto payment refundable?",
                answer: "Crypto payments are usually non-refundable. Always double-check the network, address, and amount before sending.",
            },
        ],
    },
    {
        id: "refunds-returns",
        label: "Refunds & Returns",
        icon: <RiRefundLine className="w-5 h-5" />,
        items: [
            {
                question: "When are refunds possible?",
                answer: "Refunds are possible if the order is not delivered, fails due to system issues, or cannot be completed by our team.",
            },
            {
                question: "When are refunds not possible?",
                answer: "Refunds are not possible for completed and correctly delivered orders, used gift card codes, or successful top-ups.",
            },
            {
                question: "Can gift cards be refunded?",
                answer: "Only if the gift card was not delivered or is proven invalid. Used or revealed codes cannot be refunded.",
            },
            {
                question: "How long do refunds take?",
                answer: "Refund processing time depends on the payment method and can take several business days.",
            },
        ],
    },
    {
        id: "account-security",
        label: "Account & Security",
        icon: <RiShieldKeyholeLine className="w-5 h-5" />,
        items: [
            {
                question: "What is a Login Top-Up?",
                answer: "A Login Top-Up requires temporary account access so our team can complete the purchase when UID top-up is not supported.",
            },
            {
                question: "Is my account safe during Login Top-Up?",
                answer: "Yes. Access is used only to complete the order. We recommend changing your password after delivery for extra security.",
            },
            {
                question: "Should I stay logged out during Login Top-Up?",
                answer: "Yes. Please remain logged out until the order is completed to avoid interruptions.",
            },
            {
                question: "Will you ever ask for bank OTP, card PIN, or CVV?",
                answer: "No. We will never ask for sensitive banking information.",
            },
            {
                question: "Will identity verification ever be required?",
                answer: "In rare cases, additional verification may be requested to prevent fraud and protect users.",
            },
        ],
    },
    {
        id: "customer-support",
        label: "Customer Support",
        icon: <RiCustomerService2Line className="w-5 h-5" />,
        items: [
            {
                question: "How do I contact customer support?",
                answer: "Use the support option on our website and include your Order ID for faster assistance.",
            },
            {
                question: "What details should I send to support?",
                answer: [
                    "Order ID",
                    "Payment proof (screenshot or transaction ID)",
                    "Relevant screenshots (UID, email, or issue details)",
                ],
            },
            {
                question: "Do you offer reseller or bulk order support?",
                answer: "Yes. Contact support and mention reseller or bulk requirements.",
            },
        ],
    },
    {
        id: "technical-issues",
        label: "Technical Issues",
        icon: <RiToolsLine className="w-5 h-5" />,
        items: [
            {
                question: "Order shows unpaid or pending after payment.",
                answer: "Wait a few minutes and refresh the page. If it remains unchanged, contact support with payment proof.",
            },
            {
                question: "Payment page not loading or error showing.",
                answer: "Try another browser or device, clear cache, disable VPN, and ensure pop-ups are allowed.",
            },
            {
                question: "Gift card code not received or not working.",
                answer: "Check order status and region compatibility. If the issue continues, contact support with screenshots.",
            },
            {
                question: "Stuck on verification during Login Top-Up.",
                answer: "Be ready to provide verification codes if your account has two-step authentication enabled.",
            },
            {
                question: "Sent crypto on wrong network or address.",
                answer: "Crypto transactions are usually irreversible. Always double-check before sending.",
            },
        ],
    },
];

export default function FaqPage() {
    const [activeCategory, setActiveCategory] = useState("general");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const currentCategory = faqData.find((c) => c.id === activeCategory)!;

    const handleCategoryChange = (id: string) => {
        setActiveCategory(id);
        setOpenIndex(null);
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 lg:px-0">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 border-b border-border pb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        Frequently Asked <span className="text-secondary">Questions</span>
                    </h1>
                    <p className="text-muted-foreground leading-relaxed max-w-3xl">
                        Find answers to common questions about TopUpIO.
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-4 mb-8">
                    {faqData.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryChange(cat.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium whitespace-nowrap shrink-0 ${
                                activeCategory === cat.id
                                    ? "bg-secondary text-white"
                                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ Accordion */}
                <div className="bg-card max-w-5xl mx-auto rounded-2xl border border-border p-4 sm:p-6 shadow-soft">
                    {/* Category Heading */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                            {currentCategory.icon}
                        </div>
                        <h2 className="text-lg font-bold text-foreground">{currentCategory.label}</h2>
                    </div>

                    {/* Accordion Items */}
                    <div className="divide-y divide-border">
                        {currentCategory.items.map((item, index) => (
                            <div key={index}>
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex justify-between items-center gap-4 p-4 rounded-xl hover:bg-muted text-left"
                                >
                                    <span className="text-sm font-medium text-foreground">{item.question}</span>
                                    <RiArrowDownSLine
                                        className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                            openIndex === index ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-200 ${
                                        openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                                    }`}
                                >
                                    <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                                        {Array.isArray(item.answer) ? (
                                            <ul className="list-disc pl-5 space-y-1">
                                                {item.answer.map((line, i) => (
                                                    <li key={i}>{line}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p>{item.answer}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
