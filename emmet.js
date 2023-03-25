
// thanks to : https://github.com/chemerisuk/better-emmet-plugin

if (typeof EMMET !== "object") {
    EMMET = {};
}
EMMET.dir = "ltr";

(function () {
    "use strict";
    let ct = 0;
    const tkError = ct++;
    const tkIdentifier = ct++;
    const tkInnerText = ct++;
    const tkOpenPara = ct++;
    const tkClosePara = ct++;
    const tkOpenPracket = ct++;
    const tkClosePracket = ct++;
    const tkDot = ct++;
    const tkGT = ct++;
    const tkPlus = ct++;
    const tkHash = ct++;
    const tkEqual = ct++;
    const tkString = ct++;
    const tkEndMarker = ct++;

    const mdTag = 0;
    const mdClass = 1;
    const mdId = 2;
    const mdAtt = 3;

    const modes = ["Tag", "Class", "Identifier", "Attribute"];

    const SM = {};
    const SMtag = [];
    const SMatt = [];
    const SMid = [];
    const SMcls = [];
    //tag
    SMtag[tkIdentifier] = [tkDot, tkPlus, tkHash, tkGT, tkOpenPracket, tkClosePracket, tkInnerText, tkEndMarker, tkError];
    SMtag[tkInnerText] = [tkDot, tkPlus, tkGT, tkOpenPracket, tkClosePracket, tkClosePara, tkEndMarker, tkError];
    SMtag[tkOpenPara] = [tkIdentifier, tkOpenPara, tkEndMarker, tkError];
    SMtag[tkClosePara] = [tkIdentifier, tkClosePara, tkPlus, tkGT, tkEndMarker, tkError];
    SMtag[tkPlus] = [tkIdentifier, tkOpenPara, tkEndMarker, tkError];
    SMtag[tkGT] = [tkIdentifier, tkOpenPara, tkEndMarker, tkError];
    SMtag[tkClosePracket] = [tkIdentifier, tkDot, tkPlus, tkHash, tkGT, tkInnerText, tkClosePara, tkEndMarker, tkError];


    //attribute    
    SMatt[tkIdentifier] = [tkEqual, tkIdentifier, tkClosePracket, tkEndMarker, tkError];
    SMatt[tkEqual] = [tkString, tkEndMarker, tkError];
    SMatt[tkString] = [tkIdentifier, tkClosePracket, tkEndMarker, tkError];
    SMatt[tkOpenPracket] = [tkIdentifier, tkEndMarker, tkError];
    SMatt[tkClosePracket] = [tkInnerText, tkPlus, tkGT, tkDot, tkHash, tkEndMarker, tkError];

    //id
    SMid[tkIdentifier] = [tkIdentifier, tkOpenPara, tkGT, tkDot, tkPlus, tkOpenPracket, tkClosePara, tkInnerText, tkEndMarker, tkError];
    SMid[tkHash] = [tkIdentifier, tkEndMarker, tkError];
    //class
    SMcls[tkDot] = [tkIdentifier, tkEndMarker, tkError];
    SMcls[tkIdentifier] = [tkDot, tkHash, tkGT, tkDot, tkPlus, tkOpenPracket, tkClosePara, tkInnerText, tkEndMarker, tkError];

    // build State machine    
    SM[mdTag] = SMtag;
    SM[mdClass] = SMcls;
    SM[mdId] = SMid;
    SM[mdAtt] = SMatt;

    const MODE = [];
    MODE[tkOpenPara] = mdTag;
    MODE[tkClosePara] = mdTag;
    MODE[tkGT] = mdTag;
    MODE[tkDot] = mdClass;
    MODE[tkPlus] = mdTag;
    MODE[tkHash] = mdId;
    MODE[tkOpenPracket] = mdAtt;
    MODE[tkClosePracket] = mdTag;
    MODE[tkInnerText] = mdTag;


    const isLetter = new RegExp(/[a-zA-Z]/);
    const isNumberStart = new RegExp(/[0-9+\-.]/);
    const isNumber = new RegExp(/[0-9.eEfF+\-]/);
    const isValidNumber = new RegExp(/[+\-][0-9]*\.[0-9]*[eE][0-9]*/);
    const isSpecial = new RegExp(/[-_]/);
    const isSpace = new RegExp(/[ \t\n\r]/);
    const isEol = new RegExp(/[\n\r]/);
    const isSingleChar = new RegExp(/[\(\)\[\]>\+\.#=]/);
    const isIDStart = new RegExp(/[a-zA-Z\_\$]/);
    const isID = new RegExp(/[a-zA-Z0-9\-_\$]/);
    const cbr = new RegExp(/\\}/g);
    const cqr = new RegExp(/\\'/g);
    const scTokens = []; // single This.char tokens

    scTokens['['] = tkOpenPracket;
    scTokens[']'] = tkClosePracket;
    scTokens['('] = tkOpenPara;
    scTokens[')'] = tkClosePara;
    scTokens['.'] = tkDot;
    scTokens['#'] = tkHash;
    scTokens['>'] = tkGT;
    scTokens['+'] = tkPlus;
    scTokens['='] = tkEqual;

    const htmlTags = ['!doctype ', 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio',
        'b', 'base', 'basefont', 'bdi', 'bdo', 'big', 'blockquote', 'body', 'br', 'button',
        'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup',
        'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt',
        'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins',
        'kbd', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'meta', 'meter', 'nav', 'noframes', 'noscript',
        'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby',
        's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'svg',
        'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr'
    ];
    EMMET.parse = (text) => {
        if (text == undefined) return [];
        if (text.length == 0) return [];

        let tokens = [];
        var This = {
            text: text,
            position: -1,
            char: undefined,
            line: 1,
            col: 0,
            tokens: tokens,
            tok: {},
            SM: SM,
            html: "",
            ctr: 0
        }
        // console.log(text);
        tokenizer(This);
        // console.log(This.tokens);
        toHtml(This);
        // console.log(This.html);
        return This.html;
    }
    EMMET.parsex = (text) => {
        EMMET.append(text, document.body);
    }
    EMMET.append = (parentEl, text) => {
        if (text == undefined) return [];
        if (text.length == 0) return [];
        let tokens = [];
        var This = {
            text: text,
            position: -1,
            char: undefined,
            line: 1,
            col: 0,
            tokens: tokens,
            tok: {},
            SM: SM,
            html: "",
            ctr: 0
        }
        // console.log(text);
        tokenizer(This);
        // console.log(parentEl);
        appendChildren(This, parentEl);
    }

    const tokenizer = (This) => {
        readChar(This);
        while (This.char != undefined) {
            while (This.char != undefined && isSpace.test(This.char)) readChar(This);
            if (isSingleChar.test(This.char)) {
                mkTok(This, scTokens[This.char], This.char);
                readChar(This);
            } else {
                switch (This.char) {
                    case '/': // comment & something &
                        readChar(This);
                        if (This.char === "/") // here I skipped first /, but it is error token anyway to be skipped
                            while (This.char != undefined && !isEol.test(This.char))
                                readChar(This);
                        break;
                    case '{':
                        readChar(This);
                        mkTok(This, tkInnerText, readQuotedTextToken(This, "}"));
                        readChar(This);
                        break;
                    case '"':
                        readChar(This);
                        mkTok(This, tkString, readQuotedTextToken(This, '"'));
                        readChar(This);
                        break;
                    case undefined:
                        mkTok(This, tkEndMarker);
                        break;
                    default:
                        if (isIDStart.test(This.char)) {
                            mkTok(This, tkIdentifier, readId(This));
                        } else if (isNumberStart.test(This.char)) {
                            mkTok(This, tkString, parseFloat(readNumToken(This)));
                        } else {
                            //mkTok(This, tkError, This.char); no need
                            readChar(This)
                        }
                }
            }
        }
        mkTok(This, tkEndMarker);
        // console.log(This.tokens);
    }

    const mkTok = (This, tokenType, value) => {
        This.tokens.push({ id: This.ctr++, type: tokenType, value: value, line: This.line, column: This.col - 1 });
    }

    const readChar = (This) => {
        This.position++
        This.col++;
        if (This.char == '\n' || This.char == '\r') {
            This.col = 0
            This.line++
        }
        This.char = This.position >= This.text.length ? undefined : This.text[This.position];
    }


    const readQuotedTextToken = (This, endChar) => {
        let position = This.position
        while (This.char != undefined && This.char != endChar) {
            if (This.char == '\\') {
                readChar(This)
                readChar(This)
            } else
                readChar(This);
        }
        if (This.char == undefined)
            console.log(endChar + " Not found starting form column:" + position + "! Expected Errors to happen, especially some items disappear from results.");
        let tmp = This.text.substr(position, This.position - position);
        if (endChar == "}")
            tmp = tmp.replace(cbr, "}");
        else if (endChar == '"')
            tmp = tmp.replace(cqr, '"');
        return tmp;
    }

    const readNumToken = (This) => {
        let position = This.position
        readChar(This);
        while (This.char != undefined && isNumber.test(This.char)) {
            readChar(This);
        }
        return This.text.substr(position, This.position - position);
    }

    const readId = (This) => {
        let position = This.position
        while (This.char != undefined && isID.test(This.char)) readChar(This);
        return This.text.substr(position, This.position - position);
    }

    const validToken = (This, lastToken, t, mode) => {
        let ok = (lastToken == undefined) ? true : false;
        if (!ok)
            try {
                if (This.SM[mode][lastToken.type] != undefined)
                    ok = (This.SM[mode][lastToken.type].includes(t.type));
            } catch (ex) { }
        if (!ok) console.log(`Token with id:${t.id} => "${t.value}" has been rejected under mode: ${modes[mode]}`);
        return ok;
    }
    const toHtml = (This) => {
        var mode = mdTag;
        let tokens = This.tokens;
        var tagClosureStack = [];
        var lastToken = undefined;
        let cTag;
        for (let t of tokens) {
            // console.log(t);
            if (validToken(This, lastToken, t, mode)) {
                mode = MODE[t.type] == undefined ? mode : MODE[t.type];
                switch (t.type) {
                    case tkIdentifier:
                        if (mode == mdTag) {
                            cTag = {};
                            cTag.tag = t.value;
                            cTag.classes = [];
                            cTag.id = ""
                            cTag.attributes = "dir='" + EMMET.dir + "' ";
                            cTag.innerText = "";
                        } else if (mode == mdClass) {
                            cTag.classes.push(t.value);
                        } else if (mode == mdId) {
                            cTag.id = t.value;
                        } else if (mode == mdAtt) {
                            cTag.attributes += " " + t.value;
                        }
                        break;
                    case tkString:
                        cTag.attributes += "='" + t.value + "' ";
                        break;
                    case tkInnerText:
                        cTag.innerText = t.value;
                        break;
                    case tkOpenPara:
                        if (lastToken.type == tkGT)
                            tagClosureStack.push({ tag: ">" });
                        else
                            tagClosureStack.push({ tag: "(" });
                        // console.trace("pushing into stack because of '('" + tagClosureStack.length);

                        break;
                    case tkClosePara:
                        // console.trace("stack length (before)= " + tagClosureStack.length);
                        // for (let si of tagClosureStack) console.log(si);
                        htmlTag(This, cTag);
                        closeTag(This, cTag);
                        cTag = tagClosureStack.pop();
                        while (cTag != undefined) {
                            // console.log("Pop stack got:" + cTag.tag)
                            if (cTag.tag === "(" || cTag.tag === ">")
                                break;
                            else
                                closeTag(This, cTag);
                            cTag = tagClosureStack.pop();
                        }
                        if (cTag.tag == ">") {
                            cTag = tagClosureStack.pop();
                            if (cTag != undefined) {
                                closeTag(This, cTag);
                            }
                        }
                        cTag = {};
                        // console.trace("stack length (after)= " + tagClosureStack.length);
                        // for (let si of tagClosureStack) console.log(si);
                        break;
                    case tkEndMarker:
                        // console.log("reached End .. now closing open tags ...");
                        htmlTag(This, cTag);
                        closeTag(This, cTag);
                        cTag = tagClosureStack.pop();
                        while (cTag != undefined) {
                            if (cTag.tag != "(" && cTag.tag != ">")
                                closeTag(This, cTag);
                            cTag = tagClosureStack.pop();
                        }
                        break;
                    case tkPlus:
                        htmlTag(This, cTag);
                        closeTag(This, cTag)
                        break;
                    case tkGT:
                        htmlTag(This, cTag);
                        tagClosureStack.push(cTag);
                        // console.trace("pushing into stack because of '>'" + tagClosureStack.length);
                        break;
                }
            }
            lastToken = t;
        }
    }


    const htmlTag = (This, tag) => {
        let res = "";
        try {
            res += "<" + tag.tag;
            if (tag.classes.length > 0) {
                res += " class='"
                for (let i = 0; i < tag.classes.length; i++)
                    res += (i == 0 ? "" : " ") + tag.classes[i];
                res += "'";
            }
            res += " " + (tag.id.length > 0 ? "id='" + tag.id + "'" : "") + tag.attributes + ">" + tag.innerText;
        } catch (ex) { res = ""; }
        This.html += res;
    }
    const closeTag = (This, tag) => {
        if (tag == undefined) return;
        if (tag.tag === "(" || tag.tag === ">") {
            // console.log("got --->" + tag.tag);
            console.trace();
            return;
        }
        let res = "";
        if (tag.tag != undefined)
            try {
                res += "</" + tag.tag + ">";
            } catch (ex) { res = ""; }
        This.html += res;
    }

    const appendChildren = (This, parentEl, dir) => {
        var mode = mdTag;
        let tokens = This.tokens;
        var tagStack = [];
        var lastToken = undefined;
        let theNewTag;
        let lastAttribute = "";
        tagStack.push(parentEl);
        let parent = parentEl;
        let cTag;
        let cClass;
        let toInsert = false;
        for (let t of tokens) {
            if (validToken(This, lastToken, t, mode)) {
                mode = MODE[t.type] == undefined ? mode : MODE[t.type];
                switch (t.type) {
                    case tkIdentifier:
                        if (mode == mdTag) {
                            cClass = customElements.get(t.value);
                            if (cClass != undefined)
                                cTag = new cClass();
                            else
                                cTag = document.createElement(t.value);
                            // parent.appendChild(cTag);
                            cTag.setAttribute("dir", EMMET.dir);
                            toInsert = true;
                        } else if (mode == mdClass) {
                            cTag.classList.add(t.value);
                        } else if (mode == mdId) {
                            cTag.id = t.value;
                        } else if (mode == mdAtt) {
                            lastAttribute = t.value;
                            cTag.setAttribute(t.value, "");
                        }
                        break;
                    case tkString:
                        cTag.setAttribute(lastAttribute, t.value);
                        // cTag.attributes.getNamedItem(lastAttribute).value = t.value;
                        break;
                    case tkInnerText:
                        cTag.innerText = t.value;
                        break;
                    case tkOpenPara:
                        if (lastToken != undefined)
                            if (lastToken.type != tkGT && lastToken.type != tkOpenPara)
                                tagStack.push(parent);
                        tagStack.push({ tag: "(" });
                        break;
                    case tkClosePara:
                        if (toInsert) {
                            parent.appendChild(cTag);
                            toInsert = false;
                        }
                        parent = tagStack.pop();
                        while (parent != undefined && parent.tag != "(") {
                            parent = tagStack.pop();
                        }
                        try {
                            while (parent.tag == "(") {
                                parent = tagStack.pop();
                            }
                        } catch (ex) { }
                        if (parent == undefined) {
                            parent = parentEl;
                            console.log("Stack empty!");
                        }

                        break;
                    case tkGT:
                        if (toInsert) {
                            parent.appendChild(cTag);
                            toInsert = false;
                        }
                        parent = cTag;
                        tagStack.push(parent);
                        break;
                    case tkPlus:
                        if (toInsert) {
                            parent.appendChild(cTag);
                            toInsert = false;
                        }
                        break;
                }
            }
            lastToken = t;
        }
        if (toInsert) {
            try {
                parent.appendChild(cTag);
            } catch (ex) { }
        }

    }
}());