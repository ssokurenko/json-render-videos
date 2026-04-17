# JSON Render Videos

An AI-powered video generation application that creates stunning video timelines from natural language prompts. Write a description of what you want, and watch as AI generates a complete video specification with live preview.

## Features

- **AI-Powered Video Generation**: Describe your video in natural language, and let Claude AI generate a complete JSON timeline specification
- **Real-Time Preview**: Watch your video render in real-time as the timeline is being generated
- **JSON Visualization**: See the generated timeline structure with syntax highlighting
- **Export Timeline**: Download generated timeline specifications as JSON for reuse or integration
- **Render to MP4**: Server-side video rendering to MP4 files (h264 codec)
- **Component Architecture**: Clean, modular component structure for easy customization
- **Rate Limiting**: Built-in rate limiting to prevent abuse (optional)
- **Dark Mode Ready**: Beautiful dark-themed interface built with Tailwind CSS

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with Turbopack
- **UI**: [React 19](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Video Rendering**: [Remotion](https://www.remotion.dev/) for video composition
- **Video Timeline**: [@json-render](https://json-render.dev/) for video specifications
- **AI Integration**: [Vercel AI Gateway](https://vercel.com/ai-gateway) + [Anthropic SDK](https://sdk.vercel.ai/)
- **Code Syntax Highlighting**: [Shiki](https://shiki.style/)
- **Type Safety**: TypeScript
- **Rate Limiting**: [Upstash Redis](https://upstash.com/) (optional)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- An API key from [Vercel AI Gateway](https://vercel.com/ai-gateway)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd json-render-videos
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file by copying the example:

```bash
cp .env-example .env.local
```

### 3. Get Your API Key

1. Visit [Vercel AI Gateway Portal](https://vercel.com/ai-gateway)
2. Sign up or log in with your account
3. Navigate to the **API Keys** section
4. Create a new API key
5. Copy the key and paste it into your `.env.local`:

```env
AI_GATEWAY_API_KEY=your_key_here
```

### 4. Optional: Configure Advanced Settings

The `.env.local` file includes optional settings:

```env
# AI Model (defaults to Claude Haiku 4.5 if not specified)
AI_GATEWAY_MODEL=anthropic/claude-haiku-4.5

# Rate Limiting (requires Upstash Redis)
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
RATE_LIMIT_PER_MINUTE=10
RATE_LIMIT_PER_DAY=100
```

### 5. Run the Application

**Development mode** (with hot reload and Turbopack):
```bash
npm run dev
```

**Production build**:
```bash
npm run build
npm start
```

**Type checking**:
```bash
npm run check-types
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start generating videos!

## Usage

1. **Enter a Prompt**: Describe the video you want to create in the text input
   - Example: "A 5-second intro video with text 'Hello World' fading in, then a smooth zoom effect"

2. **Generate**: Click the send button or press Enter

3. **Watch the Magic**: 
   - Left panel shows the generated JSON timeline specification with syntax highlighting
   - Right panel displays a live video preview using Remotion

4. **Export or Render**:
   - Click **"Export"** to download the timeline JSON for reuse or integration
   - Click **"Render MP4"** to render the video to an MP4 file (this may take 30-60 seconds)

5. **Download**: The MP4 will automatically download to your computer when rendering completes

## Project Structure

```
├── app/
│   ├── page.tsx                 # Main orchestrator component
│   ├── components/
│   │   ├── CodeBlock.tsx        # JSON syntax-highlighted viewer (Shiki)
│   │   ├── CopyButton.tsx       # Clipboard copy button
│   │   ├── JsonPanel.tsx        # Left panel with JSON display
│   │   └── VideoPanel.tsx       # Right panel with video preview & render button
│   ├── api/
│   │   ├── generate/
│   │   │   └── route.ts         # AI prompt → JSON timeline (streaming)
│   │   └── render/
│   │       └── route.ts         # JSON timeline → MP4 video (server-side rendering)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── page.module.css          # Page-specific styles
├── remotion/
│   ├── Root.tsx                 # Remotion composition definition
│   └── index.ts                 # Remotion root registration
├── lib/
│   ├── catalog.ts               # Video specification catalog & system prompts
│   └── rate-limit.ts            # Rate limiting logic
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration (with serverExternalPackages)
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
└── .env-example                 # Environment variables template
```

## API Reference

### POST `/api/generate`

Generates a video timeline specification from a text prompt using Claude AI.

**Request**:
```json
{
  "prompt": "Your video description here"
}
```

**Response**: A streaming text response containing the JSON timeline specification.

**Rate Limits**:
- Per minute: 10 requests (configurable)
- Per day: 100 requests (configurable)

---

### POST `/api/render`

Renders a video timeline specification to an MP4 file (server-side rendering).

**Request**:
```json
{
  "spec": {
    "composition": {
      "id": "timeline",
      "width": 1920,
      "height": 1080,
      "fps": 30,
      "durationInFrames": 300
    },
    "tracks": [...],
    "clips": [...]
  }
}
```

**Response**: Binary MP4 video file (h264 codec, 1080p, 80% JPEG quality)

**Notes**:
- Rendering time depends on video length and complexity (typically 30-120 seconds)
- Maximum timeout: 5 minutes (configurable via `maxDuration`)
- Automatically triggers download with filename `video.mp4`

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New → Project"
4. Import your repository
5. Add environment variables in the project settings:
   - `AI_GATEWAY_API_KEY` (no additional setup needed on Vercel)
   - `KV_REST_API_URL` and `KV_REST_API_TOKEN` (if using Redis)
6. Deploy!

When deployed on Vercel, the AI Gateway is automatically authenticated.

## Architecture

### Component Organization

The application follows a modular component-based architecture:

- **[page.tsx](app/page.tsx)** — Main orchestrator component (100 lines)
  - Manages state: `prompt`, `isGenerating`, `isRendering`, `spec`, `error`
  - Handlers: `generate()`, `handleSubmit()`, `handleExport()`, `handleRender()`
  - Composes UI from child components

- **[JsonPanel.tsx](app/components/JsonPanel.tsx)** — Left panel display
  - Shows JSON timeline with syntax highlighting
  - Copy button for easy JSON export
  - Real-time update indicators

- **[VideoPanel.tsx](app/components/VideoPanel.tsx)** — Right panel display
  - Live video preview using `@remotion/player`
  - Export button for JSON download
  - Render button for MP4 generation with loading state

- **[CodeBlock.tsx](app/components/CodeBlock.tsx)** — Syntax highlighting
  - Shiki integration with custom dark theme
  - Singleton highlighter pattern for performance
  - Fallback to plain text while loading

- **[CopyButton.tsx](app/components/CopyButton.tsx)** — Reusable utility
  - Clipboard API integration
  - Visual feedback (checkmark on success)

### Rendering Pipeline

1. **AI Generation** (`/api/generate`)
   - Streams text chunks from Claude via Vercel AI Gateway
   - Client-side streaming compilation using `createSpecStreamCompiler`
   - Real-time JSON spec updates

2. **Browser Preview**
   - Remotion `<Player>` component with `Renderer` from `@json-render/remotion`
   - Instant preview of AI-generated specs

3. **Server-Side Rendering** (`/api/render`)
   - Bundles Remotion composition using `@remotion/bundler`
   - Renders frames using `@remotion/renderer` with `renderMedia()`
   - Streams binary MP4 response with auto-download

## Troubleshooting

### Issue: "Generation failed" error
- **Check**: Ensure `AI_GATEWAY_API_KEY` is set in `.env.local`
- **Check**: Verify the key is valid on [Vercel AI Gateway Portal](https://vercel.com/ai-gateway)

### Issue: Rate limit exceeded
- **Check**: Wait a moment before trying again
- **Check**: Verify your rate limit settings in `.env.local`
- **Note**: Rate limiting only works if Redis credentials are configured

### Issue: Video not previewing in browser
- **Check**: Ensure the generated JSON timeline is complete (has `composition`, `tracks`, and `clips`)
- **Check**: Try a simpler prompt first
- **Check**: Open browser DevTools console for specific error messages

### Issue: "Render failed" error
- **Check**: Ensure the preview is working first (browser rendering indicates valid spec)
- **Check**: Check available disk space in `/tmp` (rendering creates temporary files)
- **Check**: Try rendering a simpler timeline first

### Issue: Render takes too long or times out
- **Note**: Local rendering typically takes 30-120 seconds depending on video length and complexity
- **For production**: Deploy to Vercel or increase `maxDuration` in `app/api/render/route.ts`
- **Check**: Simpler videos (shorter duration, fewer effects) render faster

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## License

This project is open source and available under the MIT License.

## Resources

- [Remotion Documentation](https://www.remotion.dev/docs)
- [JSON Render Documentation](https://json-render.dev/docs)
- [Vercel AI Gateway](https://vercel.com/ai-gateway)
- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Claude API](https://anthropic.com/api)
