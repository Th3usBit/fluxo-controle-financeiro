import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // O projeto não versiona arquivos gerados para assistentes de IA.
  agentRules: false,
}

export default nextConfig
