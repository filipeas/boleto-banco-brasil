import { BBClient, IBBClientProps } from "../adapters/bb-client";
import { ICreateBBPurchaseProps, IPurchase } from "../providers/client.provider";
import { formatDate } from "../utils/format-date";
import { generateBoleto } from "../utils/generate-boleto";
import { addDays } from "date-fns";

export class Client {
  private bbClient!: BBClient;

  constructor({
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONVENIO,
    BB_WALLET,
    BB_WALLET_VARIATION,
    BB_AGENCIA,
    BB_CONTA,
    ENVIRONMENT
  }: IBBClientProps) {
    // instance of client
    this.bbClient = new BBClient({
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
      BB_CONVENIO,
      BB_WALLET,
      BB_WALLET_VARIATION,
      BB_AGENCIA,
      BB_CONTA,
      ENVIRONMENT
    });
  }

  async CreatePurchase({
    customerNeighborhood,
    customerAddress,
    customerCPF,
    customerCity,
    customerName,
    customerStateCode,
    customerZipCode,
    purchaseValue,
  }: ICreateBBPurchaseProps) {
    // generate a new purchase
    const purchase = await this.bbClient.createPurchase({
      customerNeighborhood,
      customerZipCode,
      customerCity,
      customerCPF,
      customerAddress,
      customerStateCode,
      customerName,
      purchaseValue,
    });

    // generate PDF
    const linkBoleto = await generateBoleto({
      environment: this.bbClient.getENVIRONMENT(),
      agencia: this.bbClient.getBB_AGENCIA(),
      conta: this.bbClient.getBB_CONTA(),
      bbConvenio: this.bbClient.getBB_CONVENIO(),
      bbWallet: this.bbClient.getBB_WALLET(),
      cepCliente: customerZipCode,
      cidadeComprador: customerCity,
      codigoBarraNumerico: purchase.purchaseBarCode,
      dataVencimento: formatDate(addDays(new Date(), 1), 'dd/MM/yyyy'),
      enderecoComprador: customerAddress,
      estadoComprador: customerStateCode,
      nomeComprador: customerName,
      numeroBoleto: purchase.purschaseId,
      total: purchaseValue,
    });

    return linkBoleto;
  }

  async SearchLastPurchase(): Promise<IPurchase> {
    // get last purchase
    return await this.bbClient.searchLastPurchase();
  }
}