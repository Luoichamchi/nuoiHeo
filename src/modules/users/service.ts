import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { Role } from "@/lib/domain";

type CreateUserInput = {
  userId: string;
  fullName: string;
  pin: string;
  role: Role;
  isActive: boolean;
};

type UpdateUserInput = {
  fullName?: string;
  pin?: string;
  role?: Role;
  isActive?: boolean;
};

export async function listUsers() {
  return db.user.findMany({
    orderBy: [{ role: "asc" }, { fullName: "asc" }],
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function createUser(input: CreateUserInput) {
  const pinHash = await bcrypt.hash(input.pin, 10);

  return db.user.create({
    data: {
      id: input.userId,
      fullName: input.fullName,
      pinHash,
      role: input.role,
      isActive: input.isActive
    },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const data: Prisma.UserUpdateInput = {};

  if (input.fullName !== undefined) data.fullName = input.fullName;
  if (input.pin !== undefined) data.pinHash = await bcrypt.hash(input.pin, 10);
  if (input.role !== undefined) data.role = input.role;
  if (input.isActive !== undefined) data.isActive = input.isActive;

  return db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true
    }
  });
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  return db.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      isActive: true
    }
  });
}

export async function deleteUser(userId: string) {
  return db.user.delete({
    where: { id: userId },
    select: {
      id: true,
      fullName: true
    }
  });
}
