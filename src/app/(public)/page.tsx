import { HomeEssence } from "@/components/public/home/home-essence";
import { HomeHero } from "@/components/public/home/home-hero";
import { HomeLocation } from "@/components/public/home/home-location";
import { HomeMoments } from "@/components/public/home/home-moments";
import { HomeOffer } from "@/components/public/home/home-offer";
import { HomeSpace } from "@/components/public/home/home-space";
import { HomeTeam } from "@/components/public/home/home-team";
import { LocalBusinessJsonLd } from "@/components/public/local-business-jsonld";
import { getSiteContent } from "@/features/institutional/queries";
import { getSiteSettings } from "@/features/settings/queries";
import { getTour } from "@/features/tour/queries";
import { getTrainings } from "@/features/trainings/queries";

export default async function HomePage() {
  const [settings, content, tour, trainings] = await Promise.all([
    getSiteSettings(),
    getSiteContent(),
    getTour(),
    getTrainings(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />
      <HomeHero heroPath={settings?.hero_media_path ?? null} content={content.home_hero} />
      <HomeEssence content={content} />
      <HomeMoments block={content.moments} />
      <HomeOffer content={content} />
      <HomeSpace tour={tour} />
      <HomeTeam trainings={trainings} />
      <HomeLocation settings={settings} />
    </>
  );
}
