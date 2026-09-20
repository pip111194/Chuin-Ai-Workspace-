import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const messageId = formData.get("messageId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const textMimes = [
      "text/",
      "application/json",
      "application/javascript",
      "application/typescript",
      "application/xml",
      "application/x-yaml",
    ];
    const isText =
      textMimes.some((t) => file.type.startsWith(t)) ||
      file.name.match(/\.(txt|md|json|js|jsx|ts|tsx|css|html|xml|yaml|yml|csv|log|env|sh|py|java|go|rs|c|cpp|h|sql|toml|ini|conf)$/i);

    let content = "";
    if (isText) {
      content = await file.text();
      if (content.length > 100000) {
        content = content.slice(0, 100000) + "\n\n[TRUNCATED]";
      }
    } else {
      content = `[Binary file: ${file.name}, ${file.type}, ${file.size} bytes]`;
    }

    const attachment = await prisma.attachment.create({
      data: {
        messageId: messageId || null,
        name: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        content,
      },
    });

    return NextResponse.json(
      {
        attachment: {
          id: attachment.id,
          name: attachment.name,
          size: attachment.size,
          mimeType: attachment.mimeType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/attachments error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
