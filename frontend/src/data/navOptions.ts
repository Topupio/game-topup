
import { type IconType } from "react-icons";
import { FaHome as Home, FaUsers as Users, FaFileAlt as FileText, FaCog as Settings } from "react-icons/fa";
import { TbMailSearch } from "react-icons/tb";

export type NavOption = {
    name: string;
    path: string;
    end?: boolean;
};

export type AdminNavOption = {
    label: string;
    to: string;
    icon: IconType;
    end?: boolean;
};

export const navOptions: NavOption[] = [
    {
        name: "Home",
        path: "/",
        end: true,
    },
    {
        name: "About Us",
        path: "/about",
    },
    {
        name: "Bookings",
        path: "/bookings",
    },
    {
        name: "Blog",
        path: "/blog",
    },
    {
        name: "Contact Us",
        path: "/contact",
    },
];

export const adminNavOptions: AdminNavOption[] = [
    { label: "Dashboard", to: "/admin", icon: Home, end: true },
    { label: "Team", to: "/admin/team", icon: Users },
    { label: "Inquiries", to: "/admin/inquiries", icon: TbMailSearch },
    { label: "Blog", to: "/admin/blog", icon: FileText },
    { label: "Settings", to: "/admin/settings", icon: Settings },
];