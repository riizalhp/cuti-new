"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Loader2,
  Upload,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Mulai tulis artikel di sini... (tekan enter untuk baris baru)",
}: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "rounded-xl border border-slate-200 dark:border-slate-800 my-4 max-h-[460px] w-auto mx-auto object-cover shadow-sm",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-orange-600 dark:text-orange-400 font-semibold underline underline-offset-2",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none min-h-[260px] px-4 py-3 focus:outline-none text-slate-800 dark:text-slate-200 leading-relaxed",
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              uploadAndInsertImage(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          if (file && file.type.startsWith("image/")) {
            uploadAndInsertImage(file);
            return true;
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHTML = editor.getHTML();
      if (content !== currentHTML) {
        // Update content if different, for async data fetch or external update
        editor.commands.setContent(content || "", { emitUpdate: false } as any);
      }
    }
  }, [content, editor]);

  const uploadAndInsertImage = async (file: File) => {
    if (!editor) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success && json.url) {
        editor
          .chain()
          .focus()
          .setImage({ src: json.url, alt: file.name.replace(/\.[^/.]+$/, "") })
          .run();
      } else {
        alert(json.message || "Gagal mengunggah gambar.");
      }
    } catch (err: any) {
      alert("Terjadi kendala saat mengunggah gambar.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAndInsertImage(file);
    }
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL Tautan:", previousUrl || "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div className="w-full h-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Memuat editor artikel...
      </div>
    );
  }

  return (
    <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* WordPress / Blogger Style Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300 select-none">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("heading", { level: 1 })
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Judul Utama (H1)"
        >
          <Heading1 size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("heading", { level: 2 })
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Subjudul (H2)"
        >
          <Heading2 size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("heading", { level: 3 })
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Sub-subjudul (H3)"
        >
          <Heading3 size={15} />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Text Style: Bold, Italic, Strikethrough, Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("bold")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Tebal (Ctrl+B)"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("italic")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Miring (Ctrl+I)"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("strike")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Coret"
        >
          <Strikethrough size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("code")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Kode / Monospace"
        >
          <Code size={15} />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("bulletList")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Daftar Bullet"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("orderedList")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Daftar Angka"
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("blockquote")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Kutipan / Quote"
        >
          <Quote size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded-lg text-xs font-bold transition hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          title="Garis Pemisah (Divider)"
        >
          <Minus size={15} />
        </button>

        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Links */}
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded-lg text-xs font-bold transition ${
            editor.isActive("link")
              ? "bg-orange-100 dark:bg-orange-950/80 text-orange-600 dark:text-orange-400"
              : "hover:bg-slate-200/70 dark:hover:bg-slate-700/60"
          }`}
          title="Tambah Tautan Link"
        >
          <LinkIcon size={15} />
        </button>
        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-1.5 rounded-lg text-xs font-bold transition text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
            title="Hapus Tautan"
          >
            <Unlink size={15} />
          </button>
        )}

        {/* Upload Image Button (Blogger / WordPress Style) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/60 border border-orange-200/60 dark:border-orange-800/60 transition cursor-pointer disabled:opacity-50"
          title="Upload & Masukkan Gambar dari Komputer"
        >
          {isUploading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <ImageIcon size={14} />
          )}
          <span>{isUploading ? "Mengunggah…" : "Sisipkan Gambar"}</span>
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-xs font-bold transition hover:bg-slate-200/70 dark:hover:bg-slate-700/60 disabled:opacity-30"
            title="Urungkan (Undo)"
          >
            <Undo size={14} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-xs font-bold transition hover:bg-slate-200/70 dark:hover:bg-slate-700/60 disabled:opacity-30"
            title="Ulangi (Redo)"
          >
            <Redo size={14} />
          </button>
        </div>
      </div>

      {/* Tiptap Editor Canvas */}
      <div className="relative">
        <EditorContent editor={editor} />
        {isUploading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-bold text-orange-600">
            <Loader2 size={16} className="animate-spin" />
            Sedang mengunggah gambar ke server...
          </div>
        )}
      </div>

      {/* Editor Footer Hint */}
      <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>💡 Tips: Anda juga bisa langsung drag-and-drop atau paste (Ctrl+V) file gambar ke editor.</span>
        <span>
          {editor.storage.characterCount?.words?.() ?? editor.getText().trim().split(/\s+/).filter(Boolean).length} kata
        </span>
      </div>
    </div>
  );
}
