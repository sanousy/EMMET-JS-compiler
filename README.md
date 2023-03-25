# EMMET-JS-compiler
Simply Send your html application in EMMET instead of HTML to client. 

In This Ramadan, I am totally broken,so still I have some good code peices that might benefit someone, I am sharing with everyone with MITs license which implies any use without any responsiblity or liability, and in the same time, you are free to use/reuse/embed and do whatever you want without any legal or financial or even ethical responsibility on you. enjoy.

#How to use it
simply add it to your <script src="path/to/emmet.js">
and you can use it in 2 ways:

#Append directly
to document body or another existing DOM Element:
EMMET.apped (DOMElement, `div.class#id[Style="color:red"]+p{Hello this is the new era of EMMET}`);
or
#Create Html using parser
let html = EMMET.parse( `div.class#id[Style="color:red"]+p{Hello this is the new era of EMMET}`);
