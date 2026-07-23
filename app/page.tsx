"use client";

import { ChangeEvent, PointerEvent, useMemo, useRef, useState } from "react";

type Plate = { id: string; name: string; detail: string; shape: string; ratio: string };
const plates: Plate[] = [
  { id: "retangular", name: "Retangular", detail: "90 × 30 mm", shape: "plate-rectangle", ratio: "3 / 1" },
  { id: "redonda", name: "Redonda", detail: "Ø 30 mm", shape: "plate-circle", ratio: "1 / 1" },
  { id: "cantos", name: "Cantos suaves", detail: "80 × 25 mm", shape: "plate-soft", ratio: "3.2 / 1" },
];

export default function Home() {
  const [selectedPlate, setSelectedPlate] = useState("retangular");
  const [contentType, setContentType] = useState<"text" | "image">("text");
  const [text, setText] = useState("feito para durar");
  const [secondaryText, setSecondaryText] = useState("seu texto aqui");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [scale, setScale] = useState(72);
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const imageDrag = useRef({ startX: 0, startY: 0, positionX: 50, positionY: 50 });
  const plate = useMemo(() => plates.find((item) => item.id === selectedPlate) ?? plates[0], [selectedPlate]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    setImageUrl(URL.createObjectURL(file));
    setImagePosition({ x: 50, y: 50 });
    setContentType("image");
  }

  function handleImagePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (contentType !== "image" || !imageUrl) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    imageDrag.current = {
      startX: event.clientX,
      startY: event.clientY,
      positionX: imagePosition.x,
      positionY: imagePosition.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.dataset.dragWidth = String(bounds.width);
    event.currentTarget.dataset.dragHeight = String(bounds.height);
  }

  function handleImagePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId) || !imageUrl) return;
    const width = Number(event.currentTarget.dataset.dragWidth);
    const height = Number(event.currentTarget.dataset.dragHeight);
    const drag = imageDrag.current;
    setImagePosition({
      x: Math.max(0, Math.min(100, drag.positionX + ((event.clientX - drag.startX) / width) * 100)),
      y: Math.max(0, Math.min(100, drag.positionY + ((event.clientY - drag.startY) / height) * 100)),
    });
  }

  return <main className="app-shell">
    <header className="topbar"><a className="brand" href="#top" aria-label="Metal Mockup Designer início"><span className="brand-mark">M</span><span>metal mockup<span className="brand-dot">.</span>designer</span></a><div className="topbar-note"><span className="status-dot" /> simulador de gravação</div><button className="help-button" type="button" aria-label="Ajuda">?</button></header>
    <section className="workspace" id="top">
      <div className="intro"><div><p className="eyebrow">personalize sua peça</p><h1>Veja antes de gravar.</h1><p className="intro-copy">Monte uma prévia da sua placa e descubra como a gravação vai ficar no metal.</p></div><div className="step-pill"><span>01</span><b>configuração</b><i /><span>02</span> resultado</div></div>
      <div className="designer-grid">
        <aside className="controls-panel">
          <div className="panel-heading"><span>01</span><div><h2>Escolha o modelo</h2><p>Qual formato combina com a sua ideia?</p></div></div>
          <div className="plate-options">{plates.map((item) => <button className={`plate-option ${item.id === selectedPlate ? "is-selected" : ""}`} key={item.id} type="button" onClick={() => setSelectedPlate(item.id)}><span className={`mini-plate ${item.shape}`}><span className="mini-shine" /></span><span><b>{item.name}</b><small>{item.detail}</small></span><span className="radio" /></button>)}</div>
          <div className="control-divider" /><div className="panel-heading"><span>02</span><div><h2>Adicione sua gravação</h2><p>Texto ou imagem, você decide.</p></div></div>
          <div className="mode-switch" role="tablist" aria-label="Tipo de gravação"><button className={contentType === "text" ? "active" : ""} type="button" onClick={() => setContentType("text")}>Aa <span>Texto</span></button><button className={contentType === "image" ? "active" : ""} type="button" onClick={() => setContentType("image")}>▧ <span>Imagem</span></button></div>
          {contentType === "text" ? <div className="form-fields"><label>Texto principal<input value={text} onChange={(event) => setText(event.target.value)} maxLength={32} /></label><label>Linha de apoio <em>opcional</em><input value={secondaryText} onChange={(event) => setSecondaryText(event.target.value)} maxLength={42} /></label></div> : <label className="upload-zone" htmlFor="image-upload"><span className="upload-icon">↑</span><b>{imageName || "Escolha uma imagem"}</b><small>JPG ou PNG · até 10 MB</small><input id="image-upload" type="file" accept="image/png,image/jpeg" onChange={handleImage} /></label>}
          <div className="control-divider" /><label className="range-label">Tamanho da gravação <output>{scale}%</output><input type="range" min="35" max="100" value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label><button className="generate-button" type="button" disabled><span>✦</span> Fazer pedido <b>→</b></button><p className="privacy-note">Sua imagem fica somente neste navegador.</p>
        </aside>
        <section className="preview-panel" aria-label="Prévia da gravação"><div className="preview-header"><div><p className="eyebrow">02 / resultado</p><h2>Sua placa, do seu jeito.</h2></div><span className="preview-badge">prévia em escala</span></div><div className="preview-stage"><div className="stage-grid" /><div className={`mockup-plate ${plate.shape}`} style={{ aspectRatio: plate.ratio }}><span className="plate-hole hole-left" /><span className="plate-hole hole-right" /><div className={`engraving-area ${plate.shape} ${contentType === "image" && imageUrl ? "is-draggable" : ""}`} onPointerDown={handleImagePointerDown} onPointerMove={handleImagePointerMove}><div className={`engraving ${contentType === "image" ? "image-engraving" : ""}`} style={{ transform: `scale(${scale / 72})` }}>{contentType === "image" && imageUrl ? <img src={imageUrl} alt="Imagem escolhida para a gravação" style={{ objectPosition: `${imagePosition.x}% ${imagePosition.y}%` }} /> : contentType === "image" ? <span className="image-placeholder">▧</span> : <><strong>{text || "seu texto"}</strong><small>{secondaryText}</small></>}</div></div><span className="metal-highlight" /></div></div><div className="preview-footer"><span><i className="legend-dot" /> acabamento escovado</span><span>{plate.detail}</span><button type="button" aria-label="Baixar prévia">↓</button></div></section>
      </div>
    </section>
    <footer><span>Metal Mockup Designer</span><span>Uma prévia é uma ideia do resultado final. A gravação pode variar.</span><span>feito com cuidado <b>●</b></span></footer>
  </main>;
}
