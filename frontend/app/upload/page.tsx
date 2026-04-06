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
        title="Creator Tools Offer"
        description="A light sponsor option placed before the upload form so it never interrupts the actual submission flow."
        cta="Browse Tools"
        compact
      />

      <AdBanner
        title="Upload Page Banner"
        description="A secondary sponsor banner shown alongside the upload workflow for users who want another option."
        cta="Open Banner"
        href="/mystery-box"
        width={728}
        height={90}
        className="mx-auto max-w-[728px]"
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
