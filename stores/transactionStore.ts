import create, { State } from 'zustand';
import { PaymentTransactions } from 'types';

export interface TransactionStore extends State {
  transaction: PaymentTransactions;
  txhash: string | null;
  txdata: string | null;
  txamount: number | null;
  txname: string | null;
  txsymbol: string | null;
  txsigner: string | null;
  txlogoUri: string | null;
  isPendingProposal: boolean;
  pendingProposalData: any;
  setTransaction: (transaction: PaymentTransactions) => void;
  setTransactionHash: (txhash: TransactionStore['txhash']) => void;
  setTransactionData: (txdata: TransactionStore['txdata']) => void;
  setTransactionAmount: (txamount: TransactionStore['txamount']) => void;
  setTransactionName: (txname: TransactionStore['txname']) => void;
  setTransactionSymbol: (txsymbol: TransactionStore['txsymbol']) => void;
  setTransactionSigner: (txsigner: TransactionStore['txsigner']) => void;
  setTransactionLogoUri: (txlogoUri: TransactionStore['txlogoUri']) => void;
  setIsPendingProposal: (isPendingProposal: TransactionStore['isPendingProposal']) => void;
  setPendingProposalData: (pendingProposalData: TransactionStore['pendingProposalData']) => void;
  setTransactionStore: (values: Omit<TransactionStore, 'setTransaction' | 'setTransactionHash' | 'setTransactionData' | 'setTransactionAmount' | 'setTransactionName' | 'setTransactionSymbol' | 'setTransactionSigner' | 'setTransactionLogoUri' | 'setIsPendingProposal' | 'setPendingProposalData'>) => void;
}

export const INITIAL_TRANSACTION_STATE = {
  transaction: {
    data: null,
    username: '',
    address: '',
    amount: 0,
    comment: '',
    timestamp: new Date(),
    receipient: '',
    receipients: [],
    txhash: '',
    USDprice: 0,
    paymenthash: '',
    owneraddress: '',
  },
  txhash: null,
  txdata: null,
  txamount: null,
  txname: null,
  txsymbol: null,
  txsigner: null,
  txlogoUri: null,
  isPendingProposal: false,
  pendingProposalData: null,
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  ...INITIAL_TRANSACTION_STATE,
  setTransaction: (transaction: PaymentTransactions) => set((state) => ({ ...state, transaction })),
  setTransactionHash: (txhash) => set({ txhash }),
  setTransactionData: (txdata) => set({ txdata }),
  setTransactionAmount: (txamount) => set({ txamount }),
  setTransactionName: (txname) => set({ txname }),
  setTransactionSymbol: (txsymbol) => set({ txsymbol }),
  setTransactionSigner: (txsigner) => set({ txsigner }),
  setTransactionLogoUri: (txlogoUri) => set({ txlogoUri }),
  setIsPendingProposal: (isPendingProposal) => set({ isPendingProposal }),
  setPendingProposalData: (pendingProposalData) => set({ pendingProposalData }),
  setTransactionStore: (values) => set(values),
}));

