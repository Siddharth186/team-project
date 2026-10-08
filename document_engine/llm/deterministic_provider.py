import re
import uuid
from typing import Dict, Any, List, Optional
from .base import LLMProvider

class DeterministicLLMProvider(LLMProvider):
    """
    Deterministic rule-based information intelligence engine.
    Ensures 100% reliability, zero cost, and zero external dependency for tests and offline hackathon demos.
    Extracts high-precision candidate entities, facts, relationships, and source evidence.
    """

    def get_provider_name(self) -> str:
        return "deterministic_rule_engine"

    def generate_json(self, system_prompt: str, user_prompt: str) -> Dict[str, Any]:
        # Extract document_data content from prompt if wrapped
        match = re.search(r"<DOCUMENT_DATA>(.*?)</DOCUMENT_DATA>", user_prompt, re.DOTALL)
        text = match.group(1) if match else user_prompt

        # Extract context tags
        doc_id_match = re.search(r"DOCUMENT_ID:\s*([^\n\r]+)", user_prompt)
        page_num_match = re.search(r"PAGE_NUMBER:\s*(\d+)", user_prompt)
        chunk_id_match = re.search(r"CHUNK_ID:\s*([^\n\r]+)", user_prompt)

        doc_id = doc_id_match.group(1).strip() if doc_id_match else "DOC001"
        page_num = int(page_num_match.group(1)) if page_num_match else 1
        chunk_id = chunk_id_match.group(1).strip() if chunk_id_match else f"{doc_id}-P{page_num:02d}-C01"

        entities: List[Dict[str, Any]] = []
        facts: List[Dict[str, Any]] = []
        relationships: List[Dict[str, Any]] = []
        evidence_list: List[Dict[str, Any]] = []

        seen_entities = set()

        def add_entity(val: str, ent_type: str, line_src: str):
            val_clean = val.strip()
            if not val_clean or val_clean in seen_entities:
                return
            seen_entities.add(val_clean)
            ev = {
                "document_id": doc_id,
                "page_number": page_num,
                "chunk_id": chunk_id,
                "source_text": line_src.strip()
            }
            entities.append({
                "entity_id": f"ENT-{uuid.uuid4().hex[:8]}",
                "type": ent_type,
                "value": val_clean,
                "source": ev,
                "confidence": 0.98
            })
            evidence_list.append(ev)

        def add_fact(ent_ref: str, attr: str, val: Any, vtype: str, unit: Optional[str], line_src: str, v_from=None, v_to=None):
            ev = {
                "document_id": doc_id,
                "page_number": page_num,
                "chunk_id": chunk_id,
                "source_text": line_src.strip()
            }
            facts.append({
                "fact_id": f"FCT-{uuid.uuid4().hex[:8]}",
                "entity_reference": ent_ref,
                "attribute": attr,
                "value": val,
                "value_type": vtype,
                "unit": unit,
                "valid_from": v_from,
                "valid_to": v_to,
                "source": ev,
                "extraction_confidence": 0.96
            })
            evidence_list.append(ev)

        def add_rel(src: str, rel_type: str, tgt: str, line_src: str):
            ev = {
                "document_id": doc_id,
                "page_number": page_num,
                "chunk_id": chunk_id,
                "source_text": line_src.strip()
            }
            relationships.append({
                "relationship_id": f"REL-{uuid.uuid4().hex[:8]}",
                "source_entity": src,
                "relationship_type": rel_type,
                "target_entity": tgt,
                "source": ev,
                "confidence": 0.95
            })
            evidence_list.append(ev)

        # Iterate lines to extract patterns
        lines = text.split("\n")
        current_primary_person = "Applicant"

        for line in lines:
            line_str = line.strip()
            if not line_str:
                continue

            # Check for Person / Applicant name
            name_m = re.search(r'(?:Applicant(?:\s+Name)?|Name|Candidate|Employee|Customer|Officer)\s*[:=]\s*([A-Za-z\.\s]{3,40})', line_str, re.IGNORECASE)
            if name_m:
                pname = name_m.group(1).strip()
                if not pname.lower().startswith("of") and not pname.lower().startswith("the"):
                    current_primary_person = pname
                    add_entity(pname, "PERSON", line_str)
                    add_fact(pname, "full_name", pname, "string", None, line_str)

            # Check for Organization / Employer / Bank / Issuer
            org_m = re.search(r'(?:Employer|Company|Organization|Bank|Institution|Issuer|Firm)\s*[:=]\s*([A-Za-z0-9\.\,\s&]{3,50})', line_str, re.IGNORECASE)
            if org_m:
                org_name = org_m.group(1).strip()
                add_entity(org_name, "ORGANIZATION", line_str)
                add_fact(org_name, "organization_name", org_name, "string", None, line_str)
                add_rel(current_primary_person, "works_for", org_name, line_str)

            # Check for Currency / Income / Salary / Amount / Budget / Loan
            money_m = re.search(r'(?:Income|Salary|Loan(?:\s+Amount)?|Budget|Approved\s+Amount|Rent|Revenue|Cost|Total)\s*[:=]?\s*(?:Rs\.?|INR|USD|\$|₹)?\s*([\d,]+(?:\.\d+)?)\s*(INR|USD|Rs|₹|Lakh|Crore)?', line_str, re.IGNORECASE)
            if money_m:
                raw_num = money_m.group(1).replace(",", "")
                unit = money_m.group(2) or "INR"
                try:
                    num_val = float(raw_num) if "." in raw_num else int(raw_num)
                    attr_name = "amount"
                    l_lower = line_str.lower()
                    if "income" in l_lower or "salary" in l_lower:
                        attr_name = "monthly_income" if "month" in l_lower else "annual_income"
                    elif "loan" in l_lower:
                        attr_name = "loan_amount"
                    elif "budget" in l_lower:
                        attr_name = "budget"

                    add_entity(f"{unit} {num_val}", "MONEY", line_str)
                    add_fact(current_primary_person, attr_name, num_val, "number", unit, line_str)
                except ValueError:
                    pass

            # Check for Identity Numbers (PAN, Aadhaar, Passport, SSN, Account Number)
            pan_m = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b', line_str)
            if pan_m:
                pan_val = pan_m.group(1)
                add_entity(pan_val, "ID", line_str)
                add_fact(current_primary_person, "pan_number", pan_val, "string", None, line_str)

            aadhaar_m = re.search(r'\b(\d{4}\s\d{4}\s\d{4}|\d{12})\b', line_str)
            if aadhaar_m and not pan_m:
                aadhaar_val = aadhaar_m.group(1)
                add_entity(aadhaar_val, "ID", line_str)
                add_fact(current_primary_person, "aadhaar_number", aadhaar_val, "string", None, line_str)

            # Check for Dates (DOB, Issue Date, Validity)
            dob_m = re.search(r'(?:DOB|Date\s+of\s+Birth|Birth\s*Date|Issued\s+On|Valid\s+From)\s*[:=]\s*(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4})', line_str, re.IGNORECASE)
            if dob_m:
                dt_val = dob_m.group(1)
                add_entity(dt_val, "DATE", line_str)
                attr_name = "date_of_birth" if "birth" in line_str.lower() or "dob" in line_str.lower() else "issue_date"
                add_fact(current_primary_person, attr_name, dt_val, "date", None, line_str)

            # Check for Status (Approved, Rejected, Verified, Pending)
            stat_m = re.search(r'(?:Status|Application\s+Status|Decision)\s*[:=]\s*(Approved|Pending|Rejected|Verified|Under\s+Review)', line_str, re.IGNORECASE)
            if stat_m:
                stat_val = stat_m.group(1)
                add_fact(current_primary_person, "status", stat_val, "string", None, line_str)

            # Check for Email
            email_m = re.search(r'\b([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b', line_str)
            if email_m:
                email_val = email_m.group(1)
                add_entity(email_val, "ID", line_str)
                add_fact(current_primary_person, "email_address", email_val, "string", None, line_str)

            # Check for Phone Number
            phone_m = re.search(r'(?:Phone|Mobile|Contact)\s*[:=]\s*([+]?[\d\s-]{10,15})', line_str, re.IGNORECASE)
            if phone_m:
                phone_val = phone_m.group(1).strip()
                add_fact(current_primary_person, "phone_number", phone_val, "string", None, line_str)

        return {
            "entities": entities,
            "facts": facts,
            "relationships": relationships,
            "evidence": evidence_list
        }
