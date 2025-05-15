import { NextRequest, NextResponse } from "next/server";
let whitelist: string[] = [];
export async function GET() { return NextResponse.json(whitelist); }
export async function POST(req: NextRequest) { const { wallet } = await req.json(); if (!whitelist.includes(wallet)) whitelist.push(wallet); return NextResponse.json(whitelist); }
