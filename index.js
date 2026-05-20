// ============================================================
//  CORE LOGIC — cekKelulusanBeasiswa()
// ============================================================
function cekKelulusanBeasiswa(d) {
  if (d === null || d === undefined)
    return {
      valid: false,
      errors: ["Input tidak boleh null/undefined."],
      lulusBeasiswa: null,
      alasan: "Input tidak tersedia.",
    };
  if (typeof d !== "object" || Array.isArray(d))
    return {
      valid: false,
      errors: ["Input harus berupa object."],
      lulusBeasiswa: null,
      alasan: "Tipe input tidak valid.",
    };

  const { nama, ipk, penghasilan, prestasi, semester } = d;
  const errors = [];

  // Validasi nama
  if (nama === null || nama === undefined)
    errors.push("nama: tidak boleh null/undefined.");
  else if (typeof nama !== "string")
    errors.push("nama: harus string, diterima " + typeof nama + ".");
  else if (nama.trim() === "") errors.push("nama: tidak boleh string kosong.");
  else if (nama.trim().length < 3)
    errors.push(
      "nama: minimal 3 karakter (saat ini " + nama.trim().length + ").",
    );

  // Validasi ipk
  if (ipk === null || ipk === undefined)
    errors.push("ipk: tidak boleh null/undefined.");
  else if (typeof ipk !== "number" || isNaN(ipk))
    errors.push("ipk: harus number, diterima " + typeof ipk + ".");
  else if (!isFinite(ipk)) errors.push("ipk: nilai tidak valid.");
  else if (ipk < 0.0 || ipk > 4.0)
    errors.push("ipk: harus 0.0–4.0, diterima " + ipk + ".");

  // Validasi penghasilan
  if (penghasilan === null || penghasilan === undefined)
    errors.push("penghasilan: tidak boleh null/undefined.");
  else if (typeof penghasilan !== "number" || isNaN(penghasilan))
    errors.push("penghasilan: harus number.");
  else if (!Number.isInteger(penghasilan))
    errors.push("penghasilan: harus integer, diterima " + penghasilan + ".");
  else if (penghasilan < 0) errors.push("penghasilan: tidak boleh negatif.");

  // Validasi prestasi
  if (prestasi === null || prestasi === undefined)
    errors.push("prestasi: tidak boleh null/undefined.");
  else if (typeof prestasi !== "boolean")
    errors.push("prestasi: harus boolean, diterima " + typeof prestasi + ".");

  // Validasi semester
  if (semester === null || semester === undefined)
    errors.push("semester: tidak boleh null/undefined.");
  else if (typeof semester !== "number" || isNaN(semester))
    errors.push("semester: harus number.");
  else if (!Number.isInteger(semester))
    errors.push("semester: harus integer, diterima " + semester + ".");
  else if (semester < 1 || semester > 14)
    errors.push("semester: harus 1–14, diterima " + semester + ".");

  if (errors.length > 0)
    return {
      valid: false,
      errors,
      lulusBeasiswa: null,
      alasan: "Validasi gagal. Periksa input.",
    };

  // ── CORE LOGIC ──
  let lulusBeasiswa, alasan;

  if (prestasi === true && ipk >= 3.0) {
    lulusBeasiswa = true;
    alasan = "Memiliki prestasi dengan IPK " + ipk + " ≥ 3.0 (jalur prestasi).";
  } else if (
    prestasi === false &&
    ipk >= 3.5 &&
    semester >= 3 &&
    // semester <= 8 &&
    penghasilan <= 5_000_000
  ) {
    lulusBeasiswa = true;
    alasan =
      "Memenuhi seluruh syarat jalur reguler: IPK " +
      ipk +
      " ≥ 3.5, semester " +
      semester +
      " (3–8), penghasilan Rp" +
      penghasilan.toLocaleString("id-ID") +
      " < Rp5.000.000.";
  } else {
    lulusBeasiswa = false;
    const why = [];
    if (prestasi === true) {
      why.push("IPK " + ipk + " < 3.0 (syarat prestasi ≥ 3.0)");
    } else {
      if (ipk < 3.5) why.push("IPK " + ipk + " < 3.5");
      if (semester < 3 || semester > 8)
        why.push("Semester " + semester + " di luar 3–8");
      if (penghasilan >= 5_000_000)
        why.push(
          "Penghasilan Rp" +
            penghasilan.toLocaleString("id-ID") +
            " ≥ Rp5.000.000",
        );
    }
    alasan = why.length
      ? why.join("; ") + "."
      : "Tidak memenuhi kriteria manapun.";
  }

  return { valid: true, errors: [], lulusBeasiswa, alasan };
}

