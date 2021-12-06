
import UserFunc from './batfu-function';
import Variable from './batfu-variable';

export enum ValueType {
    NumberConstant,
    StringConstant,
    NilConstant,
    FunctionConstant,
    ArrayConstant,
    RecordConstant,
    Variable,
    Diffuse
}

export type ValueVector = number | string | undefined | UserFunc | Variable;

export class Value {
    public type: ValueType;
    public readonly value: ValueVector;

    public constructor(type: ValueType, value?: ValueVector) {
        this.type = type;
        this.value = value;
    }
}

export default Value;