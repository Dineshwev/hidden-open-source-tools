import UploadForm from "@/components/UploadForm";
import SectionHeading from "@/components/SectionHeading";
import AdSmartlinkSlot from "@/components/AdSmartlinkSlot";
import AdBanner from "@/components/AdBanner";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Moderated community uploads"
        title="Upload a File"
        description="Submit digital resources with metadata, licensing, tags, and a preview image. The file enters a moderation queue before it becomes eligible for the mystery engine."
      />
      <AdSmartlinkSlot
        title="Creator Partner Offer"
        description="Discover tools and offers for creators while your upload workflow stays free."
        cta="Explore Offer"
        compact
      />

      <AdBanner
        width={300}
        height={250}
        className="mx-auto max-w-[300px]"
      />

      <UploadForm />
    </div>
  );
}
