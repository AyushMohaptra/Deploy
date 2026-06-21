import React, { useEffect, useState } from 'react';
import { Plus, FileText, Trash2 } from 'lucide-react';

interface Policy {
  id: number;
  name: string;
  description: string;
  rego_code: string;
  is_active: boolean;
  created_at: string;
}

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPolicies = () => {
    setLoading(true);
    fetch('http://localhost:8000/policies/')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setPolicies(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch policies", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Security Policies</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage OPA Rego rules and compliance policies.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create Policy
        </button>
      </div>

      <div className="glass-panel stagger-1">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Policy Name</th>
                <th>Description</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Loading policies...</td></tr>
              ) : policies.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No policies defined. Click "Create Policy" to add one.</td></tr>
              ) : (
                policies.map(policy => (
                  <tr key={policy.id}>
                    <td>
                      <span className={`badge ${policy.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {policy.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} color="var(--accent-primary)" />
                      {policy.name}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{policy.description}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {new Date(policy.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-danger" style={{ padding: '0.4rem', background: 'transparent' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Policies;
