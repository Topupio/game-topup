
import { type IconType } from "react-icons";
import { 
    FaHome, 
    FaUsers, 
    FaGamepad, 
    FaCogs,
    FaBoxOpen
} from "react-icons/fa";
import { MdPayment, MdHistory } from "react-icons/md";
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
        name: "Blog",
        path: "/blog",
    },
];

export const adminNavOptions = [
    {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: FaHome,
        end: true,
    },
    {
        label: "Users",
        to: "/admin/users",
        icon: FaUsers,
    },
    {
        label: "Games & Pricing",
        to: "/admin/games",
        icon: FaGamepad,
    },
    {
        label: "Products",
        to: "/admin/products",
        icon: FaBoxOpen,
    },
    {
        label: "Orders",
        to: "/admin/orders",
        icon: TbMailSearch,
    },
    {
        label: "Payments",
        to: "/admin/payments",
        icon: MdPayment,
    },
    {
        label: "Activity Logs",
        to: "/admin/logs",
        icon: MdHistory,
    },
    {
        label: "Settings",
        to: "/admin/settings",
        icon: FaCogs,
    },
];