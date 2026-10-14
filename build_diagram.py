#!/usr/bin/env python3
"""Builds the driver-monitoring system block diagram as a standalone SVG.

Usage:
    python build_diagram.py                 # writes driver-monitoring-block-diagram.svg
    python build_diagram.py my-name.svg     # custom output path
    python build_diagram.py --png           # also exports a 2x PNG (needs playwright)

Edit text, colors (PAL), or positions (C1..C4, TY, BY, ...) below, then re-run.
"""
import html

W, H = 1800, 990
FONT = "system-ui, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

INK, MUTED, LINE = "#1b2733", "#566575", "#3a4756"

PAL = {
    "veh":   dict(fill="#eef4fb", stroke="#2a67ad", accent="#1f5594", tile="#d9e7f6", soft="#bcd3ec"),
    "srv":   dict(fill="#ecf6f0", stroke="#2f8660", accent="#216a4a", tile="#d4ebdf", soft="#b3d9c6"),
    "alert": dict(fill="#fdeeed", stroke="#cc3b30", accent="#a92b22", tile="#f9d6d3", soft="#f1b3ae"),
    "drv":   dict(fill="#fdf3e0", stroke="#c98a1b", accent="#8a5a0b", tile="#f8e3b8", soft="#efd08e"),
}

# Lucide-style 24x24 line icons
ICONS = {
    "camera": '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    "cpu": '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
    "activity": '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    "bell": '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    "file": '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
    "upload": '<path d="M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>',
    "database": '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    "chart": '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    "server": '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
}

out = []
uid = [0]


def esc(s):
    return html.escape(s, quote=False)


def add(s):
    out.append(s)


