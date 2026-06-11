"""
Generates the premium cover page for the 5-Step Financial Freedom Plan.
Outputs: cover.pdf  (then merged with content pages via pypdf)
Run: python3 generate_cover.py
"""

import math
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT

W, H = letter   # 612 x 792 pt

# ── Palette ──────────────────────────────────────────────────────────────────
ARMY        = colors.HexColor('#2D4A1E')
ARMY_DEEP   = colors.HexColor('#1E3212')
ARMY_MID    = colors.HexColor('#3D6228')
GOLD        = colors.HexColor('#C9A84C')
GOLD_LIGHT  = colors.HexColor('#E8C870')
GOLD_PALE   = colors.HexColor('#F5E4B0')
NAVY        = colors.HexColor('#1A2840')
CREAM       = colors.HexColor('#F9F5EE')
CREAM_WARM  = colors.HexColor('#F0EBE0')
SKY_DAWN    = colors.HexColor('#F4A44A')   # deep amber
SKY_MID     = colors.HexColor('#F9C874')   # warm gold
SKY_HIGH    = colors.HexColor('#4A6EA8')   # blue-grey upper sky
SKY_HORIZON = colors.HexColor('#FAD89A')   # horizon glow
WHITE       = colors.white
MUTED       = colors.HexColor('#7A7A6A')
CHARCOAL    = colors.HexColor('#2A2A2A')

# ── Helpers ───────────────────────────────────────────────────────────────────
def lerp_color(c1, c2, t):
    r = c1.red   + (c2.red   - c1.red)   * t
    g = c1.green + (c2.green - c1.green) * t
    b = c1.blue  + (c2.blue  - c1.blue)  * t
    return colors.Color(r, g, b)

def vertical_gradient(c, x, y, w, h, top_color, bottom_color, steps=120):
    for i in range(steps):
        t    = i / steps
        col  = lerp_color(bottom_color, top_color, t)
        yy   = y + h * i / steps
        hh   = h / steps + 1          # +1 avoids hairline gaps
        c.setFillColor(col)
        c.rect(x, yy, w, hh, fill=1, stroke=0)

def radial_glow(c, cx, cy, r_outer, r_inner, color, steps=60):
    """Soft radial gradient glow (light at centre, fading out)."""
    for i in range(steps):
        t   = i / steps                # 0 = inner, 1 = outer
        fac = 1 - t                    # opacity factor
        radius = r_inner + (r_outer - r_inner) * t
        col = colors.Color(color.red, color.green, color.blue, alpha=fac * 0.35)
        c.setFillColor(col)
        c.circle(cx, cy, radius, fill=1, stroke=0)

# ── Sky scene ─────────────────────────────────────────────────────────────────
def draw_sky(c):
    # 4-band vertical gradient: deep blue-grey → mid sky → gold horizon → amber
    sky_top    = colors.HexColor('#2E4870')
    sky_upper  = colors.HexColor('#4A6EA8')
    sky_lower  = colors.HexColor('#E8A850')
    sky_bottom = colors.HexColor('#F4C060')

    horizon_y = H * 0.36   # horizon line

    # Sky above horizon
    vertical_gradient(c, 0, horizon_y, W, H - horizon_y, sky_top, sky_lower, steps=200)

    # Ground below horizon (very dark, slightly warm)
    ground_top    = colors.HexColor('#3A3020')
    ground_bottom = colors.HexColor('#1A1508')
    vertical_gradient(c, 0, 0, W, horizon_y, ground_top, ground_bottom, steps=80)

    # Horizon glow — big soft radial bloom
    radial_glow(c, W / 2, horizon_y, W * 1.1, W * 0.06, GOLD_LIGHT, steps=90)

    # Sun disc
    sun_y = horizon_y + 2
    c.setFillColor(colors.Color(1.0, 0.95, 0.7, alpha=1.0))
    c.circle(W / 2, sun_y, 22, fill=1, stroke=0)
    # Sun inner bright
    c.setFillColor(WHITE)
    c.circle(W / 2, sun_y, 10, fill=1, stroke=0)
    # Sun outer warm corona rings
    for r, a in [(30, 0.25), (42, 0.14), (58, 0.07), (80, 0.03)]:
        c.setFillColor(colors.Color(1.0, 0.85, 0.4, alpha=a))
        c.circle(W / 2, sun_y, r, fill=1, stroke=0)

