// Remove vercel-url import since we're not using it
const ACCOUNT_ID = process.env.ACCOUNT_ID;

// Update to use Netlify URL or fallback to local development URL
const PLUGIN_URL = process.env.NEXT_PUBLIC_DEPLOYMENT_URL || 'https://sleet-ai-hello.netlify.app' || `${process.env.NEXT_PUBLIC_HOST || 'localhost'}:${process.env.PORT || 3000}`;

if (!PLUGIN_URL) {
  console.error(
    "!!! Plugin URL not found in env, BITTE_CONFIG or DEPLOYMENT_URL !!!"
  );
  process.exit(1);
}

export { ACCOUNT_ID, PLUGIN_URL };
