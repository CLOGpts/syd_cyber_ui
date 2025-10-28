# Backend Implementation: Pre-Report PDF via Telegram

## Overview
This document describes the backend endpoint needed to generate ATECO pre-report PDFs and send them via Telegram.

## Frontend Implementation Status
✅ **Completed** - Frontend UI and API call ready in `ATECOResponseCard.tsx`

## Backend Endpoint Required

### Endpoint: `POST /api/send-prereport-pdf`

**Request Body:**
```json
{
  "atecoData": {
    "lookup": {
      "codice2022": "62.01.00",
      "titolo2022": "Produzione di software non connesso all'edizione",
      "codice2025": "62.01.00",
      "titolo2025": "Produzione di software non connesso all'edizione"
    },
    "arricchimento": "Descrizione consulenziale del settore...",
    "normative": ["GDPR", "ISO 27001", ...],
    "certificazioni": ["ISO 9001", "ISO 27001", ...],
    "rischi": {
      "operativi": ["Interruzione servizi", ...],
      "compliance": ["Non conformità GDPR", ...],
      "cyber": ["Ransomware", ...],
      "reputazionali": ["Perdita fiducia clienti", ...]
    }
  },
  "telegramChatId": "5123398987"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report inviato con successo"
}
```

## Implementation Steps

### 1. Install Dependencies
```bash
pip install python-telegram-bot
pip install reportlab  # For PDF generation
# OR
pip install weasyprint  # Alternative for HTML to PDF
```

### 2. Create PDF Generator Function

**Option A: Using ReportLab (Pure Python)**
```python
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from io import BytesIO

def generate_ateco_pdf(ateco_data: dict) -> BytesIO:
    """Generate PDF from ATECO data"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title = Paragraph("📊 PRE-REPORT ANALISI ATECO", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 12))

    # Lookup Section
    story.append(Paragraph("🔎 Lookup diretto", styles['Heading2']))
    lookup_text = f"""
    Codice ATECO 2022: {ateco_data['lookup']['codice2022']}<br/>
    Titolo 2022: {ateco_data['lookup']['titolo2022']}<br/>
    Codice ATECO 2025: {ateco_data['lookup']['codice2025']}<br/>
    Titolo 2025: {ateco_data['lookup']['titolo2025']}
    """
    story.append(Paragraph(lookup_text, styles['Normal']))
    story.append(Spacer(1, 12))

    # Arricchimento
    story.append(Paragraph("📌 Arricchimento consulenziale", styles['Heading2']))
    story.append(Paragraph(ateco_data['arricchimento'], styles['Normal']))
    story.append(Spacer(1, 12))

    # Normative
    story.append(Paragraph("📜 Normative UE e nazionali rilevanti", styles['Heading2']))
    for norm in ateco_data['normative']:
        story.append(Paragraph(f"• {norm}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Certificazioni
    story.append(Paragraph("📑 Certificazioni ISO / schemi tipici", styles['Heading2']))
    for cert in ateco_data['certificazioni']:
        story.append(Paragraph(f"• {cert}", styles['Normal']))
    story.append(Spacer(1, 12))

    # Rischi
    story.append(Paragraph("⚠️ Rischi principali da gestire", styles['Heading2']))

    story.append(Paragraph("<b>Operativi:</b>", styles['Heading3']))
    for risk in ateco_data['rischi']['operativi']:
        story.append(Paragraph(f"› {risk}", styles['Normal']))

    story.append(Paragraph("<b>Compliance:</b>", styles['Heading3']))
    for risk in ateco_data['rischi']['compliance']:
        story.append(Paragraph(f"› {risk}", styles['Normal']))

    story.append(Paragraph("<b>Cyber / OT:</b>", styles['Heading3']))
    for risk in ateco_data['rischi']['cyber']:
        story.append(Paragraph(f"› {risk}", styles['Normal']))

    story.append(Paragraph("<b>Reputazionali:</b>", styles['Heading3']))
    for risk in ateco_data['rischi']['reputazionali']:
        story.append(Paragraph(f"› {risk}", styles['Normal']))

    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
```

**Option B: Using WeasyPrint (HTML to PDF - Recommended)**
```python
from weasyprint import HTML
from io import BytesIO

def generate_ateco_pdf(ateco_data: dict) -> BytesIO:
    """Generate PDF from ATECO data using HTML template"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            h1 {{ color: #0EA5E9; border-bottom: 2px solid #0EA5E9; padding-bottom: 10px; }}
            h2 {{ color: #0284C7; margin-top: 30px; }}
            h3 {{ color: #0369A1; margin-top: 20px; }}
            .section {{ margin-bottom: 30px; }}
            ul {{ list-style-type: none; padding-left: 0; }}
            li {{ margin: 8px 0; padding-left: 20px; }}
            li:before {{ content: "• "; color: #0EA5E9; font-weight: bold; }}
        </style>
    </head>
    <body>
        <h1>📊 PRE-REPORT ANALISI ATECO</h1>

        <div class="section">
            <h2>🔎 Lookup diretto</h2>
            <p><strong>Codice ATECO 2022:</strong> {ateco_data['lookup']['codice2022']}</p>
            <p><strong>Titolo 2022:</strong> {ateco_data['lookup']['titolo2022']}</p>
            <p><strong>Codice ATECO 2025:</strong> {ateco_data['lookup']['codice2025']}</p>
            <p><strong>Titolo 2025:</strong> {ateco_data['lookup']['titolo2025']}</p>
        </div>

        <div class="section">
            <h2>📌 Arricchimento consulenziale</h2>
            <p>{ateco_data['arricchimento']}</p>
        </div>

        <div class="section">
            <h2>📜 Normative UE e nazionali rilevanti</h2>
            <ul>
                {''.join([f'<li>{norm}</li>' for norm in ateco_data['normative']])}
            </ul>
        </div>

        <div class="section">
            <h2>📑 Certificazioni ISO / schemi tipici del settore</h2>
            <ul>
                {''.join([f'<li>{cert}</li>' for cert in ateco_data['certificazioni']])}
            </ul>
        </div>

        <div class="section">
            <h2>⚠️ Rischi principali da gestire</h2>

            <h3>Operativi</h3>
            <ul>
                {''.join([f'<li>{risk}</li>' for risk in ateco_data['rischi']['operativi']])}
            </ul>

            <h3>Compliance</h3>
            <ul>
                {''.join([f'<li>{risk}</li>' for risk in ateco_data['rischi']['compliance']])}
            </ul>

            <h3>Cyber / OT</h3>
            <ul>
                {''.join([f'<li>{risk}</li>' for risk in ateco_data['rischi']['cyber']])}
            </ul>

            <h3>Reputazionali</h3>
            <ul>
                {''.join([f'<li>{risk}</li>' for risk in ateco_data['rischi']['reputazionali']])}
            </ul>
        </div>

        <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
            <p>Generato da SYD CYBER - {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
        </footer>
    </body>
    </html>
    """

    buffer = BytesIO()
    HTML(string=html_content).write_pdf(buffer)
    buffer.seek(0)
    return buffer
```

