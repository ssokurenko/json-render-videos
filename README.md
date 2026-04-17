# JSON Render Videos

An AI-powered video generation application that creates stunning video timelines from natural language prompts. Write a description of what you want, and watch as AI generates a complete video specification with live preview.

## Features

- **AI-Powered Video Generation**: Describe your video in natural language, and let Claude AI generate a complete JSON timeline specification
- **Real-Time Preview**: Watch your video render in real-time as the timeline is being generated
- **JSON Visualization**: See the generated timeline structure with syntax highlighting
- **Export**: Download generated timeline specifications as JSON for reuse or integration
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
   - Left panel shows the generated JSON timeline specification
   - Right panel displays a live video preview

4. **Export**: Click "Export" to download the timeline JSON for use elsewhere

## Project Structure

```
├── app/
│   ├── page.tsx                 # Main home page with video generator UI
│   ├── api/
│   │   └── generate/
│   │       └── route.ts         # API endpoint for video generation
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── page.module.css          # Page-specific styles
├── lib/
│   ├── catalog.ts               # Video specification catalog & system prompts
│   └── rate-limit.ts            # Rate limiting logic
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.mjs           # PostCSS configuration
└── .env-example                 # Environment variables template
```

## API Reference

### POST `/api/generate`

Generates a video timeline specification from a text prompt.

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

## Troubleshooting

### Issue: "Generation failed" error
- **Check**: Ensure `AI_GATEWAY_API_KEY` is set in `.env.local`
- **Check**: Verify the key is valid on [Vercel AI Gateway Portal](https://vercel.com/ai-gateway)

### Issue: Rate limit exceeded
- **Check**: Wait a moment before trying again
- **Check**: Verify your rate limit settings in `.env.local`
- **Note**: Rate limiting only works if Redis credentials are configured

### Issue: Video not rendering
- **Check**: Ensure the generated JSON timeline is complete (has composition, tracks, and clips)
- **Check**: Try a simpler prompt first

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
