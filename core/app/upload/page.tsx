import UploadForm from "@/components/UploadForm";
import SectionHeading from "@/components/SectionHeading";
import AdBanner from "@/components/AdBanner";
import AdNativeBanner from "@/components/AdNativeBanner";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Moderated community uploads"
        title="Upload a File"
        description="Submit digital resources with metadata, licensing, tags, and a preview image. The file enters a moderation queue before it becomes eligible for the mystery engine."
      />

      <UploadForm />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-7">
        <div className="mb-5 text-center space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">Sponsored</p>
          <p className="text-sm text-white/65">Support placements appear after the upload workflow to avoid interrupting the task.</p>
        </div>

        <div className="space-y-5">
          <AdNativeBanner />

          <div className="space-y-4">
            <AdBanner
              title="Upload Page Banner"
              description="Optional sponsor slot shown below the primary action area."
              width={320}
              height={50}
              className="mx-auto max-w-[320px] md:hidden"
            />
            <AdBanner
              title="Upload Page Banner"
              description="Optional sponsor slot shown below the primary action area."
              width={468}
              height={60}
              className="mx-auto hidden max-w-[468px] md:flex"
            />
          </div>

          <AdBanner
            width={300}
            height={250}
            className="mx-auto max-w-[300px]"
          />
        </div>
      </section>
    </div>
  );
}


