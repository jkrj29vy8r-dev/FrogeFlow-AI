"use client";

import {
  useEditor,
  EditorContent,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Sparkles,
  ChevronDown,
  Loader2,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildExtensions } from "./extensions";
import {
  createSlashCommandsExtension,
  type SlashItem,
  type SlashMenuState,
  type SlashCallbacks,
} from "./slash-commands";
import { useEditorAi, type AiEditAction } from "../../hooks/use-editor-ai";
import { markdownToHtml } from "@/lib/markdown";

// ── Helpers ──────────────────────────────────────────────────────────────────

// AI-generated section content is markdown (**bold**, # headings, lists);
// content already edited by hand in the rich text editor is HTML already.
// markdownToHtml tells the two apart the same way this function always has —
// real HTML starts with a tag — so existing saved documents keep working.
export function plainTextToHtml(text: string): string {
  return markdownToHtml(text);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RichTextEditorHandle {
  editor: Editor | null;
  setContent: (html: string) => void;
  getHtml: () => string;
  focus: () => void;
  undo: () => void;
  redo: () => void;
}

interface RichTextEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// ── AI ACTIONS ────────────────────────────────────────────────────────────────

const AI_ACTIONS: { action: AiEditAction; label: string }[] = [
  { action: "rewrite", label: "Rewrite" },
  { action: "improve", label: "Improve writing" },
  { action: "expand", label: "Expand" },
  { action: "shorten", label: "Shorten" },
  { action: "summarize", label: "Summarize" },
  { action: "continue", label: "Continue writing" },
  { action: "examples", label: "Generate examples" },
  { action: "faq", label: "Generate FAQs" },
  { action: "tone", label: "Change tone…" },
  { action: "translate", label: "Translate…" },
];

// ── Toolbar button ────────────────────────────────────────────────────────────

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded text-xs transition-colors",
        active
          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
          : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <span className="mx-0.5 h-4 w-px bg-[hsl(var(--border))]" />
  );
}

// ── AI panel in bubble menu ────────────────────────────────────────────────────

