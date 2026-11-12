# Luna Platform: Production Deployment & Hosting Guide

This guide details the complete deployment and hosting architecture for the Luna multi-tenant platform.

---

## 1. System Architecture & Topology

```
                                  DNS: withluna.tech
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │ (*.withluna.tech /              │ (api.withluna.tech)             │
         │  app.withluna.tech)             │                                 │
         ▼                                 ▼                                 │
 ┌──────────────────────┐        ┌──────────────────────┐                    │
 │       NETLIFY        │        │        KOYEB         │                    │
 │   Next.js Frontend   │───────▶│   FastAPI Backend    │                    │
 │ (Edge Subdomain      │        │  (Python 3.12 ASGI)  │                    │
 │  Middleware Rewrite) │        └──────────┬───────────┘                    │
 └──────────────────────┘                   │                                │
                                            ├───────────────────────┐        │
                                            ▼                       ▼        ▼
                                 ┌──────────────────────┐ ┌──────────────────────┐
                                 │       UPSTASH        │ │        MODAL         │
                                 │   Serverless Redis   │ │    Serverless AI     │
                                 │  (Realtime Pub/Sub)  │ │ (Sentiment, Intent,  │
                                 │                      │ │  Qwen2.5-3B LLM)     │
                                 └──────────────────────┘ └──────────────────────┘
                                            │
                                            ▼
                                 ┌──────────────────────┐
                                 │    NEON / SUPABASE   │
                                 │ Serverless Postgres  │
                                 └──────────────────────┘

       [ FUTURE MIGRATION OPTION: Self-Host Backend + DB + Redis on Oracle Cloud VM ]
```

| Service | Component | Platform | Free Tier Specifications |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 15 App Router | **Netlify** | 100 GB bandwidth/mo, automatic SSL, Edge Middleware |
| **Backend API** | FastAPI + Uvicorn | **Koyeb** | Free Nano instance (512 MB RAM, 0.1 vCPU), auto TLS, zero sleep |
| **Realtime** | WebSocket Pub/Sub | **Upstash Redis** | 10,000 commands/day, Serverless TLS (`rediss://`) |
| **AI Engine** | DistilBERT, BART, Qwen-3B | **Modal** | \$30/month free compute credits, serverless GPU/CPU scale-to-zero |
| **Database** | PostgreSQL | **Neon / Supabase** | 0.5 GB storage, serverless connection pooling |
| **Domain** | Multi-tenant Subdomains | **withluna.tech** | Apex, `app.`, `api.`, and wildcard `*.withluna.tech` |

---

## 2. DNS & Subdomain Routing Configuration

The platform uses wildcard subdomain routing so every registered business automatically gets their own link (e.g. `hairbyfola.withluna.tech`) without creating individual DNS records.

In your DNS registrar (e.g., Namecheap, Cloudflare, Porkbun, or Google Domains) for **`withluna.tech`**, configure:

| Type | Host / Name | Value / Target | Purpose |
| :--- | :--- | :--- | :--- |
| **A** or **ALIAS** | `@` (apex) | Netlify load balancer IP (e.g. `75.2.60.5`) | Marketing homepage, `/pricing`, `/how-it-works` |
| **CNAME** | `www` | `withluna.netlify.app` | Redirects to apex |
| **CNAME** | `*` (wildcard) | `withluna.netlify.app` | **All tenant booking pages** (`{slug}.withluna.tech`) |
| **CNAME** | `app` | `withluna.netlify.app` | Platform staff app (rewrites to `/dashboard`) |
| **CNAME** | `api` | `<your-koyeb-app>.koyeb.app` | Public FastAPI backend endpoint |

