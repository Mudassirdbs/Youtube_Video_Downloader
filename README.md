# YouTube Video Downloader

A professional, modern YouTube video downloader built with Express.js and vanilla JavaScript.

## Features

- 🎨 **Modern UI** - Beautiful glassmorphism design with smooth animations
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Fast** - Quick video information fetching and downloads
- 🎬 **Multiple Qualities** - Download videos in various quality formats
- 🚀 **Easy Deploy** - Ready for Vercel or VPS deployment

## Installation

1. Clone or download this repository
2. Install dependencies:
```bash
npm install
```

## Running Locally

Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

### VPS Deployment

1. Upload files to your VPS
2. Install dependencies:
```bash
npm install
```

3. Start with PM2 (recommended):
```bash
npm install -g pm2
pm2 start server.js --name youtube-downloader
```

Or run directly:
```bash
node server.js
```

## API Endpoints

### Get Video Info
```
GET /api/info?url=<youtube_url>
```

### Download Video
```
GET /api/download?url=<youtube_url>&itag=<quality_itag>
```

## Tech Stack

- **Backend**: Express.js, ytdl-core
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Styling**: Custom CSS with glassmorphism effects
- **Fonts**: Google Fonts (Inter)

## Important Note

Please respect copyright and only download videos you have permission to download. This tool is for educational purposes and personal use only.

## License

MIT
