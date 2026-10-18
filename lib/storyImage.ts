"use client";

import { CLUB_NAME } from "./site";

export type StoryPair = { card_a: string; card_b: string; label_a: string; label_b: string };

/** Renders a 1080×1920 Instagram-story fact sheet in campaign colours and triggers a download. */
export async function downloadStoryImage(pairs: StoryPair[], modeLabel: string) {
  await document.fonts?.ready;
  const W = 1080;
  const H = 1920;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  if (!g) return;
  const font = getComputedStyle(document.body).fontFamily;

  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#30152f");
  grad.addColorStop(1, "#4a1d45");
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);

  g.fillStyle = "#ec4899";
  g.font = `900 120px ${font}`;
  g.fillText("MYTH", 80, 230);
  g.fillText("BUSTERS", 80, 350);
  g.fillStyle = "#fce7f3";
  g.font = `800 44px ${font}`;
  g.fillText("Breast Cancer Awareness Edition", 80, 430);
  g.fillStyle = "#c4b5fd";
  g.font = `600 34px ${font}`;
  g.fillText(`My Pink Pairs fact sheet · ${modeLabel}`, 80, 500);

  let y = 600;
  const maxY = H - 300;
  for (const p of pairs) {
    if (y > maxY) break;
    g.fillStyle = "rgba(255,255,255,0.08)";
    const top = y - 50;
    const lines = [
      ...wrap(g, `${p.label_a}: ${p.card_a}`, W - 220, `600 34px ${font}`),
      ...wrap(g, `${p.label_b}: ${p.card_b}`, W - 220, `400 32px ${font}`),
    ];
    const h = lines.length * 46 + 50;
    g.beginPath();
    g.roundRect(70, top, W - 140, h, 12);
    g.fill();
    let ly = y;
    lines.forEach((l, i) => {
      g.fillStyle = i < lines.length / 2 ? "#ffffff" : "#fce7f3";
      g.font = l.font;
      g.fillText(l.text, 110, ly);
      ly += 46;
    });
    y += h + 30;
  }

  g.fillStyle = "#be185d";
  g.fillRect(0, H - 240, W, 240);
  g.fillStyle = "#ffffff";
  g.font = `800 38px ${font}`;
  g.fillText("Spot the Myth. Discover the Truth.", 80, H - 160);
  g.font = `400 26px ${font}`;
  wrap(g, `Built by ${CLUB_NAME}`, W - 160, `400 26px ${font}`).forEach((l, i) => g.fillText(l.text, 80, H - 110 + i * 34));

  const url = c.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "myth-busters-fact-sheet.png";
  a.click();
}

function wrap(g: CanvasRenderingContext2D, text: string, width: number, font: string) {
  g.font = font;
  const words = text.split(" ");
  const out: { text: string; font: string }[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > width && line) {
      out.push({ text: line, font });
      line = w;
    } else line = test;
  }
  if (line) out.push({ text: line, font });
  return out;
}
