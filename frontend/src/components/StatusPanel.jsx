function Row({ name, ok, detail }) {
  return (
    <div className="status-row">
      <span className={ok ? "dot ok" : "dot bad"} aria-hidden="true" />
      <span className="status-name">{name}</span>
      <span className={ok ? "status-text ok" : "status-text bad"}>
        {ok ? "Terhubung" : "Tidak terhubung"}
      </span>
      {detail && <span className="status-detail">{detail}</span>}
    </div>
  );
}

export default function StatusPanel({ health, error, loading, onRefresh }) {
  const c = health?.components;
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>Status kerangka sistem</h2>
        <button className="btn" onClick={onRefresh} disabled={loading}>
          {loading ? "Memeriksa…" : "Periksa ulang"}
        </button>
      </div>

      {error && (
        <p className="alert">
          Backend belum bisa dihubungi ({error}). Pastikan perintah
          <code> uvicorn backend.main:app --reload </code> sedang berjalan di terminal lain.
        </p>
      )}

      {c && (
        <div className="status-list">
          <Row name="API (FastAPI)" ok={c.api.ok} detail={`versi ${health.version}`} />
          <Row
            name="Basis data (PostgreSQL)"
            ok={c.database.ok}
            detail={c.database.ok ? `${c.database.tables.length} tabel dibuat` : c.database.error}
          />
          <Row
            name="Antrean tugas (Redis)"
            ok={c.redis.ok}
            detail={c.redis.ok ? "siap untuk Celery" : "opsional minggu ini"}
          />
        </div>
      )}
    </section>
  );
}
