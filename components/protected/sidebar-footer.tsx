"use client";

import { LogoutButton } from "@/components/logout-button";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";

type SidebarFooterProps = {
  email?: string;
};

export default function SidebarFooter({ email }: SidebarFooterProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div>
      <p className="text-sm pb-3 pt-6">{email}</p>
      <div className="flex gap-x-2">
        <LogoutButton />
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/protected/settings")}
          className="cursor-pointer"
        >
          <Settings />
        </Button>
      </div>
    </div>
  );
}
