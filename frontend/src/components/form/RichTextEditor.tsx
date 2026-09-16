"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { DOMParser as ProseMirrorDOMParser } from "@tiptap/pm/model";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
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
    FaTable,
    FaPlus,
    FaMinus,
    FaTrash,
    FaColumns,
    FaChevronDown,
} from "react-icons/fa";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const parseInlineMarkdown = (value: string) => {
    const codeSpans: string[] = [];
    let html = escapeHtml(value).replace(/`([^`\n]+)`/g, (_, code: string) => {
        const token = `\u0000CODE${codeSpans.length}\u0000`;
        codeSpans.push(`<code>${code}</code>`);
        return token;
    });

    html = html
        .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
        .replace(/__([^_\n]+)__/g, "<strong>$1</strong>")
        .replace(/~~([^~\n]+)~~/g, "<s>$1</s>")
        .replace(/(^|[\s(])\*([^*\n]+)\*(?=$|[\s).,!?:;])/g, "$1<em>$2</em>")
        .replace(/(^|[\s(])_([^_\n]+)_(?=$|[\s).,!?:;])/g, "$1<em>$2</em>")
        .replace(
            /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)\s]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
        );

    return html.replace(/\u0000CODE(\d+)\u0000/g, (_, index: string) => codeSpans[Number(index)]);
};

const looksLikeMarkdown = (value: string) =>
    /(^|\n)\s{0,3}(#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|>\s+|```)|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|\[[^\]]+\]\((?:https?:\/\/|\/)/m.test(
        value,
    );

const markdownToHtml = (markdown: string) => {
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    const html: string[] = [];
    let paragraph: string[] = [];
    let listTag: "ul" | "ol" | null = null;
    let listItems: string[] = [];

    const flushParagraph = () => {
        if (!paragraph.length) return;
        html.push(`<p>${parseInlineMarkdown(paragraph.join(" "))}</p>`);
        paragraph = [];
    };

    const flushList = () => {
        if (!listTag || !listItems.length) return;
        html.push(`<${listTag}>${listItems.map((item) => `<li>${item}</li>`).join("")}</${listTag}>`);
        listTag = null;
        listItems = [];
    };

    for (let index = 0; index < lines.length; index += 1) {
        const line = lines[index];
        const trimmed = line.trim();

        if (/^\s*```/.test(line)) {
            flushParagraph();
            flushList();
            const codeLines: string[] = [];
            index += 1;
            while (index < lines.length && !/^\s*```/.test(lines[index])) {
                codeLines.push(lines[index]);
                index += 1;
            }
            html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
            continue;
        }

        if (!trimmed) {
            flushParagraph();
            flushList();
            continue;
        }

        const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
        if (heading) {
            flushParagraph();
            flushList();
            const level = heading[1].length;
            html.push(`<h${level}>${parseInlineMarkdown(heading[2])}</h${level}>`);
            continue;
        }

        if (/^\s{0,3}((\*\s*){3,}|(-\s*){3,}|(_\s*){3,})$/.test(line)) {
            flushParagraph();
            flushList();
            html.push("<hr>");
            continue;
        }

        const unorderedItem = line.match(/^\s{0,3}[-*+]\s+(.+)$/);
        const orderedItem = line.match(/^\s{0,3}\d+[.)]\s+(.+)$/);
        if (unorderedItem || orderedItem) {
            flushParagraph();
            const nextTag: "ul" | "ol" = unorderedItem ? "ul" : "ol";
            if (listTag && listTag !== nextTag) flushList();
            listTag = nextTag;
            listItems.push(parseInlineMarkdown((unorderedItem || orderedItem)![1]));
            continue;
        }

        if (/^\s{0,3}>\s?/.test(line)) {
            flushParagraph();
            flushList();
            const quoteLines: string[] = [];
            while (index < lines.length && /^\s{0,3}>\s?/.test(lines[index])) {
                quoteLines.push(lines[index].replace(/^\s{0,3}>\s?/, ""));
                index += 1;
            }
            index -= 1;
            html.push(`<blockquote><p>${parseInlineMarkdown(quoteLines.join(" "))}</p></blockquote>`);
            continue;
        }

        flushList();
        paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();
    return html.join("");
};

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    disabled?: boolean;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Start writing...",
    disabled = false,
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [showTableMenu, setShowTableMenu] = useState(false);
    const tableMenuRef = useRef<HTMLDivElement>(null);
    const disabledRef = useRef(disabled);
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
            Table.configure({
                resizable: true,
                HTMLAttributes: { class: "editor-table" },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Placeholder.configure({ placeholder }),
        ],
        editorProps: {
            handlePaste: (view, event) => {
                const plainText = event.clipboardData?.getData("text/plain") || "";
                if (!plainText || !looksLikeMarkdown(plainText)) return false;

                const container = document.createElement("div");
                container.innerHTML = markdownToHtml(plainText);
                const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(container);
                view.dispatch(view.state.tr.replaceSelection(slice).scrollIntoView());
                return true;
            },
        },
        content: value || "",
        editable: !disabled,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            if (disabledRef.current) return;
            onChange(editor.getHTML());
        },
        onTransaction: () => {
            setTick((t) => t + 1);
        },
    });

    // Sync external value into editor (e.g. when loading existing data)
    useEffect(() => {
        if (!editor) return;
        const nextValue = value || "";
        const isSame = editor.getHTML() === nextValue;
        if (isSame) return;
        editor.commands.setContent(nextValue, { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => {
        disabledRef.current = disabled;
        if (!editor) return;
        editor.setEditable(!disabled);
        if (disabled) {
            setShowLinkInput(false);
            setShowTableMenu(false);
        }
    }, [editor, disabled]);

    const handleImageUpload = useCallback(async () => {
        if (disabled) return;
        fileInputRef.current?.click();
    }, [disabled]);

    const onFileSelected = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !editor || disabled) return;

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
        [editor, disabled]
    );

    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const linkInputRef = useRef<HTMLInputElement>(null);

    // Close table menu on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
                setShowTableMenu(false);
            }
        };
        if (showTableMenu) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showTableMenu]);

    const openLinkInput = useCallback(() => {
        if (!editor || disabled) return;
        // Pre-fill with existing link URL if cursor is on a link
        const existingHref = editor.getAttributes("link").href || "";
        setLinkUrl(existingHref);
        setShowLinkInput(true);
        // Focus the input after it renders
        setTimeout(() => linkInputRef.current?.focus(), 0);
    }, [editor, disabled]);

    const applyLink = useCallback(() => {
        if (!editor || disabled) return;
        if (linkUrl.trim()) {
            const href = linkUrl.trim().startsWith("http") ? linkUrl.trim() : `https://${linkUrl.trim()}`;
            editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
        }
        setShowLinkInput(false);
        setLinkUrl("");
    }, [editor, linkUrl, disabled]);

    const removeLink = useCallback(() => {
        if (!editor || disabled) return;
        editor.chain().focus().unsetLink().run();
        setShowLinkInput(false);
        setLinkUrl("");
    }, [editor, disabled]);

    if (!editor) return null;

    return (
        <div
            className={`
                flex flex-col border border-gray-300 rounded-lg overflow-hidden
                focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500 transition
                ${disabled ? "bg-gray-50 opacity-80" : "bg-white"}
                ${expanded ? "fixed inset-0 z-[100] rounded-none bg-white" : "w-full"}
            `}
        >
            {/* Toolbar */}
            <div className={`flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 ${disabled ? "pointer-events-none opacity-50" : ""}`}>
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
                <ToolbarButton onClick={handleImageUpload} disabled={disabled || uploading} title="Upload Image">
                    {uploading ? (
                        <FaSpinner size={13} className="animate-spin" />
                    ) : (
                        <FaImage size={13} />
                    )}
                </ToolbarButton>

                {/* Table dropdown */}
                <div className="relative" ref={tableMenuRef}>
                    <ToolbarButton
                        onClick={() => setShowTableMenu((v) => !v)}
                        active={editor.isActive("table") || showTableMenu}
                        title="Table"
                    >
                        <span className="flex items-center gap-0.5">
                            <FaTable size={13} />
                            <FaChevronDown size={8} />
                        </span>
                    </ToolbarButton>

                    {showTableMenu && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg py-1 min-w-[180px]">
                            {!editor.isActive("table") ? (
                                <TableMenuItem
                                    onClick={() => {
                                        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                                        setShowTableMenu(false);
                                    }}
                                    icon={<FaTable size={12} />}
                                    label="Insert Table (3×3)"
                                />
                            ) : (
                                <>
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}
                                        icon={<FaPlus size={10} />}
                                        label="Add Column After"
                                    />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().addColumnBefore().run(); setShowTableMenu(false); }}
                                        icon={<FaPlus size={10} />}
                                        label="Add Column Before"
                                    />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}
                                        icon={<FaMinus size={10} />}
                                        label="Delete Column"
                                    />
                                    <div className="h-px bg-gray-200 my-1" />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}
                                        icon={<FaPlus size={10} />}
                                        label="Add Row After"
                                    />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().addRowBefore().run(); setShowTableMenu(false); }}
                                        icon={<FaPlus size={10} />}
                                        label="Add Row Before"
                                    />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}
                                        icon={<FaMinus size={10} />}
                                        label="Delete Row"
                                    />
                                    <div className="h-px bg-gray-200 my-1" />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().mergeCells().run(); setShowTableMenu(false); }}
                                        icon={<FaColumns size={10} />}
                                        label="Merge Cells"
                                    />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().splitCell().run(); setShowTableMenu(false); }}
                                        icon={<FaColumns size={10} />}
                                        label="Split Cell"
                                    />
                                    <div className="h-px bg-gray-200 my-1" />
                                    <TableMenuItem
                                        onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
                                        icon={<FaTrash size={10} />}
                                        label="Delete Table"
                                        danger
                                    />
                                </>
                            )}
                        </div>
                    )}
                </div>

                <Divider />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={disabled || !editor.can().undo()}
                    title="Undo"
                >
                    <FaUndo size={12} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={disabled || !editor.can().redo()}
                    title="Redo"
                >
                    <FaRedo size={12} />
                </ToolbarButton>

                {/* Spacer to push expand button to the right */}
                <div className="flex-1" />

                <ToolbarButton
                    onClick={() => setExpanded((prev) => !prev)}
                    disabled={disabled}
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
                } ${disabled ? "cursor-not-allowed bg-gray-50" : ""}`}
            />

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={disabled}
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
                    margin: 0.75rem 0;
                    line-height: 1.7;
                }
                .rich-text-editor-content .tiptap h4 {
                    font-size: 1.05rem;
                    font-weight: 600;
                    margin: 0.75rem 0 0.35rem;
                }
                .rich-text-editor-content .tiptap h5 {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0.65rem 0 0.3rem;
                }
                .rich-text-editor-content .tiptap h6 {
                    font-size: 0.9rem;
                    font-weight: 600;
                    letter-spacing: 0.025em;
                    margin: 0.6rem 0 0.25rem;
                    text-transform: uppercase;
                }
                /* Table styles */
                .rich-text-editor-content .tiptap table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 0.75rem 0;
                    overflow: hidden;
                }
                .rich-text-editor-content .tiptap table td,
                .rich-text-editor-content .tiptap table th {
                    border: 1px solid #d1d5db;
                    padding: 0.5rem 0.75rem;
                    vertical-align: top;
                    position: relative;
                    min-width: 80px;
                }
                .rich-text-editor-content .tiptap table th {
                    background-color: #f3f4f6;
                    font-weight: 600;
                    text-align: left;
                }
                .rich-text-editor-content .tiptap table td.selectedCell,
                .rich-text-editor-content .tiptap table th.selectedCell {
                    background-color: #dbeafe;
                    border-color: #93c5fd;
                }
                .rich-text-editor-content .tiptap .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background-color: #3b82f6;
                    cursor: col-resize;
                }
                .rich-text-editor-content .tiptap .tableWrapper {
                    overflow-x: auto;
                    margin: 0.5rem 0;
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

function TableMenuItem({
    onClick,
    icon,
    label,
    danger = false,
}: {
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left transition-colors
                ${danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"}
            `}
        >
            {icon}
            {label}
        </button>
    );
}