def draw_clouds(c):
    """Wispy streaks near the horizon."""
    horizon_y = H * 0.36
    cloud_data = [
        (120, horizon_y + 60, 140, 8),
        (350, horizon_y + 80, 110, 7),
        (500, horizon_y + 55, 90, 6),
        (200, horizon_y + 110, 70, 5),
        (440, horizon_y + 130, 80, 5),
    ]
    for (cx, cy, rw, rh) in cloud_data:
        for i, a in [(1.0, 0.07), (0.85, 0.05), (0.7, 0.03)]:
            c.setFillColor(colors.Color(1.0, 0.95, 0.85, alpha=a))
            c.ellipse(cx - rw * i, cy - rh * i, cx + rw * i, cy + rh * i, fill=1, stroke=0)

# ── Neighbourhood silhouette ───────────────────────────────────────────────────
def draw_neighbourhood(c):
    horizon_y = H * 0.36
    dark = colors.HexColor('#100E08')

    def house(x, base_y, w, h_wall, h_roof, chimney=False):
        """Simple pitched-roof house."""
        c.setFillColor(dark)
        # wall
        c.rect(x, base_y, w, h_wall, fill=1, stroke=0)
        # pitched roof
        roof_pts = [x - 2, base_y + h_wall,
                    x + w / 2, base_y + h_wall + h_roof,
                    x + w + 2, base_y + h_wall]
        c.setFillColor(colors.HexColor('#0C0B07'))
        path = c.beginPath()
        path.moveTo(roof_pts[0], roof_pts[1])
        path.lineTo(roof_pts[2], roof_pts[3])
        path.lineTo(roof_pts[4], roof_pts[5])
        path.close()
        c.drawPath(path, fill=1, stroke=0)
        # chimney
        if chimney:
            c.setFillColor(dark)
            c.rect(x + w * 0.7, base_y + h_wall + h_roof * 0.5, 8, h_roof * 0.6, fill=1, stroke=0)
        # door
        c.setFillColor(colors.HexColor('#1A1400'))
        door_w = w * 0.22
        door_h = h_wall * 0.42
        c.rect(x + w / 2 - door_w / 2, base_y, door_w, door_h, fill=1, stroke=0)
        # windows
        win_w = w * 0.18
        win_h = h_wall * 0.22
        for wx in [x + w * 0.15, x + w * 0.65]:
            c.setFillColor(colors.Color(1.0, 0.85, 0.4, alpha=0.5))
            c.rect(wx, base_y + h_wall * 0.45, win_w, win_h, fill=1, stroke=0)

    # Row of houses — silhouette varies in size for depth
    house(30,  horizon_y - 48, 70, 48, 28, chimney=True)
    house(105, horizon_y - 38, 52, 38, 20)
    house(162, horizon_y - 42, 62, 42, 24, chimney=True)
    house(228, horizon_y - 34, 46, 34, 18)
    # Hero house — slightly larger, centred-left (soldier stands next to it)
    house(280, horizon_y - 55, 88, 55, 32, chimney=True)
    house(374, horizon_y - 36, 56, 36, 20)
    house(435, horizon_y - 44, 68, 44, 26)
    house(508, horizon_y - 38, 54, 38, 22, chimney=True)
    house(565, horizon_y - 30, 48, 30, 16)

    # Trees (silhouette triangles)
    def tree(tx, ty, tw, th):
        c.setFillColor(colors.HexColor('#0A0F06'))
        path = c.beginPath()
        path.moveTo(tx, ty)
        path.lineTo(tx + tw / 2, ty + th)
        path.lineTo(tx + tw, ty)
        path.close()
        c.drawPath(path, fill=1, stroke=0)
        c.setFillColor(colors.HexColor('#0A0F06'))
        c.rect(tx + tw * 0.44, ty - 8, tw * 0.12, 10, fill=1, stroke=0)

    tree(245, horizon_y - 45, 26, 45)
    tree(270, horizon_y - 40, 20, 40)
    tree(393, horizon_y - 40, 22, 40)
    tree(540, horizon_y - 38, 20, 38)
    tree(555, horizon_y - 42, 24, 42)

    # Foreground ground slab for soldier to stand on
    c.setFillColor(colors.HexColor('#100D08'))
    c.rect(0, 0, W, horizon_y - 42, fill=1, stroke=0)


