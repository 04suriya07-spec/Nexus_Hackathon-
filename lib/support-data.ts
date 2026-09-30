'use client';

/**
 * POLARIS Antarctic Research Operations Portal
 * Support & Knowledge Base Data Core
 * National Centre for Polar & Ocean Research (NCPOR), MoES, Govt of India
 */

export interface SupportArticle {
  id: string;
  title: string;
  category: 'power' | 'water' | 'communications' | 'weather' | 'maintenance' | 'troubleshooting' | 'overview';
  station: 'maitri' | 'bharati' | 'both' | 'all';
  summary: string;
  severity?: 'critical' | 'warning' | 'info';
  lastUpdated: string;
  docCode: string;
  steps?: string[];
  equipmentId?: string;
  telemetryMetric?: string;
  tags: string[];
}

export interface ActiveAlert {
  id: string;
  code: string;
  title: string;
  station: 'Maitri' | 'Bharati';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  affectedSystem: string;
  rootCause: string;
  recommendedAction: string;
  sopDocument: string;
  timestamp: string;
  isSimulated: boolean;
}

export interface StationTelemetrySummary {
  name: string;
  code: string;
  location: string;
  coordinates: string;
  established: string;
  winterCrew: string;
  healthIndex: number;
  subsystems: {
    name: string;
    status: 'NORMAL' | 'WARNING' | 'CRITICAL';
    metric: string;
    details: string;
  }[];
}

export const STATION_TELEMETRY: Record<'maitri' | 'bharati', StationTelemetrySummary> = {
  maitri: {
    name: 'Maitri Research Station',
    code: 'STN-01-MAITRI',
    location: 'Schirmacher Oasis, Queen Maud Land',
    coordinates: "70°45'57\"S, 11°44'09\"E",
    established: '1989 (44th ISEA Expedition Active)',
    winterCrew: '24 / 25 Personnel',
    healthIndex: 94,
    subsystems: [
      {
        name: 'Prime Power (DG-1 & DG-2)',
        status: 'WARNING',
        metric: '420 kW / 510 kW (82%)',
        details: 'DG-2 bearing vibration anomalous (3.8 mm/s, trip limit 4.5 mm/s). DG-1 operating at nominal load.',
      },
      {
        name: 'Priyadarshini Lake Water Pipeline',
        status: 'NORMAL',
        metric: '76% Storage • 3.2 m³/day',
        details: 'Dual trace-heating circuits functional at 45W/m. Line temperature steady at +4.2°C.',
      },
      {
        name: 'SATCOM Primary (ISRO GSAT-17)',
        status: 'NORMAL',
        metric: 'C-Band 12.4 Mbps • Latency 640ms',
        details: 'Radome heater cycle active. Link margin +6.8 dB above rain/snow fade margin.',
      },
      {
        name: 'Environmental Life Support (Living Modules)',
        status: 'NORMAL',
        metric: 'Cabin +20.5°C • O₂ 20.9%',
        details: 'Exhaust air heat exchangers operating at 88% thermal recovery.',
      },
    ],
  },
  bharati: {
    name: 'Bharati Research Station',
    code: 'STN-02-BHARATI',
    location: 'Larsemann Hills, East Antarctica',
    coordinates: "69°24'28\"S, 76°11'14\"E",
    established: '2012 (Aerodynamic Modular Stilt Architecture)',
    winterCrew: '20 / 24 Personnel',
    healthIndex: 91,
    subsystems: [
      {
        name: 'Combined Heat & Power (Scania CHP)',
        status: 'NORMAL',
        metric: '380 kW / 440 kW (88%)',
        details: 'CHP units 1 & 3 synchronized. Waste heat loop maintaining station domestic water buffer.',
      },
      {
        name: 'Seawater Desalination (Reverse Osmosis)',
        status: 'NORMAL',
        metric: '79% Storage • 4.8 m³/day',
        details: 'Intake pre-strainer backwash completed. Permeate conductivity < 280 µS/cm.',
      },
      {
        name: 'ISRO Polar Satellite Ground Relay',
        status: 'WARNING',
        metric: 'Tracking Tracking • Wind 42 kt',
        details: 'Radome outer shell experiencing 42 kt gusts. Auto-stow safety threshold set to 55 kt.',
      },
      {
        name: 'BHT Polar Wind Turbines (2x 40kW)',
        status: 'NORMAL',
        metric: '48 kW Harvested • Blade De-ice ON',
        details: 'Turbines supplement main microgrid; dump load heater active in central bunker.',
      },
    ],
  },
};

