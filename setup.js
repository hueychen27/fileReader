class ElementUtils {
    static makeElement(el) {
        return document.createElement(el)
    }
    static getElement(el) {
        return document.getElementById(el);
    }
    static destroyElement(el) {
        if (el instanceof Element) {
            el.remove();
            return;
        }
        this.getElement(el)?.remove();
    }
    static clearElement(el) {
        if (el instanceof Element) {
            el.innerHTML = "";
            return;
        }
        this.getElement(el).innerHTML = "";
    }
}

function selectText(node) {
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
} // Credit: https://stackoverflow.com/a/987376

export { ElementUtils, selectText }