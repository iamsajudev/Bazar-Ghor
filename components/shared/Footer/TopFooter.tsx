import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa";

const footerLinks = [
    {
        title: "Information",
        links: ["About us", "Contact us", "Company Information", "Ghorer Bazar Stories", "Terms & Conditions", "Privacy Policy", "Careers"],
    },
    {
        title: "Shop By",
        links: ["Oil & Ghee", "Honey", "Dates", "Spices", "Nuts & Seeds", "Beverage", "Functional Foods"],
    },
    {
        title: "Support",
        links: ["Support Center", "How to Order", "Order Tracking", "Payment", "Shipping", "FAQ"],
    },
    {
        title: "Consumer Policy",
        links: ["Happy Return", "Refund Policy", "Exchange", "Cancellation", "Pre-Order", "Extra Discount"],
    },
];

export const TopFooter = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 py-12">
            {/* Column 1: Logo & Contact Info (2 cols) */}
            <div className="lg:col-span-2">
                {/* লোগো */}
                <Link href="/" className="flex items-center shrink-0 group mb-4 inline-block">
                    <div className="relative h-12 w-36">
                        <Image
                            src="/images/logo-green.png"
                            alt="BazarGhor Logo"
                            fill
                            priority
                            className="object-contain object-left group-hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                </Link>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Ghorer Bazar is an e-commerce platform dedicated to providing safe and reliable food to every home.
                </p>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                        <span>Rampura, Dhaka, Bangladesh</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>+8809642922922</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>contact@ghorerbazar.com</span>
                    </div>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3 mt-6">
                    <a href="#" className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <FaFacebookF className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <FaTwitter className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-8 h-8 bg-orange-100 dark:bg-gray-800 text-orange-500 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors">
                        <FaInstagram className="h-4 w-4" />
                    </a>
                </div>

                {/* App Download */}
                <div className="mt-6">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Download App on Mobile :</h4>
                    <div className="flex gap-2">
                        {/* এখানে আপনার App Store ও Play Store এর ইমেজ বসাবেন */}
                        <div className="h-9 w-28 bg-black rounded flex items-center justify-center text-white text-[10px]">Google Play</div>
                        <div className="h-9 w-28 bg-black rounded flex items-center justify-center text-white text-[10px]">App Store</div>
                    </div>
                </div>
            </div>

            {/* Columns 2-5: Links */}
            {footerLinks.map((column) => (
                <div key={column.title}>
                    <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">{column.title}</h4>
                    <ul className="space-y-2.5">
                        {column.links.map((link) => (
                            <li key={link}>
                                <Link href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                                    {link}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};