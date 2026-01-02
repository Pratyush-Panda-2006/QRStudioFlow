// --- 1. State Management ---
let currentType = 'link';
let qrCode;

// DEFAULT CONFIGURATION
let currentOptions = {
    width: 300,
    height: 300,
    type: "svg",
    data: "https://example.com",
    image: "",
    // CRITICAL FIX: Set Error Correction to 'H' (High) 
    // This allows 30% of the code to be covered by a logo and still scan.
    qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H" 
    },
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    // Reduce default logo size to ensure scannability
    imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: 0.3 }, 
    cornersSquareOptions: { type: "square", color: "#000000" }
};

// --- 2. QR Types Configuration ---
const types = [
    { id: 'link', icon: 'fa-solid fa-link', label: 'Link' },
    { id: 'text', icon: 'fa-solid fa-align-left', label: 'Text' },
    { id: 'email', icon: 'fa-solid fa-envelope', label: 'Email' },
    { id: 'pdf', icon: 'fa-solid fa-file-pdf', label: 'PDF' },
    { id: 'img', icon: 'fa-solid fa-image', label: 'Image' },
    { id: 'wifi', icon: 'fa-solid fa-wifi', label: 'Wi-Fi' },
    { id: 'wa', icon: 'fa-brands fa-whatsapp', label: 'WhatsApp' },
];

// --- 3. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderTypeButtons();
    
    // Initialize QR Code Styling Library
    qrCode = new QRCodeStyling(currentOptions);
    qrCode.append(document.getElementById("canvas"));

    // EVENT LISTENERS
    
    // 1. Inputs
    document.getElementById('urlValue').addEventListener('input', updateQR);
    document.getElementById('textValue').addEventListener('input', updateQR);
    
    // 2. Email
    document.getElementById('emailAddr').addEventListener('input', updateQR);
    document.getElementById('emailSub').addEventListener('input', updateQR);
    document.getElementById('emailBody').addEventListener('input', updateQR);

    // 3. Wi-Fi
    document.getElementById('wifiSSID').addEventListener('input', updateQR);
    document.getElementById('wifiPass').addEventListener('input', updateQR);
    document.getElementById('wifiType').addEventListener('change', updateQR);

    // 4. WhatsApp
    document.getElementById('waNumber').addEventListener('input', updateQR);
    document.getElementById('waMessage').addEventListener('input', updateQR);

    // 5. File Uploads (PDF/Image Content)
    document.getElementById('pdfFile').addEventListener('change', handleFileUpload);

    // 6. Design Customization
    document.getElementById('dotsColor').addEventListener('change', updateDesign);
    
    // 7. Logo Upload (Center Image)
    document.getElementById('logoInput').addEventListener('change', handleLogoUpload);
});

// --- 4. Render UI Elements ---
function renderTypeButtons() {
    const grid = document.getElementById('typeGrid');
    grid.innerHTML = types.map(t => `
        <button onclick="setType('${t.id}')" 
            class="type-btn ${t.id === currentType ? 'active' : ''} border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition">
            <i class="${t.icon} text-2xl"></i>
            <span class="text-xs font-medium">${t.label}</span>
        </button>
    `).join('');
}

// --- 5. Logic Handlers ---
function setType(type) {
    currentType = type;
    renderTypeButtons();
    
    // Hide ALL inputs first
    const inputs = ['linkInput', 'textInput', 'emailInput', 'wifiInput', 'waInput', 'fileInput'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    // Show specific input
    if(type === 'link') document.getElementById('linkInput').classList.remove('hidden');
    else if(type === 'text') document.getElementById('textInput').classList.remove('hidden');
    else if(type === 'email') document.getElementById('emailInput').classList.remove('hidden');
    else if(type === 'wifi') document.getElementById('wifiInput').classList.remove('hidden');
    else if(type === 'wa') document.getElementById('waInput').classList.remove('hidden');
    else if(type === 'pdf' || type === 'img') document.getElementById('fileInput').classList.remove('hidden');
}

function updateQR() {
    let data = "";
    
    // EXTRACT DATA BASED ON TYPE
    if (currentType === 'link') {
        data = document.getElementById('urlValue').value || "https://example.com";
    } 
    else if (currentType === 'text') {
        data = document.getElementById('textValue').value || "Text";
    }
    else if (currentType === 'email') {
        const email = document.getElementById('emailAddr').value || "";
        const sub = encodeURIComponent(document.getElementById('emailSub').value || "");
        const body = encodeURIComponent(document.getElementById('emailBody').value || "");
        data = `mailto:${email}?subject=${sub}&body=${body}`;
    }
    else if (currentType === 'wifi') {
        const ssid = document.getElementById('wifiSSID').value || "";
        const pass = document.getElementById('wifiPass').value || "";
        const type = document.getElementById('wifiType').value;
        if(type === 'nopass') data = `WIFI:T:nopass;S:${ssid};;`;
        else data = `WIFI:T:${type};S:${ssid};P:${pass};;`;
    }
    else if (currentType === 'wa') {
        const number = document.getElementById('waNumber').value || "";
        const msg = encodeURIComponent(document.getElementById('waMessage').value || "");
        data = `https://wa.me/${number}?text=${msg}`;
    }
    
    // Only update if data is valid
    if(data) {
        currentOptions.data = data;
        qrCode.update(currentOptions);
    }
}

// --- 6. File Upload Logic (PDF/Image to Link) ---
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // UI Feedback
    const loading = document.getElementById('uploadLoading');
    const success = document.getElementById('uploadSuccess');
    const text = document.getElementById('uploadText');
    
    text.classList.add('hidden');
    loading.classList.remove('hidden');
    success.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);

    // Using file.io (Note: Files are deleted after 1 view or 14 days)
    fetch('https://file.io/?expires=1w', { // Requests 1 week expiration if possible
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const publicLink = result.link;
            
            // UPDATE QR
            currentOptions.data = publicLink;
            qrCode.update(currentOptions);

            // UI Success
            loading.classList.add('hidden');
            success.classList.remove('hidden');
            document.getElementById('finalUrlDisplay').innerText = "Scan to view: " + file.name;
        } else {
            alert("Upload failed. Try a smaller file.");
            text.classList.remove('hidden');
            loading.classList.add('hidden');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Network error during upload.");
        text.classList.remove('hidden');
        loading.classList.add('hidden');
    });
}

