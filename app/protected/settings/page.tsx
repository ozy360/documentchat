"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import { MoreHorizontal, ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isDeletingDocs, setIsDeletingDocs] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        setUserId(user.id);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleDeleteChat = async () => {
    toast.info("Demo mode: This action is disabled.");
    /*
    if (
      !confirm(
        "Are you sure you want to delete all chat history? This cannot be undone."
      )
    )
      return;

    setIsDeletingChat(true);
    const { error } = await supabase
      .from("chat_history")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to delete chat history");
      console.error(error);
    } else {
      toast.success("Chat history deleted");
    }
    setIsDeletingChat(false);
    */
  };

  const handleDeleteDocuments = async () => {
    if (
      !confirm(
        "Are you sure you want to delete all documents? This cannot be undone."
      )
    )
      return;

    setIsDeletingDocs(true);

    try {
      // First, get all files from storage
      const { data: files, error: listError } = await supabase.storage
        .from("documents")
        .list("uploaded_documents", {
          limit: 100,
          offset: 0,
        });

      if (listError) {
        toast.error("Failed to list documents");
        console.error(listError);
        setIsDeletingDocs(false);
        return;
      }

      // Filter out the placeholder file
      const actualFiles =
        files?.filter((file) => file.name !== ".emptyFolderPlaceholder") || [];

      if (actualFiles.length === 0) {
        toast.info("No documents to delete");
        setIsDeletingDocs(false);
        return;
      }

      // Delete each document from Pinecone via API
      const deletePromises = actualFiles.map(async (file) => {
        try {
          const response = await fetch("/api/delete", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              document: { id: file.id, name: file.name },
              email: email,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to delete ${file.name} from Pinecone`);
          }

          return { success: true, file: file.name };
        } catch (error) {
          console.error(`Error deleting ${file.name} from Pinecone:`, error);
          return { success: false, file: file.name, error };
        }
      });

      // Wait for all Pinecone deletions to complete
      const pineconeResults = await Promise.all(deletePromises);

      // Delete files from Supabase storage
      const filePaths = actualFiles.map(
        (file) => `uploaded_documents/${file.name}`
      );
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove(filePaths);

      if (storageError) {
        toast.error("Failed to delete documents from storage");
        console.error(storageError);
        setIsDeletingDocs(false);
        return;
      }

      // Check results
      const failedDeletions = pineconeResults.filter(
        (result) => !result.success
      );
      if (failedDeletions.length > 0) {
        toast.warning(
          `Some documents may not have been fully deleted from Pinecone: ${failedDeletions
            .map((r) => r.file)
            .join(", ")}`
        );
      } else {
        toast.success(
          `All ${actualFiles.length} documents deleted successfully`
        );
      }
    } catch (error) {
      toast.error("Failed to delete documents");
      console.error(error);
    }

    setIsDeletingDocs(false);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    toast.info("Demo mode: This action is disabled.");
    /*
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Incorrect current password");
      setIsChangingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsChangingPassword(false);
    */
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <MoreHorizontal className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4">
      <Toaster />
      <div className="flex items-center gap-4 mb-8">
        <Link href="/protected">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Profile</h2>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed"
            />
            <p className="text-sm text-muted-foreground">
              Your email address is managed by your identity provider and cannot
              be changed here.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Data Management</h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-medium">Clear Chat History</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your conversation history.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteChat}
                disabled={isDeletingChat}
              >
                {isDeletingChat ? (
                  <MoreHorizontal className="h-8 w-8 animate-pulse text-muted-foreground" />
                ) : (
                  "Delete Chat"
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h3 className="font-medium">Delete All Documents</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently remove all uploaded documents.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteDocuments}
                disabled={isDeletingDocs}
              >
                {isDeletingDocs ? (
                  <MoreHorizontal className="h-8 w-8 animate-pulse text-muted-foreground" />
                ) : (
                  "Delete Documents"
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Security</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={isChangingPassword || !newPassword}>
              {isChangingPassword ? (
                <MoreHorizontal className="h-8 w-8 animate-pulse text-muted-foreground" />
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
