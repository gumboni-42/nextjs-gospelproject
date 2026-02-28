import { client } from '@/sanity/client';
import { PortableText } from "next-sanity";
import Image from 'next/image';
import { urlFor } from '@/sanity/client';
import { HeroSection } from "@/components/HeroSection";

export default async function TeamPage() {
    // Fetch team members sorted by the 'order' field
    const data = await client.fetch(`{
      "members": *[_type == "teamMember"] | order(order asc),
      "page": *[_type == "teamPage"][0]
    }`);

    const { members, page } = data;

    const sections = {
        team: members.filter((m: any) => m.section === 'team'),
        soloists: members.filter((m: any) => m.section === 'soloists'),
        band: members.filter((m: any) => m.section === 'band'),
    };

    return (
        <main className="min-h-screen">
            <HeroSection
                title={page?.title || "Meet our Team"}
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

function Section({ title, members }: { title: string, members: any[] }) {
    if (!members || members.length === 0) return null;

    return (
        <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-10">{title}</h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
                {members.map((member: any) => (
                    <div key={member._id} className="flex flex-col items-center">
                        {member.image && (
                            <img
                                src={urlFor(member.image).width(400).height(400).url()}
                                alt={member.name}
                                className="h-48 w-48 rounded-full object-cover shadow-lg"
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