// --- 7. Logo Upload Logic (Design) ---
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
        // Update QR Image
        currentOptions.image = reader.result;
        qrCode.update(currentOptions);

        // Update UI
        document.getElementById('logoPreviewImg').src = reader.result;
        document.getElementById('logoUploadState').classList.add('hidden');
        document.getElementById('logoPreviewState').classList.remove('hidden');
    }
    reader.readAsDataURL(file);
}

function removeLogo() {
    currentOptions.image = "";
    qrCode.update(currentOptions);
    document.getElementById('logoInput').value = ""; // Reset input
    document.getElementById('logoUploadState').classList.remove('hidden');
    document.getElementById('logoPreviewState').classList.add('hidden');
}

function resizeLogo(val) {
    if(!currentOptions.image) return;
    currentOptions.imageOptions.imageSize = parseFloat(val);
    qrCode.update(currentOptions);
}

// --- 8. Tabs & Design ---
function switchTab(tabName) {
    // Included 'logo' in the list
    ['templates', 'colors', 'shapes', 'logo'].forEach(t => {
        document.getElementById(`tab-${t}`).classList.add('hidden');
    });

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('border-b-2', 'border-indigo-600', 'text-indigo-600');
        btn.classList.add('text-gray-500');
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');

    const activeBtn = document.getElementById(`btn-${tabName}`);
    activeBtn.classList.remove('text-gray-500');
    activeBtn.classList.add('border-b-2', 'border-indigo-600', 'text-indigo-600');
}

function updateDesign() {
    const dotsColor = document.getElementById('dotsColor').value;
    currentOptions.dotsOptions.color = dotsColor;
    currentOptions.cornersSquareOptions.color = dotsColor;
    qrCode.update(currentOptions);
}

function setDotType(type) {
    currentOptions.dotsOptions.type = type;
    qrCode.update(currentOptions);
}

function setCornerType(type) {
    currentOptions.cornersSquareOptions.type = type;
    qrCode.update(currentOptions);
}

function applyTemplate(name) {
    if(name === 'default') {
        currentOptions.dotsOptions.color = "#000000";
        currentOptions.backgroundOptions.color = "#ffffff";
        currentOptions.dotsOptions.type = "square";
        currentOptions.cornersSquareOptions.type = "square";
    } 
    else if(name === 'birthday') {
        currentOptions.dotsOptions.color = "#ec4899";
        currentOptions.backgroundOptions.color = "#fffbeb";
        currentOptions.dotsOptions.type = "dots";
        currentOptions.cornersSquareOptions.type = "extra-rounded";
        currentOptions.cornersSquareOptions.color = "#f59e0b";
    }
    else if(name === 'marriage') {
        currentOptions.dotsOptions.color = "#be185d";
        currentOptions.backgroundOptions.color = "#ffffff";
        currentOptions.dotsOptions.type = "classy";
        currentOptions.cornersSquareOptions.type = "dot";
    }
    else if(name === 'business') {
        currentOptions.dotsOptions.color = "#1e3a8a";
        currentOptions.backgroundOptions.color = "#f3f4f6";
        currentOptions.dotsOptions.type = "square";
        currentOptions.cornersSquareOptions.type = "square";
    }
    
    // Sync color picker with template
    const picker = document.getElementById('dotsColor');
    if(picker) picker.value = currentOptions.dotsOptions.color;
    
    qrCode.update(currentOptions);
}

// --- 9. Download ---
function downloadQR(format) {
    qrCode.update({ width: 1000, height: 1000 });
    qrCode.download({ extension: format });
    qrCode.update({ width: 300, height: 300 });
}

// --- Logo Handling Logic ---

// 1. Listen for File Upload
document.getElementById('logoInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
        const result = reader.result;

        // Update QR Code
        currentOptions.image = result;
        currentOptions.imageOptions = { crossOrigin: "anonymous", margin: 10, imageSize: 0.4 }; // Default size
        qrCode.update(currentOptions);

        // Update UI: Show Preview, Hide Upload
        document.getElementById('logoPreviewImg').src = result;
        document.getElementById('logoUploadState').classList.add('hidden');
        document.getElementById('logoPreviewState').classList.remove('hidden');
    }
    reader.readAsDataURL(file);
});

// 2. Remove Logo Function
function removeLogo() {
    // Clear QR Image
    currentOptions.image = "";
    qrCode.update(currentOptions);

    // Reset Input
    document.getElementById('logoInput').value = "";

    // Reset UI: Show Upload, Hide Preview
    document.getElementById('logoUploadState').classList.remove('hidden');
    document.getElementById('logoPreviewState').classList.add('hidden');
}

// 3. Resize Logo (Optional slider)
function resizeLogo(val) {
    if(!currentOptions.image) return; // Do nothing if no logo
    currentOptions.imageOptions.imageSize = parseFloat(val);
    qrCode.update(currentOptions);
}