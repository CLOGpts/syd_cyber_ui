# Backend Implementation: Risk Assessment Report PDF via Telegram

## Overview
Endpoint per generare report PDF di risk assessment e inviarli via Telegram.

## Frontend Implementation Status
✅ **Completed** - Frontend UI e chiamata API pronta in `RiskReport.tsx`

## Backend Endpoint Required

### Endpoint: `POST /api/send-risk-report-pdf`

**Request Body:**
```json
{
  "riskData": {
    "eventCode": "107",
    "category": "Damage_Danni",
    "inherentRisk": "High",
    "control": "Partially Adequate",
    "economicImpact": "Medio - Impatto moderato gestibile",
    "nonEconomicImpact": "Elevato - Impatto significativo da gestire",
    "explanation": "Il rischio è in questa posizione perché...",
    "requiredAction": "Implementare controlli aggiuntivi...",
    "matrixPosition": "C2",
    "riskScore": 75
  },
  "telegramChatId": "5123398987"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report inviato con successo",
  "filename": "RiskReport_107_20251018_112500.pdf"
}
```

## Implementation

### 1. Genera PDF Risk Report

```python
from weasyprint import HTML
from io import BytesIO
from datetime import datetime

def generate_risk_report_pdf(risk_data: dict) -> BytesIO:
    """Genera PDF dal risk assessment data"""

    # Map risk levels to colors
    risk_colors = {
        'Critical': '#EF4444',
        'High': '#F97316',
        'Medium': '#F59E0B',
        'Low': '#10B981'
    }

    risk_color = risk_colors.get(risk_data.get('inherentRisk', 'Medium'), '#F59E0B')

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                margin: 40px;
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: #fff;
            }}
            .container {{
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                padding: 40px;
                border: 2px solid rgba(255, 255, 255, 0.1);
            }}
            h1 {{
                color: #60A5FA;
                border-bottom: 3px solid #60A5FA;
                padding-bottom: 15px;
                font-size: 32px;
            }}
            h2 {{
                color: #93C5FD;
                margin-top: 30px;
                font-size: 24px;
            }}
            .info-card {{
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin: 15px 0;
            }}
            .info-card h3 {{
                color: #BFDBFE;
                margin-top: 0;
                font-size: 14px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }}
            .info-card p {{
                margin: 10px 0 0 0;
                font-size: 18px;
                font-weight: bold;
            }}
            .matrix-badge {{
                display: inline-block;
                background: {risk_color};
                color: white;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: bold;
                font-size: 24px;
                margin: 20px 0;
            }}
            .score {{
                font-size: 48px;
                font-weight: bold;
                color: #60A5FA;
                text-align: center;
                margin: 30px 0;
            }}
            .explanation {{
                background: rgba(96, 165, 250, 0.1);
                border-left: 4px solid #60A5FA;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }}
            .action {{
                background: rgba(34, 197, 94, 0.1);
                border-left: 4px solid #22C55E;
                padding: 20px;
                margin: 20px 0;
                border-radius: 8px;
            }}
            footer {{
                margin-top: 50px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                text-align: center;
                color: #93C5FD;
                font-size: 12px;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 RISK ASSESSMENT REPORT</h1>

            <div class="info-card">
                <h3>🎯 Evento</h3>
                <p>{risk_data.get('eventCode', 'N/A')} - {risk_data.get('category', 'N/A')}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div class="info-card">
                    <h3>📈 Rischio Inerente</h3>
                    <p>{risk_data.get('inherentRisk', 'N/A')}</p>
                </div>
                <div class="info-card">
                    <h3>🛡️ Livello Controlli</h3>
                    <p>{risk_data.get('control', 'N/A')}</p>
                </div>
            </div>

            <div class="info-card">
                <h3>💰 Impatto Economico</h3>
                <p>{risk_data.get('economicImpact', 'N/A')}</p>
            </div>

            <div class="info-card">
                <h3>📊 Impatto Non Economico</h3>
                <p>{risk_data.get('nonEconomicImpact', 'N/A')}</p>
            </div>

            <div class="explanation">
                <h2>💡 PERCHÉ QUESTO RISULTATO</h2>
                <p>{risk_data.get('explanation', 'N/A').replace('<br/>', ' ').replace('<strong>', '').replace('</strong>', '')}</p>
            </div>

            <div class="action">
                <h2>⚡ AZIONE CONSIGLIATA</h2>
                <p>{risk_data.get('requiredAction', 'N/A')}</p>
            </div>

            <div style="text-align: center; margin-top: 40px;">
                <div class="matrix-badge">Posizione Matrice: {risk_data.get('matrixPosition', 'N/A')}</div>
                <div class="score">Risk Score: {risk_data.get('riskScore', 0)}/100</div>
            </div>

            <footer>
                <p>🤖 Generato da SYD CYBER - {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
                <p>Report di Risk Assessment Professionale</p>
            </footer>
        </div>
    </body>
    </html>
    """

    buffer = BytesIO()
    HTML(string=html_content).write_pdf(buffer)
    buffer.seek(0)
    return buffer
```

