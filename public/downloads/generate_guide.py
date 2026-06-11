"""
Generates: military-financial-freedom-playbook.pdf
Run: python3 generate_guide.py
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable,
    PageBreak, Table, TableStyle, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus.flowables import Flowable
import os

# ── Colors ──────────────────────────────────────────────────────────────────
ARMY       = colors.HexColor('#2D4A1E')
ARMY_LIGHT = colors.HexColor('#3D6228')
GOLD       = colors.HexColor('#C9A84C')
GOLD_LIGHT = colors.HexColor('#DFC070')
DARK       = colors.HexColor('#1A1F14')
CREAM      = colors.HexColor('#F9F5EE')
CREAM_2    = colors.HexColor('#F0EBE0')
MUTED      = colors.HexColor('#7A7A6A')
WHITE      = colors.white
TEXT       = colors.HexColor('#1A1F14')
TEXT_LIGHT = colors.HexColor('#4A4A3A')

OUTPUT = os.path.join(os.path.dirname(__file__), 'military-financial-freedom-playbook.pdf')

W, H = letter

# ── Custom Flowable: solid colored rectangle banner ─────────────────────────
class ColorBlock(Flowable):
    def __init__(self, width, height, bg, text='', text_color=WHITE,
                 font_size=11, bold=False, padding_left=16):
        super().__init__()
        self.width = width
        self.height = height
        self.bg = bg
        self.text = text
        self.text_color = text_color
        self.font_size = font_size
        self.bold = bold
        self.padding_left = padding_left

    def draw(self):
        self.canv.setFillColor(self.bg)
        self.canv.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        if self.text:
            self.canv.setFillColor(self.text_color)
            font = 'Helvetica-Bold' if self.bold else 'Helvetica'
            self.canv.setFont(font, self.font_size)
            self.canv.drawString(self.padding_left, self.height / 2 - self.font_size * 0.35, self.text)

# ── Page templates ───────────────────────────────────────────────────────────
MARGIN = 0.65 * inch
CONTENT_W = W - 2 * MARGIN

def cover_background(canvas, doc):
    canvas.saveState()
    # Full army-green top half
    canvas.setFillColor(ARMY)
    canvas.rect(0, H * 0.42, W, H * 0.58, fill=1, stroke=0)
    # Cream bottom half
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, W, H * 0.42, fill=1, stroke=0)
    # Gold accent stripe
    canvas.setFillColor(GOLD)
    canvas.rect(0, H * 0.42 - 4, W, 4, fill=1, stroke=0)

    # ── Soldier2Millionaire logo — top-left masthead ──────────────────────
    logo_x = MARGIN
    logo_y = H - MARGIN * 0.85   # baseline near top margin
    font_size = 18

    # Measure each segment to position them flush
    canvas.setFont('Helvetica-Bold', font_size)
    w_soldier     = canvas.stringWidth('SOLDIER',     'Helvetica-Bold', font_size)
    w_two         = canvas.stringWidth('2',           'Helvetica-Bold', font_size)
    w_millionaire = canvas.stringWidth('MILLIONAIRE', 'Helvetica-Bold', font_size)

    # Draw "SOLDIER" in white
    canvas.setFillColor(WHITE)
    canvas.drawString(logo_x, logo_y, 'SOLDIER')

    # Draw "2" in gold, tight against "SOLDIER"
    canvas.setFillColor(GOLD)
    canvas.drawString(logo_x + w_soldier, logo_y, '2')

    # Draw "MILLIONAIRE" in white, tight against "2"
    canvas.setFillColor(WHITE)
    canvas.drawString(logo_x + w_soldier + w_two, logo_y, 'MILLIONAIRE')

    # Thin gold underline beneath the logo
    total_w = w_soldier + w_two + w_millionaire
    canvas.setFillColor(GOLD)
    canvas.rect(logo_x, logo_y - 3, total_w, 1.5, fill=1, stroke=0)

    canvas.restoreState()

def interior_page(canvas, doc):
    canvas.saveState()
    # Cream background
    canvas.setFillColor(CREAM)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Thin gold top bar
    canvas.setFillColor(GOLD)
    canvas.rect(0, H - 28, W, 28, fill=1, stroke=0)
    # Header text
    canvas.setFillColor(ARMY)
    canvas.setFont('Helvetica-Bold', 7.5)
    canvas.drawString(MARGIN, H - 17, 'THE MILITARY FINANCIAL FREEDOM PLAYBOOK')
    canvas.setFillColor(ARMY)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawRightString(W - MARGIN, H - 17, 'soldiertomillionaire.com')
    # Thin gold bottom bar
    canvas.setFillColor(GOLD)
    canvas.rect(0, 0, W, 22, fill=1, stroke=0)
    # Page number
    canvas.setFillColor(ARMY)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawCentredString(W / 2, 7, f'Page {doc.page}')
    canvas.restoreState()

# ── Styles ───────────────────────────────────────────────────────────────────
def make_styles():
    s = {}

    s['cover_eyebrow'] = ParagraphStyle('cover_eyebrow',
        fontName='Helvetica', fontSize=9, textColor=GOLD,
        letterSpacing=2, spaceAfter=8, alignment=TA_LEFT)

    s['cover_title'] = ParagraphStyle('cover_title',
        fontName='Helvetica-Bold', fontSize=42, textColor=WHITE,
        leading=48, spaceAfter=6, alignment=TA_LEFT)

    s['cover_sub'] = ParagraphStyle('cover_sub',
        fontName='Helvetica', fontSize=13, textColor=colors.HexColor('#CCCCAA'),
        leading=20, spaceAfter=20, alignment=TA_LEFT)

    s['cover_author'] = ParagraphStyle('cover_author',
        fontName='Helvetica-Bold', fontSize=11, textColor=WHITE,
        spaceAfter=4, alignment=TA_LEFT)

    s['cover_role'] = ParagraphStyle('cover_role',
        fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#DDDDBB'),
        letterSpacing=0.5, alignment=TA_LEFT)

    s['cover_bottom'] = ParagraphStyle('cover_bottom',
        fontName='Helvetica', fontSize=10, textColor=TEXT_LIGHT,
        leading=16, alignment=TA_CENTER)

    s['section_tag'] = ParagraphStyle('section_tag',
        fontName='Helvetica-Bold', fontSize=8, textColor=GOLD,
        letterSpacing=2, spaceBefore=4, spaceAfter=4, alignment=TA_LEFT)

    s['h1'] = ParagraphStyle('h1',
        fontName='Helvetica-Bold', fontSize=26, textColor=ARMY,
        leading=30, spaceBefore=6, spaceAfter=14, alignment=TA_LEFT)

    s['h2'] = ParagraphStyle('h2',
        fontName='Helvetica-Bold', fontSize=17, textColor=ARMY,
        leading=22, spaceBefore=14, spaceAfter=8, alignment=TA_LEFT)

    s['step_num'] = ParagraphStyle('step_num',
        fontName='Helvetica-Bold', fontSize=36, textColor=GOLD,
        leading=40, spaceAfter=0, alignment=TA_LEFT)

    s['step_label'] = ParagraphStyle('step_label',
        fontName='Helvetica-Bold', fontSize=8, textColor=ARMY_LIGHT,
        letterSpacing=2, spaceBefore=0, spaceAfter=4, alignment=TA_LEFT)

    s['step_title'] = ParagraphStyle('step_title',
        fontName='Helvetica-Bold', fontSize=16, textColor=ARMY,
        leading=20, spaceBefore=0, spaceAfter=10, alignment=TA_LEFT)

    s['body'] = ParagraphStyle('body',
        fontName='Helvetica', fontSize=10.5, textColor=TEXT_LIGHT,
        leading=16, spaceBefore=0, spaceAfter=10, alignment=TA_JUSTIFY)

    s['callout_text'] = ParagraphStyle('callout_text',
        fontName='Helvetica-Bold', fontSize=10, textColor=ARMY,
        leading=15, alignment=TA_LEFT)

    s['intro_quote'] = ParagraphStyle('intro_quote',
        fontName='Helvetica-Oblique', fontSize=12, textColor=TEXT,
        leading=19, spaceBefore=6, spaceAfter=6, alignment=TA_JUSTIFY,
        leftIndent=14)

    s['checklist_head'] = ParagraphStyle('checklist_head',
        fontName='Helvetica-Bold', fontSize=11, textColor=WHITE,
        leading=15, alignment=TA_LEFT)

    s['checklist_item'] = ParagraphStyle('checklist_item',
        fontName='Helvetica', fontSize=10, textColor=DARK,
        leading=16, spaceBefore=2, spaceAfter=2, leftIndent=10)

    s['cta_head'] = ParagraphStyle('cta_head',
        fontName='Helvetica-Bold', fontSize=18, textColor=WHITE,
        leading=24, spaceAfter=8, alignment=TA_CENTER)

    s['cta_body'] = ParagraphStyle('cta_body',
        fontName='Helvetica', fontSize=10.5, textColor=colors.HexColor('#CCCCAA'),
        leading=17, spaceAfter=10, alignment=TA_CENTER)

    s['cta_url'] = ParagraphStyle('cta_url',
        fontName='Helvetica-Bold', fontSize=13, textColor=GOLD,
        spaceAfter=6, alignment=TA_CENTER)

    s['footer_note'] = ParagraphStyle('footer_note',
        fontName='Helvetica-Oblique', fontSize=8, textColor=MUTED,
        leading=13, alignment=TA_CENTER)

    return s

# ── Content helpers ──────────────────────────────────────────────────────────
def callout_block(text, styles, width):
    data = [[Paragraph(f'<b>&#128205;</b>  {text}', styles['callout_text'])]]
    t = Table(data, colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EBF0E5')),
        ('LINEAFTER',  (0,0), (0,-1), 3, ARMY),
        ('LINEBEFORE', (0,0), (0,-1), 3, ARMY),
        ('TOPPADDING',    (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING',   (0,0), (-1,-1), 14),
        ('RIGHTPADDING',  (0,0), (-1,-1), 14),
    ]))
    return t

def step_header(num, label, title, styles, width):
    left_col = [
        Paragraph(num, styles['step_num']),
    ]
    right_col = [
        Paragraph(label, styles['step_label']),
        Paragraph(title, styles['step_title']),
    ]
    data = [[left_col, right_col]]
    t = Table(data, colWidths=[0.7*inch, width - 0.7*inch])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (0,-1), 10),
    ]))
    return t

def divider(width, color=GOLD, thickness=0.75):
    return HRFlowable(width=width, thickness=thickness, color=color, spaceAfter=14, spaceBefore=6)

# ── Build PDF ────────────────────────────────────────────────────────────────
def build():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=letter,
        leftMargin=MARGIN, rightMargin=MARGIN,
        topMargin=MARGIN, bottomMargin=MARGIN,
        title='The Military Financial Freedom Playbook',
        author='Joe Do — Soldier to Millionaire',
        subject='5-Step Financial Freedom System for US Military',
    )

    styles = make_styles()
    story = []

    # ── PAGE 1: COVER ────────────────────────────────────────────────────────
    # Top half sits on army green (via cover_background)
    story.append(Spacer(1, 0.75 * inch))
    story.append(Paragraph('THE MILITARY FINANCIAL FREEDOM PLAYBOOK', styles['cover_eyebrow']))
    story.append(Paragraph('5 Steps to<br/>Financial<br/>Freedom<br/>in Uniform.', styles['cover_title']))
    story.append(Paragraph('The exact system I used to go from $0 to $750,000 net worth — on a normal military salary.', styles['cover_sub']))
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph('Joe Do', styles['cover_author']))
    story.append(Paragraph('US Army Soldier  ·  Founder, Soldier to Millionaire', styles['cover_role']))

    # Gold divider line
    story.append(Spacer(1, 0.6 * inch))
    story.append(HRFlowable(width=CONTENT_W, thickness=1, color=GOLD, spaceAfter=0))

    # Bottom half of cover (cream section)
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        'I came to America from Vietnam with nothing. I worked three jobs.<br/>'
        'I had $20 in my pocket in Hawaii at age 30.<br/><br/>'
        'Eight years later — $750,000 net worth. House paid off. Financially free.<br/><br/>'
        '<b>This guide is the exact system that made it happen.</b>',
        styles['cover_bottom']
    ))

    story.append(PageBreak())

    # ── PAGE 2: INTRO ────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph('BEFORE YOU BEGIN', styles['section_tag']))
    story.append(Paragraph('A Note From Joe', styles['h1']))
    story.append(divider(CONTENT_W))

    story.append(Paragraph(
        'This is not theory. I applied every word of this between 2018 and 2025 '
        'and went from $0 to $750,000 in net worth — on a normal income, without '
        'shortcuts, without luck, and without a financial background.',
        styles['intro_quote']
    ))
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph(
        'The system works because it is simple enough to actually do. Five steps. '
        'In order. No detours. I have shared this with 27+ soldiers in my unit and '
        'watched it change their financial trajectory within months.',
        styles['body']
    ))
    story.append(Paragraph(
        'You do not need to be a financial expert. You do not need a high salary. '
        'You need discipline, a system, and someone willing to show you the path. '
        'That is what this guide is for.',
        styles['body']
    ))
    story.append(Paragraph(
        'I paid off my home in 2 years and 9 months. I saved 60% of my income. '
        'I invested every spare dollar into the S&P 500 and never sold during a '
        'downturn. The results speak for themselves.',
        styles['body']
    ))
    story.append(Spacer(1, 0.1 * inch))

    # Key stats row
    stats_data = [
        [
            Paragraph('<b>$750K</b>\nNet Worth Built', styles['callout_text']),
            Paragraph('<b>2Y 9M</b>\nHouse Paid Off', styles['callout_text']),
            Paragraph('<b>27+</b>\nSoldiers Helped', styles['callout_text']),
            Paragraph('<b>60%</b>\nSavings Rate', styles['callout_text']),
        ]
    ]
    stats_table = Table(stats_data, colWidths=[CONTENT_W/4]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ARMY),
        ('TEXTCOLOR',  (0,0), (-1,-1), WHITE),
        ('ALIGN',      (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING',    (0,0), (-1,-1), 14),
        ('BOTTOMPADDING', (0,0), (-1,-1), 14),
        ('FONTNAME',   (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE',   (0,0), (-1,-1), 10),
        ('LINEAFTER',  (0,0), (2,-1), 0.5, colors.HexColor('#3D6228')),
    ]))
    story.append(stats_table)
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        'Read this guide once to understand the full system. Then go back to Step 1 '
        'and start. The only wrong move is waiting.',
        styles['body']
    ))
    story.append(Paragraph(
        '— Joe Do, US Army',
        ParagraphStyle('sig', fontName='Helvetica-BoldOblique', fontSize=11,
                        textColor=ARMY, alignment=TA_LEFT, spaceBefore=4)
    ))

    story.append(PageBreak())

    # ── STEPS ────────────────────────────────────────────────────────────────
    steps = [
        {
            'num': '01', 'tag': 'STEP ONE',
            'title': 'Become Debt Free',
            'body': [
                'Before you do anything else, eliminate your debt. Debt is a guaranteed '
                'negative return. If you are paying 20% interest on a credit card, that is '
                'the same as losing 20% on every dollar you hold — no investment in the '
                'world reliably beats that.',
                'List every debt you have — credit cards, car loans, personal loans, student '
                'loans. Order them from highest interest rate to lowest. Attack the highest '
                'rate first while making minimum payments on the rest. Every dollar you free '
                'up goes to the next debt on the list. This is called the avalanche method, '
                'and it is the mathematically optimal approach.',
                'The one exception: if your employer offers a retirement account match, always '
                'contribute enough to capture it — even while paying off debt. A 100% match is '
                'a guaranteed return that beats almost any interest rate. Outside of that, '
                'eliminate the debt first. Everything else waits.',
            ],
            'callout': 'No debt, no drag. Every dollar you earn works for you — not for your lender.',
        },
        {
            'num': '02', 'tag': 'STEP TWO',
            'title': 'Save Aggressively — At Least 50% of Your Income',
            'body': [
                'Once you are debt free, the mission shifts to saving as much as possible. '
                'I saved roughly 60% of my income. I lived well below my means and refused '
                'to let my lifestyle grow with my income. Every raise, every bonus, every '
                'extra dollar went into the system — not a bigger apartment or a newer car.',
                'Most people budget their spending. I budgeted my saving. The moment my '
                'paycheck landed, I moved my savings target out first. Whatever was left '
                'was my spending allowance. I did not need willpower — the system made '
                'the decision automatically.',
                'The military gives you a massive advantage: BAH covers housing, BAS covers '
                'food, and TRICARE covers healthcare. Civilians pay thousands per month for '
                'what you receive as part of service. Use that gap to build wealth faster '
                'than any civilian peer at the same income level.',
            ],
            'callout': 'Target: Save at least 50% of take-home. Automate it before you can spend it.',
        },
        {
            'num': '03', 'tag': 'STEP THREE',
            'title': 'Max Out Every Tax-Advantaged Account',
            'body': [
                'Tax-advantaged accounts are the single most powerful legal tool available '
                'to build wealth. The government lets your money grow — and in some cases '
                'lets you contribute — without paying taxes. That difference, compounded '
                'over decades, is worth hundreds of thousands of dollars.',
                'Fill them in this order:\n'
                '1. TSP — contribute at least 5% to capture the full BRS employer match.\n'
                '2. Roth IRA — max it every year ($7,000 in 2025). If deployed to a combat zone, '
                'your tax-free pay can go in tax-free — one of the best opportunities in the tax code.\n'
                '3. HSA — triple tax advantage: pre-tax contributions, tax-free growth, tax-free '
                'medical withdrawals.\n'
                '4. 529 — if you have children, start funding it early. Compounding is time-dependent.\n'
                '5. Max TSP — after the above, maximize to the IRS limit ($23,500 in 2025).',
                'Only after all tax-advantaged accounts are maxed should you invest in a '
                'taxable brokerage account.',
            ],
            'callout': 'Order: Employer match → Roth IRA → HSA → 529 → Max TSP → Taxable brokerage.',
        },
        {
            'num': '04', 'tag': 'STEP FOUR',
            'title': 'Invest Everything in S&P 500 Index Funds — and Never Sell',
            'body': [
                'I do not pick stocks. I do not time the market. I do not watch CNBC. '
                'I put every dollar into the C Fund (TSP) or a low-cost S&P 500 index fund '
                '— VFIAX, FXAIX, or VOO — and I wait.',
                'Why the S&P 500? Because over any 20-year period in history, it has never '
                'lost money. The average annual return is approximately 10%. Compounding '
                '10% over 20 to 30 years turns small, consistent contributions into '
                'life-changing wealth. $500/month at 10% annual return for 25 years grows '
                'to $598,000. You do not need to be a genius. You need to be consistent.',
                'The enemy of investing is not a bear market — it is you selling during one. '
                'I lived through multiple downturns between 2018 and 2025 and never sold a '
                'single share. Every dip was a sale. The market always recovered. '
                'Boring on purpose. Relentless by design.',
            ],
            'callout': 'C Fund (TSP) + Roth IRA in VFIAX or VOO. Set it. Forget it. Never sell in panic.',
        },
        {
            'num': '05', 'tag': 'STEP FIVE',
            'title': 'Buy a Home and Pay It Off Quickly',
            'body': [
                'Once your investment accounts are funded and running, buy a home — and '
                'pay it off as fast as possible. This eliminates your largest monthly '
                'expense and positions you for a significant tax-free gain when you sell.',
                'Under IRS Section 121, if you have lived in your home as your primary '
                'residence for at least two of the last five years, you can exclude up to '
                '$250,000 of capital gains from federal taxes when you sell ($500,000 if '
                'married filing jointly). That is a quarter of a million dollars, '
                'completely tax free.',
                'I paid my home off in 2 years and 9 months — paying only $13,500 in total '
                'interest, a fraction of what a 30-year mortgage would have cost. Use your '
                'VA loan benefit: zero down payment, no private mortgage insurance, and '
                'competitive interest rates. It is one of the best mortgage products '
                'available to anyone. Use it wisely.',
            ],
            'callout': 'Buy smart. Pay it off fast. Sell after 5 years. Keep up to $250K tax free.',
        },
    ]

    for i, step in enumerate(steps):
        story.append(step_header(step['num'], step['tag'], step['title'], styles, CONTENT_W))
        story.append(divider(CONTENT_W))
        for para_text in step['body']:
            story.append(Paragraph(para_text, styles['body']))
        story.append(callout_block(step['callout'], styles, CONTENT_W))
        if i < len(steps) - 1:
            story.append(PageBreak())

    story.append(PageBreak())

    # ── QUICK-ACTION CHECKLIST ────────────────────────────────────────────────
    story.append(Spacer(1, 0.1 * inch))
    story.append(Paragraph('YOUR MISSION BRIEF', styles['section_tag']))
    story.append(Paragraph('Quick-Action Checklist', styles['h1']))
    story.append(divider(CONTENT_W))
    story.append(Paragraph(
        'Print this page. Check off each item. This is your minimum viable action plan.',
        styles['body']
    ))
    story.append(Spacer(1, 0.1 * inch))

    checklist = [
        ('STEP 1 — DEBT', [
            'List all debts with interest rates',
            'Order from highest to lowest rate',
            'Set minimum payments on all but the top debt',
            'Direct every extra dollar to the highest-rate debt',
        ]),
        ('STEP 2 — SAVINGS', [
            'Calculate your current savings rate (savings / take-home)',
            'Set a savings target of at least 20% (work toward 50%)',
            'Automate the transfer — savings leave before you can spend them',
            'Cut one lifestyle expense this week',
        ]),
        ('STEP 3 — TAX-ADVANTAGED ACCOUNTS', [
            'Log into MyPay — set TSP to at least 5% (capture the full match)',
            'Open a Roth IRA if you do not have one (Fidelity or Vanguard)',
            'Automate monthly Roth IRA contributions',
            'Check if HSA is available through your plan',
        ]),
        ('STEP 4 — INVESTING', [
            'Select C Fund in TSP (S&P 500 equivalent)',
            'Select VFIAX, FXAIX, or VOO in your Roth IRA',
            'Set contributions to automatic — do not touch them',
            'Commit: I will not sell during a market downturn',
        ]),
        ('STEP 5 — HOME', [
            'Check VA loan eligibility at VA.gov',
            'Get pre-approved when you plan to stay 3+ years',
            'Make extra principal payments every month',
            'Target payoff in under 10 years',
        ]),
    ]

    for section_title, items in checklist:
        # Section header
        header_data = [[Paragraph(section_title, styles['checklist_head'])]]
        header_table = Table(header_data, colWidths=[CONTENT_W])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), ARMY),
            ('TOPPADDING', (0,0), (-1,-1), 7),
            ('BOTTOMPADDING', (0,0), (-1,-1), 7),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
        ]))
        story.append(header_table)
        for item in items:
            row_data = [['  ☐', Paragraph(item, styles['checklist_item'])]]
            row_table = Table(row_data, colWidths=[0.3*inch, CONTENT_W - 0.3*inch])
            row_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), CREAM_2),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('LEFTPADDING', (0,0), (0,-1), 10),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('FONTSIZE', (0,0), (0,-1), 13),
                ('TEXTCOLOR', (0,0), (0,-1), ARMY),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#D8D3C8')),
            ]))
            story.append(row_table)
        story.append(Spacer(1, 0.12 * inch))

    story.append(PageBreak())

    # ── FINAL PAGE: CTA ───────────────────────────────────────────────────────
    # Full army green background via a large table
    cta_content = [
        [Paragraph('Want Joe to Build<br/>Your Personal Plan?', styles['cta_head'])],
        [Spacer(1, 0.05*inch)],
        [Paragraph(
            'This guide gives you the system. A free 30-minute session with Joe<br/>'
            'gives you a plan built around your specific rank, pay, and goals.<br/><br/>'
            'No pitch. No upsell. Just clarity.',
            styles['cta_body']
        )],
        [Spacer(1, 0.15*inch)],
        [Paragraph('soldiertomillionaire.com/book', styles['cta_url'])],
        [Spacer(1, 0.05*inch)],
        [Paragraph('Free · 30 minutes · Built around your military situation', styles['cta_body'])],
        [Spacer(1, 0.3*inch)],
        [HRFlowable(width=CONTENT_W * 0.5, thickness=0.5, color=GOLD, spaceAfter=12)],
        [Paragraph(
            'Soldier to Millionaire  ·  soldiertomillionaire.com<br/>'
            'Joe Do, US Army',
            ParagraphStyle('cta_foot', fontName='Helvetica', fontSize=8,
                           textColor=colors.HexColor('#888870'),
                           leading=13, alignment=TA_CENTER)
        )],
    ]

    cta_table = Table([[row[0]] for row in cta_content], colWidths=[CONTENT_W])
    cta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), ARMY),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (0,0), 48),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 36),
        ('TOPPADDING', (0,1), (-1,-2), 4),
        ('BOTTOMPADDING', (0,1), (-1,-2), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 24),
        ('RIGHTPADDING', (0,0), (-1,-1), 24),
    ]))

    story.append(Spacer(1, 0.3 * inch))
    story.append(cta_table)
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        'This guide is for educational purposes only. Joe Do is not a licensed financial advisor. '
        'Please consult a licensed professional for personalized financial advice.',
        styles['footer_note']
    ))

    # ── Build with page templates ─────────────────────────────────────────────
    doc.build(
        story,
        onFirstPage=cover_background,
        onLaterPages=interior_page,
    )
    print(f'✅  PDF saved to: {OUTPUT}')

if __name__ == '__main__':
    build()
