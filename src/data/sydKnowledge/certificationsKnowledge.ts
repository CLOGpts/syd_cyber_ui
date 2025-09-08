// Database certificazioni estratto da "Elenco certificazioni (IW).xlsx"
// Mappatura completa delle certificazioni per settore e ambito

export const CERTIFICATIONS_DATABASE = {
  // CERTIFICAZIONI GENERALI CROSS-SECTOR
  general: {
    quality: [
      { code: "ISO 9001:2015", name: "Sistemi di Gestione Qualità", scope: "Tutti i settori" },
      { code: "ISO 14001:2015", name: "Sistemi di Gestione Ambientale", scope: "Tutti i settori" },
      { code: "ISO 45001:2018", name: "Salute e Sicurezza sul Lavoro", scope: "Tutti i settori" }
    ],
    security: [
      { code: "ISO/IEC 27001:2022", name: "Information Security Management System", scope: "Tutti i settori", nis2: true },
      { code: "ISO/IEC 27017:2015", name: "Cloud Security", scope: "Cloud providers", nis2: true },
      { code: "ISO/IEC 27018:2019", name: "Privacy in Cloud", scope: "Cloud providers", gdpr: true },
      { code: "ISO/IEC 27701:2019", name: "Privacy Information Management", scope: "Tutti i settori", gdpr: true },
      { code: "ISO 22301:2019", name: "Business Continuity", scope: "Tutti i settori", nis2: true },
      { code: "SOC 2 Type II", name: "Service Organization Control", scope: "Service providers", nis2: true }
    ],
    privacy: [
      { code: "GDPR Compliance", name: "General Data Protection Regulation", scope: "EU operations", mandatory: true },
      { code: "ISO/IEC 29134:2017", name: "Privacy Impact Assessment", scope: "Tutti i settori", gdpr: true },
      { code: "ISO/IEC 29151:2017", name: "PII Protection", scope: "Tutti i settori", gdpr: true }
    ]
  },

  // SETTORE AUTOMOTIVE
  automotive: {
    mandatory: [
      { code: "IATF 16949:2016", name: "Automotive Quality Management", scope: "OEM e Tier 1" },
      { code: "ISO 26262", name: "Functional Safety", scope: "Sistemi E/E", critical: true },
      { code: "ISO/SAE 21434:2021", name: "Cybersecurity Engineering", scope: "Connected vehicles", nis2: true },
      { code: "UNECE R155", name: "Cyber Security Management System", scope: "Type approval EU", mandatory: true },
      { code: "UNECE R156", name: "Software Update Management", scope: "Type approval EU", mandatory: true }
    ],
    recommended: [
      { code: "ASPICE", name: "Automotive SPICE", scope: "Software development" },
      { code: "TISAX", name: "Trusted Information Security Assessment", scope: "Supply chain" },
      { code: "ISO 21448", name: "SOTIF - Safety of the Intended Functionality", scope: "ADAS/AV" }
    ]
  },

  // SETTORE FINANCE & BANKING
  finance: {
    mandatory: [
      { code: "PCI DSS v4.0", name: "Payment Card Industry Data Security", scope: "Card payments", mandatory: true },
      { code: "SWIFT CSP", name: "Customer Security Programme", scope: "SWIFT users", mandatory: true },
      { code: "SOX Compliance", name: "Sarbanes-Oxley Act", scope: "Listed companies" }
    ],
    regulatory: [
      { code: "DORA Compliance", name: "Digital Operational Resilience Act", scope: "EU financial", nis2: true },
      { code: "Basel III", name: "Banking Supervision", scope: "Banks" },
      { code: "MiFID II", name: "Markets in Financial Instruments", scope: "Investment firms" }
    ],
    recommended: [
      { code: "ISAE 3402", name: "Assurance on Controls", scope: "Service organizations" },
      { code: "ISO 20022", name: "Financial Messaging", scope: "Payment systems" }
    ]
  },

  // SETTORE HEALTHCARE
  healthcare: {
    mandatory: [
      { code: "MDR 2017/745", name: "Medical Device Regulation", scope: "Medical devices EU", mandatory: true },
      { code: "ISO 13485:2016", name: "Medical Devices Quality", scope: "Medical devices" },
      { code: "ISO 14971:2019", name: "Risk Management Medical Devices", scope: "Medical devices" }
    ],
    digital_health: [
      { code: "IEC 62304", name: "Medical Device Software", scope: "Software as MD" },
      { code: "IEC 80001-1", name: "Risk Management IT Networks", scope: "Healthcare IT" },
      { code: "ISO 27799:2016", name: "Health Informatics Security", scope: "Healthcare data" }
    ],
    recommended: [
      { code: "HIPAA Compliance", name: "Health Insurance Portability", scope: "US operations" },
      { code: "ISO 15189:2012", name: "Medical Laboratories", scope: "Clinical labs" }
    ]
  },

  // SETTORE MANUFACTURING & INDUSTRY 4.0
  manufacturing: {
    operational: [
      { code: "IEC 62443", name: "Industrial Automation Security", scope: "OT/ICS", nis2: true },
      { code: "ISO 50001:2018", name: "Energy Management", scope: "Energy intensive" },
      { code: "CE Marking", name: "Conformité Européenne", scope: "Products in EU", mandatory: true }
    ],
    industry40: [
      { code: "RAMI 4.0", name: "Reference Architecture Model", scope: "Smart factory" },
      { code: "OPC UA", name: "Open Platform Communications", scope: "Industrial IoT" },
      { code: "ISA-95", name: "Enterprise-Control Integration", scope: "MES/ERP integration" }
    ],
    safety: [
      { code: "IEC 61508", name: "Functional Safety", scope: "Safety systems", critical: true },
      { code: "ISO 12100:2010", name: "Safety of Machinery", scope: "Machine builders" },
      { code: "ATEX 2014/34/EU", name: "Explosive Atmospheres", scope: "Ex environments" }
    ]
  },

  // SETTORE ICT & CLOUD
  ict: {
    cloud: [
      { code: "CSA STAR", name: "Cloud Security Alliance", scope: "Cloud providers" },
      { code: "ISO/IEC 27017", name: "Cloud Security Controls", scope: "Cloud services", nis2: true },
      { code: "FedRAMP", name: "Federal Risk Authorization", scope: "US Government cloud" }
    ],
    software: [
      { code: "ISO/IEC 25010:2011", name: "Software Quality", scope: "Software products" },
      { code: "CMMI", name: "Capability Maturity Model", scope: "Software development" },
      { code: "ISO/IEC 20000-1:2018", name: "IT Service Management", scope: "IT services" }
    ],
    emerging: [
      { code: "ISO/IEC 23053:2022", name: "AI Trustworthiness", scope: "AI systems" },
      { code: "ISO/IEC 23894:2023", name: "AI Risk Management", scope: "AI systems" },
      { code: "ETSI EN 303 645", name: "IoT Cybersecurity", scope: "Consumer IoT" }
    ]
  }
};

export const getCertificationsByContext = (sector: string, compliance: string[]): any[] => {
  const results = [];
  
  // Aggiungi certificazioni generali sempre rilevanti
  results.push(...CERTIFICATIONS_DATABASE.general.security);
  
  // Aggiungi certificazioni settoriali
  if (sector && CERTIFICATIONS_DATABASE[sector.toLowerCase()]) {
    const sectorCerts = CERTIFICATIONS_DATABASE[sector.toLowerCase()];
    Object.values(sectorCerts).forEach(category => {
      results.push(...category);
    });
  }
  
  // Filtra per compliance requirements
  if (compliance.includes('nis2')) {
    results.filter(cert => cert.nis2);
  }
  if (compliance.includes('gdpr')) {
    results.filter(cert => cert.gdpr);
  }
  
  return results;
};