# ── Wealth-chart graphic (notebook prop) ─────────────────────────────────────
def draw_chart(c):
    """Small notebook with upward line chart, bottom-right area."""
    cx = W * 0.78
    cy = H * 0.18
    nw, nh = 92, 68

    # Notebook body
    c.setFillColor(colors.HexColor('#F5F0E8'))
    c.roundRect(cx, cy, nw, nh, 4, fill=1, stroke=0)

    # Spiral binding left edge
    c.setFillColor(colors.HexColor('#BBBBAA'))
    c.rect(cx, cy, 7, nh, fill=1, stroke=0)
    for yy in range(int(cy + 8), int(cy + nh - 4), 10):
        c.setFillColor(colors.HexColor('#888880'))
        c.circle(cx + 3.5, yy, 3.5, fill=1, stroke=0)

    # Chart area inside notebook
    px, py = cx + 13, cy + 8
    pw, ph = nw - 18, nh - 14

    # Faint grid lines
    c.setStrokeColor(colors.HexColor('#DDDDCC'))
    c.setLineWidth(0.4)
    for i in range(1, 4):
        yg = py + ph * i / 4
        c.line(px, yg, px + pw, yg)

    # Chart line: exponential upward curve
    pts = [
        (0.0,  0.05),
        (0.15, 0.08),
        (0.30, 0.12),
        (0.45, 0.20),
        (0.60, 0.35),
        (0.75, 0.55),
        (0.88, 0.72),
        (1.00, 0.92),
    ]
    screen_pts = [(px + pw * x, py + ph * y) for x, y in pts]

    # Fill under curve (army green translucent)
    c.setFillColor(colors.Color(0.176, 0.290, 0.118, alpha=0.18))
    path = c.beginPath()
    path.moveTo(px, py)
    for sx, sy in screen_pts:
        path.lineTo(sx, sy)
    path.lineTo(px + pw, py)
    path.close()
    c.drawPath(path, fill=1, stroke=0)

    # Chart line itself
    c.setStrokeColor(ARMY_MID)
    c.setLineWidth(1.8)
    path = c.beginPath()
    path.moveTo(*screen_pts[0])
    for sx, sy in screen_pts[1:]:
        path.lineTo(sx, sy)
    c.drawPath(path, fill=0, stroke=1)

    # Endpoint dot with gold ring
    ex, ey = screen_pts[-1]
    c.setFillColor(GOLD)
    c.circle(ex, ey, 4.5, fill=1, stroke=0)
    c.setFillColor(WHITE)
    c.circle(ex, ey, 2, fill=1, stroke=0)

    # "$750K" label above endpoint
    c.setFillColor(ARMY_DEEP)
    c.setFont('Helvetica-Bold', 7)
    c.drawString(ex - 14, ey + 6, '$750K')

    # X-axis label
    c.setFillColor(MUTED.clone() if hasattr(MUTED, 'clone') else colors.HexColor('#7A7A6A'))
    c.setFont('Helvetica', 5.5)
    c.drawCentredString(px + pw / 2, cy + 2, '2018 → 2025')


