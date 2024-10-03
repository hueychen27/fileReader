import { ElementUtils, selectText } from "./setup.js"
let globalIndex = 1;

/**
 * @type {HTMLInputElement}
 */
const file = ElementUtils.getElement("file");

function getLowestIndex() {
    const max = ElementUtils.getElement("list").childElementCount
    let i = 1;
    for (; !(i > max); i++) {
        if (ElementUtils.getElement("item" + i) == null) return i;
    }
    return i;
}

/**
 * 
 * @param {File} file 
 * @param {string} data 
 * @param {number} index 
 * @returns 
 */
function insertFile(file, data, index) {
    /**
     * @type {HTMLLIElement}
     */
    const li = ElementUtils.makeElement("li");
    /**
     * @type {HTMLParagraphElement}
     */
    const p = ElementUtils.makeElement("p");
    /**
     * @type {HTMLPreElement}
     */
    const pre = ElementUtils.makeElement("pre");
    /**
     * @type {HTMLDivElement}
     */
    const floatSection = ElementUtils.makeElement("div");
    /**
     * @type {HTMLDivElement}
     */
    const innerFloatSection = ElementUtils.makeElement("div");
    /**
     * @type {HTMLImageElement}
     */
    const copyIcon = ElementUtils.makeElement("img");
    /**
     * @type {HTMLDivElement}
     */
    const remove = ElementUtils.makeElement("div");

    copyIcon.src = "./fileCopy.svg";
    copyIcon.alt = "File copy icon"
    copyIcon.className = "copyIcon";
    copyIcon.title = "Select file content to copy";
    copyIcon.addEventListener("click", function () {
        selectText(this.closest(".floatingSection").nextSibling);
    })

    remove.innerHTML = "x"
    remove.className = "remove"
    remove.title = "Remove this section"
    remove.addEventListener("click", function () {
        const listItem = this.closest(".contentListItem");
        const id = listItem.id.slice(4);
        if (globalIndex >= id) globalIndex = id;
        listItem.remove();
    })

    innerFloatSection.className = "floatingSectionInner";
    innerFloatSection.append(remove, copyIcon);

    floatSection.className = "floatingSection";
    floatSection.append(innerFloatSection);

    pre.className = "content";
    pre.append(floatSection, document.createTextNode(data));

    if (file.size > 4000000) {
        /**
         * @type {HTMLDetailsElement}
        */
        const long = ElementUtils.makeElement("details");
        long.className = "longText"
        /**
         * @type {HTMLElement}
         */
        const summary = ElementUtils.makeElement("summary")
        summary.innerText = file.name + ": "
        summary.title = "Hidden as file size is too large."

        long.append(summary, pre);
        p.append(long);
    } else {
        p.innerText = file.name + ": "
        p.append(pre);
    }

    li.id = "item" + index;
    li.className = "contentListItem";

    li.append(p);
    const currentLi = ElementUtils.getElement("item" + index)
    if (currentLi) {
        ElementUtils.getElement("list").replaceChild(li, currentLi);
        return;
    }
    ElementUtils.getElement("list").append(li)
}

async function fileHandler() {
    const files = file.files;
    const fileLength = files.length;
    ElementUtils.destroyElement("remove");
    const utf8Decoder = new TextDecoder("utf-8");
    for (let i = 0; i < fileLength; i++) {
        /**
         * @type {File}
         */
        const file = files[i];
        const stream = file.stream();
        let receivedChars = 0;
        const reader = stream.getReader();
        let totalData = "";
        let { done: finished, value: data } = await reader.read();
        let newData;
        while (true) {
            if (finished) {
                insertFile(file, totalData, globalIndex);
                globalIndex = getLowestIndex();
                break;
            }
            receivedChars += data.length;
            totalData += utf8Decoder.decode(data);
            insertFile(file, totalData, globalIndex);
            newData = await reader.read();
            finished = newData.done;
            data = newData.value;
        }
    }
}

file.addEventListener("change", fileHandler, false)
ElementUtils.getElement("clearBtn").addEventListener("click", () => {
    ElementUtils.getElement("list").innerHTML = "";
})