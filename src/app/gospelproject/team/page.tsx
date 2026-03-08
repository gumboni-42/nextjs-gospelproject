import { sanityFetch } from '@/sanity/fetch';
import { PortableText } from "next-sanity";
import { HeroSection } from "@/components/HeroSection";

const TEAM_QUERY = `{
  "members": *[_type == "teamMember" && isVisible != false] | order(order asc),
  "page": *[_id == "teamPage"][0]
}`;

export default async function TeamPage() {
    const data = await sanityFetch<{ members: any[]; page: any }>({ query: TEAM_QUERY, tags: ['teamMember', 'teamPage'] });
    const { members, page } = data;

    const sections = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        team: members.filter((m: any) => m.section === 'team'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        soloists: members.filter((m: any) => m.section === 'soloists'),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        band: members.filter((m: any) => m.section === 'band'),
    };

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