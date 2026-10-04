import type { users } from '../../../database/schema.js';

type UserRow = typeof users.$inferSelect;

export type UserDto = {
  id: string;
  email: string;
  name: string;
  status: UserRow['status'];
  lastLoginAt: string | null;
  createdAt: string;
};

export type UserListDto = { users: UserDto[] };

/** Explicit mapping: the password hash and lockout counters never leave the API. */
export function toUserDto(user: Pick<UserRow, 'id' | 'email' | 'name' | 'status' | 'lastLoginAt' | 'createdAt'>): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    status: user.status,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
