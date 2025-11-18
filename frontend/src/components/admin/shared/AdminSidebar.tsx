"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { adminNavOptions } from "@/data/navOptions";

interface AdminSidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

interface SidebarLinkProps {
    icon: ReactNode;
    label: string;
    to: string;
    isCollapsed: boolean;
    end?: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    return (
        <aside
            className={`
                fixed top-[85px] left-4 
                h-[calc(100vh-100px)] 
                bg-white shadow-lg border border-gray-200
                rounded-2xl flex flex-col transition-all duration-300 z-50
                ${isCollapsed ? "w-16" : "w-64"}
            `}
        >
            <div className="flex flex-col flex-1 overflow-y-auto px-3 py-6">
                {!isCollapsed && (
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 pl-2">
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
                        />
                    ))}
                </nav>
            </div>

            <button
                onClick={toggleSidebar}
                className="p-4 border-t border-gray-200 hover:bg-gray-100 rounded-b-2xl flex items-center justify-end text-gray-600"
            >
                {isCollapsed ? <FaChevronRight size={18} /> : <FaChevronLeft size={18} />}
            </button>
        </aside>
    );
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
    icon,
    label,
    to,
    isCollapsed,
    end,
}) => {
    const pathname = usePathname();
    const isActive = end ? pathname === to : pathname.startsWith(to);

    return (
        <Link
            href={to}
            className={`
                group flex items-center w-full px-3 py-2 rounded-xl transition-all
                ${isCollapsed ? "justify-center" : "space-x-3"} 
                ${isActive ? "bg-[#eef6ff] text-[#0074cc] font-medium" : "text-gray-600 hover:bg-gray-100"}
            `}
        >
            <span className={`${isActive ? "text-[#0074cc]" : "text-gray-500"}`}>
                {icon}
            </span>

            {!isCollapsed && (
                <span className="text-sm whitespace-nowrap">{label}</span>
            )}

            {isActive && (
                <div className="absolute left-0 w-[4px] h-8 bg-[#0074cc] rounded-r-lg"></div>
            )}
        </Link>
    );
};

export default AdminSidebar;
