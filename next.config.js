/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  webpack: (config, { isServer }) => {
    // Stub optional wallet peer deps that aren't installed
    const stubs = [
      '@web3auth/modal',
      '@web3auth/single-factor-auth',
      '@web3auth/base',
      '@web3auth/base-provider',
      '@web3auth/ethereum-provider',
      '@web3auth/openlogin-adapter',
      '@web3auth/solana-provider',
      '@magic-sdk/provider',
      'magic-sdk',
    ]
    stubs.forEach(pkg => {
      config.resolve.alias[pkg] = false
    })
    return config
  },
}

module.exports = nextConfig
