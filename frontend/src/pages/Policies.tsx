import React, { useEffect, useState } from 'react';
import { Plus, FileText, Trash2, X } from 'lucide-react';

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
  const [showModal, setShowModal] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ name: '', description: '', rego_code: '' });

  const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const baseUrl = rawUrl.replace(/\/+$/, '');

  const fetchPolicies = () => {
    setLoading(true);
    fetch(`${baseUrl}/policies/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
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

  const handleDelete = (id: number) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    
    fetch(`${baseUrl}/policies/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => {
      if (res.ok) fetchPolicies();
      else alert("Failed to delete policy or insufficient permissions.");
    })
    .catch(err => console.error("Error deleting policy", err));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${baseUrl}/policies/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...newPolicy,
        is_active: true
      })
    })
    .then(res => {
      if (res.ok) {
        setShowModal(false);
        setNewPolicy({ name: '', description: '', rego_code: '' });
        fetchPolicies();
      } else {
        alert("Failed to create policy. Only admins/auditors can create policies.");
      }
    })
    .catch(err => console.error("Error creating policy", err));
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Security Policies</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage OPA Rego rules and compliance policies.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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
                      <button 
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem', background: 'transparent' }}
                        onClick={() => handleDelete(policy.id)}
                      >
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

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, 
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="glass-panel" style={{ width: '500px', maxWidth: '90%', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>Create New Policy</h2>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Policy Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newPolicy.name} 
                  onChange={e => setNewPolicy({...newPolicy, name: e.target.value})} 
                  required 
                  placeholder="e.g. Require HTTPS"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Description</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newPolicy.description} 
                  onChange={e => setNewPolicy({...newPolicy, description: e.target.value})} 
                  required 
                  placeholder="e.g. Enforces that all endpoints use TLS."
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rego Code</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={newPolicy.rego_code} 
                  onChange={e => setNewPolicy({...newPolicy, rego_code: e.target.value})} 
                  required
                  placeholder="package deployguard&#10;&#10;deny[msg] {&#10;  not input.tls_enabled&#10;  msg := &#34;TLS must be enabled&#34;&#10;}"
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Policy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Policies;
