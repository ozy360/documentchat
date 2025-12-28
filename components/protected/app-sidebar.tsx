import { createClient } from "@/lib/supabase/server";
import LeftSection from "./left";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import SidebarFooter from "./sidebar-footer";
import { ScrollArea } from "../ui/scroll-area";
import DocumentList from "./document-list";

export default async function AppSidebar() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getClaims();

  // Fetch list of files from the 'documents' bucket
  const { data: files, error: filesError } = await supabase.storage
    .from("documents")
    .list("uploaded_documents", {
      limit: 100, // Adjust as needed
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    });

  if (filesError) {
    console.error("Error listing files:", filesError);
  }

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between h-full py-3 px-2">
        <SidebarGroup className="gap-y-4">
          <LeftSection />
          <SidebarGroupLabel className="!px-0">
            Your Documents
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <ScrollArea className="h-full">
              {files && files.length > 1 ? ( // Check for more than just the placeholder
                <DocumentList files={files} user={userData?.claims} />
              ) : (
                <p className="text-sm text-gray-500">
                  No documents uploaded yet.
                </p>
              )}
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarFooter email={userData?.claims.email} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
