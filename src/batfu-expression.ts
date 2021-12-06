
import BaseFunc from './batfu-function';
import Value from './batfu-value';
import Variable from './batfu-variable';

export class BaseExpression {}

export class FuncExpression extends BaseExpression {
    private _func: BaseFunc;
    private _args: Value[];

    public func(): BaseFunc {
        return this._func;
    }

    public args(): ReadonlyArray<Value> {
        return this._args;
    }

    public add(value: Value) {
        this._args.push(value);
    }

    public constructor(func: BaseFunc, args: Value[] = []) {
        super();
        this._func = func;
        this._args = args;
    }
}

export class AssignmentExpression extends BaseExpression {
    private _variables: Variable[];
    public variables(): ReadonlyArray<Variable> {
        return this._variables;
    }

    private _exprs: FuncExpression[];
    public exprs(): ReadonlyArray<FuncExpression> {
        return this._exprs;
    }

    public constructor(vars: Variable[], exprs: FuncExpression[]) {
        super();
        this._variables = vars;
        this._exprs = exprs;
    }
}

export default BaseExpression;