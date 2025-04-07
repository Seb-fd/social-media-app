"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function likePost(postId: string) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Not authenticated");

  await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
}

export async function unlikePost(postId: string) {
  const userId = await getDbUserId();
  if (!userId) throw new Error("Not authenticated");

  await prisma.like.deleteMany({
    where: {
      postId,
      userId,
    },
  });
}
