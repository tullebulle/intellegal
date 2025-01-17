import { useEffect } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export default function InputModal({ isOpen, onClose, onSubmit }: InputModalProps) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Add event listener when modal is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const text = formData.get('text') as string;
    if (text.trim()) {
      onSubmit(text);
      onClose();
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 style={styles.title}>Sett inn relevante kilder</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            name="text"
            style={styles.input}
            placeholder="Her kan du lime inn relevant innhold for saken, lokale reguleringer eller prosedyrer utenfor Lovdata, eller lignende..."
            autoFocus
          />
          <button 
            type="button" 
            style={styles.pdfButton} 
            disabled
            title="Kommer snart!"
          >
            <span style={styles.uploadIcon}>📄</span>
            Last opp PDF
          </button>
          <div style={styles.buttons}>
            <button type="button" style={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitButton}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
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
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '600px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: '200px',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
    resize: 'vertical',
    marginBottom: '20px',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelButton: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  submitButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  pdfButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5',
    border: '2px dashed #ddd',
    borderRadius: '4px',
    color: '#666',
    cursor: 'not-allowed',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  uploadIcon: {
    fontSize: '18px',
  },
}; 