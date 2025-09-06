
import type { SessionMeta } from '../types';

const generateReportHTML = (atecoCode: string) => {
  const reportHTML = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relazione Analisi Rischi Operativi - DEMO AZIENDA SRL</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            position: relative;
        }
        
        /* HEADER STUDIO STYLE */
        .header {
            background: linear-gradient(135deg, #5a9fd4 0%, #306998 100%);
            color: white;
            padding: 30px 40px;
            position: relative;
        }
        
        .header h1 {
            font-size: 24px;
            font-weight: 300;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 14px;
            opacity: 0.9;
        }
        
        .company-info {
            position: absolute;
            right: 40px;
            top: 50%;
            transform: translateY(-50%);
            text-align: right;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            color: #5a9fd4;
            font-size: 18px;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #5a9fd4;
        }
        
        /* RISK MATRIX STYLE */
        .risk-matrix {
            display: grid;
            grid-template-columns: 100px repeat(4, 1fr);
            gap: 2px;
            margin: 30px 0;
            background: #ddd;
            padding: 2px;
        }
        
        .risk-cell {
            padding: 20px;
            text-align: center;
            font-weight: bold;
            color: white;
            position: relative;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .risk-label {
            background: #666;
            color: white;
            font-size: 12px;
            writing-mode: vertical-rl;
            text-orientation: mixed;
        }
        
        .risk-header {
            background: #666;
            color: white;
            font-size: 12px;
        }
        
        .risk-low {
            background: #28a745;
        }
        
        .risk-medium {
            background: #ffc107;
            color: #333;
        }
        
        .risk-high {
            background: #fd7e14;
        }
        
        .risk-critical {
            background: #dc3545;
        }
        
        /* STATS CARDS */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        
        .stat-card.blue {
            background: linear-gradient(135deg, #667eea 0%, #4f46e5 100%);
        }
        
        .stat-card.green {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .stat-card.orange {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
        }
        
        .stat-value {
            font-size: 32px;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-label {
            font-size: 14px;
            opacity: 0.9;
        }
        
        /* CHARTS */
        .chart-container {
            position: relative;
            height: 400px;
            margin: 30px 0;
        }
        
        .chart-small {
            height: 300px;
        }
        
        /* TABLES */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background: #5a9fd4;
            color: white;
        }
        
        tr:hover {
            background: #f5f5f5;
        }
        
        /* FOOTER */
        .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            color: #666;
            font-size: 10px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
        }
        
        @media print {
            .page {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <!-- PAGINA 1: COPERTINA -->
    <div class="page">
        <div class="header">
            <h1>RELAZIONE RELATIVA L'ANALISI DEI RISCHI OPERATIVI</h1>
            <div class="subtitle">Metodologia di valutazione e classificazione secondo Basel III</div>
            <div class="company-info">
                <div style="font-size: 20px; font-weight: bold;">DEMO AZIENDA SRL</div>
                <div style="margin-top: 5px;">P.IVA: 12345678901</div>
                <div>ATECO: <span id="ateco-code-1">${atecoCode || '62.01.00'}</span></div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2 class="section-title">EXECUTIVE SUMMARY</h2>
                <p>La presente relazione illustra l'analisi dei rischi operativi condotta per DEMO AZIENDA SRL, 
                operante nel settore con codice ATECO <span id="ateco-code-2">${atecoCode || '62.01.00'}</span>.</p>
                <br>
                <p>L'analisi è stata condotta secondo la metodologia Basel III e le linee guida EBA, 
                utilizzando un approccio quantitativo e qualitativo per la valutazione dei rischi.</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="stat-label">Rischi Identificati</div>
                    <div class="stat-value">47</div>
                </div>
                <div class="stat-card green">
                    <div class="stat-card-content">
                        <div class="stat-label">Controlli Implementati</div>
                        <div class="stat-value">82%</div>
                    </div>
                </div>
                <div class="stat-card orange">
                    <div class="stat-label">Risk Score Medio</div>
                    <div class="stat-value">3.2</div>
                </div>
            </div>
            
            <div class="section">
                <h2 class="section-title">PRINCIPALI AREE DI RISCHIO</h2>
                <div class="chart-container chart-small">
                    <canvas id="barChart1"></canvas>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Studio Perassi - Risk Management Solutions | Pagina 1 di 5
        </div>
    </div>
    
    <!-- PAGINA 2: METODOLOGIA -->
    <div class="page">
        <div class="content" style="padding-top: 60px;">
            <div class="section">
                <h2 class="section-title">METODOLOGIA DI VALUTAZIONE</h2>
                
                <h3 style="margin: 20px 0 10px 0; color: #666;">Framework di Riferimento</h3>
                <ul style="margin-left: 20px; line-height: 1.8;">
                    <li>Basel III - Operational Risk Framework</li>
                    <li>ISO 31000:2018 - Risk Management Guidelines</li>
                    <li>COSO ERM Framework</li>
                    <li>Normativa specifica settore ATECO <span id="ateco-code-3">${atecoCode || '62.01.00'}</span></li>
                </ul>
                
                <h3 style="margin: 30px 0 10px 0; color: #666;">Categorie di Rischio Analizzate</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Descrizione</th>
                            <th>Peso %</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Frodi Interne</td>
                            <td>Attività non autorizzate, furto e frode da dipendenti</td>
                            <td>15%</td>
                        </tr>
                        <tr>
                            <td>Frodi Esterne</td>
                            <td>Furti, frodi, violazioni sistemi da parte di terzi</td>
                            <td>20%</td>
                        </tr>
                        <tr>
                            <td>Rapporti con Dipendenti</td>
                            <td>Violazioni norme lavoro, sicurezza, discriminazione</td>
                            <td>10%</td>
                        </tr>
                        <tr>
                            <td>Clienti e Prodotti</td>
                            <td>Violazioni fiduciarie, privacy, prodotti difettosi</td>
                            <td>25%</td>
                        </tr>
                        <tr>
                            <td>Danni Materiali</td>
                            <td>Danni a beni fisici per eventi naturali o umani</td>
                            <td>5%</td>
                        </tr>
                        <tr>
                            <td>Interruzioni Business</td>
                            <td>Malfunzionamenti sistemi, interruzioni servizio</td>
                            <td>15%</td>
                        </tr>
                        <tr>
                            <td>Processi Operativi</td>
                            <td>Errori transazioni, gestione processi, vendor</td>
                            <td>10%</td>
                        </tr>
                    </tbody>
                </table>
                
                <h3 style="margin: 30px 0 10px 0; color: #666;">Formula di Calcolo Risk Score</h3>
                <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #5a9fd4; margin: 20px 0;">
                    <code style="font-size: 16px;">
                        Risk Score = (Probabilità × Impatto) × (1 - Efficacia Controlli)
                    </code>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Studio Perassi - Risk Management Solutions | Pagina 2 di 5
        </div>
    </div>
    
    <!-- PAGINA 3: RISK ASSESSMENT MATRIX -->
    <div class="page">
        <div class="content" style="padding-top: 60px;">
            <div class="section">
                <h2 class="section-title">MATRICE DI VALUTAZIONE DEI RISCHI</h2>
                
                <p style="margin-bottom: 20px;">La matrice seguente classifica i rischi identificati in base a probabilità e impatto:</p>
                
                <div class="risk-matrix">
                    <!-- Headers -->
                    <div class="risk-cell risk-header"></div>
                    <div class="risk-cell risk-header">BASSO</div>
                    <div class="risk-cell risk-header">MEDIO</div>
                    <div class="risk-cell risk-header">ALTO</div>
                    <div class="risk-cell risk-header">CRITICO</div>
                    
                    <!-- Row 4 - MOLTO ALTA -->
                    <div class="risk-cell risk-label">MOLTO ALTA</div>
                    <div class="risk-cell risk-medium">3</div>
                    <div class="risk-cell risk-high">2</div>
                    <div class="risk-cell risk-critical">1</div>
                    <div class="risk-cell risk-critical">2</div>
                    
                    <!-- Row 3 - ALTA -->
                    <div class="risk-cell risk-label">ALTA</div>
                    <div class="risk-cell risk-low">5</div>
                    <div class="risk-cell risk-medium">4</div>
                    <div class="risk-cell risk-high">3</div>
                    <div class="risk-cell risk-critical">1</div>
                    
                    <!-- Row 2 - MEDIA -->
                    <div class="risk-cell risk-label">MEDIA</div>
                    <div class="risk-cell risk-low">8</div>
                    <div class="risk-cell risk-medium">6</div>
                    <div class="risk-cell risk-medium">4</div>
                    <div class="risk-cell risk-high">2</div>
                    
                    <!-- Row 1 - BASSA -->
                    <div class="risk-cell risk-label">BASSA</div>
                    <div class="risk-cell risk-low">12</div>
                    <div class="risk-cell risk-low">7</div>
                    <div class="risk-cell risk-medium">3</div>
                    <div class="risk-cell risk-medium">1</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 30px;">
                    <div style="padding: 10px; background: #28a745; color: white; text-align: center; border-radius: 5px;">
                        <strong>BASSO</strong><br>Accettabile
                    </div>
                    <div style="padding: 10px; background: #ffc107; color: #333; text-align: center; border-radius: 5px;">
                        <strong>MEDIO</strong><br>Monitoraggio
                    </div>
                    <div style="padding: 10px; background: #fd7e14; color: white; text-align: center; border-radius: 5px;">
                        <strong>ALTO</strong><br>Mitigazione
                    </div>
                    <div style="padding: 10px; background: #dc3545; color: white; text-align: center; border-radius: 5px;">
                        <strong>CRITICO</strong><br>Azione Immediata
                    </div>
                </div>
                
                <h3 style="margin: 30px 0 10px 0; color: #666;">Distribuzione dei Rischi per Severità</h3>
                <div class="chart-container chart-small">
                    <canvas id="doughnutChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Studio Perassi - Risk Management Solutions | Pagina 3 di 5
        </div>
    </div>
    
    <!-- PAGINA 4: ANALISI DETTAGLIATA -->
    <div class="page">
        <div class="content" style="padding-top: 60px;">
            <div class="section">
                <h2 class="section-title">ANALISI DETTAGLIATA PER CATEGORIA</h2>
                
                <div class="chart-container">
                    <canvas id="radarChart"></canvas>
                </div>
                
                <h3 style="margin: 30px 0 10px 0; color: #666;">Top 5 Rischi Critici Identificati</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descrizione Rischio</th>
                            <th>Categoria</th>
                            <th>Score</th>
                            <th>Stato</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>R-001</td>
                            <td>Violazione dati clienti per attacco cyber</td>
                            <td>Frodi Esterne</td>
                            <td style="color: #dc3545; font-weight: bold;">8.5</td>
                            <td>In mitigazione</td>
                        </tr>
                        <tr>
                            <td>R-002</td>
                            <td>Interruzione servizi cloud critici</td>
                            <td>Interruzioni Business</td>
                            <td style="color: #fd7e14; font-weight: bold;">7.2</td>
                            <td>Monitoraggio</td>
                        </tr>
                        <tr>
                            <td>R-003</td>
                            <td>Non conformità GDPR</td>
                            <td>Clienti e Prodotti</td>
                            <td style="color: #fd7e14; font-weight: bold;">6.8</td>
                            <td>In mitigazione</td>
                        </tr>
                        <tr>
                            <td>R-004</td>
                            <td>Errori nella fatturazione automatica</td>
                            <td>Processi Operativi</td>
                            <td style="color: #ffc107; font-weight: bold;">5.5</td>
                            <td>Controlli attivi</td>
                        </tr>
                        <tr>
                            <td>R-005</td>
                            <td>Accesso non autorizzato ai sistemi</td>
                            <td>Frodi Interne</td>
                            <td style="color: #ffc107; font-weight: bold;">5.2</td>
                            <td>Controlli attivi</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="footer">
            Studio Perassi - Risk Management Solutions | Pagina 4 di 5
        </div>
    </div>
    
    <!-- PAGINA 5: RACCOMANDAZIONI -->
    <div class="page">
        <div class="content" style="padding-top: 60px;">
            <div class="section">
                <h2 class="section-title">PIANO DI MITIGAZIONE E RACCOMANDAZIONI</h2>
                
                <h3 style="margin: 20px 0 10px 0; color: #666;">Azioni Prioritarie</h3>
                <ol style="margin-left: 20px; line-height: 2;">
                    <li><strong>Implementazione SOC 24/7:</strong> Attivare un Security Operations Center per il monitoraggio continuo</li>
                    <li><strong>Disaster Recovery Plan:</strong> Completare e testare il piano di continuità operativa</li>
                    <li><strong>Formazione Cybersecurity:</strong> Programma trimestrale di awareness per tutti i dipendenti</li>
                    <li><strong>Audit GDPR:</strong> Revisione completa delle procedure di trattamento dati</li>
                    <li><strong>Automazione Controlli:</strong> Implementare controlli automatici sui processi critici</li>
                </ol>
                
                <h3 style="margin: 30px 0 10px 0; color: #666;">Timeline Implementazione</h3>
                <div style="background: linear-gradient(to right, #5a9fd4, #306998); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">Q1 2025</div>
                            <div style="margin-top: 10px; font-size: 12px;">SOC + Formazione</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">Q2 2025</div>
                            <div style="margin-top: 10px; font-size: 12px;">DR Plan + Testing</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">Q3 2025</div>
                            <div style="margin-top: 10px; font-size: 12px;">Audit GDPR</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: bold;">Q4 2025</div>
                            <div style="margin-top: 10px; font-size: 12px;">Automazione</div>
                        </div>
                    </div>
                </div>
                
                <h3 style="margin: 30px 0 10px 0; color: #666;">Budget Stimato</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Intervento</th>
                            <th>Investimento</th>
                            <th>ROI Atteso</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Security Operations Center</td>
                            <td>€ 150.000</td>
                            <td>Riduzione rischio cyber 75%</td>
                        </tr>
                        <tr>
                            <td>Disaster Recovery</td>
                            <td>€ 80.000</td>
                            <td>RTO < 4 ore</td>
                        </tr>
                        <tr>
                            <td>Formazione e Awareness</td>
                            <td>€ 30.000</td>
                            <td>-60% incidenti human factor</td>
                        </tr>
                        <tr>
                            <td>Compliance GDPR</td>
                            <td>€ 45.000</td>
                            <td>Eliminazione rischio sanzioni</td>
                        </tr>
                        <tr>
                            <td>Automazione Processi</td>
                            <td>€ 95.000</td>
                            <td>-40% errori operativi</td>
                        </tr>
                    </tbody>
                </table>
                
                <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #28a745; margin: 30px 0;">
                    <strong>CONCLUSIONI:</strong> L'implementazione del piano di mitigazione proposto permetterà di ridurre 
                    il risk score medio da 3.2 a 1.8 entro 12 mesi, portando l'organizzazione a un livello di maturità 
                    "Managed" secondo il modello CMMI.
                </div>
            </div>
        </div>
        
        <div class="footer">
            Studio Perassi - Risk Management Solutions | Pagina 5 di 5 | © 2025
        </div>
    </div>
    
    <script>
        // BAR CHART
        const barCtx = document.getElementById('barChart1').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Frodi Esterne', 'Clienti/Prodotti', 'Interruzioni', 'Frodi Interne', 'Processi', 'Dipendenti', 'Danni'],
                datasets: [{
                    label: 'Numero Rischi',
                    data: [12, 11, 8, 6, 5, 3, 2],
                    backgroundColor: [
                        'rgba(220, 53, 69, 0.8)',
                        'rgba(253, 126, 20, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(23, 162, 184, 0.8)',
                        'rgba(102, 16, 242, 0.8)',
                        'rgba(111, 66, 193, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // DOUGHNUT CHART
        const doughnutCtx = document.getElementById('doughnutChart').getContext('2d');
        new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Basso', 'Medio', 'Alto', 'Critico'],
                datasets: [{
                    data: [32, 27, 17, 6],
                    backgroundColor: [
                        'rgba(40, 167, 69, 0.8)',
                        'rgba(255, 193, 7, 0.8)',
                        'rgba(253, 126, 20, 0.8)',
                        'rgba(220, 53, 69, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
        
        // RADAR CHART
        const radarCtx = document.getElementById('radarChart').getContext('2d');
        new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Frodi Interne', 'Frodi Esterne', 'Dipendenti', 'Clienti/Prodotti', 'Danni', 'Interruzioni', 'Processi'],
                datasets: [{
                    label: 'Rischio Attuale',
                    data: [5.2, 8.5, 3.1, 6.8, 2.5, 7.2, 5.5],
                    borderColor: 'rgba(220, 53, 69, 1)',
                    backgroundColor: 'rgba(220, 53, 69, 0.2)'
                }, {
                    label: 'Rischio Target',
                    data: [2.5, 3.5, 1.5, 3.0, 1.0, 3.0, 2.0],
                    borderColor: 'rgba(40, 167, 69, 1)',
                    backgroundColor: 'rgba(40, 167, 69, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
        
        // Function to update ATECO code
        function updateATECO(atecoCode) {
            document.querySelectorAll('[id^="ateco-code"]').forEach(el => {
                el.textContent = atecoCode;
            });
        }
    </script>
</body>
</html>`;
  return reportHTML;
};

/**
 * Generates a risk assessment report based on the current session state.
 * Creates an HTML mockup with the ATECO code from the session.
 * @param sessionState The current session metadata.
 * @returns A promise that resolves to a success status with download.
 */
export const generateReport = async (sessionState: SessionMeta): Promise<{ success: boolean; url?: string }> => {
  console.log("Generating report with session data:", sessionState);
  
  try {
    // Generate the HTML content with the ATECO code
    const htmlContent = generateReportHTML(sessionState.ateco || '62.01.00');
    
    // Create a Blob with the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-report-${sessionState.ateco || 'demo'}-${Date.now()}.html`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 100);
    
    return { success: true, url: a.download };
  } catch (error) {
    console.error('Error generating report:', error);
    return { success: false };
  }
};
