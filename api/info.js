const ytdl = require('@distube/ytdl-core');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ error: 'URL parameter is required' });
        }

        // Validate YouTube URL
        if (!ytdl.validateURL(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Get video info
        const info = await ytdl.getInfo(url);
        const videoDetails = info.videoDetails;

        // Get available formats - include both combined and video-only for higher qualities
        const formats = info.formats
            .filter(format => format.hasVideo)
            .map(format => ({
                quality: format.qualityLabel || format.quality,
                itag: format.itag,
                container: format.container,
                codecs: format.codecs,
                hasAudio: format.hasAudio,
                filesize: format.contentLength
            }))
            .filter(format => format.quality && format.quality !== 'tiny') // Remove tiny quality
            .sort((a, b) => {
                // Extract numeric quality for sorting
                const aQuality = parseInt(a.quality) || 0;
                const bQuality = parseInt(b.quality) || 0;
                return bQuality - aQuality;
            });

        // Remove duplicates based on quality, prefer formats with audio
        const qualityMap = new Map();
        formats.forEach(format => {
            const existing = qualityMap.get(format.quality);
            if (!existing || (format.hasAudio && !existing.hasAudio)) {
                qualityMap.set(format.quality, format);
            }
        });

        const uniqueFormats = Array.from(qualityMap.values());

        res.json({
            success: true,
            title: videoDetails.title,
            thumbnail: videoDetails.thumbnails[videoDetails.thumbnails.length - 1].url,
            duration: videoDetails.lengthSeconds,
            author: videoDetails.author.name,
            formats: uniqueFormats
        });

    } catch (error) {
        console.error('Error fetching video info:', error);
        res.status(500).json({
            error: 'Failed to fetch video information',
            message: error.message
        });
    }
};
