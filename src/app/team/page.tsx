import { client } from '@/sanity/client';
import { PortableText } from "next-sanity";
import Image from 'next/image';
import { urlFor } from '@/sanity/client';

export default async function TeamPage() {
    // Fetch team members sorted by the 'order' field
    const members = await client.fetch(`*[_type == "teamMember"] | order(order asc)`);

    const sections = {
        team: members.filter((m: any) => m.section === 'team'),
        soloists: members.filter((m: any) => m.section === 'soloists'),
        band: members.filter((m: any) => m.section === 'band'),
    };

    return (
        <div className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4">
                <Section title="Meet our Team" members={sections.team} />
                <Section title="Soloists" members={sections.soloists} />
                <Section title="The Band" members={sections.band} />
            </div>
        </div>
    );
}

function Section({ title, members }: { title: string, members: any[] }) {
    if (!members || members.length === 0) return null;

    return (
        <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-10">{title}</h2>
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((member: any) => (
                    <div key={member._id} className="flex flex-col items-center">
                        {member.image && (
                            <img
                                src={urlFor(member.image).width(400).height(400).url()}
                                alt={member.name}
                                className="h-48 w-48 rounded-full object-cover shadow-lg"
                            />
                        )}
                        <h3 className="mt-6 text-lg font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-indigo-600 font-medium">{member.role}</p>
                        <div className="mt-4 text-gray-500 max-w-xs">
                            {member.bio && <PortableText value={member.bio} />}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}