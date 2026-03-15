export interface Transaction {
    _id: string;
    type: string;
    amount: number;
    senderId?: string;
    receiverAccount?: string;
    status?: string;
}
