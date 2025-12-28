import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RightSection from "@/components/protected/right";

import Layout from "@/components/protected/layout";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <Layout>
      <RightSection />
    </Layout>
  );
}
