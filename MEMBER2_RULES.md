# NEXUS AI — Member 2: Intelligence Engine Rules Reference
**Subsystem:** Member 2 — Information Intelligence Engine  
**Author:** Hackathon Team Member 2  
**Purpose:** Formal specification of all deterministic rules governing normalization, entity matching, contradiction logic, temporal progression, and confidence scoring.

---

## 1. Fact Normalization Rules

### 1.1 Currency Normalization Rules
1. **Lakh & Crore Scale Multipliers:**
   - `Lakh` / `Lakhs` / `Lac` / `Lacs` / attached `L`: Multiplied by $100,000$.
     - `"₹15 lakh"` $\rightarrow$ `INR: 1,500,000`
     - `"15L"` $\rightarrow$ `INR: 1,500,000`
     - `"Rs. 15,00,000"` $\rightarrow$ `INR: 1,500,000`
   - `Crore` / `Crores` / `Cr` / attached `Cr`: Multiplied by $10,000,000$.
     - `"1.5 Cr"` $\rightarrow$ `INR: 15,000,000`
   - `Thousand` / `K` / attached `k`: Multiplied by $1,000$.
     - `"31.5K"` $\rightarrow$ `INR: 31,500`
2. **Currency Symbol Detection:**
   - `"₹"`, `"Rs"`, `"Rs."`, `"INR"`, `"Rupees"` $\rightarrow$ ISO Code `"INR"`
   - `"$"`, `"USD"` $\rightarrow$ ISO Code `"USD"`
   - `"€"`, `"EUR"` $\rightarrow$ ISO Code `"EUR"`
   - `"£"`, `"GBP"` $\rightarrow$ ISO Code `"GBP"`
3. **Format Standardization:**
   - Clean representation: `<CURRENCY>:<AMOUNT_FLOAT_2_DECIMALS>` (e.g. `INR:1500000.00`).

### 1.2 Date Normalization Rules
1. **Day-Level Precision (`DAY`):**
   - Format `DD/MM/YYYY`, `DD-MM-YYYY`: If first component $> 12$, treated as Day.
   - Format `DD-Mon-YYYY`, `DD Month YYYY`: Parsed via standard month mapping.
   - Standardized to ISO 8601 UTC timestamp and `YYYY-MM-DD` date string.
2. **Month-Level Precision (`MONTH`):**
   - Format `Month YYYY`, `Mon YYYY`, `MM/YYYY`, `YYYY-MM`:
   - Standardized to `YYYY-MM` (e.g. `"March 2024"` $\rightarrow$ `2024-03`).
3. **Quarter-Level Precision (`QUARTER`):**
   - Format `Q[1-4] YYYY` or `YYYY Q[1-4]`:
   - Standardized to `YYYY-Q[1-4]` (e.g. `"Q1 2024"` $\rightarrow$ `2024-Q1`).
4. **Fiscal Year Precision (`YEAR`):**
   - Format `FY YYYY` or `FY2023-24`:
   - Standardized to `FY2023` anchored at April 1st of that year.

### 1.3 Person Name Normalization Rules
1. **Honorific Stripping:**
   - Regex: `^(mr|mrs|ms|miss|dr|prof|shri|smt|kumari)\.?\s+` is removed.
2. **Tokenization & Casing:**
   - Trim extra spaces, remove punctuation except periods in initials.
   - Title case tokens: `"RAMESH KUMAR"` $\rightarrow$ `"Ramesh Kumar"`.
   - Preserve initials array: `["r", "k"]`.

### 1.4 Identifier Normalization Rules
1. **PAN Number:** Strip non-alphanumeric, uppercase, enforce 10 chars (`ABCDE1234F`).
2. **Phone Number:** Strip non-digits; if 12 digits starting with `91`, strip leading country code to extract canonical 10-digit mobile (`9876543210`).
3. **Account Number:** Strip hyphens, whitespace, uppercase alphanumeric.

---

## 2. Multi-Signal Entity Resolution Rules

### 2.1 Matching Signals & Weights
| Signal | Condition | Score | Decision |
| :--- | :--- | :--- | :--- |
| **Exact Unique Identifier** | Matching PAN, Passport, Phone, or Account Number | **0.99** | **Definite Merge** |
| **Exact Canonical Name** | Identical normalized full name string | **0.98** | **Definite Merge** |
| **Initial + Surname Match** | `"R. Kumar"` matches `"Ramesh Kumar"` | **0.88** | **Merge (Alias recorded)** |
| **First Name + Initial Match** | `"Ramesh K."` matches `"Ramesh Kumar"` | **0.88** | **Merge (Alias recorded)** |
| **Token Subset Compatibility** | Shorter name tokens match prefixes of longer name | **0.85** | **Merge** |
| **High String Similarity** | Jaro-Winkler string similarity $\ge 0.90$ | **0.80 - 0.90** | **Merge (Typo/OCR error)** |

### 2.2 Disambiguation Guard (Hard Constraint)
- **Rule:** If two entity mentions possess identical or similar names (e.g. `"Amit Sharma"` and `"Amit Sharma"`), but their unique identifiers (e.g. PAN numbers `AAAAA1111A` vs `BBBBB2222B`) conflict, **THE SYSTEM MUST NEVER MERGE THEM**.
- Two separate canonical entities (`PERSON_001`, `PERSON_002`) are initialized.

---

