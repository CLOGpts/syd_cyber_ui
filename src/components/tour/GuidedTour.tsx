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
      content: '🔍 Analizza ATECO - Dopo aver inserito il codice ATECO, premi questo pulsante per analizzare il settore e le normative applicabili.',
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
      content: '🛡️ Risk Management - Premi questo pulsante per l\'analisi dei rischi. Ti guideremo passo passo attraverso 191 scenari fino al report finale.',
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
      target: '#syd-agent-btn',
      content: '🧠 SYD Agent - Hai dubbi o domande? SYD Agent è il tuo consulente digitale. Ti guida, ti spiega e ti aiuta a generare report anche senza documenti.',
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
      content: '🎉 Sei pronto! Ora sai come usare SYD Cyber. Inizia caricando una visura o premi il pulsante "Analizza ATECO" per iniziare.',
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