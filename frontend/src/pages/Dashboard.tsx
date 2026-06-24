import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface ScanResult {
  id: number;
  repository_name: string;
  commit_sha: string;
  status: string;
  details: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, use an API layer. For demo, fetch directly.
    const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const baseUrl = rawUrl.replace(/\/+$/, '');
    fetch(`${baseUrl}/webhooks/scans`)
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setScans(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch scans", err);
        setLoading(false);
      });
  }, []);

  const totalScans = scans.length;
  const passedScans = scans.filter(s => s.status === 'passed').length;
  const failedScans = totalScans - passedScans;
  const complianceRate = totalScans ? Math.round((passedScans / totalScans) * 100) : 0;

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Security Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Real-time DevSecOps policy enforcement metrics.</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          <Activity size={18} style={{ marginRight: '0.5rem' }} /> Refresh Data
        </button>
      </div>

      <div className="dashboard-grid stagger-1">
        <div className="glass-panel stat-card">
          <div className="stat-icon">
            <ShieldAlert size={24} />
          </div>
          <div className="stat-content">
            <h3>Compliance Rate</h3>
            <div className="value">{complianceRate}%</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Passed Deployments</h3>
            <div className="value">{passedScans}</div>
          </div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>Blocked Deployments</h3>
            <div className="value">{failedScans}</div>
          </div>
        </div>
      </div>

      <div className="glass-panel animate-fade-in stagger-2" style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recent CI/CD Scans</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Repository</th>
                <th>Commit SHA</th>
                <th>Findings</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading data...</td></tr>
              ) : scans.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No recent deployments found.</td></tr>
              ) : (
                scans.map(scan => {
                  const details = JSON.parse(scan.details || '{}');
                  return (
                    <tr key={scan.id}>
                      <td>
                        <span className={`badge ${scan.status === 'passed' ? 'badge-success' : 'badge-danger'}`}>
                          {scan.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{scan.repository_name}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {scan.commit_sha.substring(0, 7)}
                      </td>
                      <td>
                        {scan.status === 'failed' ? (
                          <span style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                            {details.vulnerabilities_found} vulnerabilities, {details.policy_violations} violations
                          </span>
                        ) : (
                          <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>Clean</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {new Date(scan.created_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
