/**
 * 60 Synthetic Patients for Demo
 * Diverse demographics, realistic mental health profiles
 * Avatars are matched by gender, age, and ethnicity
 */

export interface SyntheticPatient {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: "M" | "F" | "Non-binary";
  email: string;
  phone_mobile: string;
  phone_home?: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  insurance_provider: string;
  insurance_member_id: string;
  primary_diagnosis_code: string;
  primary_diagnosis_name: string;
  secondary_diagnosis_code?: string;
  date_created: string;
  last_appointment: string;
  status: "Active" | "Inactive";
  provider: string;
  avatar_url: string;
  // For substrate analysis
  risk_level: "low" | "medium" | "high";
  treatment_start_date: string;
  medications?: string[];
}

// ============================================================================
// RELIABLE AVATAR SYSTEM
// Uses pravatar.cc for reliable avatar images
// 75% of patients get photos, 25% show initials fallback
// ============================================================================

/**
 * Generate a reliable avatar URL using pravatar.cc
 * Uses patient ID as seed for deterministic avatar assignment
 * @param patientId - Unique patient identifier
 * @param gender - Patient gender (M, F, or Non-binary)
 * @returns Avatar URL or empty string (for 25% of patients to show initials)
 */
function getReliableAvatar(patientId: string, gender: "M" | "F" | "Non-binary"): string {
  // Use a simple hash to deterministically decide if patient gets a photo (75%)
  const hash = patientId.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);

  // 25% of patients will show initials (no photo)
  if (hash % 4 === 0) {
    return "";
  }

  // pravatar.cc has 70 images per gender
  // Male images: 1-70, Female images: 1-70
  const genderOffset = gender === "M" ? 0 : 1000; // Use different seed range for variety
  const imageNum = (hash % 70) + 1;

  // Use seeded URL for consistent avatars per patient
  return `https://i.pravatar.cc/150?u=${patientId}-${genderOffset + imageNum}`;
}

