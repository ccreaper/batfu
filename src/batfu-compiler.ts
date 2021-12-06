
import { Block, VariableCreationMode } from "./batfu-block";
import BaseExpression from "./batfu-expression";
import { ConstFunc, UserFunc } from "./batfu-function";
import { BatfuLexToken, BatfuLexTokenType } from "./batfu-lex";

export class BatfuParser {
    private _rootBlock: Block;
    private _needle = 0;
    private _loadedTokens: BatfuLexToken[];

    private _constFuncs: ConstFunc[] = [];
    public registerFunction(func: ConstFunc) {
        this._constFuncs.push(func);
    }

    // Readers

    public next(count = 1) {
        this._needle += count;
    }

    public get() {
        return this._loadedTokens[this._needle];
    }

    public getAhead(count = 1) {
        return this._loadedTokens[this._needle + count]; 
    }

    public assertScopingAndSkip(inBlock: Block) {
        const expectTab = this.get();
        if (inBlock.tabbing() == 0 && expectTab.type == BatfuLexTokenType.Tab) {
            throw new Error('Invalid scoping: got scope tabbing where no tabs were expected.');
        } else {
            if (expectTab.type != BatfuLexTokenType.Tab) {
                throw new Error('Invalid scoping: no tabs where scope tabbing was expected.');
            } else {
                const tabValue = expectTab.value as string;
                // count tabs if \t, assume 4 spaces = 1 tab if spaces are used for scoping
                const actualLength = tabValue[0] == '\t' ? tabValue.length : tabValue.length / 4;
                if (actualLength != inBlock.tabbing()) {
                    throw new Error(`Invalid scoping: expected scoping level ${inBlock.tabbing()}, got level ${tabValue.length}`);
                }
            }
        }
        this.next(); // skip over tab
    }

    private _currentBlock!: Block;

    // Constructors

    public parseExpr(inBlock: Block): BaseExpression {
        this.assertScopingAndSkip(inBlock); // verify scoping

        const currentToken = this.get();
        const aheadToken = this.getAhead();

        if (currentToken.type == BatfuLexTokenType.Word) {
            if (aheadToken.type == BatfuLexTokenType.Symbol) {
                if (aheadToken.value == ':') {
                    // Function declaration
                    this.next(2); // skip current and ahead

                    const funcName = currentToken.value as string;
                    const userFunc = new UserFunc(funcName, inBlock);
                    this._currentBlock = userFunc.block(); // parse in the userfunc instead
                    this._currentBlock.parent()?.variable(funcName, false, VariableCreationMode.CreateNoConflict);
                }
            }
        }
    }

    // Loaders

    public parse(tokens: BatfuLexToken[]) {
        this._loadedTokens = tokens;
    }

    public constructor() {
        this._rootBlock = new Block();
        this._loadedTokens = [];
    }
}