import { NextRequest, NextResponse } from "next/server";
import { Pinecone, type AssistantModel } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  type HistoryItem = {
    role: "user" | "assistant";
    content: string;
    userId: string;
  };

  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const content = formData.get("content") as string;
    const userId = formData.get("userId") as string;

    if (!content) {
      return NextResponse.json(
        { error: "content is required" },
        {
          status: 400,
        }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_OR_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          error:
            "Supabase URL and Anon Key must be provided as environment variables.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 401 }
      );
    }

    console.log("Creating Pinecone client...");
    const pc = new Pinecone({
      apiKey: String(process.env.PINECONE_API_KEY),
    });

    const assistants = await pc.listAssistants();

    console.log("Creating assistant...");
    const assistantName = email.split("@")[0];

    const existingAssistant = assistants.assistants?.find(
      (a) => a.name === assistantName
    );

    if (!existingAssistant) {
      await pc.createAssistant({
        name: assistantName,
        instructions: "Use American English for spelling and grammar.",
      });
    }

    const assistant = pc.Assistant(assistantName);

    console.log("Getting conversation history...");
    const { data: historyData, error: historyError } = await supabase
      .from("chat_history")
      .select("role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (historyError) {
      console.error("Error fetching history:", historyError);
    }

    const history = historyData || [];
    console.log("History length:", history.length);

    console.log("Calling assistant chat...");
    const chatResp = await assistant.chat({
      messages: [...history, { role: "user", content: content }],
      model: "gpt-4o",
    });
    console.log("Chat response received");

    const assistantHistoryContent = chatResp.message?.content;

    if (assistantHistoryContent) {
      return NextResponse.json(chatResp);
    } else {
      return NextResponse.json(
        { error: "Assistant did not provide a response." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
