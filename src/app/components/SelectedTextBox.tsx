interface SelectedTextBoxProps {
  selectedText: string;
  onReformulate: () => void;
  isLoading?: boolean;
}

export default function SelectedTextBox({ 
  selectedText, 
  onReformulate, 
  isLoading = false 
}: SelectedTextBoxProps) {
  if (!selectedText) return null;

  const displayText = selectedText.length > 150 
    ? selectedText.substring(0, 150) + '...' 
    : selectedText;

  return (
    <div style={styles.container}>
      <div style={styles.textContainer}>
        {isLoading ? 'Vasker språk med såpe og vann...' : <strong>Markert tekst: </strong>}{isLoading ? '' : displayText}
      </div>
      <button 
        style={styles.button} 
        onClick={onReformulate}
        disabled={isLoading}
      >
        Språkvask
      </button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    padding: '15px',
    backgroundColor: '#f8f8f8',
    borderTop: '1px solid #ddd',
    gap: '10px',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    fontSize: '14px',
    color: '#333',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    whiteSpace: 'nowrap',
  },
}; 