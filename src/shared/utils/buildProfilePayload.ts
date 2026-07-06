import type { User } from '../../core/types/user';

type ProfileFields = Pick<User, 'name' | 'email' | 'phone' | 'cpf' | 'avatar'>;

// PUT /profile replaces the whole profile server-side — any field omitted from the body
// gets wiped (confirmed live: sending only `avatar` cleared name/email/phone/cpf, and the
// API requires name+email to be present at all). Always send the full record, merging in
// only the fields actually being changed.
export function buildProfilePayload(user: User | null, overrides: Partial<ProfileFields>): ProfileFields {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone,
    cpf: user?.cpf,
    avatar: user?.avatar,
    ...overrides,
  };
}
