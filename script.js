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
    qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H" 
    },
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 5, imageSize: 0.3 },
    cornersSquareOptions: { type: "square", color: "#000000" },
    cornersDotOptions: { type: "square", color: "#000000" }
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
    
    qrCode = new QRCodeStyling(currentOptions);
    qrCode.append(document.getElementById("canvas"));

    // EVENT LISTENERS - Content
    document.getElementById('urlValue').addEventListener('input', updateQR);
    document.getElementById('textValue').addEventListener('input', updateQR);
    document.getElementById('emailAddr').addEventListener('input', updateQR);
    document.getElementById('emailSub').addEventListener('input', updateQR);
    document.getElementById('emailBody').addEventListener('input', updateQR);
    document.getElementById('wifiSSID').addEventListener('input', updateQR);
    document.getElementById('wifiPass').addEventListener('input', updateQR);
    document.getElementById('wifiType').addEventListener('change', updateQR);
    document.getElementById('waNumber').addEventListener('input', updateQR);
    document.getElementById('waMessage').addEventListener('input', updateQR);

    // Event Listeners - Uploads
    const pdfInput = document.getElementById('pdfFile');
    if(pdfInput) pdfInput.addEventListener('change', handleFileUpload);
    
    const logoInput = document.getElementById('logoInput');
    if(logoInput) logoInput.addEventListener('change', handleLogoUpload);

    // EVENT LISTENERS - DESIGN (Updated for independent colors)
    const dotsPicker = document.getElementById('dotsColor');
    const cornerPicker = document.getElementById('cornerColor');
    const bgPicker = document.getElementById('bgColor');

    if(dotsPicker) dotsPicker.addEventListener('input', updateDesign);
    if(cornerPicker) cornerPicker.addEventListener('input', updateDesign);
    if(bgPicker) bgPicker.addEventListener('input', updateDesign);
});

// --- 4. Render UI Elements ---
function renderTypeButtons() {
    const grid = document.getElementById('typeGrid');
    if(!grid) return;
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
    
    const inputs = ['linkInput', 'textInput', 'emailInput', 'wifiInput', 'fileInput'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });

    if(type === 'link' || type === 'wa') document.getElementById('linkInput').classList.remove('hidden');
    else if(type === 'text') document.getElementById('textInput').classList.remove('hidden');
    else if(type === 'email') document.getElementById('emailInput').classList.remove('hidden');
    else if(type === 'wifi') document.getElementById('wifiInput').classList.remove('hidden');
    else if(type === 'pdf' || type === 'img') document.getElementById('fileInput').classList.remove('hidden');
}

function updateQR() {
    let data = "";
    if (currentType === 'link') data = document.getElementById('urlValue').value || "https://example.com";
    else if (currentType === 'text') data = document.getElementById('textValue').value || "Text";
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
    
    if(data) {
        currentOptions.data = data;
        qrCode.update(currentOptions);
    }
}

// --- 6. File Upload Logic ---
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const loading = document.getElementById('uploadLoading');
    const success = document.getElementById('uploadSuccess');
    const text = document.getElementById('uploadText');
    const urlDisplay = document.getElementById('finalUrlDisplay');
    
    text.classList.add('hidden');
    loading.classList.remove('hidden');
    success.classList.add('hidden');

    const formData = new FormData();
    formData.append('file', file);

    fetch('https://file.io/?expires=1w', { method: 'POST', body: formData })
    .then(response => {
        if (!response.ok) throw new Error("Upload Failed");
        return response.json();
    })
    .then(result => {
        if (result.success) {
            currentOptions.data = result.link;
            qrCode.update(currentOptions);
            loading.classList.add('hidden');
            success.classList.remove('hidden');
            urlDisplay.innerText = "Scan to view: " + file.name;
        } else {
            throw new Error("API Error");
        }
    })
    .catch(error => {
        console.warn('Upload Error:', error);
        const demoLink = "https://file.io/demo-link";
        currentOptions.data = demoLink;
        qrCode.update(currentOptions);
        loading.classList.add('hidden');
        success.classList.remove('hidden');
        urlDisplay.innerText = "DEMO LINK (Use Live Server for real upload)";
        alert("Note: Use 'Live Server' in VS Code for real uploads.");
    });
}

// --- 7. Logo Upload Logic ---
function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
        const result = reader.result;
        currentOptions.image = result;
        currentOptions.imageOptions = { crossOrigin: "anonymous", margin: 10, imageSize: 0.4 }; 
        qrCode.update(currentOptions);
        document.getElementById('logoPreviewImg').src = result;
        document.getElementById('logoUploadState').classList.add('hidden');
        document.getElementById('logoPreviewState').classList.remove('hidden');
    }
    reader.readAsDataURL(file);
}

