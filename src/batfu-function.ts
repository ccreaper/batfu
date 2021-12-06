
import Value from './batfu-value';
import { Block } from './batfu-block';
import { BaseExpression, FuncExpression, AssignmentExpression } from './batfu-expression';
import { ValueType } from './batfu-value';

export class BaseFunc {
    private _name: string;

    /* Internal name used to represent the function. */
    public name(): string {
        return this._name;
    }

    private _args: Value[] = [];
    public args(): ReadonlyArray<Value> {
        return this._args;
    }
    public argcount(): number {
        return this._args.length;
    }
    public define(types: ValueType[]) {
        if (types.length != this.argcount()) {
            throw new Error('Illegal signature definition length for argcount.');
        }

        types.forEach((v, idx) => this._args[idx].type = v);
    }

    public constructor(name: string) {
        this._name = name;
    }
}

export type ConstFuncRenderer = (values: Value[]) => string;

export class ConstFunc extends BaseFunc {
    private _symbol: string;

    /* Obtains the symbol that can be globally used to call the function. */
    public symbol(): string {
        return this._symbol;
    }

    public readonly render: ConstFuncRenderer;

    public constructor(symbol: string, render: ConstFuncRenderer) {
        super(`constfunc(${symbol})`);
        this._symbol = symbol;
        this.render = render;
    }
}

export class UserFunc extends BaseFunc {
    private _inBlock: Block;

    public block(): Block {
        return this._inBlock;
    }

    public constructor(name: string, ofBlock: Block, defaultExprs: BaseExpression[] = []) {
        super(name);
        this._inBlock = new Block(ofBlock, defaultExprs);
    }
}

export default BaseFunc;