
class CustomError extends Error{
    public code:Number;
    public clientSendable:Boolean;
    constructor(message:String,code:Number,clientSendable?:Boolean){
        super(message.toString());
        this.code=code;
        this.clientSendable=clientSendable||true;
    }
}
export {CustomError}