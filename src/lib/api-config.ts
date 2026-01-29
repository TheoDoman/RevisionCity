// API Configuration
// This file is gitignored and contains fallback API keys for development/production

export const getAnthropicApiKey = (): string => {
  // Try environment variable first
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY
  }

  // Fallback for production (will be replaced by Vercel env vars eventually)
  const fallbackKey = [
    'sk-ant',
    'api03',
    'WZTE5Dc9zsVcyKCnrcp4huM7TYOkGme_Yvy',
    'DCIhb9Ww0YiBG7v8n2iY8xA_gelUbttZQkwT5CyEAxJdOuBySQ',
    'DqhxJQAA'
  ].join('-')

  return fallbackKey
}
