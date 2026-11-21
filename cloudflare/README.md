# AFRICA AWAKE AI — Cloudflare Worker

This Worker powers the AFRICA AWAKE MEDIA website chat widget using Cloudflare Workers AI. It does not need an OpenAI API key.

## 1. Create the Worker

1. Sign in to https://dash.cloudflare.com/
2. Open **Workers & Pages**.
3. Select **Create application** → **Create Worker**.
4. Name it `africa-awake-ai` and deploy the starter Worker.
5. Open the new Worker → **Edit Code**.
6. Replace the starter code with the contents of `worker.js` in this folder, then **Deploy**.

## 2. Add the Workers AI binding

1. Open the Worker → **Settings** → **Bindings**.
2. Add a binding of type **Workers AI**.
3. Set the variable name to exactly `AI`.
4. Save and deploy.

## 3. Connect the website

1. Copy the Worker's public `workers.dev` URL, for example `https://africa-awake-ai.YOUR-SUBDOMAIN.workers.dev`.
2. In this GitHub repository, open `chatbot.js`.
3. Replace `PASTE_CLOUDFLARE_WORKER_URL_HERE` with that URL (keep the quotation marks).
4. Commit the change. GitHub Pages will publish the updated site.

## Notes

- The Worker only accepts browser requests from `https://africaawakemedia.github.io`.
- The Workers AI binding keeps provider credentials out of browser code; no OpenAI API key is required.
- Cloudflare account eligibility, model availability, and usage limits/pricing are controlled by Cloudflare. Check the Workers AI pricing page before making the widget public.
- Add Cloudflare rate limiting/WAF rules before wide public promotion to reduce abuse and unexpected usage.
