// ========================================================
// ⚙️ แผงตั้งค่าพิกัด & ขนาดสกรีนเสื้อ (สามารถปรับค่าที่นี่ได้โดยตรง)
// ========================================================
const JERSEY_CONFIG = {
  // 1. เบอร์ด้านหลัง (Back Number)
  backNumber: {
    x: 390,        // แนวนอน (390 = กึ่งกลางเสื้อพอดี)
    y: 445,        // แนวตั้ง (ความสูงของเบอร์หลัง)
    size: 415      // ขนาดตัวเลขด้านหลัง
  },

  // 2. ชื่อด้านหลัง (Back Name)
  backName: {
    arcCurveY: 195, // ระดับความโค้งของชื่อแนวตั้ง (Y)
    baseSize: 76   // ขนาดตัวอักษรชื่อเริ่มต้น
  },

  // 3. เบอร์ด้านหน้าอก (Front Chest Number)
  frontNumber: {
    x: 250,        // แนวนอน (250 = อกขวา)
    y: 250,        // แนวตั้ง (ความสูงของเบอร์หน้าอก)
    size: 100      // ขนาดตัวเลขด้านหน้า
  }
};

// ==========================================
// 1. APPLICATION STATE
// ==========================================
const AppState = {
  mode: 'new', // 'new' | 'edit'
  viewSide: 'back', // 'back' | 'front' | 'both'
  email: '',
  size: 'L',
  screenName: '',
  screenNumber: '10',
  paymentStatus: 'pending', // legacy
  orderStatus: 'รอชำระเงิน', // ค่าสถานะหลักที่บันทึกลง Sheets
  slipImage: null, // Base64 data URL
  slipFileName: '',
  slipUploadedAt: null,
  slipUrl: null, // URL of uploaded slip on Drive
  slipChanged: false, // Track if slip was changed during edit mode
  isSearchingEmail: false,
  isSubmitting: false,
  gasUrl: localStorage.getItem('PURPLE_JERSEY_GAS_URL') || 'https://script.google.com/macros/s/AKfycby4uoyfn-QCbTk2BqZnzb1ZOt54AjAXMe5y0ahMKzFj7MZZQzNeTe8PAcHg5SrynOzhAQ/exec',
  spreadsheetId: '1WOI_8VSHi_6FIaifxPNuX7hTHEElSVKeR8InFHSQZLw',
  existingRecord: null,
  orders: []
};

// Initial Seed Orders - Removed (using Google Sheets only)
const DEFAULT_DEMO_ORDERS = [];

// ==========================================
// 2. DOM ELEMENT REFERENCES
// ==========================================
const DOM = {
  // Form Inputs & Buttons
  inputEmail: document.getElementById('inputEmail'),
  emailLoadingSpinner: document.getElementById('emailLoadingSpinner'),
  emailStatusBadge: document.getElementById('emailStatusBadge'),
  formContentSection: document.getElementById('formContentSection'),
  submitButtonSection: document.getElementById('submitButtonSection'),
  inputScreenName: document.getElementById('inputScreenName'),
  inputScreenNumber: document.getElementById('inputScreenNumber'),
  btnSubmit: document.getElementById('btnSubmit'),
  btnSubmitText: document.getElementById('btnSubmitText'),
  btnSubmitIcon: document.getElementById('btnSubmitIcon'),
  btnReset: document.getElementById('btnResetForm'),
  btnRandomNumber: document.getElementById('btnRandomNumber'),
  btnCapsName: document.getElementById('btnCapsName'),
  sizeBtns: document.querySelectorAll('.size-btn'),
  quickSelectSizeBtns: document.querySelectorAll('.btn-quick-select-size'),

  // Mode Banner
  modeStatusBanner: document.getElementById('modeStatusBanner'),
  btnCancelEditMode: document.getElementById('btnCancelEditMode'),
  paymentStatusDisplay: document.getElementById('paymentStatusDisplay'),
  paymentStatusText: document.getElementById('paymentStatusText'),

  // Order Status Display (Read-only)
  paymentStatusSection: document.getElementById('paymentStatusSection'),
  orderStatusBadge: document.getElementById('orderStatusBadge'),
  statusBtns: document.querySelectorAll('.status-btn'),

  // Payment & Slip Upload Elements
  btnCopyAccount: document.getElementById('btnCopyAccount'),
  qrPromptPayModal: document.getElementById('qrPromptPayModal'),
  btnCloseQrModal: document.getElementById('btnCloseQrModal'),
  qrPromptPayImage: document.getElementById('qrPromptPayImage'),
  promptPayNumber: document.getElementById('promptPayNumber'),
  btnCopyPromptPay: document.getElementById('btnCopyPromptPay'),
  slipDropzone: document.getElementById('slipDropzone'),
  inputSlipFile: document.getElementById('inputSlipFile'),
  slipPreviewCard: document.getElementById('slipPreviewCard'),
  slipThumbnailImg: document.getElementById('slipThumbnailImg'),
  slipStatusBadge: document.getElementById('slipStatusBadge'),
  slipFileName: document.getElementById('slipFileName'),
  slipUploadTime: document.getElementById('slipUploadTime'),
  btnViewSlipFullscreen: document.getElementById('btnViewSlipFullscreen'),
  btnChangeSlip: document.getElementById('btnChangeSlip'),
  btnRemoveSlip: document.getElementById('btnRemoveSlip'),

  // Slip Lightbox Modal
  modalSlipLightbox: document.getElementById('modalSlipLightbox'),
  btnCloseSlipLightbox: document.getElementById('btnCloseSlipLightbox'),
  slipFullImg: document.getElementById('slipFullImg'),

  // Preview Elements
  jerseyCardWrapper: document.getElementById('jerseyCardWrapper'),
  jerseyViewBackEl: document.getElementById('jerseyViewBackEl'),
  jerseyViewFrontEl: document.getElementById('jerseyViewFrontEl'),
  jerseyViewBothEl: document.getElementById('jerseyViewBothEl'),

  // SVG Text & Paths
  nameArcPath: document.getElementById('nameArcPath'),
  svgCurvedNameText: document.getElementById('svgCurvedNameText'),
  svgBackNumber: document.getElementById('svgBackNumber'),
  svgFrontNumber: document.getElementById('svgFrontNumber'),
  nameArcPathBoth: document.getElementById('nameArcPathBoth'),
  svgCurvedNameBoth: document.getElementById('svgCurvedNameBoth'),
  svgBothNumber: document.getElementById('svgBothNumber'),
  svgBothFrontNumber: document.getElementById('svgBothFrontNumber'),

  // View Switchers - REMOVED (always show back view)
  btnViewBack: null,
  btnViewFront: null,
  btnViewBoth: null,
  btnToggleRotation: null,
  btnDownloadJersey: document.getElementById('btnDownloadJersey'),

  // Size Guide Modal
  modalSizeGuide: document.getElementById('modalSizeGuide'),
  btnOpenSizeGuideNav: document.getElementById('btnOpenSizeGuideNav'),
  btnOpenSizeGuideLink: document.getElementById('btnOpenSizeGuideLink'),
  btnCloseSizeGuide: document.getElementById('btnCloseSizeGuide'),

  // Google Sheets Config Modal
  btnOpenConfig: document.getElementById('btnOpenConfig'),
  btnCloseConfig: document.getElementById('btnCloseConfig'),
  modalConfig: document.getElementById('modalConfig'),
  inputGasUrl: document.getElementById('inputGasUrl'),
  btnSaveConfig: document.getElementById('btnSaveConfig'),
  btnTestGas: document.getElementById('btnTestGas'),
  gasStatusDot: document.getElementById('gasStatusDot'),
  gasStatusText: document.getElementById('gasStatusText'),

  // Database Modals & Toast
  totalOrdersCount: document.getElementById('totalOrdersCount'),
  modalOrdersCount: document.getElementById('modalOrdersCount'),
  btnOpenDatabase: document.getElementById('btnOpenDatabase'),
  btnCloseDatabase: document.getElementById('btnCloseDatabase'),
  btnCloseDatabaseFooter: document.getElementById('btnCloseDatabaseFooter'),
  modalDatabase: document.getElementById('modalDatabase'),
  ordersListContainer: document.getElementById('ordersListContainer'),
  btnExportCSV: document.getElementById('btnExportCSV'),
  toastContainer: document.getElementById('toastContainer')
};

