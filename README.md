# EMMET-JS-compiler
Simply Send your html application in EMMET instead of HTML to client. 

## How to use it
simply add it to your <script src="path/to/emmet.js">
and you can use it in 2 ways:

### Append directly
You can create HTML elements and append them directly to document body or another existing DOM Element:
  
EMMET.apped (DOMElement, \`div.class#id[Style="color:red"]+p{Hello this is the new era of EMMET}\`);
or
  
### Create Html using parser
  
  
let html = EMMET.parse( \`div.class#id[Style="color:red"]+p{Hello this is the new era of EMMET}\`);

  Remark: this compiler does not support number of repitittion because it targets storing real examples no need for generic instructions.
  If you think generic ( i.e 3il>p hello) is required please tell me why.
