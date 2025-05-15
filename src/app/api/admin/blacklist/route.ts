import { NextRequest, NextResponse } from "next/server";
// Gunakan export default agar VS Code tidak error pada module route handler
const blacklist: string[] = [];

export async function GET() {
  return NextResponse.json(blacklist);
}

export async function POST(req: NextRequest) {
  const { wallet } = await req.json();
  if (wallet && typeof wallet === "string" && !blacklist.includes(wallet)) {
    blacklist.push(wallet);
  }
  return NextResponse.json(blacklist);
}

export default { GET, POST };
