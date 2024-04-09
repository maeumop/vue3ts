import type { BooleanYN } from '@/types/common';

export interface JWT {
  exp: number
  iat: number
  iss: string
  memberUid: string
  memberEmail: string
  clientAccountMemberRelUid: string
  clientId: string
  ftpDomain: string
  authLevel: string
  mediaUids: string
  isSuper: BooleanYN
  accountStatus: string
}