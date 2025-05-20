import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import Broadcast from "@/models/Broadcast";

export async function GET() {
  await connectDB();
  // Return 20 pesan broadcast terbaru untuk user
  const broadcasts = await Broadcast.find({}).sort({ createdAt: -1 }).limit(20);
  return NextResponse.json({ broadcasts });
}
