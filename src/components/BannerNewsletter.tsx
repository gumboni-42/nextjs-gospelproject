import Link from "next/link";
import { sanityFetch } from "@/sanity/fetch";

const BANNER_QUERY = `*[_type == "newsletterBannerSettings"][0]`;

export default async function BannerNewsletter() {
    const data = await sanityFetch<{ text?: string }>({ 
        query: BANNER_QUERY, 
        tags: ['newsletterBannerSettings'] 
    });

    if (!data?.text) return null;

    return (
        <div className="w-full py-4 px-4 shadow-md" style={{ backgroundColor: 'var(--gospel-primary)' }}>
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <p className="text-white text-center font-medium m-0">
                    {data.text}
                </p>
                <Link 
                    href="/newsletter" 
                    className="inline-block py-2.5 px-6 bg-white text-primary hover:bg-gray-50 font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-[0.98] whitespace-nowrap"
                >
                    Zum Newsletter
                </Link>
            </div>
        </div>
    );
}