// ==========================================
// 3. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  updateLivePreview();
  checkGasConnection();
  // Removed: loadOrdersDatabase() - No longer using LocalStorage
});

// ==========================================
// 4. EVENT BINDINGS
// ==========================================
function bindEvents() {
  // 1. Smart Email Sync
  let emailDebounceTimer;
  let lastSearchedEmail = ''; // Track last searched email
  
  DOM.inputEmail.addEventListener('input', (e) => {
    AppState.email = e.target.value.trim();
    clearTimeout(emailDebounceTimer);
    
    if (isValidEmail(AppState.email)) {
      // Only search if email changed
      if (AppState.email !== lastSearchedEmail) {
        emailDebounceTimer = setTimeout(() => {
          lastSearchedEmail = AppState.email;
          lookupEmailAndShowForm(AppState.email);
        }, 500);
      }
    } else {
      // Clear form when email is invalid
      lastSearchedEmail = '';
      resetToNewMode();
      hideFormContent();
      DOM.emailStatusBadge.classList.add('hidden');
    }
  });

  // 2. Personalization inputs
  DOM.inputScreenName.addEventListener('input', (e) => {
    AppState.screenName = e.target.value;
    updateLivePreview();
  });

  DOM.inputScreenNumber.addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 2) val = val.slice(0, 2);
    AppState.screenNumber = val;
    e.target.value = val;
    updateLivePreview();
  });

  // Quick Tools
  if (DOM.btnCapsName) {
    DOM.btnCapsName.addEventListener('click', () => {
      AppState.screenName = AppState.screenName.toUpperCase();
      DOM.inputScreenName.value = AppState.screenName;
      updateLivePreview();
    });
  }

  if (DOM.btnRandomNumber) {
    DOM.btnRandomNumber.addEventListener('click', () => {
      const luckyNums = ['07', '09', '10', '11', '14', '20', '23', '26', '77', '99'];
      const chosen = luckyNums[Math.floor(Math.random() * luckyNums.length)];
      AppState.screenNumber = chosen;
      DOM.inputScreenNumber.value = chosen;
      updateLivePreview();
    });
  }

  // Size pills
  DOM.sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.size = btn.getAttribute('data-size');
    });
  });

  // Status pills
  const statusBtns = document.querySelectorAll('.status-btn');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.orderStatus = btn.getAttribute('data-status');
      console.log('Status changed to:', AppState.orderStatus);
      
      // Disable slip upload if status is "ชำระเงินแล้ว" or later
      updateSlipUploadAccess();
    });
  });

  // Payment Slip Upload Events
  DOM.quickSelectSizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sizeVal = btn.getAttribute('data-select-size');
      AppState.size = sizeVal;
      DOM.sizeBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-size') === sizeVal);
      });
      if (DOM.modalSizeGuide) DOM.modalSizeGuide.classList.add('hidden');
      showToast(`เลือกไซส์ ${sizeVal} เรียบร้อยแล้ว`, 'success');
    });
  });

  // Size Guide Modal Open/Close
  if (DOM.btnOpenSizeGuideNav) {
    DOM.btnOpenSizeGuideNav.addEventListener('click', () => DOM.modalSizeGuide.classList.remove('hidden'));
  }
  if (DOM.btnOpenSizeGuideLink) {
    DOM.btnOpenSizeGuideLink.addEventListener('click', () => DOM.modalSizeGuide.classList.remove('hidden'));
  }
  if (DOM.btnCloseSizeGuide) {
    DOM.btnCloseSizeGuide.addEventListener('click', () => DOM.modalSizeGuide.classList.add('hidden'));
  }

  // View Switchers - REMOVED
  // Always show back view only

  // Payment Slip Upload Events
  initSlipUploadEvents();

  // Reset Form
  DOM.btnReset.addEventListener('click', () => {
    if (confirm('คุณต้องการล้างข้อมูลในแบบฟอร์มใช่หรือไม่?')) {
      resetForm();
    }
  });

  // Submit Order
  DOM.btnSubmit.addEventListener('click', handleFormSubmit);

  // Download Jersey (optional - removed from UI)
  if (DOM.btnDownloadJersey) {
    DOM.btnDownloadJersey.addEventListener('click', downloadJerseyMockup);
  }

  // Cancel edit mode
  if (DOM.btnCancelEditMode) {
    DOM.btnCancelEditMode.addEventListener('click', resetToNewMode);
  }

  // Modals
  if (DOM.btnOpenDatabase) DOM.btnOpenDatabase.addEventListener('click', openDatabaseModal);
  if (DOM.btnCloseDatabase) DOM.btnCloseDatabase.addEventListener('click', closeDatabaseModal);
  if (DOM.btnCloseDatabaseFooter) DOM.btnCloseDatabaseFooter.addEventListener('click', closeDatabaseModal);
  if (DOM.btnExportCSV) DOM.btnExportCSV.addEventListener('click', exportOrdersToCSV);

  // Google Sheets Config Modals
  if (DOM.btnOpenConfig) DOM.btnOpenConfig.addEventListener('click', openConfigModal);
  if (DOM.btnCloseConfig) DOM.btnCloseConfig.addEventListener('click', closeConfigModal);
  if (DOM.btnSaveConfig) DOM.btnSaveConfig.addEventListener('click', saveGasConfig);
  if (DOM.btnTestGas) DOM.btnTestGas.addEventListener('click', testGasConnection);
}