export const ACTIVE_ALERTS: ActiveAlert[] = [
  {
    id: 'alt-01',
    code: 'ALT-4402',
    title: 'DG-2 Crankshaft Bearing Vibration Exceedance',
    station: 'Maitri',
    severity: 'WARNING',
    affectedSystem: 'Power Generation / Microgrid Subsystem',
    rootCause: 'Elastomeric damper degradation and harmonic resonance during cold wind shear.',
    recommendedAction: 'Execute SOP-PWR-12: Reduce DG-2 load to 45%, synchronize cold standby DG-3, inspect mount bolts.',
    sopDocument: 'KB-PWR-01',
    timestamp: 'Today, 11:05 IST',
    isSimulated: true,
  },
  {
    id: 'alt-02',
    code: 'ALT-4409',
    title: 'High Katabatic Gust Velocity Near Antenna Radome',
    station: 'Bharati',
    severity: 'WARNING',
    affectedSystem: 'SATCOM Tracking & Radome Stability',
    rootCause: 'Coastal pressure differential generating sudden 42 kt katabatic wind shear.',
    recommendedAction: 'Execute SOP-COM-04: Enable dual hydraulic lock, verify heating elements, prepare auto-stow protocol.',
    sopDocument: 'KB-COM-03',
    timestamp: 'Today, 14:18 IST',
    isSimulated: true,
  },
  {
    id: 'alt-03',
    code: 'ALT-4398',
    title: 'Priyadarshini Lake Pipeline Heat Trace Line B Current Drop',
    station: 'Maitri',
    severity: 'INFO',
    affectedSystem: 'Freshwater Distribution Pipeline',
    rootCause: 'Thermostat cycling during ambient daytime temperature increase to -8°C.',
    recommendedAction: 'Execute SOP-WAT-07: Verify line flow rate (> 15 L/min). Primary heater Line A carrying 100% load.',
    sopDocument: 'KB-WAT-02',
    timestamp: 'Today, 08:45 IST',
    isSimulated: true,
  },
];