# ── Soldier silhouette ────────────────────────────────────────────────────────
def draw_soldier(c):
    """
    Detailed soldier silhouette facing right (toward horizon).
    Full ACU/OCP combat uniform: helmet, body armour, rifle, boots.
    Drawn entirely with path operations for a crisp silhouette.
    Wedding ring implied by hand detail.
    """
    horizon_y = H * 0.36
    base_y = horizon_y - 44   # feet on ground level
    sc = 1.35                  # scale factor
    sx = W * 0.30              # x anchor (centre of figure)

    def pt(rx, ry):
        """Convert relative (rx,ry) offset to canvas coords."""
        return sx + rx * sc, base_y + ry * sc

    def fill(col):
        c.setFillColor(col)

    silhouette = colors.HexColor('#0A0F06')
    equip      = colors.HexColor('#080C04')

    # ── Boots ──────────────────────────────────────────────────────────────
    fill(silhouette)
    # Left boot
    path = c.beginPath()
    path.moveTo(*pt(-12, 0));  path.lineTo(*pt(-6, 0))
    path.lineTo(*pt(-5, 14));  path.lineTo(*pt(-14, 14)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    path = c.beginPath()   # boot toe
    path.moveTo(*pt(-14, 6)); path.lineTo(*pt(-19, 6))
    path.lineTo(*pt(-19, 14));path.lineTo(*pt(-5, 14)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Right boot
    path = c.beginPath()
    path.moveTo(*pt(4, 0));   path.lineTo(*pt(10, 0))
    path.lineTo(*pt(9, 14));  path.lineTo(*pt(3, 14));  path.close()
    c.drawPath(path, fill=1, stroke=0)
    path = c.beginPath()
    path.moveTo(*pt(9, 6));   path.lineTo(*pt(16, 6))
    path.lineTo(*pt(16, 14)); path.lineTo(*pt(3, 14));  path.close()
    c.drawPath(path, fill=1, stroke=0)

    # ── Legs (trousers) ──────────────────────────────────────────────────
    fill(silhouette)
    path = c.beginPath()
    path.moveTo(*pt(-12, 14)); path.lineTo(*pt(-4, 14))
    path.lineTo(*pt(-2, 58));  path.lineTo(*pt(-14, 58)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    path = c.beginPath()
    path.moveTo(*pt(4, 14));  path.lineTo(*pt(12, 14))
    path.lineTo(*pt(10, 58)); path.lineTo(*pt(2, 58));  path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Crotch join
    path = c.beginPath()
    path.moveTo(*pt(-4, 14)); path.lineTo(*pt(4, 14))
    path.lineTo(*pt(4, 42));  path.lineTo(*pt(-4, 42)); path.close()
    c.drawPath(path, fill=1, stroke=0)

    # ── Body armour / IOTV torso ──────────────────────────────────────────
    fill(equip)
    path = c.beginPath()
    path.moveTo(*pt(-16, 58)); path.lineTo(*pt(14, 58))
    path.lineTo(*pt(18, 105)); path.lineTo(*pt(-18, 105)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    # IOTV shoulder pads
    path = c.beginPath()
    path.moveTo(*pt(-18, 100)); path.lineTo(*pt(-22, 100))
    path.lineTo(*pt(-24, 88));  path.lineTo(*pt(-18, 85)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    path = c.beginPath()
    path.moveTo(*pt(18, 100)); path.lineTo(*pt(22, 100))
    path.lineTo(*pt(24, 88));  path.lineTo(*pt(18, 85)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Front plate / pocket detail
    fill(silhouette)
    path = c.beginPath()
    path.moveTo(*pt(-11, 65)); path.lineTo(*pt(9, 65))
    path.lineTo(*pt(10, 100)); path.lineTo(*pt(-12, 100)); path.close()
    c.drawPath(path, fill=1, stroke=0)

    # ── Arms ─────────────────────────────────────────────────────────────
    fill(silhouette)
    # Right arm (forward, carrying rifle)
    path = c.beginPath()
    path.moveTo(*pt(18, 85));  path.lineTo(*pt(24, 85))
    path.lineTo(*pt(30, 58));  path.lineTo(*pt(22, 58)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Right forearm + hand
    path = c.beginPath()
    path.moveTo(*pt(22, 58));  path.lineTo(*pt(30, 58))
    path.lineTo(*pt(34, 44));  path.lineTo(*pt(26, 44)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Left arm (slightly rearward, relaxed)
    path = c.beginPath()
    path.moveTo(*pt(-18, 85)); path.lineTo(*pt(-24, 85))
    path.lineTo(*pt(-28, 58)); path.lineTo(*pt(-20, 58)); path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Left forearm / hand
    path = c.beginPath()
    path.moveTo(*pt(-20, 58)); path.lineTo(*pt(-28, 58))
    path.lineTo(*pt(-30, 46)); path.lineTo(*pt(-22, 46)); path.close()
    c.drawPath(path, fill=1, stroke=0)

    # ── Wedding ring — gold band on left ring finger ─────────────────────
    rx, ry = pt(-26, 46)
    c.setFillColor(GOLD)
    c.circle(rx, ry, 3.2 * sc, fill=1, stroke=0)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.0))   # hole
    c.setStrokeColor(equip)
    c.setLineWidth(0.8)
    c.circle(rx, ry, 1.5 * sc, fill=0, stroke=1)

    # ── Rifle (M4, carried in right hand, pointing down-forward) ─────────
    fill(equip)
    rx0, ry0 = pt(32, 38)
    rx1, ry1 = pt(38, 10)
    c.setStrokeColor(equip)
    c.setLineWidth(3 * sc * 0.5)
    c.line(rx0, ry0, rx1, ry1)
    # Stock
    c.setLineWidth(5 * sc * 0.5)
    sx0, sy0 = pt(28, 50)
    sx1, sy1 = pt(26, 58)
    c.line(sx0, sy0, sx1, sy1)
    # Barrel flash suppressor
    bx, by = pt(40, 5)
    c.setFillColor(equip)
    c.rect(bx - 1, by, 3, 6, fill=1, stroke=0)

    # ── Neck ─────────────────────────────────────────────────────────────
    fill(silhouette)
    path = c.beginPath()
    path.moveTo(*pt(-5, 105)); path.lineTo(*pt(5, 105))
    path.lineTo(*pt(6, 118));  path.lineTo(*pt(-6, 118)); path.close()
    c.drawPath(path, fill=1, stroke=0)

    # ── Head ─────────────────────────────────────────────────────────────
    fill(silhouette)
    hx, hy = pt(0, 128)
    c.ellipse(hx - 11 * sc, hy - 14 * sc, hx + 11 * sc, hy + 14 * sc, fill=1, stroke=0)

    # ── ACH Helmet ────────────────────────────────────────────────────────
    fill(equip)
    # Helmet dome
    path = c.beginPath()
    hcx, hcy = pt(0, 132)
    path.moveTo(hcx - 14 * sc, hcy)
    path.curveTo(hcx - 14 * sc, hcy + 22 * sc,
                 hcx + 14 * sc, hcy + 22 * sc,
                 hcx + 14 * sc, hcy)
    path.curveTo(hcx + 16 * sc, hcy - 2 * sc,
                 hcx - 16 * sc, hcy - 2 * sc,
                 hcx - 14 * sc, hcy)
    path.close()
    c.drawPath(path, fill=1, stroke=0)
    # Helmet brim (front)
    path = c.beginPath()
    path.moveTo(hcx - 14 * sc, hcy)
    path.lineTo(hcx + 18 * sc, hcy - 4 * sc)
    path.lineTo(hcx + 18 * sc, hcy - 7 * sc)
    path.lineTo(hcx - 14 * sc, hcy - 5 * sc)
    path.close()
    c.drawPath(path, fill=1, stroke=0)

    # ── Backpack / assault pack ───────────────────────────────────────────
    fill(equip)
    path = c.beginPath()
    path.moveTo(*pt(-18, 105)); path.lineTo(*pt(-24, 105))
    path.lineTo(*pt(-26, 68));  path.lineTo(*pt(-18, 68)); path.close()
    c.drawPath(path, fill=1, stroke=0)


# ── Foreground grass / ground ─────────────────────────────────────────────────
def draw_foreground(c):
    horizon_y = H * 0.36
    # Simple dark grass strip in front of soldier
    c.setFillColor(colors.HexColor('#0A0C05'))
    path = c.beginPath()
    path.moveTo(0, 0)
    path.lineTo(W, 0)
    path.lineTo(W, horizon_y - 50)
    path.curveTo(W * 0.6, horizon_y - 46, W * 0.4, horizon_y - 40, 0, horizon_y - 38)
    path.close()
    c.drawPath(path, fill=1, stroke=0)


# ── Top logo bar ──────────────────────────────────────────────────────────────
def draw_logo_bar(c):
    # Thin army-green bar at very top
    bar_h = 30
    c.setFillColor(ARMY_DEEP)
    c.rect(0, H - bar_h, W, bar_h, fill=1, stroke=0)
    # Gold underline
    c.setFillColor(GOLD)
    c.rect(0, H - bar_h - 2, W, 2, fill=1, stroke=0)
    # Logo text
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 9.5)
    c.drawString(22, H - bar_h + 10, 'SOLDIER TO MILLIONAIRE')
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.45))
    c.setFont('Helvetica', 7.5)
    c.drawRightString(W - 22, H - bar_h + 10, 'soldiertomillionaire.com')


# ── Title block ───────────────────────────────────────────────────────────────
def draw_title_block(c):
    """
    Large centered title over a semi-transparent army panel.
    Sits in the upper portion of the image, above the sun.
    """
    # Backdrop panel — semi-transparent dark gradient
    panel_y = H * 0.56
    panel_h = H * 0.36
    # Dark overlay gradient over sky for legibility
    for i in range(80):
        t = i / 80
        alpha = 0.62 * (1 - t * 0.7)
        col = colors.Color(0.08, 0.12, 0.05, alpha=alpha)
        c.setFillColor(col)
        c.rect(0, panel_y + panel_h * t / 80, W, panel_h / 80 + 1, fill=1, stroke=0)

    # Logo eyebrow
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 8.5)
    c.setFillColor(colors.Color(c1.red, c1.green, c1.blue, alpha=1)
                   if False else GOLD_LIGHT)
    c.drawCentredString(W / 2, H * 0.90, 'SOLDIER TO MILLIONAIRE  ·  FREE GUIDE')

    # Main title — three lines, large
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 48)
    c.drawCentredString(W / 2, H * 0.835, 'THE FREE')
    c.setFillColor(GOLD_LIGHT)
    c.drawCentredString(W / 2, H * 0.778, '5-STEP')
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 32)
    c.drawCentredString(W / 2, H * 0.735, 'FINANCIAL FREEDOM')
    c.drawCentredString(W / 2, H * 0.700, 'PLAN FOR SOLDIERS')

    # Thin gold divider under title
    dw = 220
    c.setFillColor(GOLD)
    c.rect(W / 2 - dw / 2, H * 0.688, dw, 1.5, fill=1, stroke=0)

    # Subtitle
    c.setFillColor(colors.Color(0.95, 0.92, 0.85, alpha=0.85))
    c.setFont('Helvetica', 10)
    sub1 = 'A practical roadmap to building wealth, maximizing'
    sub2 = 'military benefits, and creating freedom for your family.'
    c.drawCentredString(W / 2, H * 0.665, sub1)
    c.drawCentredString(W / 2, H * 0.650, sub2)

