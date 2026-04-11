"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { ThemeToggle } from "./ThemeToggle";

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
                ? "shadow-md backdrop-blur-md"
                : ""
                }`}
            style={{ backgroundColor: 'var(--nav-bg)' }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link href="/">
                        <CldImage
                            width="337"
                            height="26"
                            src="logo_gospelproject"
                            alt="Gospel Project Logo"
                            crop="fill"
                            className="block md:hidden lg:block pr-10"
                        />
                        <CldImage
                            width="26"
                            height="26"
                            src="the-g.svg"
                            alt="Gospel Project Icon"
                            crop="fill"
                            className="hidden md:block md:mx-10 lg:hidden"
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
                                        className="nav-bar-link text-sm font-bold transition-colors"
                                    >
                                        {route.title}
                                    </Link>
                                )}

                                {/* Dropdown — always dark */}
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
                        <ThemeToggle />
                    </nav>

                    {/* Mobile: Theme Toggle + Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 bg-transparent"
                            style={{ color: 'var(--nav-text)' }}
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
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden backdrop-blur-xl border-t"
                    style={{
                        backgroundColor: 'var(--mobile-menu-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--foreground)',
                    }}
                >
                    <div className="space-y-1 p-4">
                        {routes.map((route) => (
                            <div key={route.path}>
                                <Link
                                    href={route.path}
                                    className="block rounded-lg px-4 py-2 text-base font-semibold transition-colors"
                                    style={{ color: 'var(--foreground)' }}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {route.title}
                                </Link>
                                {/* Mobile Submenu - simplified flat list for now */}
                                {route.children?.map((child) => (
                                    <Link
                                        key={child.path}
                                        href={child.path}
                                        className="block rounded-lg px-8 py-2 text-sm transition-colors"
                                        style={{ color: 'var(--text-muted)' }}
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
