console.log(process.env);

export const DEFAULT_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_PROMPT ||
  "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown.";

export const OPENAI_API_HOST = process.env.OPENAI_API_HOST || 'https://api.openai.com';

export const DEFAULT_TEMPERATURE = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_TEMPERATURE || "1");

export const OPENAI_API_TYPE = process.env.OPENAI_API_TYPE || 'openai';

export const OPENAI_API_VERSION =
  process.env.OPENAI_API_VERSION || '2023-03-15-preview';

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION || '';

export const AZURE_DEPLOYMENT_ID = process.env.AZURE_DEPLOYMENT_ID || '';

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export const STRIPE_KEY = process.env.STRIPE_KEY || "";

export const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL || "";

export const SUPABASE_CLIENT_KEY = process.env.NEXT_PUBLIC_SUPABASE_CLIENT_KEY || "";

export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || "";
  
export const ENABLE_STRIPE: boolean = JSON.parse(process.env.ENABLE_STRIPE || "false");