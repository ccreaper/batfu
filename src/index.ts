
import BatfuLexer from "./batfu-lex";
import { BatfuLexTokenType } from "./batfu-lex";

const testSource = `
-- comment test
f(x y z) + + x y z
f 1 f 1 2 3 3 -- comment test
x: 1
x y: 1 2
print [x y]
print &f
do
    x: 1
    x y: 1 2
    do
        print [x y]
        print &f

`;

const testLexer = new BatfuLexer(testSource);
const tokens = testLexer.lex();

/*
tokens.forEach(token => {
    console.log(token);
});
*/