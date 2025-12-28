import { NextRequest, NextResponse } from "next/server";
import { Pinecone, type AssistantModel } from "@pinecone-database/pinecone";
import { writeFile } from "fs/promises";
import { join } from "path";
import * as fs from "fs/promises";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const files = formData.getAll("files");
    const new_email = String(email.split("@")[0]);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const tempDir = join(process.cwd(), "tmp");
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const assistantList = await pc.listAssistants();
    const assistants = assistantList.assistants || [];

    // Check if assistant already exists
    let assistantName: string;
    const existing = assistants.find(
      (a: AssistantModel) => a.name === new_email
    );

    if (!existing) {
      const newAssistant = await pc.createAssistant({
        name: new_email,
        instructions: "Document assistant for user files",
        region: "us",
      });
      assistantName = newAssistant.name;
    } else {
      assistantName = existing.name;
    }

    const assistant = pc.assistant(assistantName);
    const results = [];

    for (const file of files) {
      if (!(file instanceof File)) {
        continue;
      }

      try {
        const tempFilePath = join(tempDir, file.name);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(tempFilePath, buffer);

        console.log("Processing file:", file.name);

        await assistant.uploadFile({
          path: tempFilePath,
          metadata: {
            file_name: file.name,
            original_name: file.name,
          },
        });

        await fs.unlink(tempFilePath);

        results.push({
          file: file.name,
          status: "embedded",
        });
      } catch (fileError: any) {
        console.error(`Error processing file ${file.name}:`, fileError);
        results.push({
          file: file.name,
          status: "failed",
          error: fileError.message,
        });
      }
    }

    return NextResponse.json({
      message: "All files processed successfully!",
      results,
    });
  } catch (error: any) {
    console.error("Error uploading to Pinecone:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
