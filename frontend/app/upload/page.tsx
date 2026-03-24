import UploadForm from "@/components/UploadForm";
import SectionHeading from "@/components/SectionHeading";

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Moderated community uploads"
        title="Upload a File"
        description="Submit digital resources with metadata, licensing, tags, and a preview image. The file enters a moderation queue before it becomes eligible for the mystery engine."
      />
      <UploadForm />
    </div>
  );
}
