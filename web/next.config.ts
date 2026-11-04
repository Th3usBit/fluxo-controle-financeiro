import type { NextConfig } from 'next'

/**
 * Build estático (GitHub Pages): NEXT_PUBLIC_MODO=local gera a pasta out/ e
 * BASE_PATH ajusta os caminhos para o subdiretório do repositório.
 */
const estatico = process.env.NEXT_PUBLIC_MODO === 'local'

const nextConfig: NextConfig = {
  // O projeto não versiona arquivos gerados para assistentes de IA.
  agentRules: false,
  ...(estatico
    ? {
        output: 'export',
        basePath: process.env.BASE_PATH ?? '',
        images: { unoptimized: true },
      }
    : {}),
}

export default nextConfig
