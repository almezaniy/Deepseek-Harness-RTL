window.__ModuleLoader__.load({
	id: "deepseek-harness-rtl",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/*
		 * Arabic (RTL) text fix for the DeepSeek Harness web UI.
		 *
		 * DIRECTIONS COME FROM CONTENT, NOT FROM THE FRAME.
		 * Each text block carries `unicode-bidi: plaintext` (the CSS form of
		 * dir="auto"), so the bidi algorithm takes the paragraph level from that
		 * block's first strong character: Arabic lays out and aligns right,
		 * English stays left, and both can share one message.
		 *
		 * WHY ONLY BLOCK ELEMENTS GET `plaintext`
		 * `unicode-bidi: plaintext` makes the element its own bidi paragraph.
		 * Applied to an INLINE element it splits the surrounding line at that
		 * point: a paragraph with an inline code chip comes out with its runs
		 * reordered, and a paragraph whose whole content is one <strong> gets a
		 * separate paragraph whose `text-align: start` then resolves against the
		 * parent's LTR direction, i.e. it snaps to the left. So the rules below
		 * target block boxes only (p, li, div, headings, quote, cells) and never
		 * inline ones (span, strong, em, a, code, kbd, samp). Bidi inside a
		 * paragraph handles those inline runs correctly by itself.
		 *
		 * LAYER 1 (portable) uses build-stable anchors: data-chat-flow-kind on
		 * the chat flow rows, data-composer-input on the composer, and the
		 * structural elements themselves.
		 *
		 * LAYER 2 (per build) adds the CSS-module hashes this deployment ships.
		 * These were re-verified against @deepseek-ai/dsh 0.2.2-rc.2
		 * (AssistantMarkdown.module.css .xMeOpW_root, ReasoningRow.module.css
		 * .VJlF5q_thinkBody); the 0.1.5-rc.2 hashes match nothing here. Refresh
		 * them when a build renames its modules - Layer 1 keeps the main
		 * behavior either way.
		 */

		var BLOCKS = "p, li, div, h1, h2, h3, h4, h5, h6, blockquote, figcaption, dt, dd, td, th";

		var css = [
			"/* ===== deepseek-harness-rtl ===== */",
			"",
			"/* LAYER 1 - portable, build-stable anchors. */",
			"[data-chat-flow-kind=\"assistant-step\"] :is(" + BLOCKS + "),",
			"[data-chat-flow-kind=\"user\"] :is(" + BLOCKS + "),",
			"[data-chat-flow-kind=\"steering\"] :is(" + BLOCKS + ") {",
			"  unicode-bidi: plaintext;",
			"  text-align: start;",
			"}",
			"",
			"/* The container only positions the turn; direction comes from content,",
			"   so an English message is not dragged to the right and an Arabic one",
			"   is not forced to read left-to-right. The bubble stays on its side",
			"   through the chat layout, not through `direction`. */",
			"[data-chat-flow-kind=\"user\"],",
			"[data-chat-flow-kind=\"steering\"] {",
			"  direction: ltr;",
			"  unicode-bidi: plaintext;",
			"  text-align: start;",
			"}",
			"",
			"/* A user turn reads as one block, so every line of it takes the right",
			"   edge - including a line that opens with Latin text, which `plaintext`",
			"   alone would resolve to the left and leave the bubble torn. */",
			"[data-chat-flow-kind=\"user\"] :is(" + BLOCKS + "),",
			"[data-chat-flow-kind=\"steering\"] :is(" + BLOCKS + ") {",
			"  text-align: right !important;",
			"}",
			"",
			"/* STRUCTURE SIDE vs TEXT SIDE. `direction` places what is painted",
			"   outside the text box - list markers, the indent they sit in, a quote's",
			"   bar - while `plaintext` and `text-align` place the text itself. The app",
			"   sets those elements with PHYSICAL properties (padding-left,",
			"   border-left), and `direction` cannot flip a physical side, so the side",
			"   is restated here with `!important`: the app's sheets are injected at",
			"   runtime, so neither specificity nor load order can be relied on. */",
			"[data-chat-flow-kind=\"assistant-step\"] :is(ul, ol) {",
			"  direction: rtl;",
			"  padding-left: 0 !important;",
			"  padding-right: 18px !important;",
			"}",
			"/* A nested list already sits inside the parent indent, so it takes none. */",
			"[data-chat-flow-kind=\"assistant-step\"] :is(ul, ol) :is(ul, ol) {",
			"  padding-left: 0 !important;",
			"  padding-right: 0 !important;",
			"}",
			"",
			"/* Headings are structural lines: keep them on the Arabic side even when",
			"   the heading opens with a neutral or a digit. */",
			"[data-chat-flow-kind=\"assistant-step\"] :is(h1, h2, h3, h4, h5, h6) {",
			"  text-align: right !important;",
			"}",
			"",
			"/* The quote bar and its indent, on the Arabic side. */",
			"[data-chat-flow-kind=\"assistant-step\"] blockquote {",
			"  direction: rtl;",
			"  border-left: 0 !important;",
			"  border-right: 2px solid var(--dsw-alias-label-caption) !important;",
			"  padding-left: 0 !important;",
			"  padding-right: 14px !important;",
			"}",
			"",
			"/* Tables centre in both scripts: a cell is a box, not a paragraph, and the",
			"   reader scans it by column. */",
			"[data-chat-flow-kind=\"assistant-step\"] :is(th, td) {",
			"  text-align: center !important;",
			"}",
			"",
			"/* Code stays block-scoped: `pre` decides its own direction from content,",
			"   inline `code` inherits the paragraph's and must not be isolated. */",
			"[data-chat-flow-kind] pre,",
			"[data-composer-input] pre {",
			"  unicode-bidi: plaintext;",
			"  text-align: start;",
			"}",
			"",
			"/* Composer: a Lexical contenteditable div in current builds, so anchor on",
			"   the attribute; the textarea and mirror forms stay for older ones.",
			"   Direction follows what you type. */",
			"[data-composer-input],",
			"textarea.uV2eYG_input,",
			"[data-input-mirror],",
			"[data-input-backdrop] {",
			"  direction: ltr;",
			"  unicode-bidi: plaintext;",
			"  text-align: start;",
			"}",
			"",
			"/* LAYER 2 - dsh 0.2.2-rc.2 CSS-module roots (this deployment). */",
			"/* Assistant prose - dsh-client-ui-chat AssistantMarkdown.module.css */",
			".xMeOpW_root :is(" + BLOCKS + ") {",
			"  unicode-bidi: plaintext;",
			"  text-align: start;",
			"}",
			"/* Reasoning body - dsh-client-ui-chat ReasoningRow.module.css. The row is",
			"   not always inside an assistant-step, so it carries its own anchor. */",
			".VJlF5q_thinkBody,",
			".VJlF5q_thinkBody :is(" + BLOCKS + ") {",
			"  unicode-bidi: plaintext;",
			"  text-align: start;",
			"}"
		].join("\n");

		var PLUGIN_ID = "deepseek-harness-rtl";

		function apply(ctx) {
			if (typeof document === "undefined") return;
			ctx.effect(() => {
				var tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.dataset.pluginCss = PLUGIN_ID + "/rtl.css";
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "ui-rtl-fix: RTL stylesheet");
		}

		module.exports = { apply: apply };
		return module.exports;
	}
});
