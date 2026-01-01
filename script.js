// --- 1. State Management ---
let currentType = 'link';
let qrCode;
let currentOptions = {
    width: 300,
    height: 300,
    type: "svg",
    data: "https://example.com",
    image: "",
    dotsOptions: { color: "#000000", type: "square" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 },
    cornersSquareOptions: { type: "square", color: "#000000" }
};

// --- 2. QR Types Configuration ---
// --- 2. QR Types Configuration ---
const types = [
    { id: 'link', icon: 'fa-solid fa-link', label: 'Link' },
    { id: 'text', icon: 'fa-solid fa-align-left', label: 'Text' },
    { id: 'email', icon: 'fa-solid fa-envelope', label: 'Email' },
    { id: 'pdf', icon: 'fa-solid fa-file-pdf', label: 'PDF' },
    { id: 'img', icon: 'fa-solid fa-image', label: 'Image' },
    { id: 'wifi', icon: 'fa-solid fa-wifi', label: 'Wi-Fi' },
    { id: 'wa', icon: 'fa-brands fa-whatsapp', label: 'WhatsApp' }, // Note "fa-brands" here
];

// --- 3. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderTypeButtons();
    
    // Initialize QR Code Styling Library
    qrCode = new QRCodeStyling(currentOptions);
    qrCode.append(document.getElementById("canvas"));

    // Add Event Listeners for Live Typing
    document.getElementById('urlValue').addEventListener('input', updateQR);
    document.getElementById('textValue').addEventListener('input', updateQR);
    document.getElementById('fileUrlValue').addEventListener('input', (e) => updateContent(e.target.value));

    // Add Event Listeners for Color Changes
    document.getElementById('dotsColor').addEventListener('change', updateDesign);
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
    
    // Toggle Inputs
    document.getElementById('linkInput').classList.add('hidden');
    document.getElementById('textInput').classList.add('hidden');
    document.getElementById('fileInput').classList.add('hidden');

    if(type === 'link' || type === 'email' || type === 'wa') {
        document.getElementById('linkInput').classList.remove('hidden');
    } else if(type === 'text') {
        document.getElementById('textInput').classList.remove('hidden');
    } else {
        document.getElementById('fileInput').classList.remove('hidden');
    }
}

function updateQR() {
    let data = "https://example.com";
    
    if (currentType === 'link') {
        data = document.getElementById('urlValue').value || "https://example.com";
    } else if (currentType === 'text') {
        data = document.getElementById('textValue').value || "Text";
    }
    
    currentOptions.data = data;
    qrCode.update(currentOptions);
}

function updateContent(val) {
    currentOptions.data = val;
    qrCode.update(currentOptions);
}

// --- 6. Design & Templates ---
function switchTab(tabName) {
    ['templates', 'colors', 'shapes'].forEach(t => {
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
        currentOptions.dotsOptions.color = "#ec4899"; // Pink
        currentOptions.backgroundOptions.color = "#fffbeb"; // Light yellow
        currentOptions.dotsOptions.type = "dots";
        currentOptions.cornersSquareOptions.type = "extra-rounded";
        currentOptions.cornersSquareOptions.color = "#f59e0b";
    }
    else if(name === 'marriage') {
        currentOptions.dotsOptions.color = "#be185d"; // Deep Pink
        currentOptions.backgroundOptions.color = "#ffffff";
        currentOptions.dotsOptions.type = "classy";
        currentOptions.cornersSquareOptions.type = "dot";
    }
    else if(name === 'business') {
        currentOptions.dotsOptions.color = "#1e3a8a"; // Navy
        currentOptions.backgroundOptions.color = "#f3f4f6";
        currentOptions.dotsOptions.type = "square";
        currentOptions.cornersSquareOptions.type = "square";
    }
    // Update input value to match template
    document.getElementById('dotsColor').value = currentOptions.dotsOptions.color;
    
    qrCode.update(currentOptions);
}

// --- 7. Download ---
function downloadQR(format) {
    // Temporarily increase resolution for download to ensure high quality
    qrCode.update({ width: 1000, height: 1000 }); 
    qrCode.download({ extension: format });
    // Reset to preview size
    qrCode.update({ width: 300, height: 300 }); 
}