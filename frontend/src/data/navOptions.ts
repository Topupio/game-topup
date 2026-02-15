
import { type IconType } from "react-icons";
import {
    FaHome,
    FaUsers,
    FaGamepad,
    FaCogs,
    FaImage,
    FaNewspaper,
} from "react-icons/fa";
import { MdPayment, MdHistory } from "react-icons/md";
import { TbMailSearch, TbTemplate } from "react-icons/tb";

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
        label: "Banners",
        to: "/admin/banners",
        icon: FaImage,
    },
    {
        label: "Games",
        to: "/admin/games",
        icon: FaGamepad,
    },
    {
        label: "Checkout Templates",
        to: "/admin/checkout-templates",
        icon: TbTemplate,
    },
    {
        label: "Blogs",
        to: "/admin/blogs",
        icon: FaNewspaper, // 📰 blog icon
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