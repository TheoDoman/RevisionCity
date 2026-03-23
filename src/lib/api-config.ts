// API Configuration
// The Anthropic API key must be set via the ANTHROPIC_API_KEY environment variable.
// Never add hardcoded fallback keys here.

export const getAnthropicApiKey = (): string => {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }
  return key
}
