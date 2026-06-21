import json
from . import models

def evaluate_scan(scan_results: dict, db_policies: list[models.Policy]) -> tuple[bool, list[str]]:
    """
    Evaluates scan findings against a list of active policies.
    Returns: (is_compliant: bool, violations: list[str])
    """
    if not db_policies:
        # Default strict policy if no DB policies exist
        is_clean = (
            scan_results.get("cves_found", 0) == 0 and
            scan_results.get("secrets_found", 0) == 0 and
            scan_results.get("docker_misconfigs", 0) == 0
        )
        if is_clean:
            return True, []
        return False, ["Failed Default Policy: No vulnerabilities, secrets, or misconfigurations allowed."]

    violations = []
    
    # scan_results shape:
    # { "cves_found": 2, "secrets_found": 1, "docker_misconfigs": 0 }

    for policy in db_policies:
        try:
            # We assume policy.rego_code is actually our JSON rule definition for the MVP
            # Example: {"max_cves": 0, "allow_secrets": false, "allow_docker_root": false}
            rules = json.loads(policy.rego_code)
            
            # 1. Check CVEs
            if "max_cves" in rules:
                if scan_results.get("cves_found", 0) > rules["max_cves"]:
                    violations.append(f"Policy '{policy.name}': Exceeded max allowed CVEs ({rules['max_cves']})")
            
            # 2. Check Secrets
            if rules.get("allow_secrets") is False:
                if scan_results.get("secrets_found", 0) > 0:
                    violations.append(f"Policy '{policy.name}': Secrets detection is strictly prohibited.")
            
            # 3. Check Docker Misconfigs
            if rules.get("allow_docker_root") is False:
                if scan_results.get("docker_misconfigs", 0) > 0:
                    violations.append(f"Policy '{policy.name}': Docker container misconfigurations detected (e.g. running as root).")
                    
        except Exception as e:
            print(f"Error parsing policy {policy.id}: {e}")
            violations.append(f"System Error: Policy '{policy.name}' is malformed.")

    is_compliant = len(violations) == 0
    return is_compliant, violations
