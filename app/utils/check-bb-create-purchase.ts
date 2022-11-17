import { ICreateBBPurchaseProps } from "app/providers/client.provider";
import { PurchaseError } from "../errors/purchase-error";

export function CheckBBCreatePurchase(data: ICreateBBPurchaseProps) {
  if (!data.customerName) {
    throw new PurchaseError('Informe o nome do cliente');
  }

  if (!data.customerCPF) {
    throw new PurchaseError('Informe um CPF');
  }

  if (!data.customerZipCode) {
    throw new PurchaseError('Informe um CEP');
  }

  if (!data.customerAddress) {
    throw new PurchaseError('Informe um endereço');
  }

  if (!data.customerNeighborhood) {
    throw new PurchaseError('Informe um bairro');
  }

  if (!data.customerCity) {
    throw new PurchaseError('Informe uma cidade');
  }

  if (!data.customerStateCode) {
    throw new PurchaseError('Informe a sigla do estado');
  }

  if (!data.purchaseValue) {
    throw new PurchaseError('Informe o valor da compra');
  }
}