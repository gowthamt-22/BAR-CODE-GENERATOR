// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
        /^([a-zA-Z0-9_-]{11})$/  // Direct video ID
    ];
    
    for (let pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}

// Check if input is a YouTube URL
function isYouTubeUrl(input) {
    return input.includes('youtube.com') || input.includes('youtu.be');
}

// Show toast notification
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Generate QR code
function generateQRCode(text) {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = ''; // Clear previous QR code
    
    new QRCode(qrcodeContainer, {
        text: text,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Animate the QR card
    const qrCard = document.getElementById('qrCard');
    qrCard.style.animationDelay = '0s';
}

// Generate YouTube outputs
function generateYouTubeOutputs(videoId, originalUrl) {
    const outputContainer = document.getElementById('outputContainer');
    const embedContainer = document.getElementById('embedSection');
    const thumbnailSection = document.getElementById('thumbnailSection');
    const youtubeEmbed = document.getElementById('youtubeEmbed');
    const youtubeThumbnail = document.getElementById('youtubeThumbnail');
    const downloadThumbBtn = document.getElementById('downloadThumb');
    
    // Generate QR code for the URL
    generateQRCode(originalUrl);
    
    // Generate embed with animation delay
    youtubeEmbed.src = `https://www.youtube.com/embed/${videoId}`;
    embedContainer.style.display = 'block';
    embedContainer.style.animationDelay = '0.2s';
    
    // Generate thumbnail with animation delay
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    youtubeThumbnail.src = thumbnailUrl;
    youtubeThumbnail.onerror = function() {
        // Fallback to standard quality if maxres not available
        this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
    thumbnailSection.style.display = 'block';
    thumbnailSection.style.animationDelay = '0.4s';
    
    // Setup download button
    downloadThumbBtn.onclick = async function() {
        try {
            const response = await fetch(youtubeThumbnail.src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `youtube_thumbnail_${videoId}.jpg`;
            link.click();
            window.URL.revokeObjectURL(url);
            showToast('✅ Thumbnail downloaded successfully!');
        } catch (error) {
            // Fallback method
            const link = document.createElement('a');
            link.href = youtubeThumbnail.src;
            link.download = `youtube_thumbnail_${videoId}.jpg`;
            link.target = '_blank';
            link.click();
            showToast('✅ Thumbnail opened in new tab!');
        }
    };
    
    // Show output container
    outputContainer.style.display = 'grid';
    outputContainer.style.opacity = '1';
    
    showToast('✨ Generated successfully!');
}

// Download QR code
function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL();
        link.click();
        showToast('✅ QR Code downloaded!');
    }
}

// Main generation function
function generate() {
    const input = document.getElementById('qrInput').value.trim();
    const errorContainer = document.getElementById('errorMessage');
    
    // Clear previous error
    if (errorContainer) {
        errorContainer.remove();
    }
    
    if (!input) {
        showError('⚠️ Please enter a URL or text');
        return;
    }
    
    // Add loading animation to button
    const generateBtn = document.getElementById('generation');
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    setTimeout(() => {
        // Check if it's a YouTube URL
        if (isYouTubeUrl(input)) {
            const videoId = getYouTubeVideoId(input);
            
            if (videoId) {
                generateYouTubeOutputs(videoId, input);
            } else {
                showError('❌ Invalid YouTube URL. Please check and try again.');
            }
        } else {
            // Generate QR code for regular text/URL
            generateQRCode(input);
            
            // Hide YouTube-specific sections
            document.getElementById('embedSection').style.display = 'none';
            document.getElementById('thumbnailSection').style.display = 'none';
            
            // Show output container
            const outputContainer = document.getElementById('outputContainer');
            outputContainer.style.display = 'grid';
            outputContainer.style.opacity = '1';
            
            showToast('✨ QR Code generated!');
        }
        
        // Restore button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }, 500);
}

// Show error message
function showError(message) {
    const container = document.querySelector('.input-section');
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    container.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generation');
    const downloadQRBtn = document.getElementById('downloadQR');
    const qrInput = document.getElementById('qrInput');
    const clearBtn = document.getElementById('clearBtn');
    
    generateBtn.addEventListener('click', generate);
    downloadQRBtn.addEventListener('click', downloadQRCode);
    
    // Clear button functionality
    clearBtn.addEventListener('click', function() {
        qrInput.value = '';
        clearBtn.style.display = 'none';
        qrInput.focus();
    });
    
    // Show/hide clear button
    qrInput.addEventListener('input', function() {
        clearBtn.style.display = this.value ? 'flex' : 'none';
    });
    
    // Allow Enter key to generate
    qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generate();
        }
    });
    
    // Auto-focus input
    qrInput.focus();
    
    // Add typing effect placeholder (optional enhancement)
    const placeholders = [
        'Paste YouTube link here...',
        'Or any URL you want...',
        'Text works too! ✨'
    ];
    let currentPlaceholder = 0;
    
    setInterval(() => {
        currentPlaceholder = (currentPlaceholder + 1) % placeholders.length;
        qrInput.setAttribute('placeholder', placeholders[currentPlaceholder]);
    }, 3000);
});

