import { NextRequest, NextResponse } from "next/server";
let vesting = { cliff: 30, duration: 90 };
export async function GET() { return NextResponse.json(vesting); }
export async function POST(req: NextRequest) { vesting = { ...vesting, ...(await req.json()) }; return NextResponse.json(vesting); }
