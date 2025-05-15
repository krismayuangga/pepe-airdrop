import { NextRequest, NextResponse } from "next/server";
let status = "active";
export async function GET() { return NextResponse.json({ status }); }
export async function POST(req: NextRequest) { status = (await req.json()).status; return NextResponse.json({ status }); }