### How Subdomain Routing Works in Code
The Next.js middleware at [frontend/src/middleware.ts](file:///Users/apple/Development/projects/luna/luna-web/luna-service/frontend/src/middleware.ts) inspects the incoming `Host` header:
- `hairbyfola.withluna.tech/` $\rightarrow$ Transparently rewrites to `/tenant/hairbyfola`
- `hairbyfola.withluna.tech/book-queue` $\rightarrow$ Rewrites to `/tenant/hairbyfola/book-queue`
- `hairbyfola.withluna.tech/staff/...` $\rightarrow$ Rewrites to `/tenant/hairbyfola/staff/...`
- `app.withluna.tech/` $\rightarrow$ Redirects to `/dashboard`
- `withluna.tech/` $\rightarrow$ Serves the landing homepage (`/page.tsx`)

---

## 3. Modal AI Deployment (Step-by-Step)

The unified AI service lives in [Modal/modal_app.py](file:///Users/apple/Development/projects/luna/luna-web/luna-service/Modal/modal_app.py). It runs:
- **Sentiment Analysis**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Zero-Shot Intent Classification**: `facebook/bart-large-mnli`
- **Generative Replies & Content Ideas**: `Qwen/Qwen2.5-3B-Instruct` (OpenAI-compatible `/v1/chat/completions`)
- **Model Weight Caching**: Modal Volume `luna-hf-cache` prevents re-downloading model weights on warm starts.

### Deployment Instructions:
1. **Create Account**: Sign up at [modal.com](https://modal.com).
2. **Install & Authenticate**:
   ```bash
   pip install modal
   modal setup
   ```
3. **Deploy the AI App**:
   ```bash
   cd /Users/apple/Development/projects/luna/luna-web/luna-service
   modal deploy Modal/modal_app.py
   ```
4. **Copy the Output URL**:
   Modal will display your public HTTPS URL, for example:
   ```
   Created web endpoint: https://<your-workspace>--luna-ai-api.modal.run
   ```
5. **Verify the Deployment**:
   ```bash
   curl https://<your-workspace>--luna-ai-api.modal.run/
   # Returns: {"status":"ok","service":"luna-ai"}

   curl -X POST https://<your-workspace>--luna-ai-api.modal.run/sentiment \
     -H "Content-Type: application/json" \
     -d '{"text": "I really love the quick queue booking experience!"}'
   # Returns: {"label":"POSITIVE","score":0.9998}
   ```

---

## 4. Upstash Redis Deployment (Step-by-Step)

Upstash provides serverless Redis with TLS support, ideal for low-cost queue and social studio pub/sub.

1. **Create Account**: Sign up at [upstash.com](https://upstash.com).
2. **Create Redis Database**:
   - Name: `luna-redis`
   - Region: Select the region nearest to your Koyeb deployment (e.g., `eu-central-1` Frankfurt or `us-east-1`).
   - Eviction: Disable (keep data persistent) or volatile-lru.
3. **Copy the Connection String**:
   - In the Upstash console under **Details** $\rightarrow$ **Connect**, select **aioredis / redis-py**.
   - Copy the `rediss://` URL:
     ```
     rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
     ```
   *(Note: The `rediss://` protocol indicates TLS. The backend [broker.py](file:///Users/apple/Development/projects/luna/luna-web/luna-service/backend/app/realtime/broker.py) is already configured to automatically handle Upstash TLS without CA certificate mismatch issues).*

---

## 5. PostgreSQL Database Setup

1. **Create Free Database**:
   - Create a free serverless PostgreSQL database at [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com).
2. **Copy the Connection String**:
   - Format:
     ```
     postgresql+asyncpg://<username>:<password>@<host>/<database>?ssl=require
     ```

---

## 6. Koyeb FastAPI Backend Deployment (Step-by-Step)

The backend runs the Dockerfile at [backend/Dockerfile](file:///Users/apple/Development/projects/luna/luna-web/luna-service/backend/Dockerfile).

### Method A: Via Koyeb Web Console
1. **Sign Up**: Register at [koyeb.com](https://koyeb.com).
2. **Create Service**:
   - Select **GitHub**.
   - Choose repository: `luna-service`.
   - Work directory: `backend`.
   - Builder: **Dockerfile** (uses `Dockerfile` in `backend/`).
   - Instance size: **Nano** (Free tier).
3. **Configure Ports & Health Check**:
   - Port: `8000` (Protocol: HTTP).
   - Health check path: `/health`.
4. **Set Environment Variables**:
   ```env
   ENVIRONMENT=production
   PORT=8000
   DATABASE_URL=postgresql+asyncpg://...
   REDIS_URL=rediss://default:...@...upstash.io:6379
   LUNA_MODAL_API_URL=https://<your-workspace>--luna-ai-api.modal.run
   BETTER_AUTH_SECRET=luna_secret_auth_key_2026_super_secure_multi_tenant
   ```
5. **Attach Custom Domain**:
   - In Koyeb Service Settings $\rightarrow$ **Domains**, add `api.withluna.tech`.
   - Koyeb will provide a CNAME record to add to your DNS.

---

## 7. Netlify Next.js Frontend Deployment (Step-by-Step)

The frontend uses [netlify.toml](file:///Users/apple/Development/projects/luna/luna-web/luna-service/netlify.toml) and Next.js 15.

1. **Sign Up**: Register at [netlify.com](https://netlify.com).
2. **Add New Site**:
   - Import from Git $\rightarrow$ Select `luna-service`.
   - Base directory: `frontend`.
   - Build command: `npm run build`.
   - Publish directory: `.next`.
3. **Set Environment Variables**:
   In Netlify **Site configuration** $\rightarrow$ **Environment variables**:
   ```env
   NEXT_PUBLIC_PLATFORM_DOMAIN=withluna.tech
   NEXT_PUBLIC_API_URL=https://api.withluna.tech
   BETTER_AUTH_URL=https://withluna.tech
   NEXT_PUBLIC_BETTER_AUTH_URL=https://withluna.tech
   BETTER_AUTH_SECRET=luna_secret_auth_key_2026_super_secure_multi_tenant
   NODE_VERSION=20
   ```
4. **Custom Domains**:
   - In **Domain management**, add primary domain: `withluna.tech`.
   - Add wildcard domain: `*.withluna.tech` (requires DNS verification or Netlify DNS).
   - Netlify will automatically issue Let's Encrypt wildcard certificates.

---

## 8. Future Migration: Self-Hosting on Oracle Cloud VM

When you are ready to switch the backend, database, and Redis to a dedicated Oracle Cloud Always Free VM while keeping the AI models on Modal, follow this runbook.

### Step 1: Provision Oracle Cloud Compute Instance
1. In the Oracle Cloud Console, navigate to **Compute** $\rightarrow$ **Instances** $\rightarrow$ **Create Instance**.
2. Select **Ampere A1** (Arm64, 2–4 OCPUs, 12–24 GB RAM) or AMD Compute.
3. Operating System: **Ubuntu 24.04 LTS**.
4. Assign a **Public IPv4 address**.
5. Save your SSH private key.

### Step 2: Configure Oracle Cloud Virtual Cloud Network (VCN) Ingress
1. Navigate to **Networking** $\rightarrow$ **Virtual Cloud Networks** $\rightarrow$ your VCN $\rightarrow$ **Default Security List**.
2. Add Ingress Rules:
   - Source: `0.0.0.0/0`, Protocol: `TCP`, Destination Port: `80` (HTTP)
   - Source: `0.0.0.0/0`, Protocol: `TCP`, Destination Port: `443` (HTTPS)

### Step 3: Server Setup & Docker Installation
SSH into your instance:
```bash
ssh -i /path/to/key ubuntu@<ORACLE_VM_PUBLIC_IP>
```

Install Docker and Docker Compose:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
newgrp docker
```

Allow firewall traffic in Ubuntu `iptables` / `ufw`:
```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Step 4: Deploy Luna Stack
1. Clone your repository:
   ```bash
   git clone https://github.com/<your-username>/luna-service.git
   cd luna-service
   ```
2. Create production `.env`:
   ```bash
   cat << 'EOF' > .env
   PLATFORM_DOMAIN=withluna.tech
   POSTGRES_USER=luna_user
   POSTGRES_PASSWORD=generate_a_secure_password_here
   POSTGRES_DB=luna_db
   BETTER_AUTH_SECRET=luna_secret_auth_key_2026_super_secure_multi_tenant
   LUNA_MODAL_API_URL=https://<your-workspace>--luna-ai-api.modal.run
   EOF
   ```
3. Launch services:
   ```bash
   docker compose up -d --build
   ```

### Step 5: Switch DNS
Update the DNS **A record** for `api.withluna.tech`:
- Host: `api`
- Type: `A`
- Value: `<ORACLE_VM_PUBLIC_IP>`

Caddy inside `docker-compose.yml` will automatically contact Let's Encrypt and obtain an SSL certificate for `api.withluna.tech`. The AI workload remains seamlessly offloaded to Modal.
