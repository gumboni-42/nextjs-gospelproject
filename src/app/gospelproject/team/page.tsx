import { sanityFetch } from '@/sanity/fetch';
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";

const TEAM_QUERY = `{
  "sections": {
    "team": *[_type == "teamMember" && isVisible != false && section == "team"] | order(order asc),
    "soloists": *[_type == "teamMember" && isVisible != false && section == "soloists"] | order(order asc),
    "band": *[_type == "teamMember" && isVisible != false && section == "band"] | order(order asc)
  },
  "page": *[_id in ["teamPage", "drafts.teamPage"]][0]
}`;

export default async function TeamPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await sanityFetch<{ sections: Record<string, any[]>; page: any }>({ query: TEAM_QUERY, tags: ['teamMember', 'teamPage'] });
    const { sections, page } = data;

    return (
        <main className="min-h-screen">
            <HeroSection
                title={page?.title || "Unser Team"}
                image={page?.heroImage}
                logo={page?.logo}
            />
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <Section title="Solo" members={sections.soloists} />
                    <Section title="Band" members={sections.band} />
                    <Section title="Team" members={sections.team} />
                </div>
            </div>
        </main>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Section({ title, members }: { title: string, members: any[] }) {
    if (!members || members.length === 0) return null;

    return (
        <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-10">{title}</h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {members.map((member: any) => (
                    <div key={member._id} className="flex flex-col items-center">
                        {member.image && member.image.secure_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={member.image.secure_url}
                                alt={member.name}
                                className="w-128 aspect-[16/9] rounded-md object-cover shadow-lg"
                            />
                        )}
                        <h4 className="mt-6 text-lg font-semibold">{member.name}</h4>
                        <p className="text-sm font-medium">{member.role}</p>
                        <div className="mt-4 text-white max-w-xs">
                            {member.bio && <PortableText value={member.bio} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}