def text(x, y, s, size=13, weight=400, fill=INK, anchor="start", italic=False):
    st = ' font-style="italic"' if italic else ""
    add(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{st}>{esc(s)}</text>')


def icon(name, x, y, size, color, sw=1.7):
    k = size / 24
    add(f'<g transform="translate({x},{y}) scale({k})" fill="none" stroke="{color}" stroke-width="{sw}" '
        f'stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g>')


def pill(x, y, s, pal, h=22, size=11.5, fill="#ffffff", color=None, cw=6.8, pad=18):
    w = round(len(s) * cw + pad)
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{h/2}" fill="{fill}" stroke="{pal["soft"]}" stroke-width="1.3"/>')
    text(x + w / 2, y + h / 2 + size * 0.35, s, size=size, weight=600, fill=color or pal["accent"], anchor="middle")
    return w


def pills_row(x, y, items, pal, **kw):
    for s in items:
        w = pill(x, y, s, pal, **kw)
        x += w + 6


# ---------- mini illustrations (each drawn in a 138 x 56 box at ox, oy) ----------

def vis_frames(ox, oy, pal):
    for i in range(11):
        add(f'<rect x="{ox + i * 12.5}" y="{oy + 2}" width="8" height="32" rx="2" '
            f'fill="{pal["accent"]}"/>')
    text(ox, oy + 51, "all 30 frames analysed", size=10.5, fill=MUTED)


import base64
from pathlib import Path

_img_candidates = [
    Path(__file__).parent / "160original.png",
    Path(r"C:\Dev\repos\Public repos\research\ROI-DMS\images\crop\original\160original.png"),
]
DETECTOR_IMG_B64 = ""
for _p in _img_candidates:
    if _p.exists():
        with open(_p, "rb") as _f:
            DETECTOR_IMG_B64 = base64.b64encode(_f.read()).decode("ascii")
        break


def vis_scene(ox, oy):
    size = 56
    sx = ox + (138 - size) / 2
    sy = oy
    uid[0] += 1
    cid = f"scene{uid[0]}"
    add(f'<clipPath id="{cid}"><rect x="{sx}" y="{sy}" width="{size}" height="{size}" rx="12"/></clipPath>')
    add(f'<g clip-path="url(#{cid})">')
    add(f'<rect x="{sx}" y="{sy}" width="{size}" height="{size}" fill="#1b2430"/>')
    if DETECTOR_IMG_B64:
        add(f'<image href="data:image/png;base64,{DETECTOR_IMG_B64}" x="{sx}" y="{sy}" width="{size}" height="{size}" preserveAspectRatio="none"/>')
    add('</g>')
    add(f'<rect x="{sx}" y="{sy}" width="{size}" height="{size}" rx="12" fill="none" stroke="{PAL["veh"]["soft"]}" stroke-width="1.4"/>')


def vis_window(ox, oy, pal):
    for i in range(5):
        last = i == 4
        add(f'<rect x="{ox + 6 + i * 26}" y="{oy + 4}" width="20" height="24" rx="5" '
            f'fill="{pal["accent"] if last else pal["soft"]}"/>')
    text(ox + 16, oy + 46, "t-4", size=10.5, fill=MUTED, anchor="middle")
    text(ox + 120, oy + 46, "now", size=10.5, fill=MUTED, anchor="middle")
    add(f'<path d="M{ox+32} {oy+42} H{ox+104}" stroke="{pal["soft"]}" stroke-width="1.4" stroke-dasharray="3 3"/>')


def vis_plot(ox, oy, w, h, pal):
    add(f'<rect x="{ox}" y="{oy}" width="{w}" height="{h}" rx="8" fill="#ffffff" stroke="{pal["soft"]}" stroke-width="1.3"/>')
    # Per-frame YOLO detection is binary: 0 (no distraction) or 1 (distraction detected)
    raw = [0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0]
    filt = []
    for i in range(len(raw)):
        win = raw[max(0, i - 4): i + 1]
        filt.append(sum(win) / 5)

    x_start = ox + 22
    x_end = ox + w - 12
    step = (x_end - x_start) / (len(raw) - 1)
    y_0 = oy + 42   # y coordinate for value 0
    y_1 = oy + 12   # y coordinate for value 1
    y_h = y_0 - y_1 # 30 px
    y_thresh = y_0 - 0.6 * y_h

    # Y-axis labels and guide lines
    text(ox + 11, y_1 + 3.5, "1", size=8.5, weight=700, fill=MUTED, anchor="middle")
    text(ox + 11, y_0 + 3.5, "0", size=8.5, weight=700, fill=MUTED, anchor="middle")
    add(f'<line x1="{x_start-3}" y1="{y_1}" x2="{x_end}" y2="{y_1}" stroke="{pal["soft"]}" stroke-width="0.8" stroke-dasharray="2 2"/>')
    add(f'<line x1="{x_start-3}" y1="{y_0}" x2="{x_end}" y2="{y_0}" stroke="{pal["soft"]}" stroke-width="0.8"/>')
    add(f'<line x1="{x_start-3}" y1="{y_thresh:.1f}" x2="{x_end}" y2="{y_thresh:.1f}" stroke="{PAL["alert"]["stroke"]}" stroke-width="1.3" stroke-dasharray="4 3"/>')

    # Stepped square wave for binary raw detections (0 or 1)
    raw_d = [f"M{x_start:.1f} {y_0 - raw[0] * y_h:.1f}"]
    for i in range(1, len(raw)):
        xi = x_start + i * step
        yi = y_0 - raw[i] * y_h
        raw_d.append(f"H{xi:.1f} V{yi:.1f}")
    add(f'<path d="{" ".join(raw_d)}" fill="none" stroke="#9aa9b8" stroke-width="1.4" stroke-linejoin="round"/>')

    # Smoothed moving average curve
    filt_pts = " ".join(f"{x_start + i * step:.1f},{y_0 - v * y_h:.1f}" for i, v in enumerate(filt))
    add(f'<polyline points="{filt_pts}" fill="none" stroke="{pal["accent"]}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>')

    # Legend
    ly = oy + h - 8
    add(f'<line x1="{ox+16}" y1="{ly-3}" x2="{ox+28}" y2="{ly-3}" stroke="#9aa9b8" stroke-width="1.6"/>')
    text(ox + 32, ly, "raw (0/1)", size=9.5, fill=MUTED)
    add(f'<line x1="{ox+82}" y1="{ly-3}" x2="{ox+94}" y2="{ly-3}" stroke="{pal["accent"]}" stroke-width="2.4"/>')
    text(ox + 98, ly, "filtered", size=9.5, fill=MUTED)
    add(f'<line x1="{ox+144}" y1="{ly-3}" x2="{ox+156}" y2="{ly-3}" stroke="{PAL["alert"]["stroke"]}" stroke-width="1.4" stroke-dasharray="3 2"/>')
    text(ox + 160, ly, "threshold", size=9.5, fill=MUTED)


def vis_transfer(ox, oy, pal):
    icon("file", ox + 8, oy + 8, 38, pal["accent"], sw=1.5)
    add(f'<path d="M{ox+54} {oy+28} H{ox+84}" stroke="{pal["accent"]}" stroke-width="2" stroke-dasharray="4 3"/>')
    add(f'<path d="M{ox+82} {oy+22} L{ox+92} {oy+28} L{ox+82} {oy+34} Z" fill="{pal["accent"]}"/>')
    icon("server", ox + 98, oy + 8, 38, pal["accent"], sw=1.5)


def vis_rows(ox, oy, pal):
    widths = [104, 80, 92]
    dots = ["#cc3b30", "#c98a1b", "#2a67ad"]
    for i, (wd, dc) in enumerate(zip(widths, dots)):
        y = oy + 4 + i * 18
        add(f'<circle cx="{ox+6}" cy="{y+5}" r="4" fill="{dc}"/>')
        add(f'<rect x="{ox+18}" y="{y}" width="{wd}" height="10" rx="5" fill="{pal["accent"] if i == 0 else pal["soft"]}"/>')


def vis_bars(ox, oy, pal):
    hs = [16, 28, 22, 38, 26]
    tops = []
    for i, hh in enumerate(hs):
        x = ox + 8 + i * 26
        add(f'<rect x="{x}" y="{oy + 48 - hh}" width="16" height="{hh}" rx="3" fill="{pal["soft"]}"/>')
        tops.append((x + 8, oy + 48 - hh - 5))
    add(f'<polyline points="{" ".join(f"{a},{b}" for a, b in tops)}" fill="none" stroke="{pal["accent"]}" stroke-width="2.2" '
        f'stroke-linejoin="round" stroke-linecap="round"/>')
    for a, b in tops:
        add(f'<circle cx="{a}" cy="{b}" r="3" fill="#ffffff" stroke="{pal["accent"]}" stroke-width="2"/>')


# ---------- blocks ----------

def block_shell(x, y, w, h, pal, num):
    uid[0] += 1
    cid = f"clip{uid[0]}"
    add(f'<clipPath id="{cid}"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16"/></clipPath>')
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{pal["fill"]}" stroke="{pal["stroke"]}" stroke-width="2"/>')
    add(f'<rect x="{x}" y="{y}" width="{w}" height="6" fill="{pal["stroke"]}" clip-path="url(#{cid})"/>')
    # step badge straddling the top-left corner
    bw = 26 if len(num) > 1 else 24
    add(f'<rect x="{x - bw/2 + 2}" y="{y - 10}" width="{bw}" height="24" rx="12" fill="{pal["accent"]}" stroke="#ffffff" stroke-width="2.5"/>')
    text(x + 2, y + 6.5, num, size=12.5, weight=700, fill="#ffffff", anchor="middle")


def tall_block(x, y, w, h, pal, num, ic, title, lines, side=None):
    block_shell(x, y, w, h, pal, num)
    add(f'<rect x="{x+20}" y="{y+24}" width="56" height="56" rx="14" fill="{pal["tile"]}"/>')
    icon(ic, x + 20 + 12, y + 24 + 12, 32, pal["accent"])
    if side:
        side(x + 92, y + 24)
    text(x + 20, y + 116, title, size=19.5, weight=700)
    for i, ln in enumerate(lines):
        text(x + 20, y + 138 + i * 19, ln, size=13.5, fill=MUTED)


def compact_block(x, y, w, h, pal, num, ic, title, lines):
    block_shell(x, y, w, h, pal, num)
    add(f'<rect x="{x+16}" y="{y+(h-48)/2+2}" width="48" height="48" rx="13" fill="{pal["tile"]}"/>')
    icon(ic, x + 16 + 10, y + (h - 48) / 2 + 2 + 10, 28, pal["accent"])
    text(x + 78, y + 46, title, size=18, weight=700)
    for i, ln in enumerate(lines):
        text(x + 78, y + 68 + i * 18, ln, size=13, fill=MUTED)


# ---------- arrows & labels ----------

def arrow(d, marker, color=LINE, width=2.5, dash=None):
    da = f' stroke-dasharray="{dash}"' if dash else ""
    add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round" marker-end="url(#{marker})"{da}/>')


def plain(d, color=LINE, width=2.5):
    add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linejoin="round"/>')


def label(x, y_last, lines, color=MUTED, size=12.5, weight=600, anchor="middle"):
    for i, ln in enumerate(reversed(lines)):
        text(x, y_last - i * 16, ln, size=size, weight=weight, fill=color, anchor=anchor)


# =====================================================================
add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{FONT}">')
add('<title>In-cabin driver monitoring: system block diagram</title>')
add('<desc>Real-time pipeline in the vehicle (camera, YOLO11n detector, temporal filter, alert and session log) '
    'followed by a post-session pipeline (log upload, server database, web dashboard) that feeds back to the driver.</desc>')

add('<defs>')
for name, color in [("m-line", LINE), ("m-alert", PAL["alert"]["stroke"]), ("m-srv", PAL["srv"]["stroke"])]:
    add(f'<marker id="{name}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto">'
        f'<path d="M0 0 L10 5 L0 10 Z" fill="{color}"/></marker>')
add('</defs>')

add(f'<rect width="{W}" height="{H}" fill="#ffffff"/>')


# Zones
ZX, ZW = 300, 1460
add(f'<rect x="{ZX}" y="150" width="{ZW}" height="360" rx="22" fill="#f6f9fd" stroke="{PAL["veh"]["stroke"]}" '
    f'stroke-opacity="0.55" stroke-width="2" stroke-dasharray="9 7"/>')
add(f'<text x="{ZX+30}" y="186" font-size="15"><tspan font-weight="700" fill="{PAL["veh"]["accent"]}">In the vehicle</tspan>'
    f'<tspan fill="{MUTED}" dx="10">real-time, during the drive</tspan></text>')

add(f'<rect x="{ZX}" y="596" width="{ZW}" height="304" rx="22" fill="#f5faf7" stroke="{PAL["srv"]["stroke"]}" '
    f'stroke-opacity="0.55" stroke-width="2" stroke-dasharray="9 7"/>')
add(f'<text x="{ZX+30}" y="632" font-size="15"><tspan font-weight="700" fill="{PAL["srv"]["accent"]}">On the server</tspan>'
    f'<tspan fill="{MUTED}" dx="10">after the session ends</tspan></text>')

# Columns
C1, C2, C3, C4, BW = 335, 710, 1085, 1460, 250
TY, TH = 221, 248          # top row
TC = TY + TH / 2           # 345
BY, BH = 665, 190          # bottom row
BC = BY + BH / 2           # 760

# ---- Driver (external actor)
DX, DY, DW, DH = 30, 270, 180, 560
add(f'<rect x="{DX}" y="{DY}" width="{DW}" height="{DH}" rx="22" fill="{PAL["drv"]["fill"]}" stroke="{PAL["drv"]["stroke"]}" stroke-width="2"/>')
add(f'<circle cx="{DX+DW/2}" cy="550" r="48" fill="#ffffff" stroke="{PAL["drv"]["stroke"]}" stroke-width="2.5"/>')
icon("user", DX + DW / 2 - 26, 524, 52, PAL["drv"]["accent"], sw=1.6)
text(DX + DW / 2, 632, "Driver", size=22, weight=700, fill=PAL["drv"]["accent"], anchor="middle")
text(DX + DW / 2, 652, "outside the system", size=12.5, fill=PAL["drv"]["accent"], anchor="middle")
text(DX + DW / 2, 302, "hears the alert", size=12.5, weight=600, fill=PAL["drv"]["accent"], anchor="middle")
text(DX + DW / 2, TC + 4, "is monitored", size=12.5, weight=600, fill=PAL["drv"]["accent"], anchor="middle")
text(DX + DW / 2, BC + 4, "reviews progress", size=12.5, weight=600, fill=PAL["drv"]["accent"], anchor="middle")

# ---- Top row blocks
tall_block(C1, TY, BW, TH, PAL["veh"], "1", "camera", "In-Cabin Camera",
           ["Continuous in-cabin", "video stream"], side=lambda ox, oy: vis_frames(ox, oy, PAL["veh"]))
pills_row(C1 + 20, TY + 168, ["1920×1080", "RGB", "30 FPS"], PAL["veh"], h=24)

tall_block(C2, TY, BW, TH, PAL["veh"], "2", "cpu", "YOLO11n Detector",
           ["Runs object detection on", "all 30 frames per second"], side=lambda ox, oy: vis_scene(ox, oy))
pills_row(C2 + 20, TY + 168, ["phone use", "drinking", "yawning"], PAL["veh"], h=24, size=10.5, cw=6.3, pad=14)
hw = pill(C2 + 20, TY + 198, "hand over mouth", PAL["veh"], h=24, size=10.5, cw=6.3, pad=14)

tall_block(C3, TY, BW, TH, PAL["veh"], "3", "activity", "Temporal Filter",
           ["Averages the last 5 frames;", "never uses future frames"], side=lambda ox, oy: vis_window(ox, oy, PAL["veh"]))
vis_plot(C3 + 20, TY + 166, 210, 64, PAL["veh"])

compact_block(C4, 221, BW, 112, PAL["alert"], "4a", "bell", "Alert", ["Speaker sounds,", "LED lights up"])
add(f'<circle cx="{C4+16+48-9}" cy="{221+(112-48)/2+2+9}" r="4.5" fill="{PAL["alert"]["stroke"]}" stroke="#ffffff" stroke-width="1.5"/>')
compact_block(C4, 357, BW, 112, PAL["veh"], "4b", "file", "Session Log", ["Event appended to", "the session log"])

# ---- Bottom row blocks (right to left)
tall_block(C4, BY, BW, BH, PAL["srv"], "5", "upload", "Log Upload",
           ["Session log is sent to the", "server after the trip ends"], side=lambda ox, oy: vis_transfer(ox, oy, PAL["srv"]))
tall_block(C3, BY, BW, BH, PAL["srv"], "6", "database", "Server Database",
           ["New session logs are", "appended to the database"], side=lambda ox, oy: vis_rows(ox, oy, PAL["srv"]))
tall_block(C2, BY, BW, BH, PAL["srv"], "7", "chart", "Web Dashboard",
           ["Statistics and graphs on", "desktop and mobile"], side=lambda ox, oy: vis_bars(ox, oy, PAL["srv"]))

# ---- Arrows: top row
arrow(f"M{DX+DW} {TC} H{C1}", "m-line")
label((DX + DW + C1) / 2, TC - 10, ["in-cabin camera view"])

arrow(f"M{C1+BW} {TC} H{C2}", "m-line")
label((C1 + BW + C2) / 2, TC - 10, ["30 FPS", "640×640"])

arrow(f"M{C2+BW} {TC} H{C3}", "m-line")
label((C2 + BW + C3) / 2, TC - 10, ["per-frame", "detections"])

JX = C4 - 28
plain(f"M{C3+BW} {TC} H{JX}")
plain(f"M{JX} 277 V413")
arrow(f"M{JX} 277 H{C4}", "m-line")
arrow(f"M{JX} 413 H{C4}", "m-line")
add(f'<circle cx="{JX}" cy="{TC}" r="4.5" fill="{LINE}"/>')
label((C3 + BW + JX) / 2, TC - 10, ["confirmed", "event"])

# Alert returns to the driver along the top channel
R = 14
ax = C4 + BW / 2
arrow(f"M{ax} 221 V{122+R} Q{ax} 122 {ax-R} 122 H{DX+DW/2+R} Q{DX+DW/2} 122 {DX+DW/2} {122+R} V{DY}",
      "m-alert", color=PAL["alert"]["stroke"], width=3)
text(900, 112, "audible and visual alert", size=13.5, weight=700, fill=PAL["alert"]["accent"], anchor="middle")

# Log -> Upload (crosses from vehicle to server)
arrow(f"M{ax} 469 V{BY}", "m-line")
label(ax - 14, 559, ["session log,", "sent after the trip ends"], anchor="end")

# ---- Arrows: bottom row
arrow(f"M{C4} {BC} H{C3+BW}", "m-srv", color=PAL["srv"]["stroke"])
label((C4 + C3 + BW) / 2, BC - 10, ["session", "logs"], color=PAL["srv"]["accent"])

arrow(f"M{C3} {BC} H{C2+BW}", "m-srv", color=PAL["srv"]["stroke"])
label((C3 + C2 + BW) / 2, BC - 10, ["statistics", "and trends"], color=PAL["srv"]["accent"])

arrow(f"M{C2} {BC} H{DX+DW}", "m-srv", color=PAL["srv"]["stroke"])
text((C2 + DX + DW) / 2 + 20, BC - 12, "graphs and statistics lead to better habits", size=13.5, weight=700,
     fill=PAL["srv"]["accent"], anchor="middle")

# ---- Legend
lx, ly = 300, 944
items = [("veh", "In-vehicle component"), ("srv", "Server component"),
         ("alert", "Alert path"), ("drv", "External actor")]
for key, name in items:
    p = PAL[key]
    add(f'<rect x="{lx}" y="{ly-12}" width="18" height="18" rx="5" fill="{p["fill"]}" stroke="{p["stroke"]}" stroke-width="2"/>')
    text(lx + 26, ly + 2, name, size=13, fill=MUTED)
    lx += 26 + int(len(name) * 7.2) + 34
add(f'<path d="M{lx} {ly-3} H{lx+34}" stroke="{LINE}" stroke-width="2.5" marker-end="url(#m-line)"/>')
text(lx + 48, ly + 2, "Data flow (label says what moves)", size=13, fill=MUTED)

add('</svg>')

import sys

args = [a for a in sys.argv[1:] if not a.startswith("--")]
path = args[0] if args else "driver-monitoring-block-diagram.svg"
with open(path, "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n' + "\n".join(out))
print("wrote", path)

# Optional: python build_diagram.py --png   (needs: pip install playwright && playwright install chromium)
if "--png" in sys.argv:
    from pathlib import Path
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=2)
        page.goto(Path(path).resolve().as_uri())
        png = str(Path(path).with_suffix(".png"))
        page.screenshot(path=png)
        browser.close()
    print("wrote", png)
