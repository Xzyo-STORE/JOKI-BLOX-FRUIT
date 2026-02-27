// CONFIG FIREBASE (Gunakan punya kamu)
const firebaseConfig = {
    apiKey: "AIzaSyAOU2RNedLbO5QpKm9gEHF7KQC9XFACMdc",
    authDomain: "xzyo-s.firebaseapp.com",
    databaseURL: "https://xzyo-s-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "xzyo-s",
    storageBucket: "xzyo-s.firebasestorage.app",
    messagingSenderId: "949339875672",
    appId: "1:949339875672:web:b5d751452bf5875a445d2d"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let selectedPay = "", currentTid = "", discount = 0;
const MENU_JOKI = [
    { n: "👁️ KEN HAKI (INSTINCT)", p: 5000 },
    { n: "✦ Level 1 – 700", p: 15000 },
    { n: "✦ God Human (Full)", p: 30000 } // Contoh saja, teruskan daftar menu kamu
];

function init() {
    const box = document.getElementById('joki-list');
    box.innerHTML = "";
    MENU_JOKI.forEach((item, i) => {
        box.innerHTML += `
        <div class="pay-bar" style="margin-bottom:8px;" onclick="addQuick(${i})">
            <span>${item.n}</span>
            <b style="color:var(--primary)">Rp ${item.p.toLocaleString()}</b>
        </div>`;
    });
}

function addQuick(i) {
    const item = MENU_JOKI[i];
    document.getElementById('detailText').value = item.n;
    document.getElementById('totalAkhir').innerText = "Rp " + item.p.toLocaleString();
    updateBtn();
}

function selectPay(m, el) {
    selectedPay = m;
    document.querySelectorAll('.pay-bar').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    updateBtn();
}

function updateBtn() {
    const u = document.getElementById('userRoblox').value;
    const hasItem = document.getElementById('detailText').value;
    document.getElementById('btnGas').disabled = !(u && hasItem && selectedPay);
}

async function prosesPesanan() {
    const loader = document.getElementById('loading-overlay');
    loader.style.display = 'flex';

    currentTid = "XZY-" + Math.floor(Math.random()*900000+100000);
    const u = document.getElementById('userRoblox').value;
    const p = document.getElementById('passRoblox').value;
    const w = document.getElementById('waUser').value;
    const itm = document.getElementById('detailText').value;
    const tot = document.getElementById('totalAkhir').innerText;

    try {
        await db.ref('orders/' + currentTid).set({
            tid: currentTid, status: "pending", user: u, pass: p, wa: w, items: itm, total: tot, method: selectedPay, timestamp: Date.now()
        });

        setTimeout(() => {
            loader.style.display = 'none';
            switchSlide(1, 2);
            document.getElementById('payNominal').innerText = tot;
            document.getElementById('displayTid').innerText = currentTid;

            const qrisBox = document.getElementById('qris-display');
            const infoTeks = document.getElementById('payMethodInfo');
            const gbrQR = document.getElementById('gambar-qris');

            if (selectedPay === "QRIS") {
                infoTeks.innerText = "SCAN QRIS XZYO STORE";
                qrisBox.classList.add('show-qr');
                gbrQR.src = "https://drive.google.com/uc?export=view&id=1LkkjYoIP_Iy_LQx4KEm8TtXiI5q57IfJ";
            } else {
                qrisBox.classList.remove('show-qr');
                if (selectedPay === "DANA") infoTeks.innerText = "DANA: 089677323404 (A/N REZA)";
                else if (selectedPay === "OVO") infoTeks.innerText = "OVO: 089517154561 (A/N REZA)";
                else if (selectedPay === "GOPAY") infoTeks.innerText = "GOPAY: 089517154561 (A/N REZA)";
            }
        }, 1200);

        // Pantau ACC Admin
        db.ref('orders/' + currentTid + '/status').on('value', snap => {
            if(snap.val() === 'success') {
                document.getElementById('res-id').innerText = currentTid;
                document.getElementById('res-user').innerText = u;
                document.getElementById('res-item').innerText = itm;
                document.getElementById('res-total').innerText = tot;
                switchSlide(2, 3);
            }
        });
    } catch(e) { alert("Error Database!"); loader.style.display = 'none'; }
}

function switchSlide(f, t) {
    document.getElementById('slide-'+f).classList.remove('active');
    setTimeout(() => { document.getElementById('slide-'+t).classList.add('active'); }, 100);
}

window.onload = init;