// Generate diverse, realistic patient data
export const SYNTHETIC_PATIENTS: SyntheticPatient[] = [
  // HIGH PRIORITY PATIENTS (will surface as urgent actions)
  {
    // Sarah Johnson: Female, 40yo (middle-aged), Caucasian
    id: "p001",
    client_id: "10001",
    first_name: "Sarah",
    last_name: "Johnson",
    date_of_birth: "1985-03-15",
    gender: "F",
    email: "sarah.johnson@email.com",
    phone_mobile: "(412) 555-0101",
    address_street: "245 Cedar Lane",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "Blue Cross Blue Shield",
    insurance_member_id: "BCB789456123",
    primary_diagnosis_code: "F41.1",
    primary_diagnosis_name: "Generalized Anxiety Disorder",
    secondary_diagnosis_code: "F32.1",
    date_created: "2024-06-15",
    last_appointment: "2026-01-28",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=p001-sarah-f", // Has photo
    risk_level: "medium",
    treatment_start_date: "2024-06-15",
    medications: ["Sertraline 50mg"],
  },
  {
    // Michael Chen: Male, 33yo (young), Asian
    id: "p002",
    client_id: "10002",
    first_name: "Michael",
    last_name: "Chen",
    date_of_birth: "1992-07-22",
    gender: "M",
    email: "michael.chen@email.com",
    phone_mobile: "(412) 555-0102",
    address_street: "892 Maple Drive",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15243",
    insurance_provider: "Aetna",
    insurance_member_id: "AET456789012",
    primary_diagnosis_code: "F33.1",
    primary_diagnosis_name: "Major Depressive Disorder, Recurrent, Moderate",
    date_created: "2024-03-01",
    last_appointment: "2026-01-21",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=p002-michael-m", // Has photo
    risk_level: "high",
    treatment_start_date: "2024-03-01",
    medications: ["Bupropion 150mg", "Trazodone 50mg PRN"],
  },
  {
    // Maria Rodriguez: Female, 47yo (middle-aged), Hispanic
    id: "p003",
    client_id: "10003",
    first_name: "Maria",
    last_name: "Rodriguez",
    date_of_birth: "1978-11-08",
    gender: "F",
    email: "maria.rodriguez@email.com",
    phone_mobile: "(412) 555-0103",
    address_street: "1456 Oak Street",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "UnitedHealthcare",
    insurance_member_id: "UHC321654987",
    primary_diagnosis_code: "F43.10",
    primary_diagnosis_name: "Post-Traumatic Stress Disorder",
    date_created: "2023-09-10",
    last_appointment: "2026-01-30",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=p003-maria-f", // Has photo
    risk_level: "high",
    treatment_start_date: "2023-09-10",
    medications: ["Prazosin 2mg", "Sertraline 100mg"],
  },
  {
    // James Williams: Male, 35yo (young), Caucasian
    id: "p004",
    client_id: "10004",
    first_name: "James",
    last_name: "Williams",
    date_of_birth: "1990-04-25",
    gender: "M",
    email: "james.williams@email.com",
    phone_mobile: "(412) 555-0104",
    address_street: "3021 Pine Avenue",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15216",
    insurance_provider: "Cigna",
    insurance_member_id: "CIG852963741",
    primary_diagnosis_code: "F40.10",
    primary_diagnosis_name: "Social Anxiety Disorder",
    date_created: "2025-01-05",
    last_appointment: "2026-01-27",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "", // No photo - shows initials (25% rule)
    risk_level: "low",
    treatment_start_date: "2025-01-05",
    medications: [],
  },
  {
    // Emily Davis: Female, 37yo (middle-aged), Caucasian
    id: "p005",
    client_id: "10005",
    first_name: "Emily",
    last_name: "Davis",
    date_of_birth: "1988-09-12",
    gender: "F",
    email: "emily.davis@email.com",
    phone_mobile: "(412) 555-0105",
    address_street: "567 Birch Road",
    address_city: "Bethel Park",
    address_state: "PA",
    address_zip: "15102",
    insurance_provider: "Blue Cross Blue Shield",
    insurance_member_id: "BCB159753468",
    primary_diagnosis_code: "F32.0",
    primary_diagnosis_name: "Major Depressive Disorder, Single Episode, Mild",
    date_created: "2025-06-20",
    last_appointment: "2026-01-29",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=p005-emily-f", // Has photo
    risk_level: "low",
    treatment_start_date: "2025-06-20",
    medications: [],
  },
  {
    // David Kim: Male, 30yo (young), Asian
    id: "p006",
    client_id: "10006",
    first_name: "David",
    last_name: "Kim",
    date_of_birth: "1995-02-18",
    gender: "M",
    email: "david.kim@email.com",
    phone_mobile: "(412) 555-0106",
    address_street: "789 Elm Court",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15232",
    insurance_provider: "Aetna",
    insurance_member_id: "AET753951852",
    primary_diagnosis_code: "F41.0",
    primary_diagnosis_name: "Panic Disorder",
    date_created: "2024-11-15",
    last_appointment: "2026-01-25",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=p006-david-m", // Has photo
    risk_level: "medium",
    treatment_start_date: "2024-11-15",
    medications: ["Alprazolam 0.5mg PRN"],
  },
  {
    // Jennifer Martinez: Female, 43yo (middle-aged), Hispanic
    id: "p007",
    client_id: "10007",
    first_name: "Jennifer",
    last_name: "Martinez",
    date_of_birth: "1982-06-30",
    gender: "F",
    email: "jennifer.martinez@email.com",
    phone_mobile: "(412) 555-0107",
    address_street: "234 Walnut Street",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "Medicare",
    insurance_member_id: "MED147258369",
    primary_diagnosis_code: "F33.0",
    primary_diagnosis_name: "Major Depressive Disorder, Recurrent, Mild",
    date_created: "2023-04-01",
    last_appointment: "2026-01-30",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=p007-jennifer-f", // Has photo
    risk_level: "low",
    treatment_start_date: "2023-04-01",
    medications: ["Escitalopram 10mg"],
  },
  {
    // Robert Taylor: Male, 50yo (middle-aged), Caucasian
    id: "p008",
    client_id: "10008",
    first_name: "Robert",
    last_name: "Taylor",
    date_of_birth: "1975-12-05",
    gender: "M",
    email: "robert.taylor@email.com",
    phone_mobile: "(412) 555-0108",
    address_street: "456 Spruce Lane",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15217",
    insurance_provider: "Self-Pay",
    insurance_member_id: "",
    primary_diagnosis_code: "F10.20",
    primary_diagnosis_name: "Alcohol Use Disorder, Moderate",
    secondary_diagnosis_code: "F32.1",
    date_created: "2024-08-10",
    last_appointment: "2026-01-24",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "", // No photo - shows initials (25% rule)
    risk_level: "high",
    treatment_start_date: "2024-08-10",
    medications: ["Naltrexone 50mg"],
  },

  // ============================================================================
  // 10 COMPREHENSIVE DEMO PATIENTS
  // These patients have full clinical depth for Patient 360 demo
  // ============================================================================

  // 1. RACHEL TORRES (Depression → Recovery + Career Change)
  // Has appointment TODAY (Feb 9) at 9:00 AM
  {
    id: "rachel-torres-demo",
    client_id: "20001",
    first_name: "Rachel",
    last_name: "Torres",
    date_of_birth: "1988-04-12",
    gender: "F",
    email: "rachel.torres@gmail.com",
    phone_mobile: "(412) 555-1201",
    address_street: "412 Maple Drive",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "UPMC Health Plan",
    insurance_member_id: "UMP928374651",
    primary_diagnosis_code: "F33.1",
    primary_diagnosis_name: "Major Depressive Disorder, recurrent, moderate",
    secondary_diagnosis_code: "F41.1",
    date_created: "2025-06-15",
    last_appointment: "2026-01-26",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=rachel-torres-demo-f", // Has photo
    risk_level: "low",
    treatment_start_date: "2025-06-15",
    medications: ["Sertraline 100mg daily", "Hydroxyzine 25mg PRN"],
  },

  // 2. JAMES OKAFOR (PTSD — Military Veteran)
  // Has appointment TODAY (Feb 9) at 10:30 AM
  {
    id: "james-okafor-demo",
    client_id: "20002",
    first_name: "James",
    last_name: "Okafor",
    date_of_birth: "1985-09-22",
    gender: "M",
    email: "james.okafor@outlook.com",
    phone_mobile: "(412) 555-1202",
    address_street: "267 Birch Lane",
    address_city: "Bethel Park",
    address_state: "PA",
    address_zip: "15102",
    insurance_provider: "Tricare",
    insurance_member_id: "TRC118845523",
    primary_diagnosis_code: "F43.10",
    primary_diagnosis_name: "Post-Traumatic Stress Disorder",
    secondary_diagnosis_code: "F51.01",
    date_created: "2025-04-10",
    last_appointment: "2026-01-26",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=james-okafor-demo-m", // Has photo
    risk_level: "medium",
    treatment_start_date: "2025-04-10",
    medications: ["Prazosin 2mg at bedtime", "Sertraline 150mg daily"],
  },

  // 3. SOPHIA CHEN-MARTINEZ (Anxiety + Perfectionism — Graduate Student)
  // Has appointment TODAY (Feb 9) at 1:00 PM
  {
    id: "sophia-chen-martinez-demo",
    client_id: "20003",
    first_name: "Sophia",
    last_name: "Chen-Martinez",
    date_of_birth: "1997-01-30",
    gender: "F",
    email: "sophia.cm@pitt.edu",
    phone_mobile: "(412) 555-1203",
    address_street: "1845 Murray Ave",
    address_city: "Squirrel Hill",
    address_state: "PA",
    address_zip: "15217",
    insurance_provider: "Aetna Student Health",
    insurance_member_id: "AET556789012",
    primary_diagnosis_code: "F41.1",
    primary_diagnosis_name: "Generalized Anxiety Disorder",
    date_created: "2025-09-01",
    last_appointment: "2026-01-26",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=sophia-chen-martinez-demo-f", // Has photo
    risk_level: "low",
    treatment_start_date: "2025-09-01",
    medications: ["Buspirone 15mg BID"],
  },

  // 4. MARCUS WASHINGTON (Bipolar II — Stable Maintenance)
  // Has appointment TODAY (Feb 9) at 3:30 PM
  {
    id: "marcus-washington-demo",
    client_id: "20004",
    first_name: "Marcus",
    last_name: "Washington",
    date_of_birth: "1976-12-08",
    gender: "M",
    email: "marcus.w76@gmail.com",
    phone_mobile: "(412) 555-1204",
    address_street: "530 Brownsville Rd",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15210",
    insurance_provider: "Highmark BCBS",
    insurance_member_id: "HMK443216789",
    primary_diagnosis_code: "F31.81",
    primary_diagnosis_name: "Bipolar II Disorder",
    secondary_diagnosis_code: "F10.20",
    date_created: "2024-11-15",
    last_appointment: "2026-01-12",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "", // No photo - shows initials (25% rule)
    risk_level: "medium",
    treatment_start_date: "2024-11-15",
    medications: ["Lamotrigine 200mg daily", "Quetiapine 50mg at bedtime"],
  },

  // 5. EMMA KOWALSKI (Eating Disorder Recovery)
  // Next appointment: Feb 12 at 11:00 AM
  {
    id: "emma-kowalski-demo",
    client_id: "20005",
    first_name: "Emma",
    last_name: "Kowalski",
    date_of_birth: "2001-07-19",
    gender: "F",
    email: "emma.kowalski@icloud.com",
    phone_mobile: "(412) 555-1205",
    address_street: "89 Washington Rd",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "UPMC Health Plan",
    insurance_member_id: "UMP667788990",
    primary_diagnosis_code: "F50.02",
    primary_diagnosis_name: "Bulimia Nervosa, in partial remission",
    secondary_diagnosis_code: "F33.0",
    date_created: "2025-03-20",
    last_appointment: "2026-01-29",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=emma-kowalski-demo-f", // Has photo
    risk_level: "medium",
    treatment_start_date: "2025-03-20",
    medications: ["Fluoxetine 60mg daily"],
  },

  // 6. DAVID NAKAMURA (Couples Presenting as Individual — Work Stress)
  // Next appointment: Feb 10 at 2:00 PM
  {
    id: "david-nakamura-demo",
    client_id: "20006",
    first_name: "David",
    last_name: "Nakamura",
    date_of_birth: "1982-03-14",
    gender: "M",
    email: "d.nakamura@techcorp.com",
    phone_mobile: "(412) 555-1206",
    address_street: "1620 Cochran Rd",
    address_city: "Upper St. Clair",
    address_state: "PA",
    address_zip: "15241",
    insurance_provider: "Cigna",
    insurance_member_id: "CIG334455667",
    primary_diagnosis_code: "F43.20",
    primary_diagnosis_name: "Adjustment Disorder with mixed anxiety and depressed mood",
    date_created: "2025-10-01",
    last_appointment: "2026-01-28",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=david-nakamura-demo-m", // Has photo
    risk_level: "low",
    treatment_start_date: "2025-10-01",
    medications: [],
  },

  // 7. AALIYAH BROOKS (Adolescent/Young Adult — Social Anxiety + Identity)
  // Next appointment: Feb 11 at 4:00 PM
  {
    id: "aaliyah-brooks-demo",
    client_id: "20007",
    first_name: "Aaliyah",
    last_name: "Brooks",
    date_of_birth: "2004-11-25",
    gender: "F",
    email: "aaliyah.b04@gmail.com",
    phone_mobile: "(412) 555-1207",
    address_street: "345 Castle Shannon Blvd",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15234",
    insurance_provider: "Highmark BCBS",
    insurance_member_id: "HMK998877665",
    primary_diagnosis_code: "F40.10",
    primary_diagnosis_name: "Social Anxiety Disorder",
    secondary_diagnosis_code: "F64.0",
    date_created: "2025-08-15",
    last_appointment: "2026-01-28",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=aaliyah-brooks-demo-f", // Has photo
    risk_level: "low",
    treatment_start_date: "2025-08-15",
    medications: ["Escitalopram 10mg daily"],
  },

  // 8. ROBERT FITZGERALD (Geriatric — Grief + Cognitive Concerns)
  // Next appointment: Feb 13 at 10:00 AM
  {
    id: "robert-fitzgerald-demo",
    client_id: "20008",
    first_name: "Robert",
    last_name: "Fitzgerald",
    date_of_birth: "1948-06-30",
    gender: "M",
    email: "bobfitz48@aol.com",
    phone_mobile: "(412) 555-1208",
    address_street: "2100 Bower Hill Rd",
    address_city: "Mt. Lebanon",
    address_state: "PA",
    address_zip: "15228",
    insurance_provider: "Medicare",
    insurance_member_id: "MCR1A2B3C4D5",
    primary_diagnosis_code: "F43.21",
    primary_diagnosis_name: "Adjustment Disorder with depressed mood",
    secondary_diagnosis_code: "R41.81",
    date_created: "2025-07-01",
    last_appointment: "2026-01-30",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=robert-fitzgerald-demo-m", // Has photo
    risk_level: "medium",
    treatment_start_date: "2025-07-01",
    medications: ["Mirtazapine 15mg at bedtime"],
  },

  // 9. CARMEN ALVAREZ (Postpartum Depression — New Mother)
  // HIGH RISK - Next appointment: Feb 14 at 9:00 AM
  {
    id: "carmen-alvarez-demo",
    client_id: "20009",
    first_name: "Carmen",
    last_name: "Alvarez",
    date_of_birth: "1993-02-17",
    gender: "F",
    email: "carmen.alvarez93@yahoo.com",
    phone_mobile: "(412) 555-1209",
    address_street: "1450 E Carson St",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15203",
    insurance_provider: "UPMC for You (Medicaid)",
    insurance_member_id: "UMY445566778",
    primary_diagnosis_code: "F53.0",
    primary_diagnosis_name: "Postpartum Depression",
    secondary_diagnosis_code: "F41.1",
    date_created: "2025-11-01",
    last_appointment: "2026-02-07",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=carmen-alvarez-demo-f", // Has photo
    risk_level: "high",
    treatment_start_date: "2025-11-01",
    medications: ["Sertraline 75mg daily"],
  },

  // 10. TYLER HARRISON (NEW PATIENT — Intake Scheduled)
  // NEW PATIENT - Has intake TODAY (Feb 9) at 4:30 PM
  {
    id: "tyler-harrison-demo",
    client_id: "20010",
    first_name: "Tyler",
    last_name: "Harrison",
    date_of_birth: "1990-08-05",
    gender: "M",
    email: "tyler.harrison90@gmail.com",
    phone_mobile: "(412) 555-1210",
    address_street: "780 Liberty Ave",
    address_city: "Pittsburgh",
    address_state: "PA",
    address_zip: "15222",
    insurance_provider: "Self-Pay",
    insurance_member_id: "",
    primary_diagnosis_code: "",
    primary_diagnosis_name: "Pending Intake Evaluation",
    date_created: "2026-02-06",
    last_appointment: "",
    status: "Active",
    provider: "Dr. Demo",
    avatar_url: "https://i.pravatar.cc/150?u=tyler-harrison-demo-m", // Has photo
    risk_level: "low",
    treatment_start_date: "2026-02-09",
    medications: [],
  },
];

