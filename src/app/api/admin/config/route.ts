import { NextRequest, NextResponse } from "next/server";

let config = {
  airdropStart: "",
  airdropEnd: "",
  rewardPerReferral: 20,
  rewardPerCheckin: 10,
  tokenPerUsd: 1000,
};

export async function GET() {
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  config = { ...config, ...(await req.json()) };
  return NextResponse.json(config);
}
