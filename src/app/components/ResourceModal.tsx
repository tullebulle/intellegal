import { useEffect } from 'react';
import { LegalResource } from '../types';

interface ResourceModalProps {
  resource: (LegalResource & { reason?: string }) | null;
  onClose: () => void;
}

export default function ResourceModal({ resource, onClose }: ResourceModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener when modal is open
    if (resource) {
      document.addEventListener('keydown', handleEscape);
    }

    // Clean up event listener when modal closes or component unmounts
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [resource, onClose]);

  if (!resource) return null;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {resource.law_name} § {resource.chapter}-{resource.paragraph}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        {resource.reason && (
          <div style={styles.reasonContainer}>
            <div style={styles.reasonHeader}>
              <span style={styles.aiLabel}>🤖 AI-begrunnelse</span>
            </div>
            <p style={styles.reason}>{resource.reason}</p>
          </div>
        )}
        <div style={styles.modalBody}>
          <p style={styles.content}>{resource.content}</p>
          <br />
          <p style={{...styles.url, color: '#0066cc'}}>
            <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{color: '#0066cc'}}>
              {resource.url}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: '20px',
    overflowY: 'auto',
  },
  content: {
    margin: 0,
    lineHeight: '1.6',
    fontSize: '16px',
  },
  closeButton: {
    border: 'none',
    background: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0 8px',
    color: '#666',
    // '&:hover': {
    //   color: '#000',
    // },
  },
  reasonContainer: {
    padding: '10px 20px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#E6E6FA',
  },
  reason: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    fontStyle: 'italic',
  },
}; 