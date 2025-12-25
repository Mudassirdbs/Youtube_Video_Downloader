// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const fetchBtn = document.getElementById('fetchBtn');
const downloadBtn = document.getElementById('downloadBtn');
const qualitySelect = document.getElementById('qualitySelect');
const videoPreview = document.getElementById('videoPreview');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('videoTitle');
const videoAuthor = document.getElementById('videoAuthor');
const duration = document.getElementById('duration');
const notification = document.getElementById('notification');

// State
let currentVideoInfo = null;

// Utility Functions
function showNotification(message, type = 'error') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function validateYouTubeUrl(url) {
    return extractVideoId(url) !== null;
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// API Functions
async function fetchVideoInfo(url) {
    try {
        setButtonLoading(fetchBtn, true);

        const response = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch video information');
        }

        return data;
    } catch (error) {
        throw error;
    } finally {
        setButtonLoading(fetchBtn, false);
    }
}

function displayVideoInfo(info) {
    currentVideoInfo = info;

    // Set thumbnail
    thumbnail.src = info.thumbnail;
    thumbnail.alt = info.title;

    // Set video details
    videoTitle.textContent = info.title;
    videoAuthor.textContent = info.author;
    duration.textContent = formatDuration(parseInt(info.duration));

    // Populate quality options
    qualitySelect.innerHTML = '<option value="">Choose quality...</option>';

    if (info.formats && info.formats.length > 0) {
        info.formats.forEach(format => {
            const option = document.createElement('option');
            option.value = format.itag;
            option.textContent = `${format.quality} (${format.container})`;
            qualitySelect.appendChild(option);
        });
    }

    // Show preview section
    videoPreview.style.display = 'block';
    videoPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function downloadVideo(url, itag) {
    try {
        setButtonLoading(downloadBtn, true);

        // Create download URL
        let downloadUrl = `/api/download?url=${encodeURIComponent(url)}`;
        if (itag) {
            downloadUrl += `&itag=${itag}`;
        }

        // Trigger download
        window.location.href = downloadUrl;

        showNotification('Download started! Please wait...', 'success');

        // Reset button after a delay
        setTimeout(() => {
            setButtonLoading(downloadBtn, false);
        }, 2000);

    } catch (error) {
        showNotification(error.message, 'error');
        setButtonLoading(downloadBtn, false);
    }
}

// Event Listeners
fetchBtn.addEventListener('click', async () => {
    const url = videoUrlInput.value.trim();

    if (!url) {
        showNotification('Please enter a YouTube URL', 'error');
        return;
    }

    if (!validateYouTubeUrl(url)) {
        showNotification('Please enter a valid YouTube URL', 'error');
        return;
    }

    try {
        const info = await fetchVideoInfo(url);
        displayVideoInfo(info);
        showNotification('Video information loaded successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
        videoPreview.style.display = 'none';
    }
});

qualitySelect.addEventListener('change', () => {
    downloadBtn.disabled = !qualitySelect.value;
});

downloadBtn.addEventListener('click', () => {
    const url = videoUrlInput.value.trim();
    const itag = qualitySelect.value;

    if (!itag) {
        showNotification('Please select a video quality', 'error');
        return;
    }

    downloadVideo(url, itag);
});

// Allow Enter key to fetch video
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchBtn.click();
    }
});