# store for reuse
c1 = GOLD_LIGHT


# ── Author / byline strip ─────────────────────────────────────────────────────
def draw_byline(c):
    """Dark army-green strip at the very bottom with author info."""
    strip_h = 64
    c.setFillColor(ARMY_DEEP)
    c.rect(0, 0, W, strip_h, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.rect(0, strip_h, W, 2, fill=1, stroke=0)

    # Avatar circle placeholder
    av_r = 20
    av_cx = 50
    av_cy = strip_h / 2
    c.setFillColor(ARMY_MID)
    c.circle(av_cx, av_cy, av_r, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(av_cx, av_cy - 5, 'JD')

    # Name + title
    c.setFillColor(WHITE)
    c.setFont('Helvetica-Bold', 11.5)
    c.drawString(av_cx + av_r + 12, av_cy + 8, 'Joe Do')
    c.setFillColor(colors.Color(0.85, 0.82, 0.75, alpha=0.8))
    c.setFont('Helvetica', 8.5)
    c.drawString(av_cx + av_r + 12, av_cy - 6, 'Active Duty U.S. Army Soldier  ·  Founder, Soldier to Millionaire')

    # Stars right side
    c.setFillColor(GOLD)
    c.setFont('Helvetica-Bold', 10)
    c.drawRightString(W - 22, av_cy + 5, '★★★★★')
    c.setFillColor(colors.Color(0.85, 0.82, 0.75, alpha=0.6))
    c.setFont('Helvetica', 7.5)
    c.drawRightString(W - 22, av_cy - 8, 'Trusted by 27+ U.S. Army Soldiers')


# ── Scene tagline ─────────────────────────────────────────────────────────────
def draw_scene_caption(c):
    """Italic tagline floating just above the byline strip."""
    horizon_y = H * 0.36
    text_y = horizon_y - 68
    # Small semi-transparent pill
    pill_w = 260
    pill_h = 18
    pill_x = W / 2 - pill_w / 2
    c.setFillColor(colors.Color(0.08, 0.12, 0.05, alpha=0.70))
    c.roundRect(pill_x, text_y - 3, pill_w, pill_h, 9, fill=1, stroke=0)
    c.setFillColor(GOLD_PALE)
    c.setFont('Helvetica-Oblique', 7.5)
    c.drawCentredString(W / 2, text_y + 3.5,
        '"At 30 I had $20 in my pocket. At 38 — $750,000 net worth."')
    c.setFillColor(colors.Color(1, 1, 1, alpha=0.45))
    c.setFont('Helvetica', 6.5)
    c.drawCentredString(W / 2, text_y - 3, '— Joe Do, U.S. Army')


# ── Assemble ──────────────────────────────────────────────────────────────────
def build():
    import os
    out_dir  = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(out_dir, 'cover.pdf')

    cv = canvas.Canvas(out_path, pagesize=letter)

    draw_sky(cv)
    draw_clouds(cv)
    draw_neighbourhood(cv)
    draw_soldier(cv)
    draw_foreground(cv)
    draw_chart(cv)
    draw_logo_bar(cv)
    draw_title_block(cv)
    draw_scene_caption(cv)
    draw_byline(cv)

    cv.save()
    print(f'✅  Cover saved to: {out_path}')
    return out_path


if __name__ == '__main__':
    build()
