  
        let qrInstance = null;
        let currentQRData = null;
        let currentSize = 200;

function showSection(section) {
    section.classList.add("active");
    mainContainer.classList.add("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

        const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    updateNavToggleIcon();
});

function updateNavToggleIcon() {
    if (navMenu.classList.contains("active")) {
        navToggle.textContent = "✕";
    } else {
        navToggle.textContent = "☰";
    }
}

const aboutBtn = document.getElementById("aboutBtn");
const shareBtn = document.getElementById("shareNav");
const aboutSection = document.getElementById("aboutSection");
const shareSection = document.getElementById("shareSection");
const mainContainer = document.querySelector(".container");

function showAboutSection() {
    aboutSection.classList.add("active");
    mainContainer.classList.add("hidden");
    shareSection.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeAboutSection() {
    aboutSection.classList.remove("active");
    mainContainer.classList.remove("hidden");
}

function showShareSection() {
    shareSection.classList.add("active");
    mainContainer.classList.add("hidden");
    aboutSection.classList.remove("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeShareSection() {
    shareSection.classList.remove("active");
    mainContainer.classList.remove("hidden");
}

aboutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showAboutSection();
});

shareBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showShareSection();
});

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
    aboutSection.classList.remove("active");
    mainContainer.classList.remove("hidden");
});

        // Initialize when DOM is ready
        document.addEventListener('DOMContentLoaded', function() {
            // Tab switching
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const tab = this.dataset.tab;
                    
                    // Update active button
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    // Update active tab content
                    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                    document.getElementById(`${tab}-tab`).classList.add('active');

                    // Show/hide action buttons based on tab
                    const actionButtonGroup = document.getElementById('actionButtonGroup');

                    if (tab === 'scanner' || tab === 'linkgen') {
                        actionButtonGroup.style.display = 'none';
                    } else {
                        actionButtonGroup.style.display = 'flex';
                    }

                    // Clear previous errors
                    hideMessages();
                    
                    // Stop camera if switching away from scanner
                    if (tab !== 'scanner' && typeof cameraStream !== 'undefined' && cameraStream) {
                        stopCamera();
                    }
                });
            });

            // Navbar link behavior
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (!href || !href.startsWith('#')) return;

                    const target = href.substring(1);

                    if (target === 'home') {
                        e.preventDefault();
                        closeAboutSection();
                        closeShareSection();
                        activateTab('link');
                    } else if (target === 'about' || target === 'aboutSection' || link.id === 'aboutBtn') {
                        e.preventDefault();
                        showAboutSection();
                    } else if (target === 'share') {
                        e.preventDefault();
                        shareCurrentPage();
                        showShareSection();
                    } else if (target === 'link-tab' || target === 'text-tab' || target === 'file-tab' || target === 'scanner-tab' || target === 'linkgen-tab') {
                        e.preventDefault();
                        closeAboutSection();
                        closeShareSection();
                        const tabName = target.replace('-tab', '');
                        activateTab(tabName);
                    } else if (target === '') {
                        e.preventDefault();
                        activateTab('link');
                    }

                    // Close mobile nav menu after selection
                    navMenu.classList.remove("active");
                    updateNavToggleIcon();
                });
            });
        });

        function activateTab(tab) {
            // Find matching tab button and trigger click logic
            const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
            if (btn) {
                btn.click();
            }
        }

        function generateQRCode() {
            hideMessages();
            const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
            let qrData = '';

            try {
                if (activeTab === 'link') {
                    qrData = document.getElementById('urlInput').value.trim();
                    if (!qrData) {
                        showError('Please enter a valid URL');
                        return;
                    }
                    if (!qrData.match(/^https?:\/\//)) {
                        qrData = 'https://' + qrData;
                    }
                } else if (activeTab === 'text') {
                    qrData = document.getElementById('textInput').value.trim();
                    if (!qrData) {
                        showError('Please enter some text');
                        return;
                    }
                } else if (activeTab === 'file') {
                    const fileInput = document.getElementById('fileInput');
                    const descInput = document.getElementById('fileDescription').value.trim();
                    
                    if (!fileInput.files.length) {
                        showError('Please select a file');
                        return;
                    }

                    const file = fileInput.files[0];
                    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
                    qrData = `FILE: ${descInput || file.name}\nSize: ${sizeInMB} MB\nType: ${file.type || 'Unknown'}`;
                }

                currentQRData = qrData;

                // Clear previous QR code
                const container = document.getElementById('qrContainer');
                container.innerHTML = '';
                
                // Check if QRCode library is loaded
                if (typeof QRCode === 'undefined') {
                    showError('QR Code library failed to load. Please check your internet connection and refresh the page.');
                    return;
                }
                
                // Generate new QR code
                qrInstance = new QRCode(container, {
                    text: qrData,
                    width: parseInt(currentSize),
                    height: parseInt(currentSize),
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                container.classList.add('active');
                document.getElementById('downloadBtn').classList.remove('hidden');
                showSuccess('QR Code generated successfully!');

            } catch (error) {
                showError('Error generating QR code: ' + error.message);
            }
        }

        function downloadQRCode() {
            try {
                const canvas = document.querySelector('#qrContainer canvas');
                if (!canvas) {
                    showError('No QR code to download');
                    return;
                }

                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `qrcode-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showSuccess('QR Code downloaded successfully!');
            } catch (error) {
                showError('Error downloading QR code: ' + error.message);
            }
        }

        function clearAll() {
            // Clear inputs
            document.getElementById('urlInput').value = '';
            document.getElementById('textInput').value = '';
            document.getElementById('fileInput').value = '';
            document.getElementById('fileDescription').value = '';
            
            // Clear preview
            const container = document.getElementById('qrContainer');
            container.innerHTML = '<p class="qr-placeholder">Your QR code will appear here</p>';
            container.classList.remove('active');
            document.getElementById('downloadBtn').classList.add('hidden');

            currentQRData = null;
            qrInstance = null;

            hideMessages();
        }

        function showError(message) {
            const errorEl = document.getElementById('errorMessage');
            errorEl.textContent = '❌ ' + message;
            errorEl.classList.add('show');
        }

        function showSuccess(message) {
            const successEl = document.getElementById('successMessage');
            successEl.textContent = '✓ ' + message;
            successEl.classList.add('show');
            setTimeout(() => successEl.classList.remove('show'), 3000);
        }

        function hideMessages() {
            document.getElementById('errorMessage').classList.remove('show');
            document.getElementById('successMessage').classList.remove('show');
        }

        // Scanner Functions
        let cameraStream = null;
        let scanningActive = false;

        function switchScannerMode(mode) {
            // Update button states
            document.querySelectorAll('.scanner-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-scanner="${mode}"]`).classList.add('active');

            // Show/hide appropriate sections
            const uploadScanner = document.getElementById('uploadScanner');
            const cameraContainer = document.getElementById('cameraContainer');

            if (mode === 'upload') {
                uploadScanner.style.display = 'flex';
                cameraContainer.classList.remove('active');
                stopCamera();
            } else {
                uploadScanner.style.display = 'none';
                cameraContainer.classList.add('active');
            }
        }

        function scanQRFromImage() {
            const input = document.getElementById('scanImageInput');
            const file = input.files[0];

            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        displayScanResult(code.data);
                        showSuccess('QR code detected!');
                    } else {
                        showError('No QR code found in the image. Please try another image.');
                        hideScanResult();
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                const video = document.getElementById('video');
                video.srcObject = stream;
                cameraStream = stream;
                scanningActive = true;

                document.querySelector('.btn-start-camera').style.display = 'none';
                document.querySelector('.btn-stop-camera').classList.add('active');

                scanQRFromCamera();
            } catch (error) {
                showError('Unable to access camera: ' + error.message);
            }
        }

        function stopCamera() {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
                cameraStream = null;
                scanningActive = false;
            }

            document.querySelector('.btn-start-camera').style.display = 'block';
            document.querySelector('.btn-stop-camera').classList.remove('active');
            document.getElementById('video').srcObject = null;
        }

        function scanQRFromCamera() {
            if (!scanningActive) return;

            const video = document.getElementById('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            if (canvas.width === 0 || canvas.height === 0) {
                setTimeout(scanQRFromCamera, 100);
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            try {
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (code) {
                    displayScanResult(code.data);
                    scanningActive = false;
                    stopCamera();
                    showSuccess('QR code scanned successfully!');
                    return;
                }
            } catch (e) {
                // Continue scanning
            }

            setTimeout(scanQRFromCamera, 100);
        }

        function displayScanResult(data) {
            const scannedDataEl = document.getElementById('scannedData');
            const result = document.getElementById('scannerResult');
            result.classList.add('active');

            // Display as link if it's a URL, otherwise as text
            if (data.startsWith('http://') || data.startsWith('https://')) {
                scannedDataEl.innerHTML = `<a href="${data}" target="_blank" rel="noopener noreferrer">${data}</a>`;
            } else {
                scannedDataEl.textContent = data;
            }

            // Show/hide buttons based on data type
            const openBtn = document.getElementById('openBtn');
            const downloadContentBtn = document.getElementById('downloadContentBtn');
            if (data.startsWith('http://') || data.startsWith('https://')) {
                openBtn.classList.remove('hidden');
                downloadContentBtn.classList.remove('hidden');
            } else {
                openBtn.classList.add('hidden');
                downloadContentBtn.classList.add('hidden');
            }

            // Check if it's a file (base64 encoded)
            handleScannedFilePreview(data);

            // Automatically generate share link for the scanned result
            setTimeout(() => {
                generateLinkForScanResult();
            }, 100); // Small delay to ensure DOM is updated
        }

        function handleScannedFilePreview(data) {
            const filePreviewContainer = document.getElementById('filePreviewContainer');
            const filePreview = document.getElementById('filePreview');
            const fileInfo = document.getElementById('fileInfo');

            // Check if data is a file URL (base64)
            if (data.startsWith('data:')) {
                try {
                    const dataUrl = data;
                    const mimeMatch = data.match(/data:([^;]+)/);
                    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
                    const isBase64 = data.includes('base64');

                    // Extract file name if available (will be in metadata for generated links)
                    let fileName = extractFileNameFromQR(data);
                    if (!fileName) {
                        fileName = `scanned-file.${getMimeExtension(mimeType)}`;
                    }

                    // Store for download
                    window.scannedFileData = {
                        dataUrl: dataUrl,
                        mimeType: mimeType,
                        fileName: fileName,
                        isBase64: isBase64
                    };

                    // Display preview based on file type
                    displayFilePreview(mimeType, dataUrl, fileName, filePreview, fileInfo);
                    filePreviewContainer.classList.add('active');

                } catch (error) {
                    filePreviewContainer.classList.remove('active');
                }
            } else {
                filePreviewContainer.classList.remove('active');
            }
        }

        function displayFilePreview(mimeType, dataUrl, fileName, previewEl, infoEl) {
            let previewHTML = '';
            let infoHTML = `
                <div class="file-info-row">
                    <span class="file-info-label">File Type:</span>
                    <span>${mimeType}</span>
                </div>
                <div class="file-info-row">
                    <span class="file-info-label">File Name:</span>
                    <span>${escapeHtml(fileName)}</span>
                </div>
            `;

            if (mimeType.startsWith('image/')) {
                // Image preview
                previewHTML = `<img src="${dataUrl}" class="preview-image" alt="Scanned image" />`;
            } else if (mimeType === 'application/pdf') {
                // PDF preview
                previewHTML = `<iframe src="${dataUrl}" type="application/pdf" class="preview-pdf"></iframe>`;
            } else if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('sheet')) {
                // Document file indicator
                previewHTML = `<div style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 6px;">
                    <div style="font-size: 2em;">📄</div>
                    <div style="margin-top: 10px; color: #666;">Document file ready for download</div>
                </div>`;
            } else if (mimeType.startsWith('video/')) {
                // Video preview
                previewHTML = `<video controls class="preview-pdf" style="height: 250px;">
                    <source src="${dataUrl}" type="${mimeType}">
                    Your browser does not support the video tag.
                </video>`;
            } else if (mimeType.startsWith('audio/')) {
                // Audio preview
                previewHTML = `<audio controls style="width: 100%; margin: 10px 0;">
                    <source src="${dataUrl}" type="${mimeType}">
                    Your browser does not support the audio element.
                </audio>`;
            } else {
                // Generic file
                previewHTML = `<div style="text-align: center; padding: 20px; background: #f5f5f5; border-radius: 6px;">
                    <div style="font-size: 2em;">📁</div>
                    <div style="margin-top: 10px; color: #666;">File ready for download: ${escapeHtml(fileName)}</div>
                </div>`;
            }

            previewEl.innerHTML = previewHTML;
            infoEl.innerHTML = infoHTML;
        }

        function extractFileNameFromQR(data) {
            // Try to extract filename from the data if it's stored as metadata
            try {
                if (data.includes('FILE:')) {
                    const match = data.match(/FILE:\s*([^\n]+)/);
                    if (match) return match[1];
                }
            } catch (e) {
                // Continue with default
            }
            return null;
        }

        function getMimeExtension(mimeType) {
            const mimeMap = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/webp': 'webp',
                'application/pdf': 'pdf',
                'application/msword': 'doc',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
                'application/vnd.ms-excel': 'xls',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
                'text/plain': 'txt',
                'text/html': 'html',
                'text/csv': 'csv',
                'video/mp4': 'mp4',
                'video/mpeg': 'mpeg',
                'audio/mpeg': 'mp3',
                'audio/wav': 'wav',
                'application/zip': 'zip',
                'application/x-rar-compressed': 'rar',
                'application/x-7z-compressed': '7z'
            };

            return mimeMap[mimeType] || 'bin';
        }

        function downloadScannedFile() {
            if (!window.scannedFileData) {
                showError('No file data available');
                return;
            }

            try {
                const { dataUrl, fileName } = window.scannedFileData;
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showSuccess(`Downloaded: ${fileName}`);
            } catch (error) {
                showError('Failed to download file: ' + error.message);
            }
        }

        function hideScanResult() {
            document.getElementById('scannerResult').classList.remove('active');
        }

        function copyScanResult() {
            const data = document.getElementById('scannedData').textContent;
            navigator.clipboard.writeText(data).then(() => {
                showSuccess('Copied to clipboard!');
            }).catch(() => {
                showError('Failed to copy');
            });
        }

        function openScanResult() {
            const data = document.getElementById('scannedData').textContent;
            if (data.startsWith('http://') || data.startsWith('https://')) {
                window.open(data, '_blank');
            }
        }

        function downloadScanContent() {
            const data = document.getElementById('scannedData').textContent;
            if (data.startsWith('http://') || data.startsWith('https://')) {
                const link = document.createElement('a');
                link.href = data;
                link.download = '';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        function generateLinkForScanResult() {
            const scannedData = document.getElementById('scannedData').textContent;
            
            if (!scannedData || scannedData.trim() === '') {
                showError('No scanned data to share');
                return;
            }

            try {
                // Generate unique share ID
                const shareId = generateUniqueId();
                const baseUrl = window.location.origin + window.location.pathname;
                const shareLink = `${baseUrl}?scan=${shareId}`;
                
                // Store scanned data
                const storageSuccess = storeScannedDataForSharing(scannedData, {
                    shareId: shareId,
                    createTime: Date.now(),
                    expiryTime: null, // No expiry for scanned results
                    dataType: detectDataType(scannedData)
                });

                if (storageSuccess) {
                    // Display the generated link
                    displayScannedLinkResult(shareLink, scannedData);
                    showSuccess('Share link generated for scanned result!');
                } else {
                    showError('Failed to store scanned data. Storage may be full.');
                }
            } catch (error) {
                showError('Error generating link: ' + error.message);
            }
        }

        function storeScannedDataForSharing(scannedData, metadata) {
            const shareId = metadata.shareId;
            const storageKey = `scan_${shareId}`;
            
            try {
                const storageData = {
                    scannedData: scannedData,
                    createTime: metadata.createTime,
                    expiryTime: metadata.expiryTime,
                    dataType: metadata.dataType
                };
                
                localStorage.setItem(storageKey, JSON.stringify(storageData));
                return true;
            } catch (error) {
                console.error('Storage error:', error);
                return false;
            }
        }

        function detectDataType(data) {
            if (data.startsWith('http://') || data.startsWith('https://')) {
                return 'url';
            } else if (data.includes('@') && data.includes('.')) {
                return 'email';
            } else if (/^\+?\d{10,}$/.test(data.replace(/\s+/g, ''))) {
                return 'phone';
            } else {
                return 'text';
            }
        }

        function displayScannedLinkResult(link, scannedData) {
            // Create or update the link result display
            let resultContainer = document.getElementById('scannedLinkResult');
            if (!resultContainer) {
                resultContainer = document.createElement('div');
                resultContainer.id = 'scannedLinkResult';
                resultContainer.className = 'link-result-container';
                document.getElementById('scannerResult').appendChild(resultContainer);
            }

            const dataType = detectDataType(scannedData);
            const typeIcon = dataType === 'url' ? '🔗' : dataType === 'email' ? '📧' : dataType === 'phone' ? '📞' : '📝';
            
            resultContainer.innerHTML = `
                <div class="link-result-header">${typeIcon} Share Link Created</div>
                <div class="generated-link-box">
                    <div class="generated-link-text">${link}</div>
                    <button class="btn-copy-link" onclick="copyToClipboard('${link}')">📋 Copy Link</button>
                </div>
                <div class="link-details">
                    <div class="link-details-row">
                        <span class="link-details-label">Type:</span>
                        <span class="link-details-value">${dataType.charAt(0).toUpperCase() + dataType.slice(1)}</span>
                    </div>
                    <div class="link-details-row">
                        <span class="link-details-label">Content:</span>
                        <span class="link-details-value">${scannedData.length > 50 ? scannedData.substring(0, 50) + '...' : scannedData}</span>
                    </div>
                </div>
            `;
            resultContainer.classList.add('active');
        }

        // ===== Link Generator Functions =====
        // Handle password checkbox
        function handlePasswordToggle() {
            const checkbox = document.getElementById('linkPassword');
            const passwordGroup = document.getElementById('passwordGroup');
            
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    passwordGroup.classList.remove('hidden');
                } else {
                    passwordGroup.classList.add('hidden');
                }
            });
        }

        // Handle expiry date selection
        function handleExpiryDateToggle() {
            const expiry = document.getElementById('linkExpiry');
            const customDateGroup = document.getElementById('customDateGroup');
            
            expiry.addEventListener('change', function() {
                if (this.value === 'custom') {
                    customDateGroup.classList.remove('hidden');
                } else {
                    customDateGroup.classList.add('hidden');
                }
            });
        }

        function generateShareLink() {
            hideMessages();
            
            const fileInput = document.getElementById('linkFileInput');
            const linkName = document.getElementById('linkName').value.trim();
            const expiry = document.getElementById('linkExpiry').value;
            const hasPassword = document.getElementById('linkPassword').checked;
            const password = document.getElementById('linkPasswordInput').value.trim();

            if (!fileInput.files.length) {
                showError('Please select a file');
                return;
            }

            try {
                const file = fileInput.files[0];
                
                // Check file size (localStorage limit is typically 5-10MB)
                const maxSize = 4 * 1024 * 1024; // 4MB limit
                if (file.size > maxSize) {
                    showError('File is too large. Maximum file size is 4MB for sharing.');
                    return;
                }
                
                const fileSize = formatFileSize(file.size);
                const fileName = linkName || file.name;
                
                // Generate unique share ID
                const shareId = generateUniqueId();
                const baseUrl = window.location.origin + window.location.pathname;
                const shareLink = `${baseUrl}?share=${shareId}`;
                
                // Calculate expiry date
                let expiryDate = getExpiryDate(expiry);
                
                // Generate password if needed
                let finalPassword = password;
                if (hasPassword && !password) {
                    finalPassword = generatePassword();
                }

                // Read file and store it
                const reader = new FileReader();
                reader.onload = function(e) {
                    const fileData = e.target.result;
                    
                    // Store file in localStorage
                    const storageSuccess = storeFileForSharing(fileData, {
                        shareId: shareId,
                        filename: fileName,
                        fileSize: fileSize,
                        expiryTime: expiryDate ? expiryDate.getTime() : null,
                        password: finalPassword,
                        hasPassword: hasPassword
                    });

                    if (storageSuccess) {
                        // Display results
                        displayShareLinkResult(shareLink, fileName, fileSize, expiryDate, finalPassword, hasPassword);
                        showSuccess('Share link generated successfully!');
                    } else {
                        showError('Failed to store file. File may be too large for local storage.');
                    }
                };
                
                reader.onerror = function() {
                    showError('Error reading file');
                };
                
                reader.readAsDataURL(file);

            } catch (error) {
                showError('Error generating link: ' + error.message);
            }
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
        }

        function generateUniqueId() {
            return 'share_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
        }

        function getExpiryDate(expiry) {
            const now = new Date();
            let expiryDate;

            switch(expiry) {
                case '1hour':
                    expiryDate = new Date(now.getTime() + 60 * 60 * 1000);
                    break;
                case '24hours':
                    expiryDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                    break;
                case '7days':
                    expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30days':
                    expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'custom':
                    expiryDate = new Date(document.getElementById('customDate').value);
                    break;
                default:
                    expiryDate = null;
            }

            return expiryDate;
        }

        function generatePassword() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let password = '';
            for (let i = 0; i < 8; i++) {
                password += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return password;
        }

        function storeFileForSharing(fileData, metadata) {
            const shareId = metadata.shareId;
            const storageKey = `share_${shareId}`;
            
            try {
                const storageData = {
                    filename: metadata.filename,
                    fileSize: metadata.fileSize,
                    fileData: fileData,
                    createTime: Date.now(),
                    expiryTime: metadata.expiryTime,
                    password: metadata.password,
                    hasPassword: metadata.hasPassword
                };
                
                localStorage.setItem(storageKey, JSON.stringify(storageData));
                return true;
            } catch (error) {
                console.error('Storage error:', error);
                return false;
            }
        }

        function displayShareLinkResult(link, fileName, fileSize, expiryDate, password, hasPassword) {
            let resultHTML = `
                <div class="link-result-header">✓ Share Link Created</div>
                <div class="generated-link-box">
                    <div class="generated-link-text">${link}</div>
                    <button class="btn-copy-link" onclick="copyToClipboard('${link}')">Copy</button>
                </div>
                <div class="link-details">
                    <div class="link-details-row">
                        <span class="link-details-label">File Name:</span>
                        <span class="link-details-value">${escapeHtml(fileName)}</span>
                    </div>
                    <div class="link-details-row">
                        <span class="link-details-label">File Size:</span>
                        <span class="link-details-value">${fileSize}</span>
                    </div>
                    <div class="link-details-row">
                        <span class="link-details-label">Expires:</span>
                        <span class="link-details-value">${expiryDate ? expiryDate.toLocaleDateString() + ' ' + expiryDate.toLocaleTimeString() : 'Never'}</span>
                    </div>
                    ${hasPassword ? `<div class="link-details-row">
                        <span class="link-details-label">Password:</span>
                        <span class="link-details-value">${password}</span>
                    </div>` : ''}
                </div>
                <div class="link-action-buttons">
                    <button class="btn-copy-link" onclick="copyToClipboard('${link}')">📋 Copy Link</button>
                    <button class="btn-qr-link" onclick="generateQRForLink('${link}', '${escapeHtml(fileName)}')">📱 Generate QR Code</button>
                </div>
            `;

            let resultContainer = document.getElementById('linkResultContainer');
            if (!resultContainer) {
                resultContainer = document.createElement('div');
                resultContainer.id = 'linkResultContainer';
                resultContainer.className = 'link-result-container active';
                // Insert after the generate button in the linkgen tab
                const linkgenTab = document.getElementById('linkgen-tab');
                const generateBtn = linkgenTab.querySelector('.btn-generate');
                generateBtn.parentNode.insertBefore(resultContainer, generateBtn.nextSibling);
            }

            resultContainer.innerHTML = resultHTML;
            resultContainer.classList.add('active');
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showSuccess('Copied to clipboard!');
            }).catch(() => {
                showError('Failed to copy');
            });
        }

        function copyCurrentLink() {
            const url = window.location.href;
            copyToClipboard(url);
        }

        function shareCurrentPage() {
            const link = window.location.href;
            const shareData = {
                title: 'QR Code Generator',
                text: 'Check out this QR Code generator page:',
                url: link
            };

            if (navigator.share) {
                navigator.share(shareData).catch(err => {
                    showError('Sharing failed: ' + err.message);
                    showShareSection();
                });
            } else {
                // Fallback: copy to clipboard + show UI with options
                copyToClipboard(link);
                showSuccess('Link copied! Use the share options to post it.');
                showShareSection();
            }
        }

        function shareWithWebAPI() {
            const shareData = {
                title: 'QR Code Generator',
                text: 'Check out this QR code generator!',
                url: window.location.href
            };

            if (navigator.share) {
                navigator.share(shareData).catch(error => {
                    showError('Sharing failed: ' + error.message);
                });
            } else {
                showError('Web Share API is not available in this browser.');
            }
        }

        function openShareTarget(network) {
            const url = encodeURIComponent(window.location.href);
            const text = encodeURIComponent('Try this QR Code Generator: ' + window.location.href);

            let shareUrl;
            switch(network) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'email':
                    shareUrl = `mailto:?subject=QR Code Generator&body=${text}`;
                    break;
                default:
                    return;
            }

            window.open(shareUrl, '_blank');
        }

        function generateQRForLink(link, fileName) {
            document.querySelector('[data-tab="link"]').click();
            setTimeout(() => {
                document.getElementById('urlInput').value = link;
                generateQRCode();
                showSuccess(`QR Code generated for: ${fileName}`);
            }, 100);
        }

        // ===== Download Link Handling Functions =====
        let pendingDownloadId = null;
        let pendingFileData = null;
        let correctPassword = false;

        function checkForDownloadRequest() {
            const params = new URLSearchParams(window.location.search);
            const shareId = params.get('share');
            const scanId = params.get('scan');

            if (shareId) {
                // Handle file share links
                const storageKey = `share_${shareId}`;
                const storedData = localStorage.getItem(storageKey);

                if (storedData) {
                    try {
                        const data = JSON.parse(storedData);
                        
                        // Check expiry
                        if (data.expiryTime && Date.now() > data.expiryTime) {
                            showDownloadExpired(data.filename);
                            return;
                        }

                        // Hide generator, show download page
                        document.querySelector('.container').style.display = 'none';
                        document.getElementById('downloadPage').classList.add('active');
                        document.getElementById('downloadFilename').textContent = data.filename;
                        document.getElementById('downloadSize').textContent = `Size: ${data.fileSize}`;

                        // Check password
                        if (data.hasPassword) {
                            document.getElementById('passwordModal').classList.add('active');
                            pendingDownloadId = shareId;
                            pendingFileData = data;
                            correctPassword = false;
                        } else {
                            pendingDownloadId = shareId;
                            pendingFileData = data;
                            correctPassword = true;
                        }
                    } catch (error) {
                        showDownloadError('Invalid file data. Please request a new link.');
                    }
                } else {
                    showDownloadError('File not found. The link may have expired or is invalid.');
                }
            } else if (scanId) {
                // Handle scanned result share links
                const storageKey = `scan_${scanId}`;
                const storedData = localStorage.getItem(storageKey);

                if (storedData) {
                    try {
                        const data = JSON.parse(storedData);
                        
                        // Always show the scanned result page with options
                        document.querySelector('.container').style.display = 'none';
                        showScannedResultPage(data);
                    } catch (error) {
                        showScannedResultError('Invalid scanned data. Please request a new link.');
                    }
                } else {
                    showScannedResultError('Scanned result not found. The link may have expired or is invalid.');
                }
            }
        }

        function verifyPassword() {
            const inputPassword = document.getElementById('passwordInput').value;
            
            if (!pendingFileData) {
                showDownloadError('File data not found.');
                return;
            }

            if (inputPassword === pendingFileData.password) {
                document.getElementById('passwordModal').classList.remove('active');
                correctPassword = true;
            } else {
                alert('❌ Incorrect password. Please try again.');
                document.getElementById('passwordInput').value = '';
            }
        }

        function performDownload() {
            if (!pendingFileData || !correctPassword) {
                showDownloadError('No file to download or authentication failed.');
                return;
            }

            try {
                const fileData = pendingFileData.fileData;
                const filename = pendingFileData.filename;
                
                // Create blob from data URL
                const arr = fileData.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                const n = bstr.length;
                const u8arr = new Uint8Array(n);
                for (let i = 0; i < n; i++) {
                    u8arr[i] = bstr.charCodeAt(i);
                }
                const blob = new Blob([u8arr], { type: mime });

                // Trigger download
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                setTimeout(() => {
                    alert('✓ File downloaded successfully!');
                }, 300);
            } catch (error) {
                showDownloadError('Failed to download file: ' + error.message);
            }
        }

        function cancelDownload() {
            document.getElementById('passwordModal').classList.remove('active');
            backToGenerator();
        }

        function backToGenerator() {
            pendingDownloadId = null;
            pendingFileData = null;
            correctPassword = false;
            document.getElementById('passwordInput').value = '';
            document.querySelector('.container').style.display = 'block';
            document.getElementById('downloadPage').classList.remove('active');
            
            // Also hide scanned result pages
            const scannedPage = document.getElementById('scannedResultPage');
            const scannedErrorPage = document.getElementById('scannedErrorPage');
            if (scannedPage) scannedPage.classList.remove('active');
            if (scannedErrorPage) scannedErrorPage.classList.remove('active');
            
            window.history.pushState({}, document.title, window.location.pathname);
        }

        function showDownloadError(message) {
            document.querySelector('.container').style.display = 'none';
            document.getElementById('downloadPage').classList.add('active');
            const errorDiv = document.getElementById('downloadError');
            errorDiv.innerHTML = `<div class="download-error">${message}</div>`;
            document.getElementById('downloadButton').style.display = 'none';
        }

        function showDownloadExpired(filename) {
            document.querySelector('.container').style.display = 'none';
            document.getElementById('downloadPage').classList.add('active');
            document.getElementById('downloadFilename').textContent = filename;
            const expiredDiv = document.getElementById('downloadExpired');
            expiredDiv.innerHTML = `<div class="download-expired">⏰ This link has expired. Please request a new download link.</div>`;
            document.getElementById('downloadButton').style.display = 'none';
        }

        function showScannedResultPage(data) {
            // Create scanned result page if it doesn't exist
            let scannedPage = document.getElementById('scannedResultPage');
            if (!scannedPage) {
                scannedPage = document.createElement('div');
                scannedPage.id = 'scannedResultPage';
                scannedPage.className = 'scanned-result-page';
                document.body.appendChild(scannedPage);
                
                scannedPage.innerHTML = `
                    <div class="scanned-result-container">
                        <div class="scanned-result-icon">📱</div>
                        <div class="scanned-result-title">Scanned QR Code Result</div>
                        <div class="scanned-result-content" id="scannedResultContent"></div>
                        <div class="scanned-result-actions">
                            <button class="btn-copy-scanned" onclick="copyScannedResult()">📋 Copy</button>
                            <button class="btn-open-scanned hidden" id="openScannedBtn" onclick="openScannedResult()">🔗 Open</button>
                            <button class="btn-download-scanned hidden" id="downloadScannedBtn" onclick="downloadScannedResult()">📥 Download</button>
                            <button class="btn-back-to-generator" onclick="backToGenerator()">← Back to Generator</button>
                        </div>
                    </div>
                `;
            }
            
            scannedPage.classList.add('active');
            
            // Display the scanned data
            const contentDiv = document.getElementById('scannedResultContent');
            const dataType = data.dataType;
            const scannedData = data.scannedData;
            
            let contentHTML = '';
            if (dataType === 'url') {
                contentHTML = `<div class="scanned-url">${scannedData}</div>`;
                document.getElementById('openScannedBtn').classList.remove('hidden');
                document.getElementById('downloadScannedBtn').classList.remove('hidden');
            } else if (dataType === 'email') {
                contentHTML = `<div class="scanned-email">📧 ${scannedData}</div>`;
            } else if (dataType === 'phone') {
                contentHTML = `<div class="scanned-phone">📞 ${scannedData}</div>`;
            } else {
                contentHTML = `<div class="scanned-text">${scannedData}</div>`;
            }
            
            contentDiv.innerHTML = contentHTML;
            
            // Store for actions
            window.currentScannedData = scannedData;
            
            // Store the data for copying
            window.currentScannedData = scannedData;
        }

        function showScannedResultError(message) {
            // Create error page if it doesn't exist
            let errorPage = document.getElementById('scannedErrorPage');
            if (!errorPage) {
                errorPage = document.createElement('div');
                errorPage.id = 'scannedErrorPage';
                errorPage.className = 'scanned-error-page';
                document.body.appendChild(errorPage);
                
                errorPage.innerHTML = `
                    <div class="scanned-error-container">
                        <div class="scanned-error-icon">❌</div>
                        <div class="scanned-error-title">Error</div>
                        <div class="scanned-error-message" id="scannedErrorMessage"></div>
                        <button class="btn-back-to-generator" onclick="backToGenerator()">← Back to Generator</button>
                    </div>
                `;
            }
            
            document.querySelector('.container').style.display = 'none';
            errorPage.classList.add('active');
            document.getElementById('scannedErrorMessage').textContent = message;
        }

        function copyScannedResult() {
            if (window.currentScannedData) {
                copyToClipboard(window.currentScannedData);
            }
        }

        function openScannedResult() {
            if (window.currentScannedData && window.currentScannedData.startsWith('http')) {
                window.open(window.currentScannedData, '_blank');
            }
        }

        function downloadScannedResult() {
            if (window.currentScannedData && window.currentScannedData.startsWith('http')) {
                const link = document.createElement('a');
                link.href = window.currentScannedData;
                link.download = '';
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            checkForDownloadRequest();
            handlePasswordToggle();
            handleExpiryDateToggle();
        });
    
