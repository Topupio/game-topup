"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { clientApi } from "@/lib/http/index";
import { endpoints } from "@/config/api";
import { toast } from "react-toastify";
import {
    FaBold,
    FaItalic,
    FaUnderline,
    FaListUl,
    FaListOl,
    FaQuoteLeft,
    FaImage,
    FaLink,
    FaUnlink,
    FaUndo,
    FaRedo,
    FaSpinner,
    FaCheck,
    FaTimes,
    FaAlignLeft,
    FaAlignCenter,
    FaAlignRight,
    FaAlignJustify,
    FaExpand,
    FaCompress,
} from "react-icons/fa";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Start writing...",
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    // Force re-render on editor transactions so toolbar active states stay in sync
    const [, setTick] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-blue-600 underline" },
            }),
            Image.configure({
                inline: false,
                HTMLAttributes: { class: "rounded-sm max-w-full h-auto" },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: value || "",
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onTransaction: () => {
            setTick((t) => t + 1);
        },
    });

    // Sync external value into editor (e.g. when loading existing data)
    useEffect(() => {
        if (!editor || !value) return;
        const isSame = editor.getHTML() === value;
        if (isSame) return;
        editor.commands.setContent(value, false);
    }, [editor, value]);

    const handleImageUpload = useCallback(async () => {
        fileInputRef.current?.click();
    }, []);

    const onFileSelected = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor) return;

            const fd = new FormData();
            fd.append("image", file);

            setUploading(true);
            try {
                const { data } = await clientApi.post(endpoints.upload.image, fd, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                if (data.success && data.data?.url) {
                    editor.chain().focus().setImage({ src: data.data.url }).run();
                }
            } catch (err) {
                console.error("Image upload failed:", err);
                toast.error("Image upload failed. Please try again.");
            } finally {
                setUploading(false);
            }

            // Reset so same file can be re-selected
            e.target.value = "";
        },
        [editor]
    );

    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const linkInputRef = useRef<HTMLInputElement>(null);

    const openLinkInput = useCallback(() => {
        if (!editor) return;
        // Pre-fill with existing link URL if cursor is on a link
        const existingHref = editor.getAttributes("link").href || "";
        setLinkUrl(existingHref);
        setShowLinkInput(true);
        // Focus the input after it renders
        setTimeout(() => linkInputRef.current?.focus(), 0);
    }, [editor]);

    const applyLink = useCallback(() => {
        if (!editor) return;
        if (linkUrl.trim()) {
            const href = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }
        setShowLinkInput(false);
        setLinkUrl("");
    }, [editor, linkUrl]);

    const removeLink = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().unsetLink().run();
        setShowLinkInput(false);
        setLinkUrl("");
    }, [editor]);

    if (!editor) return null;

    return (
        <div
            className={`
                flex flex-col border border-gray-300 rounded-lg overflow-hidden
                focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500 transition
                ${expanded ? "fixed inset-0 z-[100] rounded-none bg-white" : "w-full"}
            `}
        >
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="Bold"
                >
                    <FaBold size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="Italic"
                >
                    <FaItalic size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Underline"
                >
                    <FaUnderline size={13} />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                    }
                    active={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <span className="text-xs font-bold">H1</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                    active={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <span className="text-xs font-bold">H2</span>
                </ToolbarButton>
                <ToolbarButton
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                    active={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    <span className="text-xs font-bold">H3</span>
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    active={editor.isActive({ textAlign: "left" })}
                    title="Align Left"
                >
                    <FaAlignLeft size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    active={editor.isActive({ textAlign: "center" })}
                    title="Align Center"
                >
                    <FaAlignCenter size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    active={editor.isActive({ textAlign: "right" })}
                    title="Align Right"
                >
                    <FaAlignRight size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    active={editor.isActive({ textAlign: "justify" })}
                    title="Justify"
                >
                    <FaAlignJustify size={13} />
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <FaListUl size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Ordered List"
                >
                    <FaListOl size={13} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive("blockquote")}
                    title="Blockquote"
                >
                    <FaQuoteLeft size={13} />
                </ToolbarButton>

                <Divider />

                <div className="relative">
                    <ToolbarButton
                        onClick={openLinkInput}
                        active={editor.isActive("link") || showLinkInput}
                        title="Add Link"
                    >
                        <FaLink size={13} />
                    </ToolbarButton>

                    {showLinkInput && (
                        <div className="absolute top-full left-0 mt-1 z-50 flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg shadow-lg px-2 py-1.5 min-w-[280px]">
                            <input
                                ref={linkInputRef}
                                type="url"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        applyLink();
                                    }
                                    if (e.key === "Escape") {
                                        setShowLinkInput(false);
                                        setLinkUrl("");
                                        editor.commands.focus();
                                    }
                                }}
                                placeholder="https://example.com"
                                className="flex-1 text-xs px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-400"
                            />
                            <button
                                type="button"
                                onClick={applyLink}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                title="Apply link"
                            >
                                <FaCheck size={11} />
                            </button>
                            {editor.isActive("link") && (
                                <button
                                    type="button"
                                    onClick={removeLink}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Remove link"
                                >
                                    <FaUnlink size={11} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLinkInput(false);
                                    setLinkUrl("");
                                    editor.commands.focus();
                                }}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                title="Cancel"
                            >
                                <FaTimes size={11} />
                            </button>
                        </div>
                    )}
                </div>
                <ToolbarButton onClick={handleImageUpload} disabled={uploading} title="Upload Image">
                    {uploading ? (
                        <FaSpinner size={13} className="animate-spin" />
                    ) : (
                        <FaImage size={13} />
                    )}
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <FaUndo size={12} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <FaRedo size={12} />
                </ToolbarButton>

                {/* Spacer to push expand button to the right */}
                <div className="flex-1" />

                <ToolbarButton
                    onClick={() => setExpanded((prev) => !prev)}
                    title={expanded ? "Exit full width" : "Full width"}
                >
                    {expanded ? <FaCompress size={13} /> : <FaExpand size={13} />}
                </ToolbarButton>
            </div>

            {/* Upload indicator */}
            {uploading && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border-b border-blue-200 text-xs text-blue-700">
                    <FaSpinner size={11} className="animate-spin" />
                    <span>Uploading image...</span>
                </div>
            )}

            {/* Editor */}
            <EditorContent
                editor={editor}
                className={`rich-text-editor-content px-3 py-2 text-sm focus:outline-none overflow-y-auto ${
                    expanded ? "flex-1" : "min-h-[200px]"
                }`}
            />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelected}
            />

            {/* Scoped styles for the editor content */}
            <style jsx global>{`
                .rich-text-editor-content .tiptap {
                    outline: none;
                    min-height: 180px;
                }
                .rich-text-editor-content .tiptap p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .rich-text-editor-content .tiptap h1 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin: 1rem 0 0.5rem;
                }
                .rich-text-editor-content .tiptap h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0.75rem 0 0.5rem;
                }
                .rich-text-editor-content .tiptap h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0.5rem 0 0.25rem;
                }
                .rich-text-editor-content .tiptap ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .rich-text-editor-content .tiptap ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }
                .rich-text-editor-content .tiptap li {
                    margin: 0.15rem 0;
                }
                .rich-text-editor-content .tiptap blockquote {
                    border-left: 3px solid #d1d5db;
                    padding-left: 1rem;
                    margin: 0.5rem 0;
                    color: #6b7280;
                }
                .rich-text-editor-content .tiptap img {
                    max-width: 320px;
                    max-height: 240px;
                    width: auto;
                    height: auto;
                    object-fit: contain;
                    border-radius: 0.5rem;
                    margin: 0.5rem 0;
                }
                .rich-text-editor-content .tiptap a {
                    color: #2563eb;
                    text-decoration: underline;
                }
                .rich-text-editor-content .tiptap p {
                    margin: 0.25rem 0;
                }
            `}</style>
        </div>
    );
}

function ToolbarButton({
    children,
    onClick,
    active = false,
    disabled = false,
    title,
}: {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`
                p-1.5 rounded transition-colors
                ${active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}
                ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
            `}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <div className="w-px h-5 bg-gray-300 mx-1" />;
}
