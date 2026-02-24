"use client";

import { RiArrowDownSLine } from "react-icons/ri";

const COUNTRY_CODES = [
    { code: "+63", flag: "🇵🇭", label: "PH" },
    { code: "+91", flag: "🇮🇳", label: "IN" },
    { code: "+1", flag: "🇺🇸", label: "US" },
    { code: "+55", flag: "🇧🇷", label: "BR" },
    { code: "+62", flag: "🇮🇩", label: "ID" },
    { code: "+44", flag: "🇬🇧", label: "GB" },
    { code: "+971", flag: "🇦🇪", label: "AE" },
    { code: "+966", flag: "🇸🇦", label: "SA" },
    { code: "+60", flag: "🇲🇾", label: "MY" },
    { code: "+65", flag: "🇸🇬", label: "SG" },
    { code: "+81", flag: "🇯🇵", label: "JP" },
    { code: "+82", flag: "🇰🇷", label: "KR" },
    { code: "+86", flag: "🇨🇳", label: "CN" },
    { code: "+49", flag: "🇩🇪", label: "DE" },
    { code: "+33", flag: "🇫🇷", label: "FR" },
    { code: "+234", flag: "🇳🇬", label: "NG" },
    { code: "+20", flag: "🇪🇬", label: "EG" },
    { code: "+92", flag: "🇵🇰", label: "PK" },
    { code: "+880", flag: "🇧🇩", label: "BD" },
    { code: "+84", flag: "🇻🇳", label: "VN" },
    { code: "+66", flag: "🇹🇭", label: "TH" },
    { code: "+90", flag: "🇹🇷", label: "TR" },
    { code: "+7", flag: "🇷🇺", label: "RU" },
    { code: "+52", flag: "🇲🇽", label: "MX" },
];

function parsePhoneValue(fullValue: string): { countryCode: string; number: string } {
    if (!fullValue) return { countryCode: "+63", number: "" };

    // Try matching known country codes (longest first)
    const sorted = [...COUNTRY_CODES].sort((a, b) => b.code.length - a.code.length);
    for (const cc of sorted) {
        if (fullValue.startsWith(cc.code)) {
            return { countryCode: cc.code, number: fullValue.slice(cc.code.length) };
        }
    }

    return { countryCode: "+63", number: fullValue };
}

interface PhoneInputProps {
    value: string;
    onChange: (fullValue: string) => void;
    placeholder?: string;
    hasError?: boolean;
    size?: "default" | "mobile";
}

export default function PhoneInput({
    value,
    onChange,
    placeholder = "Enter phone number",
    hasError = false,
    size = "default",
}: PhoneInputProps) {
    const { countryCode, number } = parsePhoneValue(value);

    const handleCodeChange = (newCode: string) => {
        onChange(newCode + number);
    };

    const handleNumberChange = (newNumber: string) => {
        onChange(countryCode + newNumber);
    };

    const borderClass = hasError
        ? "border-red-500"
        : "border-border focus-within:border-secondary";

    const py = size === "mobile" ? "py-2.5" : "py-2";
    const textSize = size === "mobile" ? "text-sm" : "";

    return (
        <div
            className={`flex bg-input border rounded-xl transition-all focus-within:ring-2 focus-within:ring-ring/30 ${borderClass}`}
        >
            {/* Country code selector */}
            <div className="relative shrink-0">
                <select
                    value={countryCode}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className={`appearance-none bg-transparent ${py} pl-3 pr-7 text-foreground ${textSize} focus:outline-none cursor-pointer border-r border-border`}
                >
                    {COUNTRY_CODES.map((cc) => (
                        <option key={cc.code} value={cc.code} className="text-black">
                            {cc.flag} {cc.code}
                        </option>
                    ))}
                </select>
                <RiArrowDownSLine className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
            </div>

            {/* Phone number input */}
            <input
                type="tel"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder={placeholder}
                className={`flex-1 bg-transparent ${py} px-3 text-foreground ${textSize} placeholder-muted-foreground focus:outline-none min-w-0`}
            />
        </div>
    );
}
