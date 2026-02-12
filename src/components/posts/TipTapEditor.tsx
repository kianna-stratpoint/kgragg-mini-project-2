"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Underline as UnderlineIcon } from "lucide-react";
import { useMemo } from "react";

interface TiptapEditorProps {
  content: string;
  onChange: (richText: string) => void;
}

const Toolbar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  return (
    <div className="border border-gray-200 bg-gray-50 rounded-md p-1 mb-2 flex flex-wrap gap-1 sticky top-4 z-10">
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        aria-label="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
    </div>
  );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const extensions = useMemo(() => {
    return [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "What’s your commute story today?",
        emptyEditorClass:
          "before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none h-full",
      }),
    ];
  }, []);

  const editor = useEditor({
    extensions: extensions,
    content: content,
    editorProps: {
      attributes: {
        class:
          "min-h-[60vh] text-xl lg:text-lg leading-relaxed focus:outline-none prose prose-lg prose-gray max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="w-full">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
