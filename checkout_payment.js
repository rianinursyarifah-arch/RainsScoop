/* ============================================================
   checkout_payment.js
   Renders payment info panels in checkout.html (WAJIB).
   Does NOT change UI/CSS/UX except by inserting/removing
   payment detail DOM blocks under #coPaymentInfoWrapper.
   ============================================================ */

(function () {
  function safeEl(id) {
    return document.getElementById(id);
  }

  function ensurePaymentWrapper() {
    const shippingCard = safeEl('coShipping')?.closest('.checkout-card')
      || document.querySelector('.checkout-card');

    // Prefer inserting just below payment select.
    const paymentSelect = safeEl('coPayment');
    if (!paymentSelect || !paymentSelect.parentElement) return null;

    let wrapper = document.getElementById('coPaymentInfoWrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.id = 'coPaymentInfoWrapper';
      // insert after the payment form-group (same parent level)
      paymentSelect.parentElement.parentElement?.appendChild(wrapper);
      // fallback: after parent element
      if (!wrapper.parentElement) paymentSelect.parentElement.appendChild(wrapper);
    }
    return wrapper;
  }

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function makeBlock(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d;
  }

  function renderCheckoutPayment() {
    const wrapper = ensurePaymentWrapper();
    const payment = safeEl('coPayment')?.value || '';

    if (!wrapper) return;

    // always clear & re-render so switching is real-time
    clearChildren(wrapper);

    if (!payment || payment === 'COD') {
      wrapper.style.display = 'none';
      return;
    }

    wrapper.style.display = 'block';

    // --- QRIS ---
    if (payment === 'QRIS') {
      const imgPath = './images/qris.png'; // Use GitHub-safe relative path
      wrapper.appendChild(makeBlock(`
        <div class="co-pay-panel" id="coPayPanelQris">
          <div class="co-pay-title">QRIS</div>
          <p class="co-pay-note">Pilih "Bayar & Pesan" untuk menampilkan QRIS yang dapat discan.</p>
          <div style="text-align:center;margin-top:0.5rem;"><img src="${imgPath}" alt="QRIS" style="max-width:220px;display:inline-block;border-radius:6px;border:1px solid var(--border)" onerror="this.style.display='none'" /></div>
        </div>
      `));
      return;
    }

    // --- Virtual Account (VA) ---
    const bankMap = {
      'VA_BCA': { bank: 'BCA', logo: './images/bca.png' /* Replace with actual logo file under ./images/ if available */ },
      'VA_BNI': { bank: 'BNI', logo: './images/bni.png' /* Replace with actual logo file under ./images/ if available */ },
      'VA_BRI': { bank: 'BRI', logo: './images/bri.png' /* Replace with actual logo file under ./images/ if available */ },
      'VA_MANDIRI': { bank: 'Mandiri', logo: './images/mandiri.png' /* Replace with actual logo file under ./images/ if available */ },
      'SeaBank': { bank: 'SeaBank', logo: './images/seabank.png' /* optional */ }
    };

    if (payment.startsWith('VA_') || payment === 'SeaBank') {
      const info = bankMap[payment] || { bank: payment.replace('VA_', ''), logo: '' };
      const bankLabel = info.bank || payment.replace('VA_', '');
      const logoPath = info.logo || '';

      wrapper.appendChild(makeBlock(`
        <div class="co-pay-panel" id="coPayPanelVa">
          <div class="co-pay-title">Virtual Account (${bankLabel})</div>
          <div style="display:flex;gap:0.8rem;align-items:center;justify-content:flex-start;margin-top:0.6rem;">
            ${logoPath ? `<img src="${logoPath}" alt="${bankLabel} logo" style="height:40px;object-fit:contain;" onerror="this.style.display='none'" />` : ''}
            <div style="font-size:0.92rem;line-height:1.6;">Pilih "Bayar & Pesan" untuk menghasilkan Nomor Virtual Account (VA) otomatis dan instruksi pembayaran.</div>
          </div>
        </div>
      `));

      return;
    }

    // --- E-Wallet ---
    const walletMap = {
      'DANA': { account: '089528117555', logo: './images/dana.png' /* Replace with actual logo file under ./images/ if available */ },
      'OVO': { account: '089528117555', logo: './images/ovo.png' /* Replace with actual logo file under ./images/ if available */ },
      'GOPAY': { account: '089528117555', logo: './images/gopay.png' /* Replace with actual logo file under ./images/ if available */ }
    };

    if (walletMap[payment]) {
      const info = walletMap[payment];
      wrapper.appendChild(makeBlock(`
        <div class="co-pay-panel" id="coPayPanelWallet">
          <div class="co-pay-title">Pembayaran ${payment}</div>
          <div style="display:flex;gap:0.8rem;align-items:center;margin-top:0.6rem;">
            ${info.logo ? `<img src="${info.logo}" alt="${payment} logo" style="height:40px;object-fit:contain;" onerror="this.style.display='none'" />` : ''}
            <div style="font-size:0.92rem;line-height:1.7;">
              <div>Nama Akun: <strong>Rain'sScoop</strong></div>
              <div style="margin-top:0.35rem;">Nomor Tujuan:</div>
              <div style="margin-top:0.25rem;font-weight:700;color:#1a73e8;letter-spacing:0.5px;font-size:1.08rem;">${info.account}</div>
              <div style="margin-top:0.5rem;color:var(--text-light);font-size:0.88rem;">Tekan "Bayar & Pesan" lalu salin nomor tujuan untuk melakukan transfer melalui aplikasi e-wallet.</div>
            </div>
          </div>
        </div>
      `));

      return;
    }

    wrapper.style.display = 'none';
  }

  // --- Modal helpers & submit interception ---
  function createModal(contentHtml) {
    // remove existing
    const prev = document.getElementById('coPaymentModal');
    if (prev) prev.remove();
    const modal = document.createElement('div');
    modal.id = 'coPaymentModal';
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.45)';
    modal.style.zIndex = '9999';
    modal.innerHTML = `
      <div style="background:#fff;padding:1.25rem;border-radius:10px;max-width:420px;width:94%;box-shadow:0 8px 30px rgba(0,0,0,0.25);">
        ${contentHtml}
        <div style="margin-top:0.8rem;text-align:right;"><button id="coPaymentModalClose" style="padding:0.45rem 0.75rem;border-radius:6px;border:1px solid var(--border);background:transparent;">Tutup</button></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('coPaymentModalClose').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (ev) => { if (ev.target === modal) modal.remove(); });
    return modal;
  }

  function randVaNumber() {
    // generate 14-16 digit pseudo-random VA (string)
    const len = 14 + Math.floor(Math.random() * 3);
    let s = '';
    for (let i = 0; i < len; i++) s += String(Math.floor(Math.random() * 10));
    return s;
  }

  function showVaModal(bankLabel) {
    const va = randVaNumber();
    const html = `
      <h3 style="margin:0 0 0.5rem 0;">Virtual Account (${bankLabel})</h3>
      <p style="margin:0 0 0.5rem 0;color:var(--text-light);">Gunakan nomor VA di bawah untuk menyelesaikan pembayaran melalui ${bankLabel} (Instruksi: transfer ke nomor VA).</p>
      <div style="font-weight:700;font-size:1.2rem;padding:0.6rem 0;text-align:center;background:#f6f8fb;border-radius:8px;margin-top:0.4rem;border:1px dashed var(--border);">${va}</div>
      <div style="display:flex;gap:0.5rem;margin-top:0.6rem;">
        <button id="coCopyVaModalBtn" style="flex:1;padding:0.6rem;border-radius:8px;background:#1a73e8;color:#fff;border:none;">Salin Nomor VA</button>
        <button id="coCloseVaModalBtn" style="flex:1;padding:0.6rem;border-radius:8px;border:1px solid var(--border);background:transparent;">Selesai</button>
      </div>
      <p style="margin-top:0.6rem;color:var(--text-light);font-size:0.88rem;">Simpan bukti transfer untuk verifikasi pesanan.</p>
    `;
    const modal = createModal(html);
    document.getElementById('coCopyVaModalBtn').addEventListener('click', () => {
      navigator.clipboard?.writeText(va);
    });
    document.getElementById('coCloseVaModalBtn').addEventListener('click', () => modal.remove());
  }

  function showQrisModal() {
    const imgPath = './images/qris.png'; // Use GitHub-safe relative path
    const html = `
      <h3 style="margin:0 0 0.5rem 0;">QRIS</h3>
      <p style="margin:0 0 0.5rem 0;color:var(--text-light);">Scan QRIS berikut untuk melakukan pembayaran via e-wallet/m-banking.</p>
      <div style="text-align:center;margin-top:0.4rem;"><img src="${imgPath}" alt="QRIS" style="max-width:280px;border-radius:8px;border:1px solid var(--border);" onerror="this.style.display='none'" /></div>
    `;
    createModal(html);
  }

  function showWalletModal(payment) {
    const wallets = {
      'DANA': { account: '089528117555' },
      'OVO': { account: '089528117555' },
      'GOPAY': { account: '089528117555' }
    };
    const info = wallets[payment];
    const html = `
      <h3 style="margin:0 0 0.5rem 0;">${payment}</h3>
      <p style="margin:0 0 0.5rem 0;color:var(--text-light);">Gunakan nomor tujuan berikut di aplikasi ${payment} Anda:</p>
      <div style="font-weight:700;font-size:1.05rem;padding:0.6rem 0;text-align:center;background:#f6f8fb;border-radius:8px;margin-top:0.4rem;border:1px dashed var(--border);">${info.account}</div>
      <div style="display:flex;gap:0.5rem;margin-top:0.6rem;"><button id="coCopyWalletModalBtn" style="flex:1;padding:0.6rem;border-radius:8px;background:#1a73e8;color:#fff;border:none;">Salin Nomor</button><button id="coCloseWalletModalBtn" style="flex:1;padding:0.6rem;border-radius:8px;border:1px solid var(--border);background:transparent;">Selesai</button></div>
    `;
    const modal = createModal(html);
    document.getElementById('coCopyWalletModalBtn').addEventListener('click', () => navigator.clipboard?.writeText(info.account));
    document.getElementById('coCloseWalletModalBtn').addEventListener('click', () => modal.remove());
  }

  // intercept Checkout "Bayar & Pesan" button to show VA/QRIS/wallet flows
  document.addEventListener('DOMContentLoaded', () => {
    const submitBtn = safeEl('coSubmitBtn');
    submitBtn && submitBtn.addEventListener('click', (ev) => {
      const payment = safeEl('coPayment')?.value || '';
      if (!payment) return;
      if (payment === 'QRIS') {
        ev.preventDefault();
        showQrisModal();
        return;
      }
      if (payment.startsWith('VA_') || payment === 'SeaBank') {
        ev.preventDefault();
        const bankLabel = payment === 'SeaBank' ? 'SeaBank' : payment.replace('VA_', '');
        showVaModal(bankLabel);
        return;
      }
      const wallets = ['DANA', 'OVO', 'GOPAY'];
      if (wallets.indexOf(payment) !== -1) {
        ev.preventDefault();
        showWalletModal(payment);
        return;
      }
      // for COD or other flows, allow default behavior
    });
  });

  // expose global
  window.renderCheckoutPayment = renderCheckoutPayment;

  // initial render after DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    // default hidden until user chooses, but render at start if value preselected
    const paymentEl = safeEl('coPayment');
    if (paymentEl) renderCheckoutPayment();
  });
})();