// ==========================================
// 5. SLIP UPLOAD & PROCESSING
// ==========================================
function initSlipUploadEvents() {
  // Open QR PromptPay Modal
  if (DOM.btnCopyAccount) {
    DOM.btnCopyAccount.addEventListener('click', () => {
      openQrPromptPayModal();
    });
  }

  // File Input Change
  if (DOM.inputSlipFile) {
    DOM.inputSlipFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        processSlipFile(e.target.files[0]);
      }
    });
  }

  // Drag and Drop
  if (DOM.slipDropzone) {
    ['dragenter', 'dragover'].forEach(name => {
      DOM.slipDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.slipDropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      DOM.slipDropzone.addEventListener(name, (e) => {
        e.preventDefault();
        e.stopPropagation();
        DOM.slipDropzone.classList.remove('dragover');
      });
    });

    DOM.slipDropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        processSlipFile(files[0]);
      }
    });
  }

  // Slip Action Buttons
  if (DOM.btnChangeSlip) {
    DOM.btnChangeSlip.addEventListener('click', () => {
      DOM.inputSlipFile.click();
    });
  }

  if (DOM.btnRemoveSlip) {
    DOM.btnRemoveSlip.addEventListener('click', () => {
      AppState.slipImage = null;
      AppState.slipFileName = '';
      AppState.slipUploadedAt = null;
      renderSlipPreview();
      showToast('ลบไฟล์สลิปแล้ว', 'info');
    });
  }

  if (DOM.btnViewSlipFullscreen) {
    DOM.btnViewSlipFullscreen.addEventListener('click', () => {
      if (AppState.slipImage) {
        DOM.slipFullImg.src = AppState.slipImage;
        DOM.modalSlipLightbox.classList.remove('hidden');
      }
    });
  }

  if (DOM.btnCloseSlipLightbox) {
    DOM.btnCloseSlipLightbox.addEventListener('click', () => {
      DOM.modalSlipLightbox.classList.add('hidden');
    });
  }

  if (DOM.modalSlipLightbox) {
    DOM.modalSlipLightbox.addEventListener('click', (e) => {
      if (e.target === DOM.modalSlipLightbox) {
        DOM.modalSlipLightbox.classList.add('hidden');
      }
    });
  }
}

// ==========================================
// QR PROMPTPAY MODAL
// ==========================================
function openQrPromptPayModal() {
  const promptPayNumber = '0987654321'; // เลขพร้อมเพย์
  const amount = ''; // ไม่ระบุจำนวนเงิน (ให้ผู้จ่ายกรอกเอง)
  
  // Generate QR Code using PromptPay API
  const qrUrl = `https://promptpay.io/${promptPayNumber}${amount ? '/' + amount : ''}.png`;
  
  if (DOM.qrPromptPayImage) {
    DOM.qrPromptPayImage.src = qrUrl;
  }
  
  if (DOM.qrPromptPayModal) {
    DOM.qrPromptPayModal.classList.remove('hidden');
  }
}

function closeQrPromptPayModal() {
  if (DOM.qrPromptPayModal) {
    DOM.qrPromptPayModal.classList.add('hidden');
  }
}

// Event listeners for QR modal
if (DOM.btnCloseQrModal) {
  DOM.btnCloseQrModal.addEventListener('click', closeQrPromptPayModal);
}

if (DOM.qrPromptPayModal) {
  DOM.qrPromptPayModal.addEventListener('click', (e) => {
    if (e.target === DOM.qrPromptPayModal) {
      closeQrPromptPayModal();
    }
  });
}

if (DOM.btnCopyPromptPay) {
  DOM.btnCopyPromptPay.addEventListener('click', () => {
    navigator.clipboard.writeText('0987654321').then(() => {
      showToast('คัดลอกเลขพร้อมเพย์ 098-765-4321 แล้ว!', 'success');
    }).catch(() => {
      showToast('เลขพร้อมเพย์: 098-765-4321', 'info');
    });
  });
}

function processSlipFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP)', 'error');
    return;
  }

  if (file.size > 15 * 1024 * 1024) {
    showToast('ขนาดไฟล์ใหญ่เกิน 15MB กรุณาเลือกไฟล์ที่เล็กลง', 'error');
    return;
  }

  showToast('กำลังประมวลผลรูปภาพสลิป...', 'info');

  const reader = new FileReader();
  reader.onload = (e) => {
    const rawDataUrl = e.target.result;
    compressSlipImage(rawDataUrl, (compressedDataUrl) => {
      AppState.slipImage = compressedDataUrl;
      AppState.slipFileName = file.name;
      AppState.slipUploadedAt = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      AppState.slipChanged = true; // Mark that slip was changed
      renderSlipPreview();
      showToast('แนบสลิปเรียบร้อยแล้ว!', 'success');
    });
  };
  reader.readAsDataURL(file);
}

function compressSlipImage(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    const maxWidth = 900;
    const maxHeight = 1200;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      if (width / height > maxWidth / maxHeight) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      } else {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const compressed = canvas.toDataURL('image/jpeg', 0.85);
    callback(compressed);
  };
  img.src = dataUrl;
}

