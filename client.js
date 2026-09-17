window.__ModuleLoader__.load({
	id: "deepseek-harness-rtl",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		// Arabic (RTL) text fix. Two layers:
		//  - LAYER 1 (portable): build-stable anchors (data-chat-flow-kind,
		//    data-composer-input, structural elements) so it survives different
		//    builds.
		//  - LAYER 2 (this build): hash-based refinements verified against
		//    @deepseek-ai/dsh 0.1.5-rc.2; refresh them when a build renames its
		//    CSS modules, Layer 1 keeps the main behavior either way.
		var css = [
			'/* ===== dsh-client-rtl-fix ===== */',
			'/* LAYER 1 - portable, build-stable anchors */',
			'[data-chat-flow-kind="user"],',
			'[data-chat-flow-kind="steering"] {',
			'  direction: rtl;',
			'  unicode-bidi: normal;',
			'  text-align: start;',
			'}',
			'[data-chat-flow-kind="user"] *:not(pre):not(code):not(kbd):not(samp),',
			'[data-chat-flow-kind="steering"] *:not(pre):not(code):not(kbd):not(samp) {',
			'  unicode-bidi: normal;',
			'}',
			'[data-chat-flow-kind="assistant-step"] :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption, dt, dd, td, th) {',
			'  direction: rtl;',
			'  unicode-bidi: normal;',
			'  text-align: start;',
			'}',
			'/* Composer: a Lexical contenteditable div since dsh 0.1.5, so anchor on',
			'   the attribute rather than the element; the textarea and mirror forms',
			'   stay for pre-0.1.5 builds. */',
			'[data-composer-input],',
			'textarea.uV2eYG_input,',
			'[data-input-mirror],',
			'[data-input-backdrop] {',
			'  direction: rtl;',
			'}',
			'',
			'/* LAYER 2 - dsh 0.1.5-rc.2 hash refinements (best-effort) */',
			'/* User bubble - dsh-client-ui-chat ChatFlow.module.css */',
			'.Sixlwa_bubble,',
			'.Sixlwa_bubble :not(pre):not(code):not(kbd):not(samp) {',
			'  direction: rtl;',
			'  unicode-bidi: normal;',
			'  text-align: start;',
			'}',
			'/* Assistant prose - dsh-client-ui-chat AssistantMarkdown.module.css */',
			'.hWmORq_root,',
			'.hWmORq_root :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption, dt, dd, td, th, ul, ol),',
			'.hWmORq_root :is(p, li, h1, h2, h3, h4, h5, h6, blockquote, dt, dd) :not(pre):not(code):not(kbd):not(samp) {',
			'  direction: rtl;',
			'  unicode-bidi: normal;',
			'  text-align: start;',
			'}',
			'/* Reasoning body - dsh-client-ui-chat ReasoningRow.module.css */',
			'.lcKema_thinkBody,',
			'.lcKema_thinkBody :not(pre):not(code):not(kbd):not(samp) {',
			'  direction: rtl;',
			'  unicode-bidi: normal;',
			'  text-align: start;',
			'}',
			'',
			'/* CODE - always auto-detect bidi (English code stays LTR, Arabic-in-code renders RTL) */',
			'[data-chat-flow-kind] :is(pre, code, kbd, samp),',
			'[data-composer-input] :is(pre, code, kbd, samp),',
			'.hWmORq_root :is(pre, code, kbd, samp),',
			'.Sixlwa_bubble :is(pre, code, kbd, samp) {',
			'  unicode-bidi: plaintext;',
			'  text-align: start;',
			'}'
		].join('\n');
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
