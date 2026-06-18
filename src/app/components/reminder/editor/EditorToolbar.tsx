'use client';

import { Editor } from '@tiptap/react';

import {
  BoldIcon,
  ItalicIcon,
  ListBulletIcon,
  NumberedListIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface Props {
  editor: Editor;
}

export default function EditorToolbar({ editor }: Props) {
  const addLink = () => {
    const url = window.prompt('Enter URL');

    if (!url) return;

    editor
      .chain()
      .focus()
      .setLink({ href: url })
      .run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 p-2">

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className="rounded p-2 hover:bg-gray-200"
      >
        <BoldIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className="rounded p-2 hover:bg-gray-200"
      >
        <ItalicIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className="rounded p-2 hover:bg-gray-200"
      >
        U
      </button>

      <button
        type="button"
        onClick={addLink}
        className="rounded p-2 hover:bg-gray-200"
      >
        <LinkIcon className="h-5 w-5" />
      </button>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleBulletList().run()
        }
        className="rounded p-2 hover:bg-gray-200"
      >
        <ListBulletIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleOrderedList().run()
        }
        className="rounded p-2 hover:bg-gray-200"
      >
        <NumberedListIcon className="h-5 w-5" />
      </button>

      <div className="mx-2 h-6 w-px bg-gray-300" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="rounded p-2 hover:bg-gray-200"
      >
        <ArrowUturnLeftIcon className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="rounded p-2 hover:bg-gray-200"
      >
        <ArrowUturnRightIcon className="h-5 w-5" />
      </button>
    </div>
  );
}