import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ username: null });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { username: true },
  });

  return NextResponse.json({ username: user?.username ?? null });
}