// Generate remaining 52 patients programmatically
// Separate male and female names for proper avatar assignment
const maleFirstNames = [
  "Alex",
  "Andrew",
  "Anthony",
  "Benjamin",
  "Brandon",
  "Charles",
  "Christopher",
  "Daniel",
  "Edward",
  "Eric",
  "Frank",
  "Gregory",
  "Henry",
  "Jack",
  "John",
  "Justin",
  "Keith",
  "Kevin",
  "Lawrence",
  "Mark",
  "Matthew",
  "Nathan",
  "Oliver",
  "Paul",
  "Ryan",
  "Steven",
];
const femaleFirstNames = [
  "Amanda",
  "Angela",
  "Ashley",
  "Brittany",
  "Catherine",
  "Christina",
  "Danielle",
  "Diana",
  "Elizabeth",
  "Erica",
  "Grace",
  "Hannah",
  "Isabella",
  "Jessica",
  "Julia",
  "Karen",
  "Kelly",
  "Kimberly",
  "Laura",
  "Linda",
  "Lisa",
  "Margaret",
  "Megan",
  "Michelle",
  "Nancy",
  "Nicole",
  "Patricia",
  "Rachel",
];
// Diverse last names to ensure proper demographic coverage
const lastNames = [
  // Caucasian
  "Anderson",
  "Brown",
  "Clark",
  "Davis",
  "Evans",
  "Hall",
  "Harris",
  "Hill",
  "Johnson",
  "Jones",
  "King",
  "Lewis",
  "Martin",
  "Miller",
  "Mitchell",
  "Moore",
  "Nelson",
  "Parker",
  "Phillips",
  "Roberts",
  "Robinson",
  "Scott",
  "Smith",
  "Thomas",
  "Thompson",
  "Turner",
  "Walker",
  "White",
  "Wilson",
  "Wright",
  "Young",
  // Hispanic
  "Garcia",
  "Lopez",
  "Perez",
  "Flores",
  "Gonzalez",
  "Hernandez",
  "Martinez",
  "Rodriguez",
  "Sanchez",
  "Torres",
  "Rivera",
  "Ramirez",
  // Asian
  "Chen",
  "Kim",
  "Lee",
  "Nguyen",
  "Park",
  "Wong",
  "Wang",
  "Tanaka",
  "Liu",
  "Yang",
  // South Asian
  "Patel",
  "Shah",
  "Kumar",
  "Singh",
  "Sharma",
  "Gupta",
  // African American
  "Washington",
  "Jackson",
  "Freeman",
  "Banks",
  "Brooks",
  // Middle Eastern
  "Ahmed",
  "Hassan",
  "Ali",
  "Khan",
];
const diagnoses = [
  { code: "F41.1", name: "Generalized Anxiety Disorder" },
  { code: "F32.1", name: "Major Depressive Disorder, Single Episode, Moderate" },
  { code: "F33.1", name: "Major Depressive Disorder, Recurrent, Moderate" },
  { code: "F43.10", name: "Post-Traumatic Stress Disorder" },
  { code: "F40.10", name: "Social Anxiety Disorder" },
  { code: "F41.0", name: "Panic Disorder" },
  { code: "F34.1", name: "Dysthymic Disorder" },
  { code: "F42.2", name: "Obsessive-Compulsive Disorder" },
  { code: "F50.00", name: "Anorexia Nervosa" },
  { code: "F31.81", name: "Bipolar II Disorder" },
];
const insurers = [
  "Blue Cross Blue Shield",
  "Aetna",
  "UnitedHealthcare",
  "Cigna",
  "Medicare",
  "Medicaid",
  "Self-Pay",
  "Highmark",
  "UPMC Health Plan",
];

