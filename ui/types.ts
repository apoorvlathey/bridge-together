export type StoredSigData = {
  [chainId: number]: ChainSigData[];
};

export interface ChainSigData {
  sig: string;
  user: string;
  amount: string;
}
