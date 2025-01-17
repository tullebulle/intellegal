import Image from 'next/image';
import { useState } from 'react';
import HelpModal from './HelpModal';

interface NavbarProps {
  onOpenInput: () => void;
}

export default function Navbar({ onOpenInput }: NavbarProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <div style={styles.navbar}>
        <div style={styles.logoBackground}>
          <Image
            src="/intellegal_logo.png"
            alt="Intellegal Logo"
            width={150}
            height={40}
          />
        </div>
        <button 
          style={styles.navButton}
          onClick={onOpenInput}
          title="Last opp kilder"
        >
          <span style={styles.icon}>📤</span>
        </button>
        <button 
          onClick={() => setIsHelpOpen(true)} 
          style={styles.navButton}
        >
          <span style={styles.icon}>🗯️</span>
        </button>
        <button style={styles.navButton} title="Innstillinger (kommer snart)">
          <span style={styles.icon}>⚙️</span>
        </button>
      </div>
      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    width: '50px',
    height: '100vh',
    backgroundColor: '#8B7355',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 0 20px 0',
    gap: '20px',
  },
  logoBackground: {
    backgroundColor: '#f0f0f0',
    borderBottom: '1px solid #ddd',
    borderRight: '1px solid #ddd',
    padding: '10px 5px',
    // borderRadius: '4px',
  },
  navButton: {
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  },
  icon: {
    fontSize: '20px',
  },
}; 