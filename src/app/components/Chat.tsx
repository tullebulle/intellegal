import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { getChatCompletion } from '../services/openai';
import { CHAT_PROMPT } from '../config/prompts';

interface ChatProps {
  selectedText?: string;
}

export default function Chat({ selectedText }: ChatProps) {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  // Scroll when chat history changes
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // useEffect(() => {
  //   if (selectedText) {
  //     setChatHistory(prev => [...prev, {
  //       id: Date.now().toString(),
  //       role: 'system',
  //       content: `Bruker har markert følgende tekst: "${selectedText}"`
  //     }]);
  //   }
  // }, [selectedText]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage
    };

    setChatHistory(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Include system prompt and selected text in the context
      const messages = [
        { role: 'system', content: CHAT_PROMPT },
        ...(selectedText ? [{ role: 'system', content: `Markert tekst: "${selectedText}"` }] : []),
        ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user', content: inputMessage }
      ];

      const response = await getChatCompletion(messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };

      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Beklager, det oppstod en feil ved behandling av forespørselen.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div ref={chatWindowRef} style={styles.chatWindow}>
        {chatHistory.length === 0 ? (
          <p style={styles.chatPlaceholder}>
          {selectedText 
            ? `Selected text: "${selectedText}"`
            : "Need help? Chat with our AI, that can answer any of your questions, or review your document."}
        </p>
        ) : (
          chatHistory.map(message => (
            <div
              key={message.id}
              style={{
                ...styles.message,
                ...(message.role === 'assistant' ? styles.assistantMessage : styles.userMessage)
              }}
            >
              {message.content}
            </div>
          ))
        )}
        {isLoading && <div style={styles.loading}>AI is thinking...</div>}
      </div>
      <div style={styles.chatInputContainer}>
        <input
          type="text"
          style={styles.chatInput}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button 
          style={styles.chatButton}
          onClick={handleSendMessage}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
  },
  chatWindow: {
    height: 'calc(100% - 20px)',
    overflowY: 'auto',
    padding: '20px',
    paddingBottom: '80px',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  message: {
    padding: '10px 15px',
    marginBottom: '10px',
    borderRadius: '8px',
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#007bff',
    color: 'white',
    marginLeft: 'auto',
  },
  assistantMessage: {
    backgroundColor: '#f0f0f0',
    color: 'black',
    marginRight: 'auto',
  },
  loading: {
    padding: '10px',
    color: '#666',
    fontStyle: 'italic',
  },
  chatPlaceholder: {
    color: '#666',
    fontSize: '14px',
    textAlign: 'center',
  },
  chatInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '5px',
    borderTop: '1px solid #ddd',
    backgroundColor: 'white',
    gap: '10px',
    display: 'flex',
    zIndex: 10,
  },
  chatInput: {
    flex: 1,
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '14px',
  },
  chatButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
}; 