### 2. FastAPI Endpoint

```python
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter()

class RiskReportData(BaseModel):
    eventCode: str
    category: str
    inherentRisk: str
    control: str
    economicImpact: str
    nonEconomicImpact: str
    explanation: str
    requiredAction: str
    matrixPosition: str
    riskScore: int

class SendRiskReportRequest(BaseModel):
    riskData: RiskReportData
    telegramChatId: str

@router.post("/api/send-risk-report-pdf")
async def send_risk_report_pdf(request: SendRiskReportRequest):
    """Generate and send Risk Assessment report PDF via Telegram"""
    try:
        # Generate PDF
        pdf_buffer = generate_risk_report_pdf(request.riskData.dict())

        # Generate filename
        event_code = request.riskData.eventCode.replace('/', '_')
        filename = f"RiskReport_{event_code}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

        # Send via Telegram (riusa la funzione esistente)
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
        print(f"Errore send_risk_report_pdf: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### 3. Riusa Telegram Function

La funzione `send_pdf_telegram` è già implementata per il pre-report ATECO, riusala:

```python
# Telegram credentials (già esistenti)
TELEGRAM_BOT_TOKEN = "8487460592:AAEPO3TCVVVVe4s7yHRiQNt-NY0Y5yQB3Xk"

async def send_pdf_telegram(chat_id: str, pdf_buffer: BytesIO, filename: str):
    """Send PDF via Telegram - SHARED FUNCTION"""
    try:
        bot = Bot(token=TELEGRAM_BOT_TOKEN)

        # Determine caption based on filename
        if "RiskReport" in filename:
            caption = "📊 Risk Assessment Report - SYD CYBER\n\nValutazione professionale del rischio completata."
        else:
            caption = "📊 Pre-Report ATECO - SYD CYBER\n\nIl tuo consulente ha generato questo report per te."

        await bot.send_document(
            chat_id=chat_id,
            document=pdf_buffer,
            filename=filename,
            caption=caption
        )

        return True
    except TelegramError as e:
        print(f"Errore Telegram: {e}")
        return False
```

## Testing

```bash
curl -X POST http://localhost:8000/api/send-risk-report-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "riskData": {
      "eventCode": "107",
      "category": "Damage_Danni",
      "inherentRisk": "High",
      "control": "Partially Adequate",
      "economicImpact": "Medio - Impatto moderato gestibile",
      "nonEconomicImpact": "Elevato - Impatto significativo da gestire",
      "explanation": "Test explanation",
      "requiredAction": "Test action",
      "matrixPosition": "C2",
      "riskScore": 75
    },
    "telegramChatId": "5123398987"
  }'
```

## Integration Notes

1. ✅ Riusa il token Telegram esistente
2. ✅ Riusa la funzione `send_pdf_telegram` (aggiorna solo la caption)
3. ✅ Usa WeasyPrint (già installato per pre-report)
4. ✅ Stesso pattern di endpoint del pre-report

**Zero dipendenze aggiuntive necessarie!**
