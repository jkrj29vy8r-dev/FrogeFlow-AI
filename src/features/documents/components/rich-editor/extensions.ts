import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common as grammars } from "lowlight";
import type { Extensions } from "@tiptap/core";

const lowlight = createLowlight(grammars);

export function buildExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight
      heading: { levels: [1, 2, 3] },
    }),

    Underline,

    TextStyle,

    TextAlign.configure({ types: ["heading", "paragraph"] }),

    Highlight.configure({ multicolor: false }),

    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    }),

    Image.configure({ inline: false, allowBase64: true }),

    TaskList,
    TaskItem.configure({ nested: true }),

    Table.configure({ resizable: false }),
    TableRow,
    TableCell,
    TableHeader,

    CodeBlockLowlight.configure({ lowlight }),

    CharacterCount,

    Placeholder.configure({
      placeholder: placeholder ?? "Write something, or press '/' for commands…",
      emptyEditorClass: "is-editor-empty",
    }),
  ];
}

export type { Extensions };
