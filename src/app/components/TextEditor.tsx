import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface TextEditorHandle {
  insertReformulatedText: (oldText: string, newText: string) => void;
}

interface TextEditorProps {
  onSelectionChange: (selectedText: string) => void;
  ref?: React.RefObject<TextEditorHandle>;
}

const BlurHighlight = Extension.create({
  name: 'blurHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blurHighlight'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, old) {
            const { selection } = tr;
            const hasSelection = selection.from !== selection.to;
            const action = tr.getMeta('blurHighlight');

            if (!hasSelection || action === 'focus') {
              return DecorationSet.empty;
            }

            if (hasSelection && action === 'blur') {
              const decoration = Decoration.inline(selection.from, selection.to, {
                class: 'blur-highlight',
              });
              return DecorationSet.create(tr.doc, [decoration]);
            }

            return old;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleDOMEvents: {
            blur: (view) => {
              view.dispatch(view.state.tr.setMeta('blurHighlight', 'blur'));
              return false;
            },
            focus: (view) => {
              view.dispatch(view.state.tr.setMeta('blurHighlight', 'focus'));
              return false;
            },
          },
        },
      }),
    ];
  },
});

export const TextEditor = forwardRef<TextEditorHandle, TextEditorProps>(
  ({ onSelectionChange }, ref) => {
    const [lastSelection, setLastSelection] = useState<{from: number, to: number} | null>(null);

    const editor = useEditor({
      extensions: [
        StarterKit,
        Underline,
        BlurHighlight,
      ],
      content: '',
      editorProps: {
        attributes: {
          class: 'persistent-selection',
        },
      },
      onSelectionUpdate: ({ editor }) => {
        const selection = editor.state.selection;
        const selectedText = selection.empty 
          ? '' 
          : editor.state.doc.textBetween(selection.from, selection.to);
        
        if (!selection.empty) {
          setLastSelection({ from: selection.from, to: selection.to });
          onSelectionChange(selectedText);
        } else {
          onSelectionChange('');
        }
      },
    });

    const handleContainerClick = () => {
      editor?.chain().focus().run();
    };

    useImperativeHandle(ref, () => ({
      insertReformulatedText: (oldText: string, newText: string) => {
        if (!editor || !lastSelection) return;
        
        editor.chain()
          .focus()
          .setTextSelection(lastSelection.to)
          .insertContent(`<br><br>${newText}`)
          .run();
      }
    }));

    const additionalStyles = `
      .persistent-selection ::selection {
        background: rgba(0, 123, 255, 0.3);
      }
      .persistent-selection :not(:focus) ::selection {
        background: rgba(0, 123, 255, 0.15);
      }
      .blur-highlight {
        background-color: rgba(0, 123, 255, 0.2);
      }
    `;

    return (
      <div style={styles.container} onClick={handleContainerClick}>
        <style>{`
          .blur-highlight {
            background-color: rgba(0, 123, 255, 0.2);
          }
          .ProseMirror ::selection {
            background-color: rgba(0, 123, 255, 0.4) !important;
          }
        `}</style>
        <div style={styles.toolbar}>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            style={{
              ...styles.toolbarButton,
              backgroundColor: editor?.isActive('bold') ? '#666666' : 'transparent',
            }}
          >
            B
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            style={{
              ...styles.toolbarButton,
              backgroundColor: editor?.isActive('italic') ? '#666666' : 'transparent',
            }}
          >
            I
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            style={{
              ...styles.toolbarButton,
              backgroundColor: editor?.isActive('underline') ? '#666666' : 'transparent',
            }}
          >
            U
          </button>
        </div>
        <EditorContent editor={editor} style={styles.editor} />
      </div>
    );
  }
);

export default TextEditor;

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  toolbar: {
    display: 'flex',
    gap: '5px',
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
  toolbarButton: {
    padding: '5px 10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  editor: {
    flex: 1,
    overflowY: 'auto',
    cursor: 'text',
    padding: '10px',
  },
}; 