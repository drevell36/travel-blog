# Travel Blog

A SvelteKit travel blog with Cloudflare Pages, D1 database, and R2 storage.

## Features

- 📝 Blog posts with markdown editor & live preview
- 📷 Photo gallery with R2 storage
- 🧳 Trip organization
- 🏷️ Tags and categories
- 💬 Comments with moderation
- ❤️ Like system
- 🔍 Integrated search
- 📊 Analytics dashboard
- 🌙 Dark mode
- 📱 PWA support (installable app)
- 📰 RSS feed
- 🗺️ Sitemap for SEO
- 🗺️ Map integration (OpenStreetMap)
- 🎥 Video embeds (YouTube/Vimeo)

---

## Hosting on Cloudflare

### Prerequisites

1. [Cloudflare account](https://dash.cloudflare.com/sign-up)
2. [Node.js](https://nodejs.org/) (v18+)
3. [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

```bash
npm install -g wrangler
wrangler login
```

---

### Step 1: Create D1 Database

```bash
# Create the database
wrangler d1 create travel-blog-db

# You'll get output like:
# [[d1_databases]]
# binding = "DB"
# database_name = "travel-blog-db"
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

Update `wrangler.toml` with your database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "travel-blog-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

---

### Step 2: Create R2 Bucket

```bash
# Create the bucket for photo storage
wrangler r2 bucket create travel-blog-photos
```

The bucket is already configured in `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "PHOTOS_BUCKET"
bucket_name = "travel-blog-photos"
```

---

### Step 3: Run Database Migrations

```bash
# Run all migrations on remote database
wrangler d1 execute travel-blog-db --remote --file=migrations/0001_init.sql
wrangler d1 execute travel-blog-db --remote --file=migrations/0002_admin_user.sql
wrangler d1 execute travel-blog-db --remote --file=migrations/0003_features.sql
```

> ⚠️ **Important**: The default admin credentials are:
> - Username: `admin`
> - Password: `admin123`
> 
> **Change this immediately** after first login via `/admin/settings`.

---

### Step 4: Deploy to Cloudflare Pages

#### Option A: Via Git (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
3. Click **"Create a project"** → **"Connect to Git"**
4. Select your repository
5. Configure build settings:
   - **Framework preset**: SvelteKit
   - **Build command**: `npm run build`
   - **Build output directory**: `.svelte-kit/cloudflare`
6. Click **Deploy**

After deployment, add bindings:
1. Go to **Settings** → **Functions** → **D1 database bindings**
   - Variable name: `DB`
   - D1 database: `travel-blog-db`
2. Go to **Settings** → **Functions** → **R2 bucket bindings**
   - Variable name: `PHOTOS_BUCKET`
   - R2 bucket: `travel-blog-photos`
3. **Redeploy** for bindings to take effect

#### Option B: Direct Deploy via CLI

```bash
# Build the project
npm run build

# Deploy
wrangler pages deploy .svelte-kit/cloudflare --project-name=travel-blog
```

Then add bindings in the Cloudflare dashboard as described above.

---

### Step 5: Configure Custom Domain (Optional)

1. Go to Cloudflare Dashboard → Pages → your project
2. Click **"Custom domains"**
3. Add your domain (must be on Cloudflare DNS)
4. Cloudflare will automatically configure SSL

---

## Local Development

```bash
# Install dependencies
npm install

# Create local D1 database and run migrations
wrangler d1 execute travel-blog-db --local --file=migrations/0001_init.sql
wrangler d1 execute travel-blog-db --local --file=migrations/0002_admin_user.sql
wrangler d1 execute travel-blog-db --local --file=migrations/0003_features.sql

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

Login with `admin` / `admin123`

---

## Project Structure

```
├── migrations/           # D1 database migrations
│   ├── 0001_init.sql     # Users, sessions, posts, photos
│   ├── 0002_admin_user.sql # Default admin account
│   └── 0003_features.sql # Tags, trips, comments, etc.
├── src/
│   ├── lib/
│   │   ├── components/   # Svelte components
│   │   │   └── MarkdownEditor.svelte
│   │   └── server/
│   │       └── db.ts     # Database class
│   └── routes/
│       ├── admin/        # Admin dashboard
│       │   ├── posts/    # Post management
│       │   ├── photos/   # Photo management
│       │   ├── trips/    # Trip management
│       │   ├── tags/     # Tag management
│       │   ├── comments/ # Comment moderation
│       │   ├── analytics/# Stats dashboard
│       │   └── settings/ # Change password
│       ├── photos/       # Public photo gallery
│       ├── post/[slug]/  # Blog post pages
│       ├── search/       # Search results
│       ├── tag/[slug]/   # Posts by tag
│       ├── trip/[slug]/  # Trip detail
│       ├── trips/        # All trips
│       ├── rss.xml/      # RSS feed
│       └── sitemap.xml/  # XML sitemap
├── static/
│   ├── manifest.json     # PWA manifest
│   ├── sw.js             # Service worker
│   └── offline.html      # Offline page
├── wrangler.toml         # Cloudflare config
└── svelte.config.js      # SvelteKit config
```

---

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 runes
- **Hosting**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: Session cookies with bcrypt
- **Adapter**: `@sveltejs/adapter-cloudflare`

---

## Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard overview |
| `/admin/posts` | Manage blog posts |
| `/admin/posts/new` | Create new post |
| `/admin/photos` | Manage photos |
| `/admin/photos/upload` | Upload photos |
| `/admin/trips` | Manage trips |
| `/admin/tags` | Manage tags |
| `/admin/comments` | Moderate comments |
| `/admin/analytics` | View stats |
| `/admin/settings` | Change password |

---

## Troubleshooting

### "Database not found" error
Make sure you've run the migrations on the remote database:
```bash
wrangler d1 execute travel-blog-db --remote --file=migrations/0001_init.sql
```

### Photos not uploading
Ensure R2 bucket binding is configured in Cloudflare Dashboard:
- Settings → Functions → R2 bucket bindings
- Variable name must be `PHOTOS_BUCKET`

### Can't login
Reset the admin password by running:
```bash
wrangler d1 execute travel-blog-db --remote --file=migrations/0002_admin_user.sql
```
This resets credentials to `admin` / `admin123`.

### Bindings not working after deploy
After adding bindings in the dashboard, you must redeploy:
- Go to Deployments → click on latest → Retry deployment

---

## License

MIT
