"use client";
import { SquarePlus } from "lucide-react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/dropzone";
import { useSupabaseUpload } from "@/hooks/use-supabase-upload";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect } from "react";

type LeftSectionProps = {
  email?: string;
};

export default function LeftSection({ email }: LeftSectionProps) {
  const props = useSupabaseUpload({
    bucketName: "documents",
    path: "uploaded_documents",
    allowedMimeTypes: [
      "application/pdf", // PDF (.pdf)
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX (.docx)
      "application/json", // JSON (.json)
      "text/markdown", // Markdown (.md)
      "text/plain", // Text (.txt)
    ],

    maxFiles: 2,
    maxFileSize: 1000 * 1000 * 10, // 10MB,
  });

  useEffect(() => {
    if (props.isSuccess) {
      const uploadedFiles = props.files.filter((file) =>
        props.successes.includes(file.name)
      );

      console.log("Files selected, uploading to API...", uploadedFiles);

      const embedDocuments = async () => {
        try {
          const formData = new FormData();
          uploadedFiles.forEach((file) => {
            formData.append("files", file);
          });

          formData.append("email", email || "");

          const res = await fetch("/api/embed", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          if (res.ok) {
            console.log("Embedding complete:", data);
          } else {
            console.error("Embedding failed:", data);
          }
        } catch (error) {
          console.error("Embedding error:", error);
        }
      };

      embedDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.isSuccess, props.files, props.successes, email]);

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"outline"}>
            <SquarePlus size={5} />
            Upload document
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload document file</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <Dropzone {...props} className="w-full h-fit">
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
        </DialogContent>
      </Dialog>
    </div>
  );
}
