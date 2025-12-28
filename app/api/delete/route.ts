import { NextRequest, NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req: NextRequest) {
  try {
    const { document, email } = await req.json();

    if (!document || !email) {
      return NextResponse.json(
        { error: "document and email are required" },
        { status: 400 }
      );
    }

    const assistantName = String(email).split("@")[0];
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const assistant = pc.Assistant(assistantName);

    await assistant.deleteFile(document.name);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file from Pinecone:", error);
    return NextResponse.json(
      { error: "Failed to delete file from Pinecone" },
      { status: 500 }
    );
  }
}
