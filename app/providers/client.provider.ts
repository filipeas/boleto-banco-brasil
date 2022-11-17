export type ICreateBBPurchaseProps = {
  customerName: string;
  customerCPF: string;
  customerZipCode: string;
  customerAddress: string;
  customerNeighborhood: string;
  customerCity: string;
  customerStateCode: string;
  purchaseValue: number;
}

export type IBBRecipientProps = {
  angency: number;
  currentAccount: number;
  addressType: number;
  address: string;
  neighborhood: string;
  city: string;
  cityCode: number;
  stateCode: string;
  zipcode: number;
  paymentVoucher: string;
}

export type IResponseBBPurchaseProps = {
  purschaseId: string;
  wallet: number;
  walletVariation: string;
  customerCode: string;
  purchaseNumber: string;
  purchaseBarCode: string;
  billingAccount: string;
  ticketSequence: string;
  recipient: IBBRecipientProps;
  qrCode: {
    url: string;
    txId: string;
    emv: string;
  };
}

export type IPurchase = {
  numeroBoletoBB: string;
  dataRegistro: string;
  dataVencimento: string;
  valorOriginal: string;
  carteiraConvenio: string;
  variacaoCarteiraConvenio: string;
  codigoEstadoTituloCobranca: string;
  estadoTituloCobranca: string;
  contrato: string;
  dataMovimento: string;
  dataCredito: string;
  valorAtual: string;
  valorPago: string;
}

export type IResponseSearchBBPurchase = {
  indicadorContinuidade: string;
  quantidadeRegistros: string;
  proximoIndice: string;
  boletos: IPurchase[];
};

export interface IClientProvider {
  createPurchase(data: ICreateBBPurchaseProps): Promise<IResponseBBPurchaseProps>;
  searchLastPurchase(): Promise<IPurchase>;
}