function generatePatient(index: number): SyntheticPatient {
  // Alternate between male and female patients
  const isMale = index % 2 === 0;
  const firstName = isMale
    ? maleFirstNames[Math.floor(index / 2) % maleFirstNames.length]!
    : femaleFirstNames[Math.floor(index / 2) % femaleFirstNames.length]!;
  const lastName = lastNames[index % lastNames.length]!;
  const diagnosis = diagnoses[index % diagnoses.length]!;
  const insurer = insurers[index % insurers.length]!;
  const birthYear = 1960 + (index % 40);
  const birthMonth = String((index % 12) + 1).padStart(2, "0");
  const birthDay = String((index % 28) + 1).padStart(2, "0");
  const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;
  const patientId = `p${String(index + 9).padStart(3, "0")}`;
  const gender: "M" | "F" = isMale ? "M" : "F";

  // Get reliable avatar URL (75% have photos, 25% show initials)
  const avatarUrl = getReliableAvatar(patientId, gender);

  return {
    id: patientId,
    client_id: String(10000 + index + 8),
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth,
    gender: gender,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone_mobile: `(412) 555-${String(index + 109).padStart(4, "0")}`,
    address_street: `${100 + index * 7} ${["Oak", "Maple", "Cedar", "Pine", "Elm", "Birch"][index % 6]!} ${["St", "Ave", "Rd", "Ln", "Dr"][index % 5]!}`,
    address_city: ["Pittsburgh", "Mt. Lebanon", "Bethel Park", "Upper St. Clair", "South Hills"][
      index % 5
    ]!,
    address_state: "PA",
    address_zip: ["15228", "15216", "15232", "15243", "15102"][index % 5]!,
    insurance_provider: insurer,
    insurance_member_id:
      insurer === "Self-Pay"
        ? ""
        : `${insurer.substring(0, 3).toUpperCase()}${String(Math.floor(Math.random() * 999999999)).padStart(9, "0")}`,
    primary_diagnosis_code: diagnosis.code,
    primary_diagnosis_name: diagnosis.name,
    date_created: `202${3 + (index % 3)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    last_appointment: "2026-01-" + String(20 + (index % 10)).padStart(2, "0"),
    status: index % 12 === 0 ? "Inactive" : "Active",
    provider: "Dr. Demo",
    avatar_url: avatarUrl,
    risk_level: index % 5 === 0 ? "high" : index % 3 === 0 ? "medium" : "low",
    treatment_start_date: `202${3 + (index % 3)}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 28) + 1).padStart(2, "0")}`,
    medications: index % 3 === 0 ? ["Sertraline 50mg"] : index % 4 === 0 ? ["Bupropion 150mg"] : [],
  };
}

// Add remaining patients
for (let i = 0; i < 52; i++) {
  SYNTHETIC_PATIENTS.push(generatePatient(i));
}

export default SYNTHETIC_PATIENTS;
