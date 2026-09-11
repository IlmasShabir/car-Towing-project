import { useEffect, useRef, useState, useCallback } from 'react';
import {
  FiBold, FiItalic, FiUnderline,
  FiList, FiHash, FiLink2, FiImage, FiTable,
  FiAlignLeft, FiAlignCenter, FiAlignRight,
  FiCornerUpLeft, FiCornerUpRight,
} from 'react-icons/fi';
import { uploadBlogImage } from '../../api/blogApi';
import './RichTextEditor.css';

const exec = (cmd, val = null) => document.execCommand(cmd, false, val);

const BlockSelect = ({ onChange }) => {
  const [val, setVal] = useState('P');
  const handleChange = (e) => {
    const tag = e.target.value;
    setVal(tag);
    if (tag === 'P') {
      exec('formatBlock', 'p');
    } else {
      exec('formatBlock', tag);
    }
    onChange?.();
  };
  return (
    <select className="rte-block-select" value={val} onChange={handleChange} aria-label="Text block type">
      <option value="P">Paragraph</option>
      <option value="H1">Heading 1</option>
      <option value="H2">Heading 2</option>
      <option value="H3">Heading 3</option>
    </select>
  );
};

const RichTextEditor = ({ value = '', onChange, placeholder = 'Write your article…' }) => {
  const editorRef = useRef(null);
  const fileRef = useRef(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (editorRef.current) {
      if (value && editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
      setIsEmpty(!editorRef.current.textContent?.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = useCallback(() => {
    const html = editorRef.current?.innerHTML || '';
    const text = editorRef.current?.textContent || '';
    setIsEmpty(!text.trim());
    // Warn: if empty, set to '<p><br></p>' so the editor always has a block node.
    onChange?.(html);
  }, [onChange]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  // Ensure selection is always inside the editor before exec.
  const safeExec = (cmd, val) => {
    focusEditor();
    exec(cmd, val);
    emitChange();
  };

  const formatBold = () => safeExec('bold');
  const formatItalic = () => safeExec('italic');
  const formatUnderline = () => safeExec('underline');

  const formatUL = () => safeExec('insertUnorderedList');
  const formatOL = () => safeExec('insertOrderedList');

  const alignLeft = () => safeExec('justifyLeft');
  const alignCenter = () => safeExec('justifyCenter');
  const alignRight = () => safeExec('justifyRight');

  const undo = () => safeExec('undo');
  const redo = () => safeExec('redo');

  const insertLink = () => {
    focusEditor();
    const url = window.prompt('Link URL (https://..., /services/..., mailto:..., tel:...)');
    if (!url) return;
    const clean = url.trim();
    const safe = /^(https?:\/\/|\/|mailto:|tel:|#)/i.test(clean) ? clean : `https://${clean}`;
    safeExec('createLink', safe);
    // Set target="_blank" for external links.
    const sel = window.getSelection();
    if (sel && sel.anchorNode) {
      const anchor = sel.anchorNode.nodeType === 1
        ? sel.anchorNode.closest?.('a')
        : sel.anchorNode.parentElement?.closest?.('a');
      if (anchor) {
        if (safe.startsWith('http')) {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadBlogImage(file);
      focusEditor();
      exec('insertImage', res.url);
      emitChange();
    } catch (err) {
      window.alert('Image upload failed: ' + err.message);
    }
    e.target.value = '';
  };

  const insertImageUrl = () => {
    focusEditor();
    const url = window.prompt('Image URL');
    if (!url) return;
    safeExec('insertImage', url.trim());
  };

  const insertTable = () => {
    focusEditor();
    const rows = 3;
    const cols = 3;
    let html = '<table><thead><tr>';
    for (let c = 0; c < cols; c++) html += `<th>Header ${c + 1}</th>`;
    html += '</tr></thead><tbody>';
    for (let r = 0; r < rows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td>Cell</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    exec('insertHTML', html);
    emitChange();
  };

  const insertBlockquote = () => safeExec('formatBlock', 'blockquote');

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + B for bold (native works, but ensure emit).
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      emitChange();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      emitChange();
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      // Let native undo/redo run, then emit.
      setTimeout(emitChange, 10);
    }
  };

  const handlePaste = () => setTimeout(emitChange, 10);

  return (
    <div className="rte-wrapper">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleUploadImage}
      />

      <div className="rte-toolbar" onMouseDown={(e) => e.preventDefault()}>
        <BlockSelect onChange={emitChange} />

        <span className="rte-divider" />

        <button type="button" onClick={formatBold} title="Bold (Ctrl+B)"><FiBold /></button>
        <button type="button" onClick={formatItalic} title="Italic (Ctrl+I)"><FiItalic /></button>
        <button type="button" onClick={formatUnderline} title="Underline (Ctrl+U)"><FiUnderline /></button>

        <span className="rte-divider" />

        <button type="button" onClick={formatUL} title="Bullet list"><FiList /></button>
        <button type="button" onClick={formatOL} title="Numbered list"><FiHash /></button>

        <span className="rte-divider" />

        <button type="button" onClick={alignLeft} title="Align left"><FiAlignLeft /></button>
        <button type="button" onClick={alignCenter} title="Align center"><FiAlignCenter /></button>
        <button type="button" onClick={alignRight} title="Align right"><FiAlignRight /></button>

        <span className="rte-divider" />

        <button type="button" onClick={insertLink} title="Insert link"><FiLink2 /></button>
        <button type="button" onClick={insertImageUrl} title="Insert image by URL"><FiImage /></button>
        <button type="button" onClick={() => fileRef.current?.click()} title="Upload image">⤒</button>
        <button type="button" onClick={insertTable} title="Insert table"><FiTable /></button>
        <button type="button" onClick={insertBlockquote} title="Blockquote">❝</button>

        <span className="rte-divider" />

        <button type="button" onClick={undo} title="Undo"><FiCornerUpLeft /></button>
        <button type="button" onClick={redo} title="Redo"><FiCornerUpRight /></button>
      </div>

      <div className="rte-editor-wrap">
        {isEmpty && !value && (
          <div className="rte-placeholder">{placeholder}</div>
        )}
        <div
          ref={editorRef}
          className="rte-editor"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Article content editor"
          spellCheck
          onInput={emitChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={emitChange}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;