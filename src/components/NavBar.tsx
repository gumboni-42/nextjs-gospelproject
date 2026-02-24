"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';

export interface Route {
    title: string;
    path: string;
    children?: Route[];
}

interface NavBarProps {
    routes: Route[];
}

export function NavBar({ routes }: NavBarProps) {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-black/60 backdrop-blur-md shadow-md dark:bg-black/60"
                : "bg-black/80"
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/" className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        <CldImage
                            width="337"
                            height="26"
                            src="logo_gospelproject"
                            alt="Gospel Project Logo"
                            crop="fill"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {routes.map((route) => (
                            <div key={route.path} className="relative group">
                                {pathname === route.path ? (
                                    <span
                                        className="text-sm font-bold cursor-default"
                                        style={{ color: 'var(--gospel-primary)' }}
                                    >
                                        {route.title}
                                    </span>
                                ) : (
                                    <Link
                                        href={route.path}
                                        className="nav-bar-link text-sm font-bold transition-colors text-gray-700 dark:text-gray-200"
                                    >
                                        {route.title}
                                    </Link>
                                )}

                                {/* Dropdown */}
                                {route.children && route.children.length > 0 && (
                                    <div className="absolute left-0 -ml-5 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out transform translate-y-2 group-hover:translate-y-0">
                                        <div className="overflow-hidden rounded-xl bg-gray-900 shadow-xl ring-1 ring-white/10">
                                            <div className="p-1">
                                                {route.children.map((child) => (
                                                    <Link
                                                        key={child.path}
                                                        href={child.path}
                                                        className={`block rounded-lg px-4 py-2 text-sm !text-white hover:bg-gray-800 ${pathname === child.path && "bg-gray-800/60"
                                                            }`}
                                                    >
                                                        {child.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 dark:text-gray-200"
                    >
                        <span className="sr-only">Open menu</span>
                        {mobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 dark:bg-black/95 dark:border-white/10 dark:text-white">
                    <div className="space-y-1 p-4">
                        {routes.map((route) => (
                            <div key={route.path}>
                                <Link
                                    href={route.path}
                                    className="block rounded-lg px-4 py-2 text-base font-semibold hover:bg-gray-50 dark:hover:bg-white/5"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {route.title}
                                </Link>
                                {/* Mobile Submenu - simplified flat list for now */}
                                {route.children?.map((child) => (
                                    <Link
                                        key={child.path}
                                        href={child.path}
                                        className="block rounded-lg px-8 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-white/5"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {child.title}
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}
