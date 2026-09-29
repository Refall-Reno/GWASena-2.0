const STEPS = ["Unggah & Validasi", "Konfigurasi", "Komputasi", "Hasil", "Anotasi Gen", "Ekspor"];

export default function Stepper({ active = 0 }) {
  return (
    <ol className="stepper" aria-label="Tahapan analisis">
      {STEPS.map((label, i) => (
        <li key={label} className={i === active ? "step is-active" : "step"}>
          <span className="step-num">{i + 1}</span>
          <span className="step-label">{label}</span>
        </li>
      ))}
    </ol>
  );
}
