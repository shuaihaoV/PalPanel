import { NextRequest, NextResponse } from "next/server";
import { GetBanListAction } from "../actions/Actions";

async function handle(req: NextRequest) {
  const data = await GetBanListAction();
  const rows = data.message.split("\n");
  const result = [];
  for (let i = 1; i < rows.length; i++) {
    if (rows[i] === "") {
      continue;
    }
    const values = rows[i].split(",");
    result.push(`steam_${values[2]}`);
  }
  return new NextResponse(result.join("\n"), { status: 200, headers: { "content-type": "text/html; charset=UTF-8" } });
}

export const GET = handle;
export const POST = handle;