function AiPanel({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const { isLoading, error, runAction, cancel } = useEditorAi();
  const [preview, setPreview] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [showToneInput, setShowToneInput] = useState(false);
  const [showLangInput, setShowLangInput] = useState(false);
  const [toneValue, setToneValue] = useState("");
  const [langValue, setLangValue] = useState("");

  const getSelectedText = useCallback(() => {
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, " ");
  }, [editor]);

  const applyResult = useCallback(
    (result: string) => {
      if (!result.trim()) return;
      const { from, to } = editor.state.selection;
      const html = result
        .split(/\n{2,}/)
        .map((p) => `<p>${p.trim()}</p>`)
        .join("");
      editor.chain().focus().deleteRange({ from, to }).insertContent(html).run();
      onClose();
    },
    [editor, onClose]
  );

  const run = useCallback(
    async (
      action: AiEditAction,
      opts?: { tone?: string; language?: string }
    ) => {
      const text = getSelectedText();
      if (!text) return;
      setPreview(null);
      setPendingAction(action);
      try {
        const result = await runAction(action, text, opts);
        setPreview(result);
      } catch {
        // error shown via hook
      } finally {
        setPendingAction(null);
      }
    },
    [getSelectedText, runAction]
  );

  if (preview !== null) {
    return (
      <div className="w-72 space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-3 shadow-xl">
        <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
          AI suggestion
        </p>
        <div className="max-h-32 overflow-y-auto rounded-lg bg-[hsl(var(--muted))] p-2 text-xs leading-relaxed text-[hsl(var(--foreground))]">
          {preview}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => applyResult(preview)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
          >
            <Check className="h-3 w-3" /> Replace
          </button>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
          >
            <RotateCcw className="h-3 w-3" /> Try again
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center rounded-lg border border-[hsl(var(--border))] px-2 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  if (showToneInput) {
    return (
      <div className="w-56 space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-3 shadow-xl">
        <p className="text-xs font-medium">Change tone to…</p>
        <input
          autoFocus
          value={toneValue}
          onChange={(e) => setToneValue(e.target.value)}
          placeholder="e.g. professional, casual, formal"
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && toneValue.trim()) {
              setShowToneInput(false);
              void run("tone", { tone: toneValue.trim() });
            }
            if (e.key === "Escape") setShowToneInput(false);
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (toneValue.trim()) {
                setShowToneInput(false);
                void run("tone", { tone: toneValue.trim() });
              }
            }}
            className="flex-1 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowToneInput(false)}
            className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (showLangInput) {
    return (
      <div className="w-56 space-y-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-3 shadow-xl">
        <p className="text-xs font-medium">Translate to…</p>
        <input
          autoFocus
          value={langValue}
          onChange={(e) => setLangValue(e.target.value)}
          placeholder="e.g. Spanish, French, German"
          className="w-full rounded-lg border border-[hsl(var(--border))] bg-transparent px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && langValue.trim()) {
              setShowLangInput(false);
              void run("translate", { language: langValue.trim() });
            }
            if (e.key === "Escape") setShowLangInput(false);
          }}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (langValue.trim()) {
                setShowLangInput(false);
                void run("translate", { language: langValue.trim() });
              }
            }}
            className="flex-1 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90"
          >
            Translate
          </button>
          <button
            type="button"
            onClick={() => setShowLangInput(false)}
            className="rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-52 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] py-1 shadow-xl">
      {isLoading ? (
        <div className="flex items-center gap-2 px-3 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(var(--primary))]" />
          <span>
            {pendingAction
              ? `${pendingAction.charAt(0).toUpperCase() + pendingAction.slice(1)}ing…`
              : "Thinking…"}
          </span>
          <button
            type="button"
            onClick={cancel}
            className="ml-auto text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <>
          {error && (
            <p className="px-3 py-1.5 text-[10px] text-[hsl(var(--destructive))]">
              {error}
            </p>
          )}
          {AI_ACTIONS.map(({ action, label }) => (
            <button
              key={action}
              type="button"
              onClick={() => {
                if (action === "tone") {
                  setShowToneInput(true);
                } else if (action === "translate") {
                  setShowLangInput(true);
                } else {
                  void run(action);
                }
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
            >
              {label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// ── Slash command menu ────────────────────────────────────────────────────────

function SlashCommandMenu({
  state,
  selectedIndex,
  onSelect,
  onHoverIndex,
}: {
  state: SlashMenuState;
  selectedIndex: number;
  onSelect: (item: SlashItem) => void;
  onHoverIndex: (i: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (state.items.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="z-50 max-h-64 w-60 overflow-y-auto rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] py-1 shadow-xl"
    >
      <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
        Blocks
      </p>
      {state.items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          data-index={i}
          onClick={() => onSelect(item)}
          className={cn(
            "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
            i === selectedIndex
              ? "bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]"
              : "text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))]"
          )}
          onMouseEnter={() => onHoverIndex(i)}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] font-mono text-[10px] font-bold text-[hsl(var(--primary))]">
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium">{item.title}</p>
            <p className="truncate text-[10px] text-[hsl(var(--muted-foreground))]">
              {item.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Rich Text Editor ──────────────────────────────────────────────────────────

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  { initialContent, onChange, placeholder, disabled = false, className },
  ref
) {
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);

  // Stable ref holding the latest callbacks — updated after every render
  const callbacksRef = useRef<SlashCallbacks | null>(null);

  useLayoutEffect(() => {
    callbacksRef.current = {
      onShow: (state: SlashMenuState) => {
        setSlashMenu(state);
        setSlashSelectedIndex(0);
      },
      onHide: () => {
        setSlashMenu(null);
        setSlashSelectedIndex(0);
      },
      onKeyDown: (event: KeyboardEvent): boolean => {
        if (!slashMenu) return false;
        const total = slashMenu.items.length;
        if (event.key === "ArrowDown") {
          setSlashSelectedIndex((i) => (i + 1) % total);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSlashSelectedIndex((i) => (i - 1 + total) % total);
          return true;
        }
        if (event.key === "Enter" || event.key === "Tab") {
          const item = slashMenu.items[slashSelectedIndex];
          if (item) {
            slashMenu.command(item);
            setSlashMenu(null);
          }
          return true;
        }
        if (event.key === "Escape") {
          setSlashMenu(null);
          return true;
        }
        return false;
      },
    };
  });

  // Extensions created once — callbacksRef is a stable object, safe to capture
  const extensions = useMemo(
    () => [
      ...buildExtensions(placeholder),
      // eslint-disable-next-line react-hooks/refs
      createSlashCommandsExtension(callbacksRef as React.RefObject<SlashCallbacks>),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const html = plainTextToHtml(initialContent);

  const editor = useEditor({
    extensions,
    content: html,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  useImperativeHandle(ref, () => ({
    editor: editor ?? null,
    setContent(newHtml: string) {
      editor?.commands.setContent(plainTextToHtml(newHtml));
    },
    getHtml() {
      return editor?.getHTML() ?? "";
    },
    focus() {
      editor?.commands.focus();
    },
    undo() {
      editor?.commands.undo();
    },
    redo() {
      editor?.commands.redo();
    },
  }));

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor?.isActive("bold") ?? false,
      isItalic: ctx.editor?.isActive("italic") ?? false,
      isUnderline: ctx.editor?.isActive("underline") ?? false,
      isStrike: ctx.editor?.isActive("strike") ?? false,
      isHighlight: ctx.editor?.isActive("highlight") ?? false,
      isCode: ctx.editor?.isActive("code") ?? false,
      isBulletList: ctx.editor?.isActive("bulletList") ?? false,
      isOrderedList: ctx.editor?.isActive("orderedList") ?? false,
      isTaskList: ctx.editor?.isActive("taskList") ?? false,
      isBlockquote: ctx.editor?.isActive("blockquote") ?? false,
      isH1: ctx.editor?.isActive("heading", { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive("heading", { level: 2 }) ?? false,
      isH3: ctx.editor?.isActive("heading", { level: 3 }) ?? false,
      isAlignLeft: ctx.editor?.isActive({ textAlign: "left" }) ?? false,
      isAlignCenter: ctx.editor?.isActive({ textAlign: "center" }) ?? false,
      isAlignRight: ctx.editor?.isActive({ textAlign: "right" }) ?? false,
    }),
  });

  const addLink = useCallback(() => {
    const url = window.prompt("Enter URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className={cn("relative", className)}>
      {/* Floating format + AI bubble menu */}
      <BubbleMenu
        editor={editor}
        className="flex items-center gap-0.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-1.5 shadow-lg"
        shouldShow={({ from, to }) => from !== to && !disabled}
      >
        {showAiPanel ? (
          <AiPanel editor={editor} onClose={() => setShowAiPanel(false)} />
        ) : (
          <>
            {/* AI button */}
            <button
              type="button"
              onClick={() => setShowAiPanel(true)}
              title="AI actions"
              className="flex h-7 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-violet-500 px-2 text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-3 w-3" />
              AI
              <ChevronDown className="h-3 w-3" />
            </button>

            <ToolbarDivider />

            {/* Headings */}
            <ToolbarButton
              title="Heading 1"
              active={editorState?.isH1}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              title="Heading 2"
              active={editorState?.isH2}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              title="Heading 3"
              active={editorState?.isH3}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            >
              H3
            </ToolbarButton>

            <ToolbarDivider />

            {/* Inline formatting */}
            <ToolbarButton
              title="Bold (⌘B)"
              active={editorState?.isBold}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Italic (⌘I)"
              active={editorState?.isItalic}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Underline (⌘U)"
              active={editorState?.isUnderline}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Strikethrough"
              active={editorState?.isStrike}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Highlight"
              active={editorState?.isHighlight}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Inline code"
              active={editorState?.isCode}
              onClick={() => editor.chain().focus().toggleCode().run()}
            >
              <Code2 className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton title="Link" onClick={addLink}>
              <Link2 className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Alignment */}
            <ToolbarButton
              title="Align left"
              active={editorState?.isAlignLeft}
              onClick={() =>
                editor.chain().focus().setTextAlign("left").run()
              }
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Align center"
              active={editorState?.isAlignCenter}
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Align right"
              active={editorState?.isAlignRight}
              onClick={() =>
                editor.chain().focus().setTextAlign("right").run()
              }
            >
              <AlignRight className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Block formatting */}
            <ToolbarButton
              title="Bullet list"
              active={editorState?.isBulletList}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Numbered list"
              active={editorState?.isOrderedList}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Checklist"
              active={editorState?.isTaskList}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <CheckSquare className="h-3.5 w-3.5" />
            </ToolbarButton>
            <ToolbarButton
              title="Blockquote"
              active={editorState?.isBlockquote}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <Quote className="h-3.5 w-3.5" />
            </ToolbarButton>
          </>
        )}
      </BubbleMenu>

      {/* Slash command menu — fixed positioned using viewport coords from extension */}
      {slashMenu && slashMenu.items.length > 0 && (
        <div
          className="fixed z-50"
          style={{ top: slashMenu.top, left: slashMenu.left }}
        >
          <SlashCommandMenu
            state={slashMenu}
            selectedIndex={slashSelectedIndex}
            onSelect={(item) => {
              slashMenu.command(item);
              setSlashMenu(null);
            }}
            onHoverIndex={setSlashSelectedIndex}
          />
        </div>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose-editor min-h-[200px] focus:outline-none"
      />
    </div>
  );
});