function removeLogo() {
    currentOptions.image = "";
    qrCode.update(currentOptions);
    document.getElementById('logoInput').value = "";
    document.getElementById('logoUploadState').classList.remove('hidden');
    document.getElementById('logoPreviewState').classList.add('hidden');
}

function resizeLogo(val) {
    if(!currentOptions.image) return;
    currentOptions.imageOptions.imageSize = parseFloat(val);
    qrCode.update(currentOptions);
}

// --- 8. Design & Color Logic (UPDATED FOR DUAL COLORS) ---
function updateDesign() {
    const dotsColor = document.getElementById('dotsColor').value;
    const cornerColor = document.getElementById('cornerColor').value;
    const bgColor = document.getElementById('bgColor').value;
    
    // Safety Checks
    if (!currentOptions.dotsOptions) currentOptions.dotsOptions = {};
    if (!currentOptions.cornersSquareOptions) currentOptions.cornersSquareOptions = {};
    if (!currentOptions.cornersDotOptions) currentOptions.cornersDotOptions = {};
    if (!currentOptions.backgroundOptions) currentOptions.backgroundOptions = {};

    // Apply Independent Colors
    currentOptions.dotsOptions.color = dotsColor;
    currentOptions.cornersSquareOptions.color = cornerColor; // Outer corner square
    currentOptions.cornersDotOptions.color = cornerColor;    // Inner corner dot
    currentOptions.backgroundOptions.color = bgColor;
    
    qrCode.update(currentOptions);
}

function switchTab(tabName) {
    ['templates', 'colors', 'shapes', 'logo'].forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) el.classList.add('hidden');
    });

    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.remove('border-b-2', 'border-indigo-600', 'text-indigo-600');
        btn.classList.add('text-gray-500');
    });

    const targetTab = document.getElementById(`tab-${tabName}`);
    if(targetTab) targetTab.classList.remove('hidden');

    const activeBtn = document.getElementById(`btn-${tabName}`);
    if(activeBtn) {
        activeBtn.classList.remove('text-gray-500');
        activeBtn.classList.add('border-b-2', 'border-indigo-600', 'text-indigo-600');
    }
}

function setDotType(type) {
    currentOptions.dotsOptions.type = type;
    qrCode.update(currentOptions);
}

function setCornerType(type) {
    currentOptions.cornersSquareOptions.type = type;
    if(type === 'dot') currentOptions.cornersDotOptions.type = 'dot';
    else currentOptions.cornersDotOptions.type = 'square';
    
    qrCode.update(currentOptions);
}

function applyTemplate(name) {
    let dotColor = "#000000";
    let cornerColor = "#000000";
    let bgColor = "#ffffff";
    let dotType = "square";
    let cornerType = "square";
    
    if(name === 'default') {
        dotColor = "#000000";
        cornerColor = "#000000";
    } 
    else if(name === 'birthday') {
        dotColor = "#ec4899"; // Pink dots
        cornerColor = "#f59e0b"; // Orange corners
        bgColor = "#fffbeb";
        dotType = "dots";
        cornerType = "extra-rounded";
    }
    else if(name === 'marriage') {
        dotColor = "#be185d"; 
        cornerColor = "#be185d"; 
        dotType = "classy";
        cornerType = "dot";
    }
    else if(name === 'business') {
        dotColor = "#1e3a8a"; // Navy
        cornerColor = "#1e3a8a";
        bgColor = "#f3f4f6";
    }
    
    // Safety Checks
    if (!currentOptions.dotsOptions) currentOptions.dotsOptions = {};
    if (!currentOptions.cornersSquareOptions) currentOptions.cornersSquareOptions = {};
    if (!currentOptions.cornersDotOptions) currentOptions.cornersDotOptions = {};
    if (!currentOptions.backgroundOptions) currentOptions.backgroundOptions = {};

    // Apply Values
    currentOptions.dotsOptions.color = dotColor;
    currentOptions.cornersSquareOptions.color = cornerColor;
    currentOptions.cornersDotOptions.color = cornerColor;
    currentOptions.backgroundOptions.color = bgColor;
    currentOptions.dotsOptions.type = dotType;
    currentOptions.cornersSquareOptions.type = cornerType;
    
    // Sync UI Color Pickers
    const dotsPicker = document.getElementById('dotsColor');
    const cornerPicker = document.getElementById('cornerColor');
    const bgPicker = document.getElementById('bgColor');

    if(dotsPicker) dotsPicker.value = dotColor;
    if(cornerPicker) cornerPicker.value = cornerColor;
    if(bgPicker) bgPicker.value = bgColor;
    
    qrCode.update(currentOptions);
}

// --- 9. Download ---
function downloadQR(format) {
    qrCode.update({ width: 1000, height: 1000 });
    qrCode.download({ extension: format });
    qrCode.update({ width: 300, height: 300 });
}