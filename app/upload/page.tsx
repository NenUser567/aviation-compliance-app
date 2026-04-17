import UploadDropzone from "@/components/upload-dropzone";

export default function UploadPage() {
  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Upload Licensing Documents</h1>
      <p className="text-muted-foreground mb-8">
        Upload aviation licensing documents for extraction and compliance review.
      </p>
      <UploadDropzone />
    </main>
  );
}