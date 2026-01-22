"use client";

interface NewsBarProps {
    items: string[];
}

export function NewsBar({ items }: NewsBarProps) {
    if (!items || items.length === 0) return null;

    return (
        <div className="w-full bg-purple-900 text-white overflow-hidden py-3">
            <div className="animate-marquee whitespace-nowrap flex gap-12 px-4 shadow-sm">
                {/* Duplicate items for infinite scroll illusion if needed, or simple map */}
                {items.map((item, index) => (
                    <span key={index} className="text-lg font-medium inline-block mx-8">
                        • {item}
                    </span>
                ))}
                {items.map((item, index) => (
                    <span key={`dup-${index}`} className="text-lg font-medium inline-block mx-8" aria-hidden="true">
                        • {item}
                    </span>
                ))}
            </div>
            <style jsx>{`
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    );
}
