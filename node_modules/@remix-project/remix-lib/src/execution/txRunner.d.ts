export declare type Transaction = {
    from: string;
    to: string;
    value: string;
    data: string;
    gasLimit: number;
    useCall: boolean;
    timestamp?: number;
    type: '0x1' | '0x2';
};
export declare class TxRunner {
    event: any;
    pendingTxs: any;
    queusTxs: any;
    opt: any;
    internalRunner: any;
    constructor(internalRunner: any, opt: any);
    rawRun(args: Transaction, confirmationCb: any, gasEstimationForceSend: any, promptCb: any, cb: any): void;
    execute(args: Transaction, confirmationCb: any, gasEstimationForceSend: any, promptCb: any, callback: any): void;
}
