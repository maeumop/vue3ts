import type { MemberClientDomainItem } from '@/types/api/memberAccountApi';
import type { ConstAuthKeys } from '@/types/common';

export interface ClientAccount {
  clientName: string
  clientId: string
  domains: MemberClientDomainItem[]
  authLevel: ConstAuthKeys
}
