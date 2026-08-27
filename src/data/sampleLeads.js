/**
 * Sample dataset for Home Tech Dealer Leads (Sheet 1)
 * Used as high-fidelity fallback when the Google Sheet feed is offline or pending public permissions.
 * Matches Columns A-I schema precisely (Columns J and K omitted).
 */

export const SAMPLE_LEADS = [
  {
    id: 'lead-1',
    fullName: 'Marcus Vance',
    phone: '(480) 555-0192',
    address: '4922 E Baseline Rd, Suite 104',
    usage: 'Smart Home Hub + Security',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18 mins ago
    status: 'New Lead',
    dripDay: 'Day 1',
    City: 'Mesa',
    State: 'AZ'
  },
  {
    id: 'lead-2',
    fullName: 'Elena Rostova',
    phone: '(303) 555-7821',
    address: '1428 Champa Street',
    usage: 'HVAC Automation & Climate',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    status: 'Contacted',
    dripDay: 'Day 1',
    City: 'Denver',
    State: 'CO'
  },
  {
    id: 'lead-3',
    fullName: 'David Sterling',
    phone: '(512) 555-4309',
    address: '701 Brazos St, Tower B',
    usage: 'Commercial Audio/Visual & Lighting',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hrs ago
    status: 'Qualified',
    dripDay: 'Day 2',
    City: 'Austin',
    State: 'TX'
  },
  {
    id: 'lead-4',
    fullName: 'Rachel Chen',
    phone: '(206) 555-8914',
    address: '2201 4th Ave, Penthouse 4',
    usage: 'Solar Inverter + Battery Storage',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
    status: 'In Progress',
    dripDay: 'Day 3',
    City: 'Seattle',
    State: 'WA'
  },
  {
    id: 'lead-5',
    fullName: 'Jonathan Miller',
    phone: '(404) 555-6672',
    address: '3344 Peachtree Rd NE',
    usage: 'Full Whole-Home Automation',
    timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(), // 5.3 hrs ago
    status: 'Converted',
    dripDay: 'Day 5',
    City: 'Atlanta',
    State: 'GA'
  },
  {
    id: 'lead-6',
    fullName: 'Sophia Martinez',
    phone: '(619) 555-3211',
    address: '890 W Harbor Dr, Ste 200',
    usage: 'Surveillance & Access Control',
    timestamp: new Date(Date.now() - 1000 * 60 * 480).toISOString(), // 8 hrs ago
    status: 'Qualified',
    dripDay: 'Day 3',
    City: 'San Diego',
    State: 'CA'
  },
  {
    id: 'lead-7',
    fullName: 'Derek Reynolds',
    phone: '(704) 555-9083',
    address: '201 S Tryon St',
    usage: 'Smart Shading & Lighting Control',
    timestamp: new Date(Date.now() - 1000 * 60 * 720).toISOString(), // 12 hrs ago
    status: 'Contacted',
    dripDay: 'Day 2',
    City: 'Charlotte',
    State: 'NC'
  },
  {
    id: 'lead-8',
    fullName: 'Amara Patel',
    phone: '(615) 555-2248',
    address: '120 4th Ave S',
    usage: 'Smart Energy Management',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 1.1).toISOString(), // Yesterday
    status: 'In Progress',
    dripDay: 'Day 4',
    City: 'Nashville',
    State: 'TN'
  },
  {
    id: 'lead-9',
    fullName: 'Bradley Cooper-Smith',
    phone: '(407) 555-6733',
    address: '450 S Orange Ave, Suite 300',
    usage: 'Home Theater & Surround Audio',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 1.5).toISOString(),
    status: 'Converted',
    dripDay: 'Day 7',
    City: 'Orlando',
    State: 'FL'
  },
  {
    id: 'lead-10',
    fullName: 'Teresa Morales',
    phone: '(702) 555-8840',
    address: '3720 S Las Vegas Blvd',
    usage: 'Smart Lock & Keyless Entry',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 2).toISOString(),
    status: 'Follow-up Required',
    dripDay: 'Day 4',
    City: 'Las Vegas',
    State: 'NV'
  },
  {
    id: 'lead-11',
    fullName: 'Liam O’Connor',
    phone: '(617) 555-1290',
    address: '500 Boylston St',
    usage: 'Network & Mesh Wi-Fi Infrastructure',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 2.5).toISOString(),
    status: 'Qualified',
    dripDay: 'Day 5',
    City: 'Boston',
    State: 'MA'
  },
  {
    id: 'lead-12',
    fullName: 'Hannah Zimmerman',
    phone: '(503) 555-7719',
    address: '1120 NW Couch St',
    usage: 'Smart Irrigation & Water Monitoring',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 3).toISOString(),
    status: 'New Lead',
    dripDay: 'Day 1',
    City: 'Portland',
    State: 'OR'
  },
  {
    id: 'lead-13',
    fullName: 'Gabriel Santos',
    phone: '(214) 555-6623',
    address: '1717 McKinney Ave',
    usage: 'EV Charger Integration & Storage',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 3.8).toISOString(),
    status: 'In Progress',
    dripDay: 'Day 6',
    City: 'Dallas',
    State: 'TX'
  },
  {
    id: 'lead-14',
    fullName: 'Chloe Bennett',
    phone: '(312) 555-9012',
    address: '233 S Wacker Dr',
    usage: 'Multi-Room Audio System',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 4.2).toISOString(),
    status: 'Contacted',
    dripDay: 'Day 2',
    City: 'Chicago',
    State: 'IL'
  },
  {
    id: 'lead-15',
    fullName: 'Travis Walker',
    phone: '(801) 555-3498',
    address: '222 S Main St, Ste 500',
    usage: 'Smart Lighting & Motorized Shades',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 5.1).toISOString(),
    status: 'Converted',
    dripDay: 'Day 8',
    City: 'Salt Lake City',
    State: 'UT'
  },
  {
    id: 'lead-16',
    fullName: 'Maya Lin',
    phone: '(415) 555-7801',
    address: '555 Mission St, Fl 18',
    usage: 'AI Security & Biometric Access',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440 * 6).toISOString(),
    status: 'Qualified',
    dripDay: 'Day 7',
    City: 'San Francisco',
    State: 'CA'
  }
];
