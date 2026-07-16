import { Extension } from "@tiptap/core";
import { Suggestion, type SuggestionProps, type SuggestionOptions } from "@tiptap/suggestion";
import type { Editor, Range } from "@tiptap/core";
import type { RefObject } from "react";

export interface SlashItem {
  title: string;
  description: string;
  icon: string;
  keywords: string[];
  execute: (editor: Editor, range: Range) => void;
}

export const SLASH_ITEMS: SlashItem[] = [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "H1",
    keywords: ["heading", "h1", "title", "large"],
    execute: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 1 })
        .run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "H2",
    keywords: ["heading", "h2", "subtitle", "medium"],
    execute: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 2 })
        .run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "H3",
    keywords: ["heading", "h3", "small"],
    execute: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setHeading({ level: 3 })
        .run(),
  },
  {
    title: "Paragraph",
    description: "Plain text paragraph",
    icon: "¶",
    keywords: ["paragraph", "text", "plain", "p"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Bullet List",
    description: "Unordered list of items",
    icon: "•",
    keywords: ["bullet", "list", "unordered", "ul"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered List",
    description: "Ordered list of items",
    icon: "1.",
    keywords: ["numbered", "ordered", "list", "ol", "number"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Checklist",
    description: "Interactive task checklist",
    icon: "☐",
    keywords: ["checklist", "task", "todo", "check"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Blockquote",
    description: "Quote or pull text",
    icon: "❝",
    keywords: ["quote", "blockquote", "pull"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code Block",
    description: "Syntax-highlighted code",
    icon: "</>",
    keywords: ["code", "codeblock", "syntax", "pre"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Insert a table",
    icon: "⊞",
    keywords: ["table", "grid", "rows", "columns"],
    execute: (editor, range) =>
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    title: "Divider",
    description: "Horizontal divider line",
    icon: "—",
    keywords: ["hr", "divider", "rule", "line", "separator"],
    execute: (editor, range) =>
      editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
];

export function filterSlashItems(query: string): SlashItem[] {
  const q = query.toLowerCase();
  if (!q) return SLASH_ITEMS;
  return SLASH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some((k) => k.includes(q))
  );
}

export interface SlashMenuState {
  items: SlashItem[];
  query: string;
  command: (item: SlashItem) => void;
  top: number;
  left: number;
}

export interface SlashCallbacks {
  onShow: (state: SlashMenuState) => void;
  onHide: () => void;
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export function createSlashCommandsExtension(
  callbacksRef: RefObject<SlashCallbacks>
) {
  return Extension.create({
    name: "slashCommands",

    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem, SlashItem>({
          editor: this.editor,
          char: "/",
          allowSpaces: false,
          startOfLine: false,
          items({ query }: { query: string }) {
            return filterSlashItems(query);
          },
          command({ editor, range, props }) {
            props.execute(editor, range);
          },
          render(): ReturnType<
            NonNullable<SuggestionOptions<SlashItem, SlashItem>["render"]>
          > {
            return {
              onStart(props: SuggestionProps<SlashItem, SlashItem>) {
                const rect = props.clientRect?.() ?? null;
                callbacksRef.current?.onShow({
                  items: props.items,
                  query: props.query,
                  command: props.command,
                  top: rect ? rect.bottom + 4 : 0,
                  left: rect ? rect.left : 0,
                });
              },
              onUpdate(props: SuggestionProps<SlashItem, SlashItem>) {
                const rect = props.clientRect?.() ?? null;
                callbacksRef.current?.onShow({
                  items: props.items,
                  query: props.query,
                  command: props.command,
                  top: rect ? rect.bottom + 4 : 0,
                  left: rect ? rect.left : 0,
                });
              },
              onExit() {
                callbacksRef.current?.onHide();
              },
              onKeyDown({ event }: { event: KeyboardEvent }): boolean {
                return callbacksRef.current?.onKeyDown(event) ?? false;
              },
            };
          },
        }),
      ];
    },
  });
}
