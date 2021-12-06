
export enum BatfuLexTokenType {
    /* Note: Operators are considered words, unlike Lua. */
    Word, Symbol, NumberConstant, StringConstant, Tab, Newline
}

export interface BatfuLexToken {
    type: BatfuLexTokenType;
    value: string | number;
    line: number;
    pos: number;
}

export class BatfuLexer {
    private _source: string;
    private _needle = 0;
    private _length: number;

    private _line = 1;
    private _linepos = 0;
    private _hasNewlined = false;

    private _tokensSource?: BatfuLexToken[];

    public eof(): boolean {
        return this._needle >= this._length;
    }

    public read(atPosition?: number): string {
        return this._source[atPosition ?? this._needle];
    }

    public readLong(count: number): string {
        return this._source.substr(this._needle, count);
    }

    public next(count = 1) {
        this._needle += count;
        this._linepos += count;
    }

    /* Example usage: const someStr = this.consume(this.readLong(8)) */
    public consume(str: string): string {
        this.next(str.length);
        return str;
    }

    public test(str: string, caseless?: boolean): boolean {
        return caseless ? this.readLong(str.length).toLowerCase() == str.toLowerCase() : this.readLong(str.length) == str;
    }

    public testExpr(expr: RegExp, length = 1): boolean {
        return expr.test(this.readLong(length));
    }

    public testAssert(str: string, message?: string) {
        if (!this.test(str)) {
            throw new Error(`${message ?? 'Assertion test failed'} ("${str}")`);
        }
    }

    /* === Specialized reads === */

    public readComment() {
        this.testAssert("--");
        while (!this.test("\n") && !this.eof()) {
            this.next();
        }
    }

    public readString(): string {
        this.testAssert("'");
        this.next();

        const startString = this._needle;
        while (!this.test("'") && !this.eof()) {
            this.next();
            if (!this.eof() && this.read() == '\\') {
                this.next(2); // skip over \\char 
            }
        }
        const endString = this._needle - 1;
        this.next(); // skip over '
        return this._source.substring(startString, endString);
    }

    public readNumber(): number {
        const startNumber = this._needle;
        const hexadecimal = this.test('0x', true);

        if (hexadecimal) {
            this.next(2); // skip over 0x
        }

        while (!this.testExpr(/[\s\n]/) && !this.eof()) {
            if (hexadecimal) {
                if (!this.testExpr(/[0-9a-fA-F]/)) {
                    throw new Error('Unexpected character in hexadecimal number');
                }
            } else {
                if (!this.testExpr(/\d/)) {
                    throw new Error('Unexpected character in number');
                }
            }
            this.next();
        }

        const endNumber = this._needle;
        const numberString = this._source.substring(startNumber, endNumber);
        return hexadecimal ? parseInt(numberString, 16) : parseFloat(numberString);
    }

    public readWord(): string {
        const startWord = this._needle;
        while (this.testExpr(/[\w-!$%^*_+|~`";<>?,./]/) && !this.eof()) {
            this.next();
        }
        const endWord = this._needle;
        const wordString = this._source.substring(startWord, endWord);
        console.log('read word ' + wordString);
        return wordString;
    }

    public readWhitespace() {
        const startWs = this._needle;
        const oldLine = this._line;
        const oldPos = this._linepos;

        if (this.read() == '\n') {
            this._hasNewlined = true;

            while (this.testExpr(/\n/) && !this.eof()) {
                this.next();
                this._line++;
            }
            this._linepos = 0;
            this._tokensSource?.push({
                type: BatfuLexTokenType.Newline,
                value: '\n',
                line: oldLine, // :troll:
                pos: oldPos
            });
        } else if (this.testExpr(/\s/)) {
            while (this.testExpr(/[\s]/) && !this.eof()) {
                this.next();
            }

            if (this._hasNewlined) {
                // has new lined, so these are tabs
                this._hasNewlined = false;
                const endWs = this._needle;
                const wsString = this._source.substring(startWs, endWs);
                this._tokensSource?.push({
                    type: BatfuLexTokenType.Tab,
                    value: wsString,
                    line: this._line,
                    pos: 0
                });
            }
        }
    }

    public checkIfSymbol(char: string): boolean {
        return ('()[]{}&=:').includes(char);
    }

    public lex(): BatfuLexToken[] {
        const tokens: BatfuLexToken[] = [];
        this._tokensSource = tokens;

        try {
            while (!this.eof()) {
                const lookAt = this.read();
                const isComment = this.test('--');

                if (isComment) {
                    this.readComment();
                    continue;
                }

                const line = this._line;
                const pos = this._linepos;

                if (/\d/.test(lookAt)) {
                    this._hasNewlined = false;
                    tokens.push({
                        type: BatfuLexTokenType.NumberConstant,
                        value: this.readNumber(),
                        line: line,
                        pos: pos
                    });
                    //this.next();
                } else if (this.checkIfSymbol(lookAt)) {
                    this._hasNewlined = false;
                    tokens.push({
                        type: BatfuLexTokenType.Symbol,
                        value: lookAt,
                        line: line,
                        pos: pos
                    });
                    this.next();
                } else if (/[\s\n]/.test(lookAt)) {
                    console.log('rendering ws');
                    this.readWhitespace(); // skip over
                } else {
                    // assume word
                    this._hasNewlined = false;
                    tokens.push({
                        type: BatfuLexTokenType.Word,
                        value: this.readWord(),
                        line: line,
                        pos: pos
                    });
                }
            }
        } catch (exception) {
            const isError = exception as Error;
            throw new Error(`Syntax error [${this._line}:${this._linepos}]: ${isError.message ?? isError.toString()}`);
        }

        return tokens;
    }

    public constructor(source: string) {
        this._source = source;
        this._length = this._source.length;
    }
}

export default BatfuLexer;