export const KNOWLEDGE_ARTICLES: SupportArticle[] = [
  {
    id: 'kb-01',
    docCode: 'SOP-PWR-01',
    title: 'Microgrid Paralleling & Cold-Standby Generator Transfer',
    category: 'power',
    station: 'both',
    summary: 'Standard operating procedure for synchronizing backup diesel generation and emergency load shedding during severe polar cold.',
    severity: 'critical',
    lastUpdated: '2026-09-15',
    equipmentId: 'GEN-VOLVO-D7A / SCANIA-DC13',
    telemetryMetric: 'Microgrid Bus Frequency (50.0 ± 0.2 Hz)',
    tags: ['generator', 'power', 'paralleling', 'blackout', 'microgrid', 'diesel'],
    steps: [
      'Confirm pre-heater coolant circuit temperature is ≥ +45°C prior to cranking.',
      'Engage synchroscope on Master Control Panel; align phase angle within ±5 degrees of running bus.',
      'Close vacuum circuit breaker (VCB-2) and ramp excitation voltage to 415V 3-phase.',
      'Balance kW and kVAR sharing equally between online units (droop setting 3.5%).',
      'If vibration exceeds 4.5 mm/s, immediately trip excitation and shed non-essential science loads.',
    ],
  },
  {
    id: 'kb-02',
    docCode: 'SOP-WAT-02',
    title: 'Priyadarshini Lake Pipeline Freeze-Protection & Thaw Cycle',
    category: 'water',
    station: 'maitri',
    summary: 'Preventive and emergency protocols for maintaining the 1.2 km insulated trace-heated water pipeline from Zub / Priyadarshini Lake.',
    severity: 'warning',
    lastUpdated: '2026-08-28',
    equipmentId: 'PUMP-ZUB-01 / TRACE-RAYCHEM-45W',
    telemetryMetric: 'Pipe Core Temperature (+3.8°C min)',
    tags: ['water', 'pipeline', 'priyadarshini', 'freezing', 'trace-heating', 'maitri'],
    steps: [
      'Verify water circulation velocity remains strictly above 0.8 m/s at all times.',
      'Check resistance of redundant heating circuits A & B (expected 18.2 Ω per 100m).',
      'In event of pump trip, immediately open gravity drain valve V-04 at station manifold to prevent ice expansion.',
      'For emergency thawing, apply low-voltage high-current induction thawing unit starting from lakehead.',
    ],
  },
  {
    id: 'kb-03',
    docCode: 'SOP-COM-03',
    title: 'ISRO GSAT-17 Tracking Re-acquisition & High-Wind Auto-Stow',
    category: 'communications',
    station: 'both',
    summary: 'Procedure for recovering C-band carrier lock and safeguarding parabolic dish antennas during blizzard force katabatic winds.',
    severity: 'warning',
    lastUpdated: '2026-09-02',
    equipmentId: 'ANT-GSAT-3.8M / ISRO-MODEM-9200',
    telemetryMetric: 'Beacon Eb/N0 Margin (+6.5 dB)',
    tags: ['satcom', 'gsat17', 'isro', 'radome', 'wind', 'tracking', 'antenna'],
    steps: [
      'Check azimuth and elevation angle against ephemeris table for GSAT-17 (Geostationary 93.5°E).',
      'If tracking jitter exceeds 0.2°, engage closed-loop step-track beacon receiver.',
      'When sustained wind speeds exceed 55 kt (102 km/h), command dish to 90° zenith stow position.',
      'Activate emergency Iridium / Inmarsat BGAN backup link for vital telemetry transmission.',
    ],
  },
  {
    id: 'kb-04',
    docCode: 'SOP-MET-04',
    title: 'Katabatic Blizzard Alert Tiers & Station Lockdown Checklist',
    category: 'weather',
    station: 'both',
    summary: 'Mandatory safety protocol for research station outdoor activities, traverse operations, and building envelope sealing.',
    severity: 'critical',
    lastUpdated: '2026-09-10',
    equipmentId: 'AWS-VAISALA-MAWS / MET-DOPPLER',
    telemetryMetric: 'Barometric Tendency (ΔP / 3hr)',
    tags: ['blizzard', 'weather', 'katabatic', 'lockdown', 'wind', 'safety'],
    steps: [
      'Condition Green (Wind < 25 kt): Normal outdoor research permitted with buddy system and VHF radio.',
      'Condition Amber (Wind 25–45 kt): Outdoor movement restricted to inter-module guideline ropes.',
      'Condition Red (Wind > 45 kt): Total outdoor ban. Seal all vestibule double airlock doors.',
      'Verify emergency battery packs in all personal survival suits and radio transceivers.',
    ],
  },
  {
    id: 'kb-05',
    docCode: 'SOP-MNT-05',
    title: 'Arctic Grade Lubricants & Fuel Winterization Protocol',
    category: 'maintenance',
    station: 'both',
    summary: 'Fuel handling standards, anti-icing additive ratios, and cold-start oil viscosity requirements under sub-zero conditions down to -50°C.',
    severity: 'info',
    lastUpdated: '2026-07-20',
    equipmentId: 'FUEL-FARM-TANK-1A / KASTEL-DISP',
    telemetryMetric: 'Fuel Cloud Point (-48°C)',
    tags: ['maintenance', 'fuel', 'jet-a1', 'lubricant', 'winterization', 'engines'],
    steps: [
      'Use only Jet A-1 or ATF mixed with 0.15% FSII (Fuel System Icing Inhibitor / Di-EGME).',
      'For heavy machinery engines, use synthetic 0W-40 oil complying with MIL-L-46167 standard.',
      'Perform bi-weekly fuel tank bottom water drainage using warm syringe test.',
      'Keep fuel storage tanks maintained above 60% capacity to minimize moisture condensation inside tanks.',
    ],
  },
  {
    id: 'kb-06',
    docCode: 'SOP-WAT-06',
    title: 'Reverse Osmosis Seawater Desalination Maintenance (Bharati)',
    category: 'water',
    station: 'bharati',
    summary: 'Operational guide for seawater intake pre-filtration, high-pressure pump maintenance, and membrane chemical cleaning.',
    severity: 'info',
    lastUpdated: '2026-08-11',
    equipmentId: 'RO-SW-DOW-FILMTEC / PUMP-CAT-350',
    telemetryMetric: 'Permeate Flow (180 L/hr)',
    tags: ['water', 'desalination', 'reverse-osmosis', 'bharati', 'filtration', 'seawater'],
    steps: [
      'Backwash multi-media dual sand filters every 72 operational hours or when ΔP > 0.8 bar.',
      'Ensure intake heating jacket maintains seawater inlet temperature between +4°C and +8°C.',
      'Monitor permeate electrical conductivity; initiate acid wash cycle if reading rises above 400 µS/cm.',
      'Dose food-grade sodium hypochlorite at 0.5 ppm for post-treatment mineralization tank.',
    ],
  },
  {
    id: 'kb-07',
    docCode: 'SYS-OVR-07',
    title: 'POLARIS Architecture & Station Autonomous Edge Telemetry',
    category: 'overview',
    station: 'all',
    summary: 'Technical overview of the POLARIS distributed telemetry architecture, local edge buffering, and NCPOR ground control link.',
    severity: 'info',
    lastUpdated: '2026-09-28',
    equipmentId: 'POLARIS-EDGE-GATEWAY-V2',
    telemetryMetric: 'Sync Queue Latency (0 ms in nominal)',
    tags: ['architecture', 'edge', 'sqlite', 'sync', 'offline', 'telemetry', 'overview'],
    steps: [
      'Telemetry sampled across 12 station subsystems every 2 seconds by local RTUs.',
      'If SATCOM drops, edge server automatically enters Autonomous Offline Buffer Mode.',
      'All support documents, interactive SOPs, and historical data remain 100% accessible locally.',
      'Upon link restoration, buffered telemetry packets resynchronize with NCPOR HQ in Vasco da Gama, Goa.',
    ],
  },
  {
    id: 'kb-08',
    docCode: 'TSG-GEN-08',
    title: 'Generator Vibration Troubleshooting & Harmonic Isolation',
    category: 'troubleshooting',
    station: 'maitri',
    summary: 'Comprehensive diagnostics tree for anomalous generator vibration, unbalance, bearing misalignment, and electrical faults.',
    severity: 'warning',
    lastUpdated: '2026-09-29',
    equipmentId: 'GEN-02-MAITRI / VIB-SENSOR-BENTLY',
    telemetryMetric: 'RMS Vibration Velocity (mm/s)',
    tags: ['troubleshooting', 'generator', 'vibration', 'bearing', 'maitri', 'fault'],
    steps: [
      'Take FFT spectrum reading: 1X RPM indicates unbalance; 2X RPM indicates shaft misalignment.',
      'Inspect anti-vibration rubber isolation mounts (AV mounts) for perishing or ice compaction.',
      'Verify fuel injector firing consistency across all 6 cylinders using infrared pyrometer on exhaust runners.',
      'If vibration remains > 4.0 mm/s after mount re-torque, switch primary generation to DG-1 or DG-3.',
    ],
  },
];

