import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

const GuidedTour: React.FC = () => {
  const [run, setRun] = useState(false);

  // Controlla se è la prima visita
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Aspetta che la pagina sia caricata
      setTimeout(() => {
        setRun(true);
      }, 1000);
    }

    // Esponi la funzione per riavviare il tour
    (window as any).startGuidedTour = () => {
      localStorage.removeItem('hasSeenTour');
      setRun(true);
    };

    return () => {
      delete (window as any).startGuidedTour;
    };
  }, []);

  const steps: Step[] = [
    {
      target: 'body',
      content: '👋 Benvenuto in SYD Cyber! In meno di 1 minuto ti mostriamo come funziona la piattaforma.',
      placement: 'center',
      disableBeacon: true
    },
    {
      target: '#upload-center',
      content: '📁 Centro Caricamento - Qui puoi caricare una visura camerale. Il sistema estrarrà automaticamente il codice ATECO per iniziare l\'analisi.',
      placement: 'bottom',
      spotlightClicks: true,
      disableScrolling: false,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: '#analyze-ateco-btn',
      content: '🔍 Analizza ATECO - Dopo aver inserito il codice ATECO, premi questo pulsante per ottenere un PRE-REPORT immediato con rischi tipici del settore, normative applicabili e suggerimenti. Utile per prepararsi prima del Risk Management completo.',
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: false,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: '#risk-management-btn',
      content: (
        <div>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 'bold' }}>
            🛡️ Che cos'è il Risk Management in azienda
          </h3>
          <p style={{ marginBottom: '10px', fontSize: '13px', opacity: 0.9 }}>
            <strong>Caratteristiche e vantaggi dell'analisi di gestione dei rischi</strong>
          </p>
          <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
            Il <em>Risk Management</em> (o gestione dei rischi) è il processo attraverso il quale un'azienda
            identifica, valuta e controlla i rischi che possono influire sul raggiungimento dei propri obiettivi.
          </p>
          <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
            Sebbene non sia possibile eliminare completamente i rischi, la loro analisi e gestione consente
            di adottare strategie e comportamenti adeguati per ridurne l'impatto o, in alcuni casi, creare del
            valore economico e trasformarli in opportunità di miglioramento.
          </p>
          <p style={{ marginBottom: '10px', fontSize: '13px', lineHeight: '1.6' }}>
            <strong>SYD</strong> è uno strumento progettato per supportare l'imprenditore nell'analisi autonoma
            dei rischi della propria organizzazione, guidandolo in un percorso strutturato e intuitivo.
            Il risultato del processo di valutazione è un <em>Report di Analisi dei Rischi</em>, che evidenzia
            le principali aree di vulnerabilità e propone azioni di controllo, prevenzione o mitigazione.
          </p>
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: 'rgba(102, 126, 234, 0.15)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.3)'
          }}>
            <p style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              Il Rischio si valuta e si può:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
              <div style={{ padding: '6px', backgroundColor: 'rgba(255, 200, 100, 0.3)', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Evitare</strong>
              </div>
              <div style={{ padding: '6px', backgroundColor: 'rgba(100, 200, 100, 0.3)', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Ridurre</strong>
              </div>
              <div style={{ padding: '6px', backgroundColor: 'rgba(255, 200, 100, 0.3)', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Trasferire</strong>
              </div>
              <div style={{ padding: '6px', backgroundColor: 'rgba(100, 200, 100, 0.3)', borderRadius: '4px', textAlign: 'center' }}>
                <strong>Accettare</strong>
              </div>
            </div>
          </div>
        </div>
      ),
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: false,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: '#video-presentation-btn',
      content: '🎥 Video Presentazione - Vuoi una panoramica completa? Guarda il video introduttivo con il nostro avatar digitale.',
      placement: 'left',
      spotlightClicks: true,
      disableScrolling: false,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: 'body',
      content: '🎉 Sei pronto! Ora sai come usare SYD Cyber. Inizia caricando una visura o premi "Analizza ATECO". PS: Cerca il bottone "Syd AI" in basso a destra per il tuo assistente personale!',
      placement: 'center',
      disableBeacon: true
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === 'close') {
      // Tour completato, skippato o chiuso
      localStorage.setItem('hasSeenTour', 'true');
      setRun(false);
    }
  };

  // Funzione pubblica per riavviare il tour
  const startTour = () => {
    setRun(true);
  };

  // Esponi la funzione startTour globalmente
  useEffect(() => {
    (window as any).startGuidedTour = startTour;
  }, []);

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      disableOverlayClose
      disableCloseOnEsc={false}
      spotlightClicks
      spotlightPadding={12}
      floaterProps={{
        disableAnimation: false,
        hideArrow: false
      }}
      styles={{
        options: {
          primaryColor: '#667eea',
          textColor: '#fff',
          backgroundColor: '#1f2937',
          arrowColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.7)',
          spotlightShadow: '0 0 0 4px rgba(102, 126, 234, 0.4), 0 0 15px 8px rgba(102, 126, 234, 0.3), 0 0 30px 15px rgba(102, 126, 234, 0.2)',
          beaconSize: 36,
          zIndex: 10000,
        },
        spotlight: {
          borderRadius: 8,
        },
        tooltip: {
          borderRadius: 12,
          padding: 20,
          fontSize: 14,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipContent: {
          padding: '8px 0',
        },
        buttonNext: {
          backgroundColor: '#667eea',
          borderRadius: 8,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#9ca3af',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#9ca3af',
        },
        buttonClose: {
          width: 14,
          height: 14,
          padding: 14,
        },
      }}
      locale={{
        back: 'Indietro',
        close: 'Chiudi',
        last: 'Fine',
        next: 'Avanti',
        skip: 'Salta tour',
      }}
    />
  );
};

export default GuidedTour;