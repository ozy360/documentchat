"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, MoreHorizontal, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast, Toaster } from "sonner";

type FileObject = {
  id: string;
  name: string;
};

type DocumentListProps = {
  files: FileObject[];
  user: any;
};

export default function DocumentList({ files, user }: DocumentListProps) {
  const supabase = createClient();

  if (!user) {
    return null;
  }

  const assistantName = String(user.email).split("@")[0];

  const handleDownload = async (fileName: string) => {
    try {
      const filePath = `uploaded_documents/${fileName}`;
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 60); // 60 seconds expiry

      if (error) {
        console.error("Error creating signed URL:", error);
        toast.error("Failed to download file.");
        return;
      }

      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = data.signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started.");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file.");
    }
  };

  const handleDelete = async (file: FileObject) => {
    try {
      const filePath = `uploaded_documents/${file.name}`;
      const { error } = await supabase.storage
        .from("documents")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting file:", error);
        toast.error("Failed to delete file.");
        return;
      }

      const response = await fetch("/api/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document: file,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete from Pinecone");
      }

      toast.success("File deleted successfully.");
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file.");
    }
  };

  return (
    <>
      <Toaster />
      <ul className="space-y-6">
        {files
          .filter((file) => file.name !== ".emptyFolderPlaceholder")
          .map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300"
            >
              <span
                className="flex-grow hover:underline hover:cursor-pointer"
                title={file.name}
                onClick={() => {
                  if ((window as any).insertDocumentToPrompt) {
                    (window as any).insertDocumentToPrompt(file.name);
                  }
                }}
              >
                {file.name}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => handleDownload(file.name)}
                    className="cursor-pointer"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(file)}
                    className="text-red-500 focus:text-red-500"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
      </ul>
    </>
  );
}