// ============================================================
//  CURRENCY FORMATTER (Rupiah)
// ============================================================
function formatCurrency(input) {
  // Simpan posisi kursor relatif dari kanan
  const selStart = input.selectionStart;
  const prevLen = input.value.length;

  // Ambil hanya digit
  const digits = input.value.replace(/\D/g, "");

  // Format dengan titik setiap 3 digit dari kanan
  const formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = formatted;

  // Jaga posisi kursor agar tidak melompat ke akhir
  const newLen = input.value.length;
  const cursorPos = selStart + (newLen - prevLen);
  input.setSelectionRange(cursorPos, cursorPos);
}

// ============================================================
//  TOGGLE STATE
// ============================================================
let prestasiValue = null;

function setToggle(field, val) {
  prestasiValue = val;
  document.getElementById("btn-ya").className =
    "toggle-btn" + (val === true ? " active-yes" : "");
  document.getElementById("btn-tidak").className =
    "toggle-btn" + (val === false ? " active-no" : "");
  document.getElementById("h-prestasi").textContent = "";
}

// ============================================================
//  FORM SUBMIT
// ============================================================
let logData = [];

function submitForm() {
  clearHints();

  const namaRaw = document.getElementById("f-nama").value;
  const ipkRaw = document.getElementById("f-ipk").value;
  // Hapus titik pemisah ribuan sebelum parsing
  const pengRaw = document
    .getElementById("f-penghasilan")
    .value.replace(/\./g, "");
  const semRaw = document.getElementById("f-semester").value;

  // Build input (let validation layer handle type errors)
  const input = {
    nama: namaRaw,
    ipk: ipkRaw === "" ? null : parseFloat(ipkRaw),
    penghasilan: pengRaw === "" ? null : parseInt(pengRaw, 10),
    prestasi: prestasiValue,
    semester: semRaw === "" ? null : parseInt(semRaw, 10),
  };

  // Inline hints for quick UX
  if (!namaRaw.trim()) hint("h-nama", "Nama wajib diisi.");
  if (ipkRaw === "") hint("h-ipk", "IPK wajib diisi.");
  if (pengRaw === "") hint("h-penghasilan", "Penghasilan wajib diisi.");
  if (prestasiValue === null) hint("h-prestasi", "Pilih status prestasi.");
  if (semRaw === "") hint("h-semester", "Pilih semester.");

  const hasil = cekKelulusanBeasiswa(input);
  renderResult(hasil, input);
  addLog(input, hasil);
}