// ==========================================
// ORDER STATUS DISPLAY (READ-ONLY from Sheets)
// ==========================================
function updateSlipUploadAccess() {
  const lockedStatuses = ['ชำระเงินแล้ว', 'กำลังผลิต', 'จัดส่งแล้ว', 'เสร็จสิ้น'];
  const isLocked = lockedStatuses.includes(AppState.orderStatus);
  
  // สถานะ "ยกเลิก" ไม่ล็อค - อนุญาตให้อัปโหลดสลิปใหม่ได้
  
  const slipSection = document.getElementById('slipUploadSection');
  
  console.log('[SLIP ACCESS] Status:', AppState.orderStatus);
  console.log('[SLIP ACCESS] Has slip:', !!AppState.slipUrl || !!AppState.slipImage);
  console.log('[SLIP ACCESS] isLocked:', isLocked);
  console.log('[SLIP ACCESS] slipSection found:', !!slipSection);
  
  if (isLocked) {
    // Hide entire slip upload section using inline style
    if (slipSection) {
      slipSection.style.display = 'none';
      console.log('[SLIP ACCESS] Section hidden with display:none');
    } else {
      console.error('[SLIP ACCESS] slipUploadSection element not found!');
    }
    
    // Show informational message instead
    let infoMessage = document.getElementById('paymentCompleteInfo');
    if (!infoMessage) {
      infoMessage = document.createElement('div');
      infoMessage.id = 'paymentCompleteInfo';
      infoMessage.className = 'p-4 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-sm mt-3';
      infoMessage.innerHTML = `
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0">
            <i class="fa-solid fa-circle-check text-lg"></i>
          </div>
          <div>
            <p class="font-bold text-green-800 mb-1">ชำระเงินเรียบร้อยแล้ว</p>
            <p class="text-xs text-green-700">รอรับของได้เลย หากจะแก้ข้อมูล ชื่อ หมายเลข หรือ ไซส์ ก็แก้ไปเลย</p>
          </div>
        </div>
      `;
      // Insert after the slip section
      if (slipSection && slipSection.parentNode) {
        slipSection.parentNode.insertBefore(infoMessage, slipSection.nextSibling);
        console.log('[SLIP ACCESS] Info message created');
      }
    } else {
      infoMessage.style.display = 'block';
      console.log('[SLIP ACCESS] Info message shown');
    }
    
    console.log('[SLIP ACCESS] Slip upload LOCKED');
  } else {
    // Show slip upload section
    if (slipSection) {
      slipSection.style.display = '';
      console.log('[SLIP ACCESS] Section shown');
    }
    
    const infoMessage = document.getElementById('paymentCompleteInfo');
    if (infoMessage) {
      infoMessage.style.display = 'none';
      console.log('[SLIP ACCESS] Info message hidden');
    }
    
    console.log('[SLIP ACCESS] Slip upload UNLOCKED');
  }
}

function renderOrderStatus(statusText) {
  console.log('[RENDER STATUS] Called with:', statusText);

  if (!statusText || statusText.trim() === '') {
    // Show default status
    statusText = 'รอชำระเงิน';
  }

  // Show alert for cancelled status
  if (statusText === 'ยกเลิก') {
    setTimeout(() => {
      showCancelledOrderAlert();
    }, 500);
  }

  // Update active status button
  const statusBtns = document.querySelectorAll('.status-btn');
  statusBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-status') === statusText);
  });
  
  // Update slip upload access based on status
  AppState.orderStatus = statusText;
  updateSlipUploadAccess();
}