## 3. Attribute Canonicalization & Synonym Rules

The following raw extracted attribute names are deterministically mapped to canonical attributes:

| Raw Attributes | Canonical Attribute |
| :--- | :--- |
| `salary`, `salary_credit`, `monthly_salary`, `take_home_pay`, `net_salary` | `monthly_income` |
| `annual_salary`, `yearly_income`, `annual_income` | `annual_income` |
| `requested_loan`, `loan_amount`, `loan_requested` | `loan_amount_requested` |
| `dob`, `birth_date` | `date_of_birth` |
| `pan`, `pan_card` | `pan_number` |
| `aadhaar`, `aadhaar_card` | `aadhaar_number` |
| `phone_number`, `mobile`, `contact_number` | `contact_number` |
| `residential_address`, `residence_address`, `permanent_address` | `address` |
| `employer`, `company_name`, `organization` | `employer_name` |

---

## 4. Contradiction vs. Temporal Revision Rules

### 4.1 Invariant Attribute Rule
Certain attributes are **invariant** for a human entity:
`date_of_birth`, `pan_number`, `aadhaar_number`, `passport_number`, `gender`, `father_name`.
- **Rule:** If two facts for the same entity assert different values for an invariant attribute, **IT IS ALWAYS A CRITICAL CONTRADICTION**, regardless of timestamps.

### 4.2 Time-Variant Attribute Rules
Attributes such as `monthly_income`, `budget`, `bank_balance`, `annual_turnover`:
1. **Identical Values:**
   - Different documents $\rightarrow$ `CONSISTENT` (Severity: `INFORMATIONAL`). Confirms cross-document truth.
   - Same document $\rightarrow$ `DUPLICATE` (Severity: `INFORMATIONAL`).
2. **Different Values with Distinct Timestamps:**
   - Both facts have distinct, explicit timestamps (e.g. `2023` vs `2024-01` vs `2024-03`):
   - Classified as `TEMPORAL_CHANGE` (Severity: `LOW`).
   - Recorded as a chronological milestone; deltas are calculated.
3. **Different Values within Same Time Period:**
   - Both facts claim values for the same time point (e.g. both refer to "March 2024" or application date vs concurrent bank statement):
   - If relative discrepancy $> 30\% \rightarrow$ `CONTRADICTION` (Severity: `HIGH`).
   - If relative discrepancy between $5\%$ and $30\% \rightarrow$ `CONTRADICTION` (Severity: `HIGH` / `MEDIUM`).
4. **Different Values with Unspecified Time:**
   - If one or both facts lack clear timestamps $\rightarrow$ `POSSIBLE_CONTRADICTION` (Severity: `MEDIUM`).

---

## 5. Missing Information Checklist Rules

### 5.1 Loan Verification Required Fields
| Attribute | Required For | Severity if Missing |
| :--- | :--- | :--- |
| `name` | Identity verification | `CRITICAL` |
| `identity_proof` (PAN/Aadhaar) | Statutory KYC compliance | `CRITICAL` |
| `signature` | Legal contract enforceability | `CRITICAL` |
| `monthly_income` | Debt-to-income repayment evaluation | `HIGH` |
| `bank_account` | Loan disbursement & ECS/NACH setup | `HIGH` |
| `employment_status` / `employer_name` | Occupational stability audit | `HIGH` |
| `address` | Physical residence verification | `HIGH` |
| `date_of_birth` | Age eligibility & credit bureau pull | `HIGH` |

### 5.2 Mandatory Document Package Completeness
- An application package must contain at least one document of type `BANK_STATEMENT`. If absent, a `MISSING_INFORMATION` finding is emitted with severity `HIGH`.

---

## 6. Multi-Signal Confidence Formula

Confidence is derived mathematically using 6 independent signals:

$$\text{Confidence Score} = w_1 E_{\text{ext}} + w_2 E_{\text{ent}} + w_3 C_{\text{norm}} + w_4 Q_{\text{src}} + w_5 C_{\text{comp}} + w_6 P_{\text{evid}}$$

### Weights & Parameters:
- **$w_1 = 0.20$ (Extraction Confidence $E_{\text{ext}}$):** Average extraction confidence from Member 1's OCR parser.
- **$w_2 = 0.20$ (Entity Match Score $E_{\text{ent}}$):** String/identifier match score from entity resolution ($0.99$ for identifier match, $0.88$ for initials).
- **$w_3 = 0.15$ (Normalization Certainty $C_{\text{norm}}$):** $0.98$ for exact currencies/numbers, $0.95$ for dates, $0.88$ for text.
- **$w_4 = 0.15$ (Source Document Quality $Q_{\text{src}}$):** $0.95$ for official bank statements, ITR returns, and PAN cards; $0.85$ for self-declarations.
- **$w_5 = 0.15$ (Comparison Certainty $C_{\text{comp}}$):** $0.98$ for deterministic mathematical comparisons; $0.75$ for fuzzy matches.
- **$w_6 = 0.15$ (Evidence Completeness $P_{\text{evid}}$):** Full score ($1.0$) when Document ID, Page Number, and Exact Text Snippet are present.

### Categorical Thresholds:
- $\text{Score} \ge 0.82 \longrightarrow$ **`HIGH`**
- $0.65 \le \text{Score} < 0.82 \longrightarrow$ **`MEDIUM`**
- $\text{Score} < 0.65 \longrightarrow$ **`LOW`**
