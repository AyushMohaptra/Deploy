import React from 'react';
import { Shield, Lock, FileCheck, Server } from 'lucide-react';

const TrustCenter: React.FC = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Trust Center</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          Discover how DeployGuard protects your deployment pipelines using enterprise-grade security architecture, compliance enforcement, and robust cryptography.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* Compliance */}
        <div className="glass-panel stagger-1" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
              <FileCheck size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>SOC 2 Compliance</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Our infrastructure is designed to align with SOC 2 Type II principles. We enforce strict access controls, maintain detailed audit logs for every policy evaluation, and ensure zero-trust pipeline executions.
          </p>
        </div>

        {/* Authentication */}
        <div className="glass-panel stagger-2" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
              <Lock size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Identity & RBAC</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            DeployGuard uses highly secure JSON Web Tokens (JWT) signed with HS256 for session management. Role-Based Access Control (RBAC) ensures only authorized auditors can modify critical security policies.
          </p>
        </div>

        {/* Encryption */}
        <div className="glass-panel stagger-3" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
              <Shield size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Data Encryption</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            All data at rest is encrypted using AES-256 by our cloud database providers (Supabase). Data in transit is strictly protected via TLS 1.3 to prevent any man-in-the-middle attacks during webhook transmissions.
          </p>
        </div>

        {/* Infrastructure */}
        <div className="glass-panel stagger-4" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '12px' }}>
              <Server size={28} color="var(--accent-primary)" />
            </div>
            <h2 style={{ fontSize: '1.25rem' }}>Sandboxed Scanners</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Our security scanners execute in isolated, ephemeral environments. OSV Vulnerability checks and regex-based Secret Detection run asynchronously without exposing your source code to external risks.
          </p>
        </div>

      </div>
    </div>
  );
};

export default TrustCenter;
