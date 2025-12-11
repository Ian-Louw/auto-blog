# Frontend - AutoBlog

Next.js frontend with Tailwind CSS for the AutoBlog AI-powered content platform.

## Tech Stack

- **Next.js 14** (Pages Router)
- **React 18**
- **Tailwind CSS** - Utility-first styling
- **SWR** - Data fetching and caching

## Features

- **Modern UI Design** - Custom Tailwind CSS with professional color palette
- **Responsive Layout** - Mobile, tablet, and desktop optimized
- **Real-time Updates** - Auto-refreshes articles every 5 seconds
- **Loading States** - Smooth loading spinners and error handling
- **Article Cards** - Gradient cards with hover effects
- **SEO Friendly** - Proper meta tags and semantic HTML

## Color Palette

The UI uses a custom color scheme defined in `tailwind.config.js`:

```javascript
colors: {
  'charcoal': '#424143',  // Primary text and dark elements
  'stone': '#9d9486',     // Secondary text
  'gold': '#eac37e',      // Accents and CTAs
  'cream': '#e4dac8',     // Subtle backgrounds
  'sage': '#dde3df',      // Page background
  'white': '#ffffff',     // Cards and content
}
```

## Project Structure

```
frontend/
├── pages/
│   ├── _app.js              # Global app wrapper (imports Tailwind)
│   ├── index.js             # Homepage - article list
│   └── articles/[id].js     # Article detail page
│
├── components/
│   ├── Header.js            # Navigation header with logo
│   ├── Layout.js            # Page layout wrapper with footer
│   ├── ArticleCard.js       # Article display card component
│   └── Loading.js           # Loading spinner component
│
├── styles/
│   └── globals.css          # Tailwind directives + custom styles
│
├── public/
│   └── .gitkeep             # Placeholder for static assets
│
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── next.config.js           # Next.js configuration
├── Dockerfile               # Multi-stage production build
└── package.json
```

## Pages

### Homepage (`/`)

**Features:**
- Hero section with title and description
- Article list with cards
- Loading state
- Error handling
- "How It Works" info box

**Components Used:**
- `Layout` - Page wrapper
- `ArticleCard` - Individual article display
- `Loading` - Loading spinner

### Article Detail (`/articles/[id]`)

**Features:**
- Gradient header with title
- Full article content
- Publication date
- Back navigation
- Responsive design

## Components

### Header

```javascript
<Header />
```

Navigation bar with:
- Logo (book icon + "AutoBlog")
- Navigation links
- Responsive design

### Layout

```javascript
<Layout>
  {children}
</Layout>
```

Wraps all pages with:
- Header component
- Main content area
- Footer with copyright

### ArticleCard

```javascript
<ArticleCard article={article} />
```

Displays article with:
- Title
- Content preview
- Publication date
- "AI Generated" badge
- Hover effects

### Loading

```javascript
<Loading />
```

Centered loading spinner with "Loading articles..." text.

## Development

### Install Dependencies

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

**Important:** `NEXT_PUBLIC_` prefix makes it available in the browser.

### Run Development Server

```bash
npm run dev
```

Runs on http://localhost:3000 with hot reload.

### Build for Production

```bash
npm run build
npm start
```

## Docker

### Build Image

The Dockerfile uses a multi-stage build for optimization:

```dockerfile
# Stage 1: Builder
- Install dependencies
- Copy source files
- Build Next.js app (static optimization)

# Stage 2: Runner
- Copy built files
- Install production dependencies only
- Expose port 3000
- Start Next.js server
```

**Build:**

```bash
docker build -t auto-blog-frontend .
```

**Build with API URL:**

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE=http://<YOUR_EC2_IP>:4000 \
  -t auto-blog-frontend .
```

**Run:**

```bash
docker run -p 3000:3000 auto-blog-frontend
```

## API Integration

### Endpoints Used

**GET `/articles`**
- Fetches all articles
- Auto-refreshes every 5 seconds using SWR
- Ordered by newest first

**GET `/articles/:id`**
- Fetches single article by ID
- Used on detail page

### SWR Configuration

```javascript
const { data, error } = useSWR(
  `${base}/articles`,
  fetcher,
  { refreshInterval: 5000 }
);
```

Benefits:
- Automatic revalidation
- Caching
- Optimistic UI updates
- Error handling

## Tailwind CSS

### Global Styles

`styles/globals.css` includes:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-sage text-charcoal;
  }
}

@layer components {
  .btn-primary { /* Custom button styles */ }
  .card { /* Card styles */ }
  .article-card { /* Article card styles */ }
}
```

### Custom Classes

- `.btn-primary` - Primary button style
- `.card` - White card with shadow
- `.article-card` - Article display card with left border

### Responsive Design

Uses Tailwind's responsive prefixes:

```javascript
className="text-sm md:text-base lg:text-lg"
```

Breakpoints:
- `sm:` 640px+
- `md:` 768px+
- `lg:` 1024px+
- `xl:` 1280px+

## Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'primary': '#your-color',
  'secondary': '#your-color',
}
```

### Add Components

Create in `components/` directory:

```javascript
// components/MyComponent.js
export default function MyComponent() {
  return <div>...</div>;
}
```

Import in pages:

```javascript
import MyComponent from '../components/MyComponent';
```

### Modify Layout

Edit `components/Layout.js` to change:
- Header
- Footer
- Page wrapper styles

## Performance

### Optimizations Applied

1. **Static Generation** - Pages pre-rendered at build time
2. **Image Optimization** - Next.js automatic image optimization
3. **Code Splitting** - Automatic route-based splitting
4. **SWR Caching** - Client-side data caching
5. **Tailwind Purging** - Unused CSS removed in production

### Bundle Size

```
Route (pages)                             Size     First Load JS
┌ ○ /                                     5.48 kB        87.9 kB
├   /_app                                 0 B            79.9 kB
├ ○ /404                                  180 B          80.1 kB
└ ○ /articles/[id]                        640 B            83 kB
```

## Troubleshooting

### Frontend Shows "Loading..."

1. Check backend is running:
   ```bash
   curl http://localhost:4000/articles
   ```

2. Verify `NEXT_PUBLIC_API_BASE` is correct

3. Check browser console for errors

### Styles Not Applying

1. Restart dev server after Tailwind config changes
2. Clear `.next` folder:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Docker Build Fails

1. Check `NEXT_PUBLIC_API_BASE` is set as build arg
2. Ensure `/public` directory exists
3. Check Dockerfile paths are correct

## Production Deployment

On AWS EC2, the frontend is built with:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_BASE=http://<YOUR_EC2_IP>:4000 \
  -t frontend .
```

Then pushed to ECR and pulled on EC2.

See main [README.md](../README.md) for complete deployment instructions.

## Author

**Ian Louw**
📧 ian@ianlouw.com
🌐 [ianlouw.com](https://ianlouw.com)
