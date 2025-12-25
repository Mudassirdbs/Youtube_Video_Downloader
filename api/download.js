const express = require('express');
const ytdl = require('@distube/ytdl-core');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { url, itag } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video info to get the title for filename
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^\w\s]/gi, '');

        // Set headers for download
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        // Stream the video - ytdl-core will handle merging video and audio if needed
        const videoStream = ytdl(url, {
            quality: itag || 'highest',
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            }
        });

        // Pipe the video stream to response
        videoStream.pipe(res);

        videoStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Failed to download video',
                    message: error.message
                });
            }
        });

    } catch (error) {
        console.error('Error downloading video:', error);
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Failed to download video',
                message: error.message
            });
        }
    }
});

module.exports = router;
