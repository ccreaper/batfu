
import BaseExpression, { FuncExpression } from "./batfu-expression";
import Variable from "./batfu-variable";

export enum VariableCreationMode {
    NoCreate,
    CreateIfMissing,
    CreateNoConflict
}

export class Block {
    private _parent?: Block;
    public parent(): Block | undefined {
        return this._parent;
    }

    private _tabbing = 0;
    public tabbing(): number {
        return this._tabbing;
    }
    public setTabbing(tabCount: number) {
        this._tabbing = tabCount;
    }

    private _varList: Variable[] = [];
    public list(): ReadonlyArray<Variable> {
        return this._varList;
    }
    public variable(name: string, recursive?: boolean, createMode: VariableCreationMode = VariableCreationMode.NoCreate): Variable | undefined {
        let vari = this._varList.find(v => v.name == name);
        if (createMode == VariableCreationMode.NoCreate) {
            if (vari === undefined && this._parent && recursive) {
                vari = this._parent.variable(name, recursive);
                if (vari !== undefined) {
                    return vari;
                }
            }
            return undefined;
        }

        if (createMode == VariableCreationMode.CreateNoConflict && vari) {
            throw new Error(`Cannot create variable "${name}" (already exists)`);
        }

        if (createMode == VariableCreationMode.CreateIfMissing && vari !== undefined) {
            return undefined;
        }

        vari = { name: name };
        this._varList.push(vari);
        return vari;
    }

    private _exprs: BaseExpression[];
    private _returnExpr = 0;
    private _singular = false;

    public returnExpr(): FuncExpression | undefined {
        return (this._singular ? this._exprs[0] : this._exprs[this._returnExpr]) as FuncExpression;
    }

    public exprs(): ReadonlyArray<BaseExpression> {
        return this._exprs;
    }

    public setExprs(exprs: BaseExpression[]) {
        this._exprs = exprs;
    }

    public constructor(parent?: Block, existingExprs?: BaseExpression[]) {
        this._parent = parent;
        this._exprs = existingExprs ?? [];
    }
}