function hint(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearHints() {
  ["h-nama", "h-ipk", "h-penghasilan", "h-prestasi", "h-semester"].forEach(
    (id) => {
      document.getElementById(id).textContent = "";
    },
  );
  ["f-nama", "f-ipk", "f-penghasilan"].forEach((id) => {
    document.getElementById(id).classList.remove("err", "ok");
  });
}

// ============================================================
//  RENDER RESULT
// ============================================================
function renderResult(hasil, input) {
  const box = document.getElementById("result-box");
  const icon = document.getElementById("r-icon");
  const nama = document.getElementById("r-nama");
  const status = document.getElementById("r-status");
  const alasan = document.getElementById("r-alasan");
  const errors = document.getElementById("r-errors");
  const detail = document.getElementById("r-detail");
  const detailR = document.getElementById("r-detail-rows");

  box.className = "result-box";

  if (!hasil.valid) {
    icon.className = "result-icon invalid";
    icon.textContent = "⚠";
    nama.textContent = input.nama || "—";
    status.className = "result-status invalid";
    status.textContent = "Validasi Gagal";
    alasan.textContent = "";
    errors.innerHTML = hasil.errors.map((e) => `<li>${e}</li>`).join("");
    detail.style.display = "none";
  } else if (hasil.lulusBeasiswa) {
    box.classList.add("lulus-glow");
    icon.className = "result-icon lulus";
    icon.textContent = "✓";
    nama.textContent = input.nama;
    status.className = "result-status lulus";
    status.textContent = "LULUS BEASISWA";
    alasan.textContent = hasil.alasan;
    errors.innerHTML = "";
    showDetail(detailR, input);
    detail.style.display = "block";
  } else {
    box.classList.add("gagal-glow");
    icon.className = "result-icon gagal";
    icon.textContent = "✗";
    nama.textContent = input.nama;
    status.className = "result-status gagal";
    status.textContent = "TIDAK LULUS";
    alasan.textContent = hasil.alasan;
    errors.innerHTML = "";
    showDetail(detailR, input);
    detail.style.display = "block";
  }

  box.classList.remove("idle");
  // re-trigger icon animation
  icon.style.animation = "none";
  void icon.offsetWidth;
  icon.style.animation = "";
}

function showDetail(container, input) {
  const rows = [
    ["IPK", typeof input.ipk === "number" ? input.ipk.toFixed(2) : "—"],
    [
      "Penghasilan",
      typeof input.penghasilan === "number"
        ? "Rp" + input.penghasilan.toLocaleString("id-ID")
        : "—",
    ],
    [
      "Prestasi",
      input.prestasi === true
        ? "Ada"
        : input.prestasi === false
          ? "Tidak Ada"
          : "—",
    ],
    ["Semester", input.semester ?? "—"],
  ];
  container.innerHTML = rows
    .map(
      ([k, v]) =>
        `<div style="display:flex;justify-content:space-between;font-size:11.5px;">
      <span style="color:var(--text-3);font-family:'DM Mono',monospace;">${k}</span>
      <span style="color:var(--text-2);font-weight:500;">${v}</span>
    </div>`,
    )
    .join("");
}

// ============================================================
//  LOG TABLE
// ============================================================
function addLog(input, hasil) {
  logData.push({ input, hasil, id: logData.length + 1 });
  renderLog();
}

function renderLog() {
  const body = document.getElementById("log-body");
  const count = document.getElementById("log-count");
  count.textContent = logData.length;

  if (!logData.length) {
    body.innerHTML =
      '<tr><td colspan="8"><p class="log-empty">Belum ada uji yang dijalankan</p></td></tr>';
    return;
  }

  body.innerHTML = [...logData]
    .reverse()
    .map(({ id, input, hasil }) => {
      let chip, statusText;
      if (!hasil.valid) {
        chip = "chip-invalid";
        statusText = "Invalid";
      } else if (hasil.lulusBeasiswa) {
        chip = "chip-lulus";
        statusText = "Lulus";
      } else {
        chip = "chip-gagal";
        statusText = "Tidak Lulus";
      }

      const short = hasil.valid
        ? hasil.alasan.slice(0, 60) + (hasil.alasan.length > 60 ? "…" : "")
        : hasil.errors[0] +
          (hasil.errors.length > 1 ? ` (+${hasil.errors.length - 1})` : "");

      return `<tr>
      <td style="color:var(--text-3);font-family:'DM Mono',monospace;">${id}</td>
      <td style="font-weight:500;">${input.nama || '<span style="color:var(--text-3)">—</span>'}</td>
      <td style="font-family:'DM Mono',monospace;">${typeof input.ipk === "number" ? input.ipk.toFixed(2) : "—"}</td>
      <td style="font-family:'DM Mono',monospace;">${typeof input.penghasilan === "number" ? "Rp" + input.penghasilan.toLocaleString("id-ID") : "—"}</td>
      <td>${input.prestasi === true ? "Ada" : input.prestasi === false ? "Tidak" : "—"}</td>
      <td style="font-family:'DM Mono',monospace;">${input.semester ?? "—"}</td>
      <td><span class="chip ${chip}">${statusText}</span></td>
      <td style="color:var(--text-2);font-size:11.5px;">${short}</td>
    </tr>`;
    })
    .join("");
}

function clearLog() {
  logData = [];
  renderLog();
}
