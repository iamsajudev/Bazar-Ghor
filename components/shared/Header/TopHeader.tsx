import Link from "next/link";
import { PhoneCall, MapPin, ChevronDown, Globe, Sparkles } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

export const TopHeader = () => {
    return (
        <div className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-900 text-white text-xs py-2.5 border-b border-green-600/30 shadow-sm">
            <div className="container mx-auto px-4 flex justify-between items-center">

                {/* Left: Hotline & Announcement */}
                <div className="flex items-center gap-6">
                    <a
                        href="tel:09612338833"
                        className="flex items-center gap-2 hover:text-emerald-200 transition-colors duration-200 group"
                    >
                        <div className="bg-white/10 p-1.5 rounded-full group-hover:bg-white/20 transition-all">
                            <PhoneCall className="h-3.5 w-3.5 text-emerald-300 animate-pulse" />
                        </div>
                        <span className="font-medium tracking-wide">Hotline: <strong className="font-semibold">09612-338833</strong></span>
                    </a>

                    {/* Optional Announcement/Offer Banner (Hidden on mobile) */}
                    <div className="hidden md:flex items-center gap-1.5 text-emerald-100 bg-white/10 px-3 py-1 rounded-full text-[11px] backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 text-yellow-300" />
                        <span>Cashback on orders over 1000 TK!</span>
                    </div>
                </div>

                {/* Right: Links, Socials & Language */}
                <div className="flex items-center gap-5">
                    {/* Track Order */}
                    <Link
                        href="/track-order"
                        className="hover:text-emerald-200 flex items-center gap-1.5 transition-colors duration-200 font-medium"
                    >
                        <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                        <span>Track Order</span>
                    </Link>

                    <div className="h-3.5 w-[1px] bg-white/20 hidden sm:block" />

                    {/* Social Icons (Hidden on small mobile) */}
                    <div className="hidden sm:flex items-center gap-3">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-200 transition-colors">
                            <FaFacebook className="h-3.5 w-3.5" />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-200 transition-colors">
                            <FaInstagram className="h-3.5 w-3.5" />
                        </a>
                    </div>

                    <div className="h-3.5 w-[1px] bg-white/20 hidden sm:block" />

                    {/* Language Switcher Dropdown/Button */}
                    <div className="relative group cursor-pointer flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-md transition-all duration-200">
                        <Globe className="h-3.5 w-3.5 text-emerald-300" />
                        <span className="font-medium">English</span>
                        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full pt-1 w-24 bg-white text-gray-800 rounded-md shadow-lg py-1 hidden group-hover:block z-50 text-xs border border-gray-100">
                            <button className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors">English</button>
                            <button className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 hover:text-emerald-700 font-medium transition-colors">বাংলা</button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};