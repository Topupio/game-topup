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
            className={`fixed top-[75px] left-0 h-[calc(100vh-70px)] flex flex-col ${
                isCollapsed ? "w-16" : "w-64"
            } bg-white border-r border-gray-300 transition-all duration-300 z-50`}
        >
            <div className="flex flex-col flex-1 overflow-y-auto">
                <div className="p-6">
                    {!isCollapsed && (
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Admin Panel
                        </h2>
                    )}
                    <nav className="flex flex-col space-y-3 text-gray-700">
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
            </div>

            <div
                className="p-4 border-t border-gray-300 hover:bg-gray-100 cursor-pointer transition mt-auto"
                onClick={toggleSidebar}
            >
                <div className="flex items-center space-x-2 text-gray-700">
                    {isCollapsed ? (
                        <FaChevronRight size={18} />
                    ) : (
                        <>
                            <FaChevronLeft size={18} />
                            <span className="text-sm">Collapse Sidebar</span>
                        </>
                    )}
                </div>
            </div>
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

    // Determine if active
    const isActive = end ? pathname === to : pathname.startsWith(to);

    const baseClasses =
        "flex items-center px-3 py-2 rounded-lg transition group";
    const layoutClasses = isCollapsed ? "justify-center" : "space-x-3";
    const activeClasses = "text-[#0074cc] font-semibold";
    const inactiveClasses = "text-gray-600 hover:bg-gray-100";

    return (
        <Link
            href={to}
            className={`${baseClasses} ${layoutClasses} ${
                isActive ? activeClasses : inactiveClasses
            }`}
        >
            <span className={isActive ? "text-[#0074cc]" : "text-gray-500"}>
                {icon}
            </span>

            {(!isCollapsed || isActive) && (
                <span className="text-sm truncate ml-3">{label}</span>
            )}
        </Link>
    );
};

export default AdminSidebar;