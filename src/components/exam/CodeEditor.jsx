import React, { useEffect, useLayoutEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, placeholder } from "@codemirror/view";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  commentKeymap,
} from "@codemirror/commands";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import {
  indentOnInput,
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";

const ARENA_BG = "#0F172A";
const ARENA_PLAIN = "#E2E8F0";
const ARENA_COMMENT = "#94A3B8";
const ARENA_KEYWORD = "#38BDF8";
const ARENA_TYPE = "#FBBF24";
const ARENA_FUNCTION = "#A78BFA";
const ARENA_STRING = "#86EFAC";
const ARENA_NUMBER = "#F472B6";
const ARENA_CONSTANT = "#F87171";
const ARENA_OPERATOR = "#CBD5E1";
const ARENA_LINE_NUMBER = "#475569";
const ARENA_CURSOR = "#7DD3FC";
const ARENA_SELECTION = "rgba(56,189,248,0.18)";
const ARENA_ACTIVE_LINE = "rgba(56,189,248,0.06)";

const arenaHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: ARENA_COMMENT, fontStyle: "italic" },
  {
    tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.moduleKeyword, t.definitionKeyword, t.modifier],
    color: ARENA_KEYWORD,
  },
  { tag: [t.typeName, t.className, t.namespace, t.typename, t.definition(t.typeName)], color: ARENA_TYPE },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.functionName, t.definition(t.variableName)], color: ARENA_FUNCTION },
  { tag: [t.string, t.special(t.string), t.regexp, t.character], color: ARENA_STRING },
  { tag: [t.number, t.integer, t.float], color: ARENA_NUMBER },
  { tag: [t.bool, t.null, t.atom, t.constant(t.name), t.standard(t.name)], color: ARENA_CONSTANT },
  { tag: [t.meta, t.processingInstruction], color: ARENA_CONSTANT },
  { tag: [t.operator, t.punctuation, t.bracket, t.separator], color: ARENA_OPERATOR },
  { tag: [t.variableName, t.propertyName, t.labelName], color: ARENA_PLAIN },
]);

const arenaLanguage = (language) => {
  switch ((language || "").toLowerCase()) {
    case "python":
    case "py":
      return python();
    case "javascript":
    case "js":
      return javascript();
    case "java":
      return java();
    case "cpp":
    case "c++":
    case "c":
      return cpp();
    default:
      return javascript();
  }
};

const arenaEditorExtensions = (language) => [
  lineNumbers(),
  highlightActiveLine(),
  highlightActiveLineGutter(),
  bracketMatching(),
  closeBrackets(),
  indentOnInput(),
  history(),
  keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...commentKeymap, indentWithTab]),
  syntaxHighlighting(arenaHighlightStyle),
  EditorView.lineWrapping,
  EditorView.theme({
    "&": {
      height: "100%",
      backgroundColor: ARENA_BG,
      color: ARENA_PLAIN,
      fontSize: "13px",
    },
    "&.cm-focused": { outline: "none" },
    ".cm-scroller": { fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", padding: "0 0 60px" },
    ".cm-content": { caretColor: ARENA_CURSOR, padding: "12px 0" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: ARENA_CURSOR, borderLeftWidth: "2px" },
    ".cm-selectionBackground, .cm-content ::selection": { backgroundColor: ARENA_SELECTION },
    ".cm-activeLine": { backgroundColor: ARENA_ACTIVE_LINE },
    ".cm-gutters": { backgroundColor: ARENA_BG, color: ARENA_LINE_NUMBER, border: "none" },
    ".cm-activeLineGutter": { backgroundColor: ARENA_ACTIVE_LINE, color: ARENA_KEYWORD },
    ".cm-matchingBracket": { backgroundColor: "rgba(56,189,248,0.25)", outline: "1px solid rgba(56,189,248,0.5)" },
    ".cm-selectionMatch": { backgroundColor: "rgba(56,189,248,0.12)" },
    "&.cm-focused .cm-matchingBracket, & .cm-matchingBracket": { borderRadius: "2px" },
  }),
];

export default function CodeEditor({
  value = "",
  onChange = () => {},
  language = "python",
  readOnly = false,
  autoFocus = false,
  placeholder = "",
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useLayoutEffect(() => {
    if (!containerRef.current) return undefined;

    const view = new EditorView({
      state: EditorState.create({
        doc: value || "",
        extensions: [
          arenaLanguage(language),
          ...arenaEditorExtensions(language),
          EditorView.editable.of(!readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          ...(placeholder ? [placeholder(placeholder)] : []),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    if (autoFocus) {
      setTimeout(() => view.focus(), 0);
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value || "" } });
    }
  }, [value]);

  return <div ref={containerRef} className="h-full w-full overflow-hidden rounded-b-xl" />;
}