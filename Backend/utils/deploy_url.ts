// set deployment url
export const deploymentUrl =
  process.env.VOTEBE_URL ||       // set this in env for custom url
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||       // Vercel
  process.env.URL ||              // Netlify (main domain)
  "http://localhost:3000";        // Local development fallback
