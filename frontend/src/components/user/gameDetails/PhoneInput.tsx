"use client";

import {
    COUNTRY_CODES,
    COUNTRY_CODES_BY_LENGTH,
    DEFAULT_COUNTRY_CODE,
} from "@/lib/constants/countryCallingCodes";
import { useEffect, useRef, useState } from "react";
import { RiArrowDownSLine, RiSearchLine } from "react-icons/ri";

const REGION_NAME_FORMATTER = new Intl.DisplayNames(["en"], { type: "region" });

function getRegionName(regionCode: string) {
    try {
        return REGION_NAME_FORMATTER.of(regionCode) || regionCode;
    } catch {
        return regionCode;
    }
}

function getCountryName(label: string) {
    return label.split("/").map(getRegionName).join(" / ");
}

function getCountrySearchValue(country: { code: string; label: string }) {
    return `${country.code} ${country.label} ${getCountryName(country.label)}`.toLowerCase();
}

function parsePhoneValue(fullValue: string): { countryCode: string; number: string } {
    if (!fullValue) return { countryCode: DEFAULT_COUNTRY_CODE, number: "" };

    // Try matching known country codes (longest first).
    for (const cc of COUNTRY_CODES_BY_LENGTH) {
        if (fullValue.startsWith(cc.code)) {
            return { countryCode: cc.code, number: fullValue.slice(cc.code.length) };
        }
    }

    return { countryCode: DEFAULT_COUNTRY_CODE, number: fullValue };
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
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const { countryCode, number } = parsePhoneValue(value);
    const selectedCountry = COUNTRY_CODES.find((cc) => cc.code === countryCode) || COUNTRY_CODES[0];
    const normalizedQuery = query.trim().toLowerCase();

    const filteredCountries = normalizedQuery
        ? COUNTRY_CODES.filter((country) =>
            getCountrySearchValue(country).includes(normalizedQuery)
        )
        : COUNTRY_CODES;

    useEffect(() => {
        if (!isOpen) return;

        searchInputRef.current?.focus();

        const handlePointerDown = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    const handleCodeChange = (newCode: string) => {
        onChange(newCode + number);
        setIsOpen(false);
        setQuery("");
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
            ref={wrapperRef}
            className={`flex bg-input border rounded-xl transition-all focus-within:ring-2 focus-within:ring-ring/30 ${borderClass}`}
        >
            <div className="relative shrink-0">
                <button
                    type="button"
                    onClick={() => setIsOpen((open) => !open)}
                    aria-label="Country calling code"
                    aria-expanded={isOpen}
                    className={`flex items-center gap-1 bg-transparent ${py} pl-3 pr-7 w-[7.25rem] text-foreground ${textSize} focus:outline-none cursor-pointer border-r border-border`}
                >
                    <span className="truncate">
                        {selectedCountry.flag} {selectedCountry.code}
                    </span>
                </button>
                <RiArrowDownSLine
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    size={14}
                />

                {isOpen && (
                    <div className="absolute left-0 top-[calc(100%+0.25rem)] z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-card shadow-xl">
                        <div className="p-2 border-b border-border">
                            <div className="relative">
                                <RiSearchLine
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                                    size={14}
                                />
                                <input
                                    ref={searchInputRef}
                                    type="search"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search country or code"
                                    aria-label="Search country calling code"
                                    className="w-full rounded-lg bg-input border border-border py-2 pl-8 pr-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-secondary focus:ring-2 focus:ring-ring/30"
                                />
                            </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto py-1">
                            {filteredCountries.length > 0 ? (
                                filteredCountries.map((country) => {
                                    const isSelected = country.code === countryCode;
                                    const countryName = getCountryName(country.label);

                                    return (
                                        <button
                                            key={`${country.label}-${country.code}`}
                                            type="button"
                                            aria-label={`Select ${countryName} ${country.code}${isSelected ? ", selected" : ""}`}
                                            onClick={() => handleCodeChange(country.code)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted transition-colors ${
                                                isSelected ? "bg-muted text-secondary" : "text-foreground"
                                            }`}
                                        >
                                            <span className="text-base shrink-0">{country.flag}</span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate font-medium">
                                                    {countryName}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">
                                                    {country.label} {country.code}
                                                </span>
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <p className="px-3 py-4 text-sm text-muted-foreground">
                                    No country codes found.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <input
                type="tel"
                value={number}
                onChange={(e) => handleNumberChange(e.target.value)}
                onFocus={() => setIsOpen(false)}
                placeholder={placeholder}
                aria-label={placeholder}
                className={`flex-1 bg-transparent ${py} px-3 text-foreground ${textSize} placeholder-muted-foreground focus:outline-none min-w-0`}
            />
        </div>
    );
}
