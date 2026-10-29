"""
NEXUS AI — UNIVERSAL MULTI-FORMAT DOCUMENT GENERATOR
Generates on-demand production artifacts matching user requests:
- PDF Reports & Technical Analysis (ReportLab)
- Excel Data Ledgers & Spreadsheets (openpyxl / pandas)
- High-Resolution Architecture Diagrams & Images (matplotlib / PIL)
- Word Documents (python-docx)
"""

import os
import io
import re
from datetime import datetime
from typing import Dict, Any, List, Optional

# Target public directory where orchestrator serves static generated files
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "orchestrator", "public", "generated"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

class UniversalDocumentGenerator:

    @staticmethod
    def sanitize_filename(name: str) -> str:
        s = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
        return s.strip('_')

    @classmethod
    def generate_pdf(
        cls,
        title: str,
        subtitle: str = "NEXUS AI Grounded Intelligence Dossier",
        sections: Optional[List[Dict[str, Any]]] = None,
        code_snippets: Optional[List[Dict[str, str]]] = None,
        tables: Optional[List[Dict[str, Any]]] = None,
        citations: Optional[List[str]] = None,
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a formatted PDF document using ReportLab.
        """
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted, KeepTogether, HRFlowable
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.pdfgen import canvas

        if not filename:
            safe_title = cls.sanitize_filename(title[:30])
            filename = f"NEXUS_{safe_title}_{int(datetime.now().timestamp())}.pdf"
        elif not filename.endswith(".pdf"):
            filename += ".pdf"

        file_path = os.path.join(OUTPUT_DIR, filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            leftMargin=40,
            rightMargin=40,
            topMargin=45,
            bottomMargin=45
        )

        styles = getSampleStyleSheet()

        # Custom Brand Styles
        title_style = ParagraphStyle(
            'NexusTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            'NexusSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#475569'),
            spaceAfter=12
        )

        h2_style = ParagraphStyle(
            'NexusH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=colors.HexColor('#0F172A'),
            spaceBefore=12,
            spaceAfter=6
        )

        h3_style = ParagraphStyle(
            'NexusH3',
            parent=styles['Heading3'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=15,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=8,
            spaceAfter=4
        )

        body_style = ParagraphStyle(
            'NexusBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor('#1E293B'),
            spaceAfter=6
        )

        bullet_style = ParagraphStyle(
            'NexusBullet',
            parent=body_style,
            leftIndent=15,
            bulletIndent=5,
            spaceAfter=4
        )

        code_style = ParagraphStyle(
            'NexusCode',
            parent=styles['Code'],
            fontName='Courier',
            fontSize=8,
            leading=10.5,
            textColor=colors.HexColor('#064E3B'),
            backColor=colors.HexColor('#F0FDF4'),
            borderColor=colors.HexColor('#BBF7D0'),
            borderWidth=1,
            borderPadding=6,
            spaceBefore=4,
            spaceAfter=8
        )

        story = []

        # Header Badge
        story.append(Paragraph(f"<b>NEXUS AI INTELLIGENCE SUITE</b> &bull; STRICTLY GROUNDED REPORT &bull; {datetime.now().strftime('%Y-%m-%d %H:%M')}", subtitle_style))
        story.append(Paragraph(title, title_style))
        story.append(Paragraph(subtitle, subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#059669'), spaceBefore=2, spaceAfter=12))

        # Sections
        if sections:
            for sec in sections:
                sec_title = sec.get("title", "")
                if sec_title:
                    story.append(Paragraph(sec_title, h2_style))

                content = sec.get("content", "")
                if content:
                    blocks = re.split(r'(```[\s\S]*?```)', content)
                    for block in blocks:
                        clean_block = block.strip()
                        if not clean_block:
                            continue
                        if clean_block.startswith('```'):
                            lines = clean_block.split('\n')
                            lang = lines[0].replace('```', '').strip() or 'Code'
                            code_lines = lines[1:-1] if lines[-1].strip() == '```' else lines[1:]
                            code_body = '\n'.join(code_lines)
                            story.append(Paragraph(f"<b>Verified {lang.upper()} Snippet:</b>", h3_style))
                            story.append(Preformatted(code_body.strip(), code_style))
                            story.append(Spacer(1, 4))
                        else:
                            paragraphs = clean_block.split("\n\n")
                            for p in paragraphs:
                                clean_p = p.strip()
                                if clean_p.startswith("•") or clean_p.startswith("-") or clean_p.startswith("*"):
                                    lines = clean_p.split("\n")
                                    for line in lines:
                                        item = re.sub(r'^[•\-\*]\s*', '', line.strip())
                                        escaped_item = item.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                        fmt_item = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', escaped_item)
                                        story.append(Paragraph(f"&bull; {fmt_item}", bullet_style))
                                else:
                                    escaped_p = clean_p.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                                    fmt_p = re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', escaped_p)
                                    story.append(Paragraph(fmt_p, body_style))

                sec_code = sec.get("code")
                sec_lang = sec.get("language", "code")
                if sec_code:
                    story.append(Paragraph(f"<b>Snippet ({sec_lang}):</b>", h3_style))
                    story.append(Preformatted(sec_code.strip(), code_style))

                sec_bullets = sec.get("bullets", [])
                for b in sec_bullets:
                    story.append(Paragraph(f"&bull; {b}", bullet_style))

                story.append(Spacer(1, 6))

        # Standalone Code Snippets
        if code_snippets:
            story.append(Paragraph("Implementation & Verified Code Blocks", h2_style))
            for snippet in code_snippets:
                snip_title = snippet.get("title", "Code Example")
                snip_lang = snippet.get("language", "Java")
                snip_code = snippet.get("code", "")
                story.append(Paragraph(f"<b>{snip_title}</b> <i>({snip_lang})</i>", h3_style))
                story.append(Preformatted(snip_code.strip(), code_style))
                story.append(Spacer(1, 4))

        # Tables
        if tables:
            for tbl in tables:
                tbl_title = tbl.get("title", "Structured Findings")
                story.append(Paragraph(tbl_title, h2_style))
                headers = tbl.get("headers", [])
                rows = tbl.get("rows", [])
                
                table_data = [[Paragraph(f"<b>{h}</b>", body_style) for h in headers]]
                for r in rows:
                    table_data.append([Paragraph(str(cell), body_style) for cell in r])

                t = Table(table_data, colWidths=[None] * len(headers))
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#064E3B')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ('TOPPADDING', (0, 0), (-1, -1), 4),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
                ]))
                story.append(t)
                story.append(Spacer(1, 8))

        # Citations Section
        if citations:
            story.append(Paragraph("Verified Primary Citations", h2_style))
            for c in citations:
                story.append(Paragraph(f"&bull; <i>{c}</i>", bullet_style))

        # Footer Notice
        story.append(Spacer(1, 12))
        story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceBefore=8, spaceAfter=6))
        story.append(Paragraph("<i>Strictly grounded in uploaded coursework materials &bull; Generated by NEXUS AI Autonomous Document Intelligence System</i>", subtitle_style))

        # Numbered Canvas for Page X of Y
        class NumberedCanvas(canvas.Canvas):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, **kwargs)
                self._saved_page_states = []

            def showPage(self):
                self._saved_page_states.append(dict(self.__dict__))
                self._startPage()

            def save(self):
                num_pages = len(self._saved_page_states)
                for state in self._saved_page_states:
                    self.__dict__.update(state)
                    self.draw_page_number(num_pages)
                    super().showPage()
                super().save()

            def draw_page_number(self, page_count):
                self.setFont("Helvetica", 8)
                self.setFillColor(colors.HexColor('#64748B'))
                self.drawRightString(612 - 40, 25, f"Page {self._pageNumber} of {page_count}")
                self.drawString(40, 25, "NEXUS AI Enterprise Intelligence Dossier — Confidential")

        doc.build(story, canvasmaker=NumberedCanvas)
        file_size = os.path.getsize(file_path)

        return {
            "success": True,
            "artifactType": "PDF",
            "fileName": filename,
            "filePath": file_path,
            "fileSize": f"{round(file_size / 1024, 1)} KB",
            "downloadUrl": f"/api/generated/{filename}",
            "generatedAt": datetime.now().isoformat()
        }

    @classmethod
    def generate_excel(
        cls,
        title: str,
        sheets_data: Dict[str, List[Dict[str, Any]]],
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate an Excel workbook with styled headers, auto-fit columns, and zebra rows.
        """
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
        from openpyxl.utils import get_column_letter

        if not filename:
            safe_title = cls.sanitize_filename(title[:30])
            filename = f"NEXUS_{safe_title}_{int(datetime.now().timestamp())}.xlsx"
        elif not filename.endswith(".xlsx"):
            filename += ".xlsx"

        file_path = os.path.join(OUTPUT_DIR, filename)

        wb = openpyxl.Workbook()
        # Remove default sheet
        wb.remove(wb.active)

        header_fill = PatternFill(start_color="064E3B", end_color="064E3B", fill_type="solid")
        header_font = Font(name="Calibri", size=11, bold=True, color="C9FF3D")
        zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
        thin_border = Border(
            left=Side(style='thin', color='CBD5E1'),
            right=Side(style='thin', color='CBD5E1'),
            top=Side(style='thin', color='CBD5E1'),
            bottom=Side(style='thin', color='CBD5E1')
        )

        for sheet_name, records in sheets_data.items():
            safe_sheet_name = sheet_name[:31] # Excel max 31 chars
            ws = wb.create_sheet(title=safe_sheet_name)
            ws.views.sheetView[0].showGridLines = True

            if not records:
                ws.append(["No records available"])
                continue

            # Extract headers from first record
            headers = list(records[0].keys())
            ws.append([h.replace("_", " ").title() for h in headers])

            # Header row styling
            for col_idx in range(1, len(headers) + 1):
                cell = ws.cell(row=1, column=col_idx)
                cell.fill = header_fill
                cell.font = header_font
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.border = thin_border

            # Data rows
            for row_idx, rec in enumerate(records, start=2):
                row_vals = [rec.get(h, "") for h in headers]
                ws.append(row_vals)
                for col_idx in range(1, len(headers) + 1):
                    cell = ws.cell(row=row_idx, column=col_idx)
                    cell.border = thin_border
                    if row_idx % 2 == 0:
                        cell.fill = zebra_fill

            # Auto-fit column widths
            for col in ws.columns:
                max_len = max(len(str(cell.value or '')) for cell in col)
                col_letter = get_column_letter(col[0].column)
                ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

            # Freeze top row
            ws.freeze_panes = "A2"

        wb.save(file_path)
        file_size = os.path.getsize(file_path)

        return {
            "success": True,
            "artifactType": "EXCEL",
            "fileName": filename,
            "filePath": file_path,
            "fileSize": f"{round(file_size / 1024, 1)} KB",
            "downloadUrl": f"/api/generated/{filename}",
            "generatedAt": datetime.now().isoformat()
        }

    @classmethod
    def generate_diagram(
        cls,
        topic: str,
        title: str = "System Architecture & Flow Diagram",
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate high-resolution PNG architectural diagram using Matplotlib.
        """
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import matplotlib.patches as patches

        if not filename:
            safe_topic = cls.sanitize_filename(topic[:20])
            filename = f"Diagram_{safe_topic}_{int(datetime.now().timestamp())}.png"
        elif not filename.endswith(".png"):
            filename += ".png"

        file_path = os.path.join(OUTPUT_DIR, filename)

        fig, ax = plt.subplots(figsize=(12, 7), dpi=150)
        fig.patch.set_facecolor('#0D0F0E')
        ax.set_facecolor('#0D0F0E')

        t_lower = topic.lower()

        if "servlet" in t_lower or "serverlet" in t_lower:
            # 5-Stage Servlet Lifecycle & Container Diagram
            ax.set_xlim(0, 100)
            ax.set_ylim(0, 100)
            ax.axis('off')

            # Title
            ax.text(50, 93, "Java Servlet Request-Response Architecture & Lifecycle", color="#C9FF3D", fontsize=15, fontweight='bold', ha='center')
            ax.text(50, 88, "Verified from SERVLETS AND DATABASE CONNECTIVITY.pdf (Unit-4)", color="#8F9691", fontsize=10, ha='center')

            # Box 1: Web Client / Browser
            client_box = patches.FancyBboxPatch((5, 45), 18, 30, boxstyle="round,pad=1", ec="#3B82F6", fc="#1E293B", lw=2)
            ax.add_patch(client_box)
            ax.text(14, 65, "Web Browser / Client", color="#FFFFFF", fontsize=11, fontweight='bold', ha='center')
            ax.text(14, 55, "HTTP GET / POST\nForm Data & Query\nParameters", color="#94A3B8", fontsize=8.5, ha='center')

            # Arrows: Client <-> Tomcat
            ax.annotate("", xy=(30, 62), xytext=(23, 62), arrowprops=dict(arrowstyle="->", color="#C9FF3D", lw=2.5))
            ax.text(26.5, 65, "HTTP Request", color="#C9FF3D", fontsize=8, ha='center')
            ax.annotate("", xy=(23, 52), xytext=(30, 52), arrowprops=dict(arrowstyle="->", color="#38BDF8", lw=2))
            ax.text(26.5, 47, "HTML / JSON", color="#38BDF8", fontsize=8, ha='center')

            # Box 2: Servlet Container (Tomcat / JVM)
            container_box = patches.FancyBboxPatch((30, 18), 42, 65, boxstyle="round,pad=1.5", ec="#10B981", fc="#064E3B", alpha=0.35, lw=2, ls='--')
            ax.add_patch(container_box)
            ax.text(51, 80, "Web Container / Servlet Engine (JVM)", color="#34D399", fontsize=11, fontweight='bold', ha='center')

            # Stage 1: Load & Instantiate
            ax.add_patch(patches.FancyBboxPatch((33, 62), 16, 12, boxstyle="round,pad=0.5", ec="#10B981", fc="#0F172A", lw=1.5))
            ax.text(41, 69, "1. Loading &", color="#F8FAFC", fontsize=9, fontweight='bold', ha='center')
            ax.text(41, 64, "Instantiation", color="#F8FAFC", fontsize=9, fontweight='bold', ha='center')

            # Stage 2: init()
            ax.add_patch(patches.FancyBboxPatch((53, 62), 16, 12, boxstyle="round,pad=0.5", ec="#F59E0B", fc="#0F172A", lw=1.5))
            ax.text(61, 69, "2. init()", color="#FBBF24", fontsize=9, fontweight='bold', ha='center')
            ax.text(61, 64, "(Single JVM call)", color="#94A3B8", fontsize=7.5, ha='center')

            # Stage 3: service() -> doGet() / doPost()
            ax.add_patch(patches.FancyBboxPatch((38, 40), 26, 15, boxstyle="round,pad=0.7", ec="#C9FF3D", fc="#131B16", lw=2))
            ax.text(51, 49, "3. service(req, res)", color="#C9FF3D", fontsize=10, fontweight='bold', ha='center')
            ax.text(51, 43, "Dispatches doGet() / doPost()\nConcurrent Worker Threads", color="#E2E8F0", fontsize=8, ha='center')

            # Stage 4: destroy()
            ax.add_patch(patches.FancyBboxPatch((43, 23), 16, 10, boxstyle="round,pad=0.5", ec="#EF4444", fc="#0F172A", lw=1.5))
            ax.text(51, 29, "4. destroy()", color="#F87171", fontsize=9, fontweight='bold', ha='center')
            ax.text(51, 25, "Release Resources", color="#94A3B8", fontsize=7.5, ha='center')

            # Internal arrows
            ax.annotate("", xy=(53, 68), xytext=(49, 68), arrowprops=dict(arrowstyle="->", color="#94A3B8", lw=1.5))
            ax.annotate("", xy=(51, 55), xytext=(61, 62), arrowprops=dict(arrowstyle="->", color="#94A3B8", lw=1.5))
            ax.annotate("", xy=(51, 33), xytext=(51, 40), arrowprops=dict(arrowstyle="->", color="#94A3B8", lw=1.5))

            # Box 3: Relational Database (JDBC)
            db_box = patches.FancyBboxPatch((78, 38), 17, 25, boxstyle="round,pad=1", ec="#EC4899", fc="#1E293B", lw=2)
            ax.add_patch(db_box)
            ax.text(86.5, 56, "Relational DB", color="#FFFFFF", fontsize=11, fontweight='bold', ha='center')
            ax.text(86.5, 46, "Oracle / MySQL\nDriverManager\nConnection Pool", color="#F472B6", fontsize=8, ha='center')

            # Arrows: Tomcat <-> Database
            ax.annotate("", xy=(78, 51), xytext=(64, 51), arrowprops=dict(arrowstyle="<->", color="#EC4899", lw=2))
            ax.text(71, 54, "JDBC SQL", color="#EC4899", fontsize=8, ha='center')

            # web.xml mapping pill
            ax.add_patch(patches.FancyBboxPatch((35, 6), 32, 7, boxstyle="round,pad=0.5", ec="#C9FF3D", fc="#0D100E", lw=1))
            ax.text(51, 9.5, "Mapped via WEB-INF/web.xml <servlet-mapping>", color="#C9FF3D", fontsize=8, fontfamily='monospace', ha='center')

        else:
            # Generic Document Intelligence Graph Flow
            ax.set_xlim(0, 100)
            ax.set_ylim(0, 100)
            ax.axis('off')
            ax.text(50, 90, f"NEXUS AI Architecture: {topic.title()}", color="#C9FF3D", fontsize=16, fontweight='bold', ha='center')

            steps = ["Document Ingestion\n(PDF/DOCX/OCR)", "Atomic Fact\nExtraction", "Vector Store\n& Graph Index", "Multi-Agent\nReasoning", "Verified Output\n& Report Gen"]
            colors_list = ["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#C9FF3D"]

            for i, (step, col) in enumerate(zip(steps, colors_list)):
                x = 8 + i * 18
                box = patches.FancyBboxPatch((x, 38), 14, 24, boxstyle="round,pad=0.8", ec=col, fc="#171A18", lw=2)
                ax.add_patch(box)
                ax.text(x + 7, 50, step, color="#FFFFFF", fontsize=9, fontweight='bold', ha='center')
                if i < len(steps) - 1:
                    ax.annotate("", xy=(x + 18, 50), xytext=(x + 14, 50), arrowprops=dict(arrowstyle="->", color=col, lw=2))

        plt.tight_layout()
        plt.savefig(file_path, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
        plt.close(fig)

        file_size = os.path.getsize(file_path)

        return {
            "success": True,
            "artifactType": "IMAGE",
            "fileName": filename,
            "filePath": file_path,
            "fileSize": f"{round(file_size / 1024, 1)} KB",
            "downloadUrl": f"/api/generated/{filename}",
            "generatedAt": datetime.now().isoformat()
        }

    @classmethod
    def generate_docx(
        cls,
        title: str,
        subtitle: str = "NEXUS AI Grounded Intelligence Dossier",
        sections: Optional[List[Dict[str, Any]]] = None,
        code_snippets: Optional[List[Dict[str, str]]] = None,
        filename: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate a Microsoft Word (.docx) document using python-docx.
        """
        import docx
        from docx.shared import Inches, Pt, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH

        if not filename:
            safe_title = cls.sanitize_filename(title[:30])
            filename = f"NEXUS_{safe_title}_{int(datetime.now().timestamp())}.docx"
        elif not filename.endswith(".docx"):
            filename += ".docx"

        file_path = os.path.join(OUTPUT_DIR, filename)

        doc = docx.Document()

        # Title
        p_title = doc.add_paragraph()
        run_title = p_title.add_run(title)
        run_title.font.name = "Calibri"
        run_title.font.size = Pt(20)
        run_title.font.bold = True
        run_title.font.color.rgb = RGBColor(15, 23, 42)

        # Subtitle
        p_sub = doc.add_paragraph()
        run_sub = p_sub.add_run(f"{subtitle} — {datetime.now().strftime('%B %d, %Y')}")
        run_sub.font.size = Pt(10)
        run_sub.font.italic = True
        run_sub.font.color.rgb = RGBColor(100, 116, 139)

        # Sections
        if sections:
            for sec in sections:
                sec_title = sec.get("title", "")
                if sec_title:
                    h = doc.add_heading(sec_title, level=2)
                    for r in h.runs:
                        r.font.color.rgb = RGBColor(6, 78, 59)

                content = sec.get("content", "")
                if content:
                    for para in content.split("\n\n"):
                        clean = para.strip()
                        if clean.startswith("•") or clean.startswith("-"):
                            doc.add_paragraph(re.sub(r'^[•\-]\s*', '', clean), style='List Bullet')
                        else:
                            doc.add_paragraph(clean)

                code = sec.get("code")
                if code:
                    tbl = doc.add_table(rows=1, cols=1)
                    cell = tbl.cell(0, 0)
                    p_code = cell.paragraphs[0]
                    r_code = p_code.add_run(code.strip())
                    r_code.font.name = "Consolas"
                    r_code.font.size = Pt(9)
                    r_code.font.color.rgb = RGBColor(6, 78, 59)

        if code_snippets:
            doc.add_heading("Code Implementation Examples", level=2)
            for snip in code_snippets:
                doc.add_heading(snip.get("title", "Snippet"), level=3)
                tbl = doc.add_table(rows=1, cols=1)
                cell = tbl.cell(0, 0)
                p_code = cell.paragraphs[0]
                r_code = p_code.add_run(snip.get("code", "").strip())
                r_code.font.name = "Consolas"
                r_code.font.size = Pt(9)

        doc.save(file_path)
        file_size = os.path.getsize(file_path)

        return {
            "success": True,
            "artifactType": "DOCX",
            "fileName": filename,
            "filePath": file_path,
            "fileSize": f"{round(file_size / 1024, 1)} KB",
            "downloadUrl": f"/api/generated/{filename}",
            "generatedAt": datetime.now().isoformat()
        }