export const FREQUENT_QUESTIONS = [
  {
    q: 'How does the Support Portal function during SATCOM satellite blackout?',
    a: 'POLARIS runs a localized edge cache on the station local area network. All 8 primary SOPs, troubleshooting flowcharts, equipment schematics, and recent telemetry caches are stored in local browser storage and station edge servers. Operators can continue diagnosing systems and creating support logs completely offline.',
  },
  {
    q: 'What is the acceptable vibration limit for Maitri Generator 02?',
    a: 'According to NCPOR mechanical standards, nominal RMS vibration is < 2.5 mm/s. A warning flag triggers at 3.5 mm/s, and automatic safety interlock trip occurs at 4.5 mm/s. DG-2 is currently operating under advisory at 3.8 mm/s.',
  },
  {
    q: 'Where does fresh water come from at Maitri vs Bharati?',
    a: 'Maitri draws surface freshwater from the glacial lake Priyadarshini (Zub Lake) via a 1.2 km heated pipeline. Bharati uses a reverse-osmosis seawater desalination plant drawing seawater from the ocean bay with heated intake jackets.',
  },
  {
    q: 'Who receives submitted support tickets and what is the SLA?',
    a: 'Tickets are dispatched simultaneously to the on-site Station Chief Engineer and the 24/7 NCPOR Ground Control Operations Centre in Vasco da Gama, Goa. Priority P1 (Emergency) tickets have an immediate 15-minute response protocol.',
  },
];

export const AIRA_KNOWLEDGE_BASE: Record<string, string> = {
  vibration: 'Generator 02 at Maitri is currently reporting 3.8 mm/s vibration (warning threshold 3.5 mm/s, critical trip at 4.5 mm/s). Recommended procedure: Follow SOP-PWR-12 to reduce load to 45%, inspect AV elastomeric mounts, and synchronize DG-3 as standby.',
  water: 'Water status: Maitri lake pipeline is nominal at 76% storage and +4.2°C trace-heating temperature. Bharati RO desalination is running at 79% capacity with permeate conductivity < 280 µS/cm. Both stations have > 45 days reserve.',
  satcom: 'ISRO GSAT-17 primary link is active at 12.4 Mbps (C-Band). Bharati radome is experiencing 42 kt gusts. If winds exceed 55 kt, auto-stow protocol will engage and switch to Inmarsat BGAN backup.',
  weather: 'Current conditions: Maitri: -12.4°C, Wind 18 kt (Condition GREEN). Bharati: -8.6°C, Wind 12 kt (Condition GREEN). Next 48h weather window remains favorable for station exterior maintenance.',
  fuel: 'Fuel reserves: Maitri has 68% Jet A-1 Arctic Grade reserve (~140 days at current consumption rate). Bharati has 81% reserve (~185 days). Both fuel farms are winterized with FSII additives.',
  health: 'Overall polar fleet health index is 94% at Maitri and 91% at Bharati. The only active operational advisories are the DG-2 vibration at Maitri and wind gusts at Bharati.',
};
