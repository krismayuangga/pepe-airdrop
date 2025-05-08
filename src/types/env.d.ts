declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test'
    NEXT_PUBLIC_SITE_URL: string
    NEXT_PUBLIC_STAKING_URL: string
    NEXT_PUBLIC_CHAIN_ID: string
  }
}
