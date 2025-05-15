import { NextResponse } from "next/server";
let logs: string[] = ["[2024-06-01] Admin login", "[2024-06-01] Reward distributed"];
export async function GET() { return NextResponse.json(logs); }
