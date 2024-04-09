import type { ProcessEnv } from '@/types/common';

const { VUE_APP_DOMAIN, VUE_APP_API_VERSION }: ProcessEnv = process.env;

/**
 * API URL 리턴
 * @returns
 */
export const getAPIUrl = () => {
  return `https://api.${VUE_APP_DOMAIN}/${VUE_APP_API_VERSION}`;
};
