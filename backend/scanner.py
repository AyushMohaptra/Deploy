import requests
import json
import re
from sqlalchemy.orm import Session
from . import models
from .policy_engine import evaluate_scan

OSV_API_URL = "https://api.osv.dev/v1/query"

# Basic regex patterns for secret scanning
SECRET_PATTERNS = {
    "AWS Access Key": r"AKIA[0-9A-Z]{16}",
    "RSA Private Key": r"-----BEGIN RSA PRIVATE KEY-----",
    "Generic API Key (High Entropy)": r"(?i)(api_key|apikey|secret)[=:]\s*[\"'][a-zA-Z0-9\-_]{32,}[\"']"
}

def scan_github_repo(repo_full_name: str, commit_sha: str, db: Session):
    print(f"Starting advanced scan for {repo_full_name} at {commit_sha}")
    
    scan_results = {
        "cves_found": 0,
        "secrets_found": 0,
        "docker_misconfigs": 0,
        "vulnerable_packages": [],
        "secrets_details": [],
        "docker_details": []
    }

    # 1. OSV Dependency Scanning
    _scan_dependencies(repo_full_name, scan_results)
    
    # 2. Dockerfile Misconfiguration Scanning
    _scan_dockerfile(repo_full_name, scan_results)
    
    # 3. Secret Scanning (via Commit Diff)
    if commit_sha and commit_sha != "latest" and commit_sha != "unknown-sha":
        _scan_secrets(repo_full_name, commit_sha, scan_results)

    # 4. Policy Evaluation
    db_policies = db.query(models.Policy).filter(models.Policy.is_active == True).all()
    is_compliant, violations = evaluate_scan(scan_results, db_policies)

    status = "passed" if is_compliant else "failed"
    
    details_dict = {
        "vulnerabilities_found": scan_results["cves_found"],
        "secrets_found": scan_results["secrets_found"],
        "docker_misconfigs": scan_results["docker_misconfigs"],
        "policy_violations": len(violations),
        "violation_reasons": violations,
        "vulnerable_packages": scan_results["vulnerable_packages"],
        "secrets_details": scan_results["secrets_details"],
        "docker_details": scan_results["docker_details"]
    }
    
    _save_result(db, repo_full_name, commit_sha, status, details_dict)

def _scan_dependencies(repo_full_name: str, scan_results: dict):
    raw_url = f"https://raw.githubusercontent.com/{repo_full_name}/main/package.json"
    response = requests.get(raw_url, timeout=10)
    if response.status_code != 200:
        raw_url = f"https://raw.githubusercontent.com/{repo_full_name}/master/package.json"
        response = requests.get(raw_url, timeout=10)
        
    if response.status_code == 200:
        try:
            package_data = response.json()
            dependencies = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
            for pkg_name, version in dependencies.items():
                clean_version = version.replace('^', '').replace('~', '').replace('>', '').replace('=', '').strip()
                if not clean_version or clean_version == '*': continue
                
                osv_resp = requests.post(OSV_API_URL, json={"version": clean_version, "package": {"name": pkg_name, "ecosystem": "npm"}}, timeout=5)
                if osv_resp.status_code == 200:
                    data = osv_resp.json()
                    if "vulns" in data:
                        vuln_count = len(data["vulns"])
                        scan_results["cves_found"] += vuln_count
                        scan_results["vulnerable_packages"].append({"package": pkg_name, "version": clean_version, "cves": vuln_count})
        except Exception as e:
            print(f"Error parsing dependencies: {e}")

def _scan_dockerfile(repo_full_name: str, scan_results: dict):
    raw_url = f"https://raw.githubusercontent.com/{repo_full_name}/main/Dockerfile"
    response = requests.get(raw_url, timeout=10)
    if response.status_code != 200:
        raw_url = f"https://raw.githubusercontent.com/{repo_full_name}/master/Dockerfile"
        response = requests.get(raw_url, timeout=10)
        
    if response.status_code == 200:
        content = response.text
        lines = content.split('\n')
        has_user_directive = False
        for line in lines:
            line = line.strip().upper()
            if line.startswith("USER ") and "ROOT" not in line:
                has_user_directive = True
            if line.startswith("FROM ") and "LATEST" in line:
                scan_results["docker_misconfigs"] += 1
                scan_results["docker_details"].append("Avoid using ':latest' tags in base images for deterministic builds.")
            if line.startswith("EXPOSE 22"):
                scan_results["docker_misconfigs"] += 1
                scan_results["docker_details"].append("Exposing port 22 (SSH) is a severe security risk in containers.")
        
        if not has_user_directive:
            scan_results["docker_misconfigs"] += 1
            scan_results["docker_details"].append("No USER directive found. Container defaults to running as root, which is insecure.")

def _scan_secrets(repo_full_name: str, commit_sha: str, scan_results: dict):
    # Fetch commit diff from GitHub API
    api_url = f"https://api.github.com/repos/{repo_full_name}/commits/{commit_sha}"
    # Use headers to get the diff format directly
    headers = {"Accept": "application/vnd.github.v3.diff"}
    try:
        response = requests.get(api_url, headers=headers, timeout=10)
        if response.status_code == 200:
            diff_text = response.text
            for name, pattern in SECRET_PATTERNS.items():
                matches = re.findall(pattern, diff_text)
                if matches:
                    scan_results["secrets_found"] += len(matches)
                    scan_results["secrets_details"].append(f"Found {len(matches)} potential '{name}' in commit diff.")
    except Exception as e:
        print(f"Error scanning secrets: {e}")

def _save_result(db: Session, repo_name: str, commit_sha: str, status: str, details_dict: dict):
    db_result = models.ScanResult(
        repository_name=repo_name,
        commit_sha=commit_sha,
        status=status,
        details=json.dumps(details_dict)
    )
    db.add(db_result)
    db.commit()
    print(f"Saved advanced scan result for {repo_name}: {status}")
