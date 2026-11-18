import {escapeHtml} from "@evals/eval-criteria-mapping/environment/reporting/escape-html/EscapeHtml";

it("escapes every character that could open a tag or an attribute", () => {
  expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe("&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;");
});

it("leaves plain text alone", () => {
  expect(escapeHtml("a plain rifle")).toBe("a plain rifle");
});
