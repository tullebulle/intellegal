"use client"
import { useState, useRef } from 'react';
import { mockLegalResources } from './data/mockData';
import ResourceList from './components/ResourceList';
import TextEditor, { TextEditorHandle } from './components/TextEditor';
import Chat from './components/Chat';
import Navbar from './components/Navbar';
import InputModal from './components/InputModal';
import SelectedTextBox from './components/SelectedTextBox';
import { getReformulation } from './services/openai';
import { RelevantResource } from './components/ResourceList';

export default function Home() {
  const [selectedText, setSelectedText] = useState<string>('');
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isReformulating, setIsReformulating] = useState(false);
  const editorRef = useRef<TextEditorHandle>(null);
  const [selectedLegalResources, setSelectedLegalResources] = useState<RelevantResource[]>([]);

  const handleReformulate = async () => {
    if (!selectedText) return;

    setIsReformulating(true);
    try {
      const reformulatedText = await getReformulation(selectedText);
      editorRef.current?.insertReformulatedText(selectedText, reformulatedText);
    } catch (error) {
      console.error('Failed to reformulate:', error);
    } finally {
      setIsReformulating(false);
    }
  };

  const handleInputSubmit = (text: string) => {
    console.log('Submitted text:', text);
  };

  return (
    <div style={styles.mainContainer}>
      <Navbar onOpenInput={() => setIsInputModalOpen(true)} />
      <div style={styles.container}>
        <div style={styles.leftPane}>
          <div style={styles.paneContent}>
            <div style={styles.paneHeader}>Dokument</div>
            <TextEditor 
              ref={editorRef}
              onSelectionChange={setSelectedText} 
            />
            <SelectedTextBox 
              selectedText={selectedText}
              onReformulate={handleReformulate}
              isLoading={isReformulating}
            />
          </div>
        </div>
        <div style={styles.rightPane}>
          <div style={styles.topRightPane}>
            <div style={styles.paneContent}>
              <div style={styles.paneHeader}>Rettskilder</div>
              <ResourceList 
                resources={mockLegalResources} 
                selectedText={selectedText}
                onSelectedResourcesChange={setSelectedLegalResources}
              />
            </div>
          </div>
          <div style={styles.bottomRightPane}>
            <div style={styles.paneContent}>
              <div style={styles.paneHeader}>Chat med AI</div>
                  <Chat 
                    selectedText={selectedText}
                    selectedResources={selectedLegalResources}
                  />
            </div>
          </div>
        </div>
      </div>
      <InputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSubmit={handleInputSubmit}
      />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  mainContainer: {
    display: 'flex',
    height: '100vh',
  },
  container: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },
  leftPane: {
    width: '50%',
    display: 'flex',
    backgroundColor: '#f4f4f4',
    borderRight: '1px solid #ddd',
  },
  rightPane: {
    width: '50%',
    display: 'flex',
    flexDirection: 'column',
  },
  paneContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    width: '100%',
  },
  paneHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontSize: '16px',
    flexShrink: 0,
  },
  topRightPane: {
    height: '50%',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
  },
  bottomRightPane: {
    height: '50%',
    display: 'flex',
    flexDirection: 'column',
  },
};