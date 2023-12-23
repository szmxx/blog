import { visit } from "unist-util-visit";

export function remarkDeruntify() {
  function transformer(tree) {
    visit(tree, "text", function (node) {
      let wordCount = node.value.split(" ").length;

      if (wordCount >= 4) {
        node.value = node.value.replace(/ ([^ ]*)$/, "\u00A0$1");
      }
    });
  }

  return transformer;
}