### 3. Create Telegram Sender Function

```python
from telegram import Bot
from telegram.error import TelegramError

TELEGRAM_BOT_TOKEN = "8487460592:AAEPO3TCVVVVe4s7yHRiQNt-NY0Y5yQB3Xk"

async def send_pdf_telegram(chat_id: str, pdf_buffer: BytesIO, filename: str):
    """Send PDF via Telegram"""
    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)

        # Send the PDF document
        await bot.send_document(
            chat_id=chat_id,
            document=pdf_buffer,
            filename=filename,
            caption="📊 Pre-Report ATECO - SYD CYBER\n\nIl tuo consulente ha generato questo report per te."
        )

        return True
    except TelegramError as e:
        print(f"Errore Telegram: {e}")
        return False
```

### 4. Create FastAPI Endpoint

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime

router = APIRouter()

class RiskData(BaseModel):
    operativi: List[str]
    compliance: List[str]
    cyber: List[str]
    reputazionali: List[str]

class LookupData(BaseModel):
    codice2022: str
    titolo2022: str
    codice2025: str
    titolo2025: str

class ATECOData(BaseModel):
    lookup: LookupData
    arricchimento: str
    normative: List[str]
    certificazioni: List[str]
    rischi: RiskData

class SendPreReportRequest(BaseModel):
    atecoData: ATECOData
    telegramChatId: str

@router.post("/api/send-prereport-pdf")
async def send_prereport_pdf(request: SendPreReportRequest):
    """Generate and send ATECO pre-report PDF via Telegram"""
    try:
        # Generate PDF
        pdf_buffer = generate_ateco_pdf(request.atecoData.dict())

        # Generate filename
        ateco_code = request.atecoData.lookup.codice2025 or request.atecoData.lookup.codice2022
        filename = f"PreReport_ATECO_{ateco_code}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        # Send via Telegram
        success = await send_pdf_telegram(
            chat_id=request.telegramChatId,
            pdf_buffer=pdf_buffer,
            filename=filename
        )

        if not success:
            raise HTTPException(status_code=500, detail="Errore durante l'invio su Telegram")

        return {
            "success": True,
            "message": "Report inviato con successo",
            "filename": filename
        }

    except Exception as e:
        print(f"Errore send_prereport_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 5. Register the Router in main.py

```python
from fastapi import FastAPI
from .routes.telegram import router as telegram_router

app = FastAPI()

# ... existing routes ...

app.include_router(telegram_router)
```

## Environment Variables

Add to backend `.env`:
```env
TELEGRAM_BOT_TOKEN=8487460592:AAEPO3TCVVVVe4s7yHRiQNt-NY0Y5yQB3Xk
```

## Testing

### Test with curl:
```bash
curl -X POST https://web-production-3373.up.railway.app/api/send-prereport-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "atecoData": {
      "lookup": {
        "codice2022": "62.01.00",
        "titolo2022": "Produzione di software",
        "codice2025": "62.01.00",
        "titolo2025": "Produzione di software"
      },
      "arricchimento": "Test report",
      "normative": ["GDPR", "ISO 27001"],
      "certificazioni": ["ISO 9001"],
      "rischi": {
        "operativi": ["Test risk 1"],
        "compliance": ["Test risk 2"],
        "cyber": ["Test risk 3"],
        "reputazionali": ["Test risk 4"]
      }
    },
    "telegramChatId": "5123398987"
  }'
```

## Cost Analysis
- **Telegram API**: ✅ FREE (unlimited messages)
- **WeasyPrint**: ✅ FREE (open-source)
- **Railway Hosting**: ✅ Existing infrastructure (no extra cost)

**Total Cost: €0**

## Security Considerations
1. ⚠️ **Store Telegram Bot Token in environment variables** (not hardcoded)
2. ✅ Validate `telegramChatId` to prevent unauthorized sending
3. ✅ Add rate limiting to prevent abuse (e.g., max 10 reports per hour)
4. ✅ Sanitize HTML content to prevent XSS in PDFs

## Future Enhancements
- [ ] Store chat IDs in database associated with user accounts
- [ ] Add option to email instead of Telegram
- [ ] Generate more sophisticated PDFs with charts/graphs
- [ ] Add digital signature to PDFs
- [ ] Support multiple recipients (CC consulente + cliente)