// ==========================================
// SLIP PREVIEW & UPLOAD
// ==========================================
function renderSlipPreview() {
  console.log('[SLIP RENDER] Called with AppState.slipImage:', AppState.slipImage);
  
  if (AppState.slipImage) {
    if (DOM.slipDropzone) DOM.slipDropzone.classList.add('hidden');
    if (DOM.slipPreviewCard) DOM.slipPreviewCard.classList.remove('hidden');
    
    // Check if slipImage is a URL (from Drive) or base64
    const isUrl = AppState.slipImage.indexOf('http') === 0;
    console.log('[SLIP RENDER] Is URL:', isUrl);
    
    // Convert Drive URL to embeddable format if needed
    let imageUrl = AppState.slipImage;
    if (isUrl && imageUrl.indexOf('drive.google.com') > 0) {
      // Extract file ID and convert to thumbnail URL
      const fileIdMatch = imageUrl.match(/[?&]id=([^&]+)/);
      console.log('[SLIP RENDER] File ID match:', fileIdMatch);
      if (fileIdMatch && fileIdMatch[1]) {
        imageUrl = `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
        console.log('[SLIP RENDER] Converted to thumbnail URL:', imageUrl);
      }
    }
    
    if (DOM.slipThumbnailImg) {
      console.log('[SLIP RENDER] Setting thumbnail src to:', imageUrl);
      DOM.slipThumbnailImg.src = imageUrl;
    }
    if (DOM.slipFullImg) {
      DOM.slipFullImg.src = imageUrl;
    }
    if (DOM.slipFileName) DOM.slipFileName.textContent = AppState.slipFileName || 'slip_payment.jpg';
    if (DOM.slipUploadTime) DOM.slipUploadTime.textContent = AppState.slipUploadedAt ? `อัปโหลดเมื่อ ${AppState.slipUploadedAt}` : 'มีสลิปในระบบ';

    // Add error handler for image loading
    if (DOM.slipThumbnailImg) {
      DOM.slipThumbnailImg.onerror = function() {
        console.log('Failed to load thumbnail, trying original URL');
        this.src = AppState.slipImage; // Fallback to original URL
      };
    }

    if (DOM.slipStatusBadge) {
      console.log('[SLIP STATUS] Mode:', AppState.mode, 'isUrl:', isUrl);
      if (AppState.mode === 'edit' && isUrl) {
        DOM.slipStatusBadge.className = 'text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md inline-block mb-0.5';
        DOM.slipStatusBadge.innerHTML = '<i class="fa-solid fa-receipt mr-1"></i>สลิปเดิมที่เคยแนบไว้';
      } else {
        DOM.slipStatusBadge.className = 'text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md inline-block mb-0.5';
        DOM.slipStatusBadge.innerHTML = '<i class="fa-solid fa-circle-check mr-1"></i>แนบสลิปเรียบร้อยแล้ว';
      }
    }
  } else {
    if (DOM.slipDropzone) DOM.slipDropzone.classList.remove('hidden');
    if (DOM.slipPreviewCard) DOM.slipPreviewCard.classList.add('hidden');
    if (DOM.slipThumbnailImg) DOM.slipThumbnailImg.src = '';
    if (DOM.slipFullImg) DOM.slipFullImg.src = '';
    if (DOM.inputSlipFile) DOM.inputSlipFile.value = '';
  }
}

// ==========================================
// 6. LIVE PREVIEW ENGINE (CLEAN - NO SHADOWS)
// ==========================================
function calculateDynamicNameTypography(nameText, baseSize) {
  const len = nameText ? nameText.trim().length : 0;
  let dynamicSize = baseSize;
  let letterSpacing = '4';

  if (len === 0) {
    dynamicSize = baseSize;
    letterSpacing = '4';
  } else if (len <= 4) {
    dynamicSize = Math.max(baseSize, Math.round(baseSize * 1.08));
    letterSpacing = '9';
  } else if (len <= 6) {
    dynamicSize = baseSize;
    letterSpacing = '6';
  } else if (len <= 8) {
    dynamicSize = Math.round(baseSize * 0.90);
    letterSpacing = '4';
  } else if (len <= 10) {
    dynamicSize = Math.round(baseSize * 0.78);
    letterSpacing = '2.5';
  } else if (len <= 12) {
    dynamicSize = Math.round(baseSize * 0.68);
    letterSpacing = '1.8';
  } else {
    dynamicSize = Math.round(baseSize * 0.58);
    letterSpacing = '1';
  }

  return { dynamicSize, letterSpacing };
}

function updateLivePreview() {
  const name = (AppState.screenName || '').toString().trim();
  const number = (AppState.screenNumber || '10').toString().trim();
  const displayName = name || 'YOUR NAME';
  const displayNumber = number || '10';

  const { backNumber, backName, frontNumber } = JERSEY_CONFIG;

  // 1. Dynamic Curved Name Typography (Fewer characters = larger bold text)
  const { dynamicSize, letterSpacing } = calculateDynamicNameTypography(name, backName.baseSize);

  // Standard collar ends around Y = 270 at X=140 and X=640
  const arcYEnd = 270;
  if (DOM.nameArcPath) {
    DOM.nameArcPath.setAttribute('d', `M 140 ${arcYEnd} Q 390 ${backName.arcCurveY} 640 ${arcYEnd}`);
  }
  if (DOM.nameArcPathBoth) {
    DOM.nameArcPathBoth.setAttribute('d', `M 910 ${arcYEnd} Q 1155 ${backName.arcCurveY} 1400 ${arcYEnd}`);
  }

  // Name Text Content & Dynamic Font Size / Letter Spacing
  if (DOM.svgCurvedNameText) {
    DOM.svgCurvedNameText.textContent = displayName;
    const parentText = DOM.svgCurvedNameText.parentElement;
    if (parentText) {
      parentText.setAttribute('font-size', dynamicSize.toString());
      parentText.setAttribute('letter-spacing', letterSpacing);
      parentText.style.fill = '#ffffff';
      parentText.removeAttribute('filter');
    }
  }

  if (DOM.svgCurvedNameBoth) {
    DOM.svgCurvedNameBoth.textContent = displayName;
    const parentTextBoth = DOM.svgCurvedNameBoth.parentElement;
    if (parentTextBoth) {
      parentTextBoth.setAttribute('font-size', Math.round(dynamicSize * 0.95).toString());
      parentTextBoth.setAttribute('letter-spacing', letterSpacing);
      parentTextBoth.style.fill = '#ffffff';
      parentTextBoth.removeAttribute('filter');
    }
  }

  // 2. Number Position & Size (Inter Miami Font - Clean, No Shadows)
  if (DOM.svgBackNumber) {
    DOM.svgBackNumber.style.fontFamily = "'JerseyMiami', sans-serif";
    DOM.svgBackNumber.setAttribute('font-size', backNumber.size.toString());
    DOM.svgBackNumber.setAttribute('x', backNumber.x.toString());
    DOM.svgBackNumber.setAttribute('y', backNumber.y.toString());
    DOM.svgBackNumber.textContent = displayNumber;
  }

  // Front View Chest Number (Calibrated athletic chest size)
  if (DOM.svgFrontNumber) {
    DOM.svgFrontNumber.style.fontFamily = "'JerseyMiami', sans-serif";
    DOM.svgFrontNumber.setAttribute('font-size', frontNumber.size.toString());
    DOM.svgFrontNumber.setAttribute('x', frontNumber.x.toString());
    DOM.svgFrontNumber.setAttribute('y', frontNumber.y.toString());
    DOM.svgFrontNumber.textContent = displayNumber;
  }

  // Both Sides View: Back Number & Front Chest Number
  if (DOM.svgBothNumber) {
    DOM.svgBothNumber.style.fontFamily = "'JerseyMiami', sans-serif";
    DOM.svgBothNumber.setAttribute('font-size', backNumber.size.toString());
    DOM.svgBothNumber.setAttribute('x', '1155');
    DOM.svgBothNumber.setAttribute('y', backNumber.y.toString());
    DOM.svgBothNumber.textContent = displayNumber;
  }

  if (DOM.svgBothFrontNumber) {
    DOM.svgBothFrontNumber.style.fontFamily = "'JerseyMiami', sans-serif";
    DOM.svgBothFrontNumber.setAttribute('font-size', frontNumber.size.toString());
    DOM.svgBothFrontNumber.setAttribute('x', frontNumber.x.toString());
    DOM.svgBothFrontNumber.setAttribute('y', frontNumber.y.toString());
    DOM.svgBothFrontNumber.textContent = displayNumber;
  }

  applyNumberStyle();
}

function applyNumberStyle() {
  const cls = 'number-style-clean';
  if (DOM.svgBackNumber) DOM.svgBackNumber.setAttribute('class', cls);
  if (DOM.svgFrontNumber) DOM.svgFrontNumber.setAttribute('class', cls);
  if (DOM.svgBothNumber) DOM.svgBothNumber.setAttribute('class', cls);
  if (DOM.svgBothFrontNumber) DOM.svgBothFrontNumber.setAttribute('class', cls);
}

// View switcher removed - always show back view

// ==========================================
// 7. SMART EMAIL LOOKUP & DATABASE
// ==========================================
function hideFormContent() {
  if (DOM.formContentSection) DOM.formContentSection.classList.add('hidden');
  if (DOM.submitButtonSection) DOM.submitButtonSection.classList.add('hidden');
}

function showFormContent() {
  if (DOM.formContentSection) DOM.formContentSection.classList.remove('hidden');
  if (DOM.paymentStatusSection) DOM.paymentStatusSection.classList.remove('hidden');
  if (DOM.submitButtonSection) DOM.submitButtonSection.classList.remove('hidden');
}

async function lookupEmailAndShowForm(email) {
  // Clear previous data first
  DOM.emailLoadingSpinner.classList.remove('hidden');
  DOM.emailStatusBadge.classList.add('hidden');

  console.log('Looking up email:', email);
  console.log('GAS URL:', AppState.gasUrl);

  // Check Google Sheets only
  if (AppState.gasUrl) {
    try {
      const searchUrl = `${AppState.gasUrl}?action=search&email=${encodeURIComponent(email)}`;
      console.log('Fetching:', searchUrl);
      
      const resp = await fetch(searchUrl);
      console.log('Response status:', resp.status);
      console.log('Response type:', resp.headers.get('content-type'));
      
      const text = await resp.text();
      console.log('Response text (first 200 chars):', text.substring(0, 200));
      
      let result;
      try {
        result = JSON.parse(text);
        console.log('Parsed JSON:', result);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        console.error('Response is not JSON, probably HTML error page');
        throw new Error('Invalid response from server');
      }
      
      DOM.emailLoadingSpinner.classList.add('hidden');

      if (result && result.found && result.data) {
        // Found existing record - load it
        const gasRecord = {
          email: result.data.email || email,
          name: result.data.name || '',
          number: (result.data.number || '10').toString(),
          size: result.data.size || 'L',
          price: 390,
          timestamp: result.data.timestamp || '',
          status: result.data.status || 'Confirmed',
          slipUrl: result.data.slipUrl || null,
          slipImage: result.data.slipUrl || null,
          slipFileName: 'สลิปการโอนเงินเดิม.jpg'
        };
        
        console.log('Found record, loading data...');
        switchToEditMode(gasRecord);
        showFormContent();
        showToast('พบข้อมูลจาก Google Sheets! ดึงข้อมูลมาให้แล้ว', 'success');
        return;
      } else {
        console.log('Email not found in Sheets');
      }
    } catch (err) {
      console.error('GAS lookup error:', err);
      DOM.emailLoadingSpinner.classList.add('hidden');
      showToast('เกิดข้อผิดพลาดในการเชื่อมต่อ Google Sheets', 'error');
    }
  } else {
    console.warn('No GAS URL configured');
    DOM.emailLoadingSpinner.classList.add('hidden');
  }

  // New user - clear everything and start fresh
  console.log('New user, clearing form...');
  resetToNewMode();
  showFormContent();
  DOM.emailStatusBadge.classList.remove('hidden');
  DOM.emailStatusBadge.innerHTML = '<i class="fa-solid fa-check text-emerald-500 mr-1"></i>อีเมลใหม่ พร้อมสั่งจอง';
  showToast('ยินดีต้อนรับ! กรอกข้อมูลด้านล่างเพื่อสั่งจอง', 'success');
}
function loadOrdersDatabase() {
  // Removed LocalStorage - using Google Sheets only
  AppState.orders = [];
}

function saveOrdersToLocal() {
  // Removed LocalStorage - using Google Sheets only
}

function updateOrdersCountBadge() {
  // Removed - no longer tracking local count
}

async function lookupEmail(email) {
  // This function is now replaced by lookupEmailAndShowForm
  await lookupEmailAndShowForm(email);
}

function switchToEditMode(record) {
  AppState.mode = 'edit';
  AppState.existingRecord = record;
  AppState.slipChanged = false;
  AppState.slipUrl = record.slipUrl || null;

  AppState.screenName = record.name || '';
  AppState.screenNumber = record.number || '10';
  AppState.size = record.size || 'L';
  AppState.orderStatus = record.status || 'รอชำระเงิน';

  DOM.inputScreenName.value = record.name || '';
  DOM.inputScreenNumber.value = record.number || '10';

  DOM.sizeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-size') === AppState.size);
  });

  // Update status buttons
  const statusBtns = document.querySelectorAll('.status-btn');
  statusBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-status') === AppState.orderStatus);
  });

  // Show order status from Sheets (read-only)
  renderOrderStatus(AppState.orderStatus);

  // Sync previous slip if present
  if (record.slipImage || record.slipUrl) {
    AppState.slipImage = record.slipImage || record.slipUrl;
    AppState.slipUrl = record.slipUrl;
    AppState.slipFileName = record.slipFileName || 'สลิปการโอนเงินเดิม.jpg';
    AppState.slipUploadedAt = record.slipUploadedAt || record.timestamp || 'มีสลิปในระบบ';
    console.log('[SLIP DEBUG] Loading slip from record');
    console.log('[SLIP DEBUG] Has slipImage:', !!AppState.slipImage);
    console.log('[SLIP DEBUG] Has slipUrl:', !!AppState.slipUrl);
    console.log('[SLIP DEBUG] Full slipUrl:', AppState.slipUrl);
    
    // If it's a Drive URL, fetch via GAS proxy
    if (AppState.slipUrl && AppState.slipUrl.indexOf('drive.google.com') > 0) {
      const fileIdMatch = AppState.slipUrl.match(/[?&]id=([^&]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        console.log('[SLIP DEBUG] Fetching image via GAS proxy for fileId:', fileIdMatch[1]);
        fetchDriveImageViaGAS(fileIdMatch[1]);
      } else {
        renderSlipPreview();
      }
    } else {
      renderSlipPreview();
    }
  } else {
    console.log('No slip found for this record');
    AppState.slipImage = null;
    AppState.slipFileName = '';
    AppState.slipUploadedAt = null;
    renderSlipPreview();
  }

  DOM.modeStatusBanner.classList.remove('hidden');
  DOM.btnSubmitText.textContent = 'บันทึกการแก้ไขข้อมูล';
  DOM.btnSubmitIcon.className = 'fa-solid fa-floppy-disk mr-1.5';

  // Show payment status if available
  if (record.status) {
    DOM.paymentStatusDisplay.classList.remove('hidden');
    DOM.paymentStatusText.textContent = record.status;
    
    // Add color based on status
    if (record.status.indexOf('ชำระเงินสำเร็จ') >= 0 || record.status.indexOf('ตรวจสอบแล้ว') >= 0) {
      DOM.paymentStatusText.className = 'text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-200/70 text-emerald-900';
    } else if (record.status.indexOf('รอตรวจสอบ') >= 0) {
      DOM.paymentStatusText.className = 'text-xs font-bold px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900';
    } else {
      DOM.paymentStatusText.className = 'text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700';
    }
  } else {
    DOM.paymentStatusDisplay.classList.add('hidden');
  }

  updateLivePreview();
}

function resetToNewMode() {
  AppState.mode = 'new';
  AppState.existingRecord = null;
  AppState.slipChanged = false;
  AppState.slipUrl = null;
  AppState.slipImage = null;
  AppState.slipFileName = '';
  AppState.slipUploadedAt = null;
  AppState.orderStatus = 'รอชำระเงิน';
  
  // Clear form fields
  AppState.screenName = '';
  AppState.screenNumber = '10';
  AppState.size = 'L';
  
  DOM.inputScreenName.value = '';
  DOM.inputScreenNumber.value = '10';
  
  // Reset size buttons
  DOM.sizeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-size') === 'L');
  });

  // Hide order status display on reset
  if (DOM.orderStatusSection) DOM.orderStatusSection.classList.add('hidden');
  AppState.orderStatus = 'รอชำระเงิน';
  
  // Clear slip preview
  renderSlipPreview();
  
  // Update button text
  DOM.modeStatusBanner.classList.add('hidden');
  DOM.paymentStatusDisplay.classList.add('hidden');
  DOM.btnSubmitText.textContent = 'ยืนยันการสั่งจองและส่งสลิป';
  DOM.btnSubmitIcon.className = 'fa-solid fa-check mr-1.5';
  
  // Update live preview
  updateLivePreview();
}

function resetForm() {
  AppState.screenName = '';
  AppState.screenNumber = '10';
  AppState.size = 'L';
  AppState.email = '';
  AppState.slipImage = null;
  AppState.slipFileName = '';
  AppState.slipUploadedAt = null;

  DOM.inputEmail.value = '';
  DOM.inputScreenName.value = '';
  DOM.inputScreenNumber.value = '10';
  DOM.emailStatusBadge.classList.add('hidden');

  DOM.sizeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-size') === 'L'));

  renderSlipPreview();
  resetToNewMode();
  hideFormContent(); // Hide form when reset
  updateLivePreview();
}

// ==========================================
// 8. FETCH DRIVE IMAGE VIA GAS PROXY
// ==========================================
async function fetchDriveImageViaGAS(fileId) {
  try {
    console.log('[GAS PROXY] Fetching image for fileId:', fileId);
    const url = `${CONFIG.GAS_URL}?action=getImage&fileId=${encodeURIComponent(fileId)}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'success' && data.image) {
      console.log('[GAS PROXY] Image fetched successfully, size:', data.image.length);
      AppState.slipImage = data.image; // base64 data URL
      renderSlipPreview();
    } else {
      console.error('[GAS PROXY] Failed:', data.message);
      showToast('ไม่สามารถโหลดสลิปจาก Google Drive ได้', 'error');
    }
  } catch (err) {
    console.error('[GAS PROXY] Error:', err);
    showToast('เกิดข้อผิดพลาดในการโหลดสลิป', 'error');
  }
}

// ==========================================
// 8. FORM SUBMISSION & GOOGLE SHEETS
// ==========================================
async function handleFormSubmit() {
  const email = DOM.inputEmail.value.trim();
  const name = DOM.inputScreenName.value.trim();
  const number = DOM.inputScreenNumber.value.trim();

  if (!email || !isValidEmail(email)) {
    showToast('กรุณากรอกอีเมลให้ถูกต้อง', 'error');
    DOM.inputEmail.focus();
    return;
  }

  if (!name) {
    showToast('กรุณาระบุชื่อที่ต้องการสกรีน', 'error');
    DOM.inputScreenName.focus();
    return;
  }

  if (!number) {
    showToast('กรุณาระบุเบอร์เสื้อ (0-99)', 'error');
    DOM.inputScreenNumber.focus();
    return;
  }

  AppState.isSubmitting = true;
  DOM.btnSubmit.disabled = true;
  DOM.btnSubmitText.textContent = 'กำลังบันทึกข้อมูล...';

  const nowStr = new Date().toLocaleString('th-TH');
  
  // Prepare data to send to Google Sheets
  // Only send slipImage if it's new or changed
  const shouldSendSlip = (AppState.mode === 'new' || AppState.slipChanged) && AppState.slipImage;
  
  console.log('[SUBMIT] Mode:', AppState.mode);
  console.log('[SUBMIT] Slip changed:', AppState.slipChanged);
  console.log('[SUBMIT] Has slipImage:', !!AppState.slipImage);
  console.log('[SUBMIT] Has slipUrl:', !!AppState.slipUrl);
  console.log('[SUBMIT] Should send slip:', shouldSendSlip);
  
  const orderData = {
    email: email,
    productTitle: 'เสื้อแข่งขันทีมสีม่วง 2026',
    name: name.toUpperCase(),
    number: number,
    size: AppState.size,
    price: 390,
    timestamp: nowStr,
    status: AppState.orderStatus || 'รอชำระเงิน',
    slipImage: shouldSendSlip ? AppState.slipImage : null,
    slipUrl: (!shouldSendSlip && AppState.slipUrl) ? AppState.slipUrl : null,
    slipFileName: AppState.slipFileName || null,
    slipUploadedAt: AppState.slipUploadedAt || (AppState.slipImage ? nowStr : null)
  };
  
  console.log('[SUBMIT] Final orderData.slipImage:', orderData.slipImage ? 'YES (base64)' : 'NO');
  console.log('[SUBMIT] Final orderData.slipUrl:', orderData.slipUrl || 'NO');

  // Sync with Google Sheets (no local storage)
  if (AppState.gasUrl) {
    try {
      await fetch(AppState.gasUrl, {
        method: 'POST',
        mode: 'no-cors', // Use no-cors mode for Google Apps Script
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      // Note: no-cors mode doesn't return readable response
      // We'll assume success if no error is thrown
      
    } catch (err) {
      console.warn('Google Sheets sync warning:', err);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง', 'error');
      AppState.isSubmitting = false;
      DOM.btnSubmit.disabled = false;
      DOM.btnSubmitText.textContent = AppState.mode === 'edit' ? 'บันทึกการแก้ไขข้อมูล' : 'ยืนยันการสั่งจองและส่งสลิป';
      return;
    }
  }

  AppState.isSubmitting = false;
  DOM.btnSubmit.disabled = false;
  DOM.btnSubmitText.textContent = AppState.mode === 'edit' ? 'บันทึกการแก้ไขข้อมูล' : 'ยืนยันการสั่งจองและส่งสลิป';
  
  // Reset slip changed flag after successful submit
  AppState.slipChanged = false;

  triggerConfetti();
  showToast(AppState.mode === 'edit' ? 'บันทึกการแก้ไขเรียบร้อยแล้ว!' : 'สั่งจองเสื้อและแนบสลิปสำเร็จ!', 'success');
}

// ==========================================
// 9. MODALS & EXPORT
// ==========================================
function openDatabaseModal() {
  renderOrdersList();
  DOM.modalDatabase.classList.remove('hidden');
}

function closeDatabaseModal() {
  DOM.modalDatabase.classList.add('hidden');
}

function renderOrdersList() {
  if (AppState.orders.length === 0) {
    DOM.ordersListContainer.innerHTML = `
      <div class="text-center py-8 text-slate-400">
        <i class="fa-solid fa-box-open text-3xl mb-2"></i>
        <p class="text-xs">ยังไม่มีรายการสั่งจอง</p>
      </div>`;
    return;
  }

  DOM.ordersListContainer.innerHTML = AppState.orders.map((o, idx) => `
    <div class="p-3.5 rounded-2xl bg-white border border-purple-100 shadow-sm flex items-center justify-between gap-3">
      <div class="flex items-center space-x-3">
        ${o.slipImage ? `
          <div class="w-10 h-12 rounded-lg bg-slate-100 border border-purple-100 overflow-hidden shrink-0 cursor-pointer" onclick="viewOrderSlipFull(${idx})" title="คลิกเพื่อดูสลิป">
            <img src="${o.slipImage}" alt="Slip" class="w-full h-full object-cover">
          </div>
        ` : `
          <div class="w-10 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 text-xs shrink-0" title="ไม่มีสลิป">
            <i class="fa-solid fa-image"></i>
          </div>
        `}
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="font-black text-slate-900 text-sm font-sport-bold">${o.name}</span>
            <span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 font-mono font-bold text-xs">#${o.number}</span>
            <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-xs">Size ${o.size}</span>
          </div>
          <p class="text-[11px] text-slate-500 font-mono">${o.email} &bull; ฿${o.price}</p>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <button onclick="editOrderFromList(${idx})" class="p-2 rounded-lg text-purple-600 hover:bg-purple-50 text-xs font-bold transition cursor-pointer" title="แก้ไข">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button onclick="deleteOrderFromList(${idx})" class="p-2 rounded-lg text-rose-500 hover:bg-rose-50 text-xs font-bold transition cursor-pointer" title="ลบ">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

window.viewOrderSlipFull = function (idx) {
  const order = AppState.orders[idx];
  if (order && order.slipImage) {
    DOM.slipFullImg.src = order.slipImage;
    DOM.modalSlipLightbox.classList.remove('hidden');
  }
};

window.editOrderFromList = function (idx) {
  const order = AppState.orders[idx];
  if (!order) return;
  closeDatabaseModal();
  DOM.inputEmail.value = order.email;
  lookupEmail(order.email);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteOrderFromList = function (idx) {
  if (confirm('คุณต้องการลบรายการสั่งจองนี้ใช่หรือไม่?')) {
    AppState.orders.splice(idx, 1);
    saveOrdersToLocal();
    renderOrdersList();
    showToast('ลบรายการเรียบร้อยแล้ว', 'info');
  }
};

function exportOrdersToCSV() {
  if (AppState.orders.length === 0) {
    showToast('ไม่มีข้อมูลสำหรับส่งออก', 'error');
    return;
  }

  let csv = 'Timestamp,Email,Name,Number,Size,Style,Price,Status,HasSlip\n';
  AppState.orders.forEach(o => {
    csv += `"${o.timestamp}","${o.email}","${o.name}","${o.number}","${o.size}","${o.style}","${o.price}","${o.status || 'Confirmed'}","${o.slipImage ? 'YES' : 'NO'}"\n`;
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `authong_purple_orders_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('ส่งออกไฟล์ CSV สำเร็จ', 'success');
}

// Google Sheets Config Modal Handlers
function openConfigModal() {
  if (DOM.inputGasUrl) DOM.inputGasUrl.value = AppState.gasUrl;
  if (DOM.modalConfig) DOM.modalConfig.classList.remove('hidden');
}

function closeConfigModal() {
  if (DOM.modalConfig) DOM.modalConfig.classList.add('hidden');
}

function saveGasConfig() {
  const url = DOM.inputGasUrl ? DOM.inputGasUrl.value.trim() : '';
  AppState.gasUrl = url;
  localStorage.setItem('PURPLE_JERSEY_GAS_URL', url);
  checkGasConnection();
  closeConfigModal();
  showToast('บันทึกการตั้งค่า Google Sheets แล้ว', 'success');
}

function testGasConnection() {
  const url = DOM.inputGasUrl ? DOM.inputGasUrl.value.trim() : '';
  if (!url) {
    showToast('กรุณากรอก Web App URL ก่อนทดสอบ', 'error');
    return;
  }
  showToast('กำลังทดสอบการเชื่อมต่อ...', 'info');
  fetch(`${url}?action=ping`, { mode: 'no-cors' })
    .then(() => {
      showToast('เชื่อมต่อกับ Google Apps Script สำเร็จ!', 'success');
    })
    .catch(() => {
      showToast('การส่งข้อมูลพร้อมใช้งาน (โหมด no-cors)', 'info');
    });
}

function checkGasConnection() {
  if (AppState.gasUrl) {
    if (DOM.gasStatusDot) DOM.gasStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-500 shadow-xs';
    if (DOM.gasStatusText) DOM.gasStatusText.textContent = 'Sheets (เชื่อมแล้ว)';
  } else {
    if (DOM.gasStatusDot) DOM.gasStatusDot.className = 'w-2 h-2 rounded-full bg-slate-300';
    if (DOM.gasStatusText) DOM.gasStatusText.textContent = 'Google Sheets';
  }
}

// ==========================================
// 10. UTILITIES
// ==========================================
function downloadJerseyMockup() {
  showToast('กำลังประมวลผลรูปภาพเสื้อ HD...', 'info');
  html2canvas(DOM.jerseyCardWrapper, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = `Authong_Purple_Jersey_${AppState.screenName || 'Custom'}_${AppState.screenNumber || '10'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('ดาวน์โหลดรูปภาพเสื้อเรียบร้อยแล้ว!', 'success');
  }).catch(err => {
    showToast('เกิดข้อผิดพลาดในการดาวน์โหลด', 'error');
  });
}

function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#a78bfa', '#8b5cf6', '#c4b5fd', '#fbcfe8']
    });
  }
}

function showCancelledOrderAlert() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'cancelledOrderModal';
  modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scale-up">
      <!-- Icon -->
      <div class="flex justify-center">
        <div class="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
          <i class="fa-solid fa-circle-exclamation text-3xl text-rose-600"></i>
        </div>
      </div>
      
      <!-- Title -->
      <h3 class="text-xl font-bold text-center text-slate-900">
        คำสั่งซื้อถูกยกเลิก
      </h3>
      
      <!-- Message -->
      <div class="space-y-2 text-sm text-slate-700">
        <p class="text-center font-semibold text-rose-700">
          <i class="fa-solid fa-hand-holding-heart mr-1"></i>
          ไม่ต้องตกใจนะครับ!
        </p>
        <p class="text-center">
          คำสั่งซื้อของคุณถูกยกเลิกเนื่องจากข้อมูลไม่ครบถ้วนหรือมีปัญหา
        </p>
        <div class="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs space-y-1">
          <p class="font-semibold text-purple-900">
            <i class="fa-solid fa-lightbulb mr-1"></i>
            วิธีแก้ไข:
          </p>
          <ul class="list-disc list-inside text-purple-800 space-y-0.5 ml-1">
            <li>อัปโหลดสลิปการชำระเงินใหม่อีกครั้ง</li>
            <li>ตรวจสอบข้อมูลให้ถูกต้องครบถ้วน</li>
            <li>หรือติดต่อทีมงานที่ <strong>OpenChat</strong></li>
          </ul>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex gap-2">
        <button type="button" id="btnContactSupport" 
          class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg transition">
          <i class="fa-solid fa-comments mr-1.5"></i>
          ติดต่อทีมงาน
        </button>
        <button type="button" id="btnCloseModal" 
          class="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition">
          <i class="fa-solid fa-check mr-1.5"></i>
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal handler
  const closeModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 200);
  };
  
  document.getElementById('btnCloseModal').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Contact support handler
  document.getElementById('btnContactSupport').addEventListener('click', () => {
    window.open('https://line.me/ti/g2/your-openchat-url', '_blank');
    closeModal();
  });
  
  // Animate in
  requestAnimationFrame(() => {
    modal.style.opacity = '1';
  });
}

function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-purple-700 text-white'
  };

  toast.className = `px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 pointer-events-auto transition transform translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `<i class="fa-solid fa-circle-info"></i><span>${msg}</span>`;

  DOM.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