// Generate QR code
function generateQRCode(text) {
    const qrcodeContainer = document.getElementById('qrcode');
    qrcodeContainer.innerHTML = ''; // Clear previous QR code
    
    new QRCode(qrcodeContainer, {
        text: text,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Generate YouTube outputs
function generateYouTubeOutputs(videoId, originalUrl) {
    const outputContainer = document.getElementById('outputContainer');
    const embedContainer = document.getElementById('embedSection');
    const thumbnailSection = document.getElementById('thumbnailSection');
    const youtubeEmbed = document.getElementById('youtubeEmbed');
    const youtubeThumbnail = document.getElementById('youtubeThumbnail');
    const downloadThumbBtn = document.getElementById('downloadThumb');
    
    // Generate QR code for the URL
    generateQRCode(originalUrl);
    
    // Generate embed
    youtubeEmbed.src = `https://www.youtube.com/embed/${videoId}`;
    embedContainer.style.display = 'block';
    
    // Generate thumbnail
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    youtubeThumbnail.src = thumbnailUrl;
    youtubeThumbnail.onerror = function() {
        // Fallback to standard quality if maxres not available
        this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    };
    thumbnailSection.style.display = 'block';
    
    // Setup download button
    downloadThumbBtn.onclick = function() {
        const link = document.createElement('a');
        link.href = youtubeThumbnail.src;
        link.download = `youtube_thumbnail_${videoId}.jpg`;
        link.target = '_blank';
        link.click();
    };
    
    // Show output container
    outputContainer.classList.add('show');
}

// Download QR code
function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL();
        link.click();
    }
}

// Main generation function
function generate() {
    const input = document.getElementById('qrInput').value.trim();
    const errorContainer = document.getElementById('errorMessage');
    
    // Clear previous error
    if (errorContainer) {
        errorContainer.remove();
    }
    
    if (!input) {
        showError('Please enter a URL or text');
        return;
    }
    
    // Check if it's a YouTube URL
    if (isYouTubeUrl(input)) {
        const videoId = getYouTubeVideoId(input);
        
        if (videoId) {
            generateYouTubeOutputs(videoId, input);
        } else {
            showError('Invalid YouTube URL. Please check and try again.');
        }
    } else {
        // Generate QR code for regular text/URL
        generateQRCode(input);
        
        // Hide YouTube-specific sections
        document.getElementById('embedSection').style.display = 'none';
        document.getElementById('thumbnailSection').style.display = 'none';
        
        // Show output container
        document.getElementById('outputContainer').classList.add('show');
    }
}

// Show error message
function showError(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    container.appendChild(errorDiv);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generation');
    const downloadQRBtn = document.getElementById('downloadQR');
    const qrInput = document.getElementById('qrInput');
    
    generateBtn.addEventListener('click', generate);
    downloadQRBtn.addEventListener('click', downloadQRCode);
    
    // Allow Enter key to generate
    qrInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            generate();
        }
    });
});
