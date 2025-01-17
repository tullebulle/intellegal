import { LegalResource } from '../types';
import { useState } from 'react';
import ResourceModal from './ResourceModal';
import { getChatCompletion } from '../services/openai';
import { RESOURCE_ANALYSIS_PROMPT } from '../config/prompts';

interface ResourceListProps {
  resources: LegalResource[];
  selectedText?: string;
  onSelectedResourcesChange: (resources: RelevantResource[]) => void;
}

export interface RelevantResource extends LegalResource {
  reason?: string;
  isSelected?: boolean;
}

export default function ResourceList({ resources, selectedText, onSelectedResourcesChange }: ResourceListProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [relevantResources, setRelevantResources] = useState<RelevantResource[]>(resources);
  const [selectedResource, setSelectedResource] = useState<RelevantResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedResources, setSelectedResources] = useState<RelevantResource[]>([]);

  const handleAnalyze = async () => {
    setError(null); // Clear any previous errors
    console.log('Analyzing with:', { selectedText, searchQuery });
    
    if (!searchQuery.trim()) {
      console.log('Setting error: No search query');
      setError('Tekstfeltet er tomt.');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const resourcesText = resources.map(resource => 
        `Resource ID: ${resource.id}
         Law: ${resource.law_name} Chapter ${resource.chapter}-${resource.paragraph}
         Content: ${resource.content}`
      ).join('\n\n');

      const messages = [
        { role: 'system', content: RESOURCE_ANALYSIS_PROMPT },
        { 
          role: 'user', 
          content: `Query: ${searchQuery}\n\n${selectedText ? `Selected Text: ${selectedText}\n\n` : ''}Available Resources:\n${resourcesText}`
        }
      ];

      const response = await getChatCompletion(messages);
      
      try {
        const parsedResponse = JSON.parse(response);
        console.log('Parsed response:', parsedResponse);
        
        const orderedResources: RelevantResource[] = [];
        
        parsedResponse.relevantResources.forEach((relevant: { id: string, reason: string }) => {
          const resource = resources.find(r => r.id === relevant.id);
          if (resource) {
            orderedResources.push({
              ...resource,
              reason: relevant.reason
            });
          }
        });
        
        setRelevantResources(orderedResources);
        
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        console.log('Raw response:', response);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Det oppstod en feil under analysen');
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (resource: RelevantResource) => {
    const newSelectedResources = selectedResources.find(r => r.id === resource.id)
      ? selectedResources.filter(r => r.id !== resource.id)
      : [...selectedResources, resource];
    
    setSelectedResources(newSelectedResources);
    onSelectedResourcesChange(newSelectedResources);
  };

  return (
    <div style={styles.container}>
      {relevantResources.length !== resources.length && (
        <button 
          onClick={() => setRelevantResources(resources)} 
          style={styles.resetButton}
        >
          Vis alle rettskilder
        </button>
      )}
      {error && (
        <div style={styles.errorOverlay}>
          <div style={styles.errorMessage}>
            {error}
          </div>
        </div>
      )}
      <div style={styles.resourceList}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingDots}>
              <span className="bouncing-dot" style={styles.dot}>●</span>
              <span className="bouncing-dot" style={{...styles.dot, animationDelay: '0.2s'}}>●</span>
              <span className="bouncing-dot" style={{...styles.dot, animationDelay: '0.4s'}}>●</span>
            </div>
            <p style={styles.loadingText}>Analyserer relevante rettskilder...</p>
          </div>
        ) : (
          relevantResources.map((resource) => (
            <div key={resource.id} style={styles.resourceCard}>
              <div style={styles.resourceHeader}>
                <input
                  type="checkbox"
                  checked={!!selectedResources.find(r => r.id === resource.id)}
                  onChange={() => handleCheckboxChange(resource)}
                  style={styles.checkbox}
                  onClick={(e) => e.stopPropagation()}
                />
                <div 
                  style={styles.resourceContent} 
                  onClick={() => setSelectedResource(resource)}
                >
                  <h3 style={styles.resourceTitle}>
                    {resource.law_name} § {resource.chapter}-{resource.paragraph} - {resource.title}
                  </h3>
                  <div style={styles.resourceDetails}>
                    <p style={styles.preview}>{resource.content.substring(0, 100)}...</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <ResourceModal 
        resource={selectedResource} 
        onClose={() => setSelectedResource(null)}
      />
      
      <div style={styles.searchContainer}>
        <input
          type="text"
          style={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Gjør et semantisk rettskildesøk med eller uten markert tekst..."
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleAnalyze();
            }
          }}
        />
        <button 
          style={styles.searchButton}
          onClick={handleAnalyze}
          disabled={isLoading}
        >
          {isLoading ? '...' : 'Søk'}
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    width: '100%',
    height: '100%',
    margin: '0 auto',
    overflow: 'hidden',
  },
  resourceList: {
    flex: 1,
    overflowY: 'auto',
    paddingTop: '20px',
    paddingRight: '20px',
    paddingBottom: '70px',  // Increased to make room for the input area
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    backgroundColor: '#f5f5f5',
  },
  resourceCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer',
    minHeight: '100px',
    width: '100%',
  },
  resourceTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  resourceDetails: {
    fontSize: '14px',
  },
  year: {
    color: '#666',
    fontSize: '12px',
  },
  preview: {
    margin: '5px 0 0 0',
    color: '#444',
    fontSize: '14px',
  },
  searchContainer: {
    position: 'absolute',
    bottom: '-5px',
    left: 0,
    right: 0,
    padding: '5px',
    marginBottom: '5px',
    backgroundColor: 'white',
    borderTop: '1px solid #ddd',
    zIndex: 10,
    display: 'flex',
    gap: '10px',
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  searchButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: '20px',
    paddingRight: '20px',
    paddingBottom: '20px',
    paddingLeft: '20px',
  },
  loadingDots: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
  },
  dot: {
    fontSize: '24px',
    color: '#007bff',
    opacity: 0.3,
  },
  loadingText: {
    color: '#666',
    fontSize: '14px',
    margin: 0,
  },
  errorOverlay: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 1000,
    width: 'auto',
    animation: 'fadeInOut 3s ease-in-out forwards',
    opacity: 0,
  },
  errorMessage: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '10px 20px',
    borderRadius: '4px',
    fontSize: '14px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap',
  },
  resourceHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    paddingTop: '3px',
  },
  checkbox: {
    cursor: 'pointer',
    marginTop: '6px',
  },
  resourceContent: {
    flex: 1,
  },
  resetButton: {
    position: 'absolute',
    top: '10px',
    right: '20px',
    padding: '6px 12px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    zIndex: 10,
  },
}; 