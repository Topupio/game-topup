"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { adminNavOptions } from "@/data/navOptions";

interface AdminSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
    isMobileOpen: boolean;
    onMobileClose: () => void;
}

interface SidebarLinkProps {
    icon: ReactNode;
    label: string;
    to: string;
    isCollapsed: boolean;
    isMobile: boolean;
    end?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, setIsCollapsed, isMobileOpen, onMobileClose }) => {
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[60] md:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-72
                    bg-card shadow-lg border-r border-border
                    flex flex-col transition-all duration-300
                    z-[70]
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                    md:top-[85px] md:left-4
                    md:h-[calc(100vh-100px)]
                    md:rounded-2xl md:border md:border-border
                    md:z-50
                    ${isCollapsed ? "md:w-16" : "md:w-64"}
                `}
            >
                {/* Mobile header */}
                <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
                    <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground"
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                <div className="flex flex-col flex-1 overflow-y-auto px-3 py-6">
                    {!isCollapsed && (
                        <h2 className="hidden md:block text-xl font-semibold text-foreground mb-6 pl-2">
                            Dashboard
                        </h2>
                    )}

                    <nav className="flex flex-col space-y-2">
                        {adminNavOptions.map((item) => (
                            <SidebarLink
                                key={item.label}
                                icon={<item.icon size={20} />}
                                label={item.label}
                                to={item.to}
                                end={item.end}
                                isCollapsed={isCollapsed}
                                isMobile={isMobileOpen}
                            />
                        ))}
                    </nav>
                </div>

                {/* Desktop collapse toggle */}
                <button
                    onClick={toggleSidebar}
                    className="hidden md:flex p-4 border-t border-border hover:bg-muted rounded-b-2xl items-center justify-end text-muted-foreground"
                >
                    {isCollapsed ? <FaChevronRight size={18} /> : <FaChevronLeft size={18} />}
                </button>
            </aside>
        </>
    );
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
    icon,
    label,
    to,
    isCollapsed,
    isMobile,
    end,
}) => {
    const pathname = usePathname();
    const isActive = end ? pathname === to : pathname.startsWith(to);
    const showLabel = isMobile || !isCollapsed;

    return (
        <Link
            href={to}
            className={`
                group flex items-center w-full px-3 py-2 rounded-xl transition-all
                ${!showLabel ? "justify-center" : "space-x-3"}
                ${isActive ? "bg-[#eef6ff] text-[#0074cc] font-medium" : "text-muted-foreground hover:bg-muted"}
            `}
        >
            <span className={`${isActive ? "text-[#0074cc]" : "text-muted-foreground"}`}>
                {icon}
            </span>

            {showLabel && (
                <span className="text-sm whitespace-nowrap">{label}</span>
            )}

            {isActive && (
                <div className="absolute left-0 w-[4px] h-8 bg-[#0074cc] rounded-r-lg"></div>
            )}
        </Link>
    );
};

export default AdminSidebar;
