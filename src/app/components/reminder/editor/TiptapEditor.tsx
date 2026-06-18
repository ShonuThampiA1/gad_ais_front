'use client';

import { useEditor, EditorContent } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';

import EditorToolbar from './EditorToolbar';
import { useEffect } from 'react';

interface Props {
  initialContent?: string;
  onChange?: (html: string) => void;
}

export default function TiptapEditor({
  initialContent = '',
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,

      Underline,

      Link.configure({
        openOnClick: false,
      }),

      Placeholder.configure({
        placeholder: 'Compose your message...',
      }),

      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],

    content: initialContent,

    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });
  
  useEffect(() => {
    if (editor && initialContent !== editor.getHTML()) {
        editor.commands.setContent(initialContent);
    }
 }, [initialContent, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border bg-white">

      <EditorToolbar editor={editor} />

      <EditorContent
        editor={editor}
        className="min-h-[300px] p-4"
      />
    </div>
  );
}