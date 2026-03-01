import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { HeroSection } from "@/components/HeroSection";
import { NewsBar } from "@/components/NewsBar";
import { FeatureSection } from "@/components/FeatureSection";

const HOME_QUERY = `*[_id == "homePage"][0]`;

export const metadata = {
  title: "Gospelproject - Home",
  description: "Willkommen beim Gospelproject.",
};

export default async function IndexPage() {
  const homeData = await client.fetch<SanityDocument>(HOME_QUERY);

  if (!homeData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4">Willkommen</h1>
          <p className="text-gray-600">Bitte konfiguriere die Startseite im Sanity Studio.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection image={homeData.heroImage} size="large" overlay={false} />

      {homeData.newsEnabled && <NewsBar items={homeData.newsItems} />}

      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full max-w-6xl mx-auto h-full items-stretch">
          <FeatureSection
            title={homeData.gospelprojectSection?.title}
            logo={homeData.gospelprojectSection?.logo}
            text={homeData.gospelprojectSection?.text}
            linkUrl={homeData.gospelprojectSection?.internalLink}
            linkText="Mehr zu Gospelproject"
          />
          <FeatureSection
            title={homeData.gospelationSection?.title}
            logo={homeData.gospelationSection?.logo}
            text={homeData.gospelationSection?.text}
            linkUrl={homeData.gospelationSection?.internalLink}
            linkText="Mehr zu Gospelation"
          />
        </div>
      </div>
    </main>
  );
}