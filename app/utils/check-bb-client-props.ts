import { IBBClientProps } from "app/adapters/bb-client";
import { PurchaseError } from "../errors/purchase-error";

export function CheckBBClientProps({
  BB_API_KEY,
  BB_BASIC_CREDENTIALS,
  BB_CONVENIO,
  BB_WALLET,
  BB_WALLET_VARIATION,
  BB_AGENCIA,
  BB_CONTA,
  ENVIRONMENT
}: IBBClientProps) {
  if (!BB_API_KEY) {
    throw new PurchaseError('Informe uma BB_API_KEY');
  }

  if (!BB_BASIC_CREDENTIALS) {
    throw new PurchaseError('Informe uma BB_BASIC_CREDENTIALS');
  }

  if (!BB_CONVENIO) {
    throw new PurchaseError('Informe uma BB_CONVENIO');
  }

  if (!BB_WALLET) {
    throw new PurchaseError('Informe uma BB_WALLET');
  }

  if (!BB_WALLET_VARIATION) {
    throw new PurchaseError('Informe uma BB_WALLET_VARIATION');
  }

  if (!BB_AGENCIA) {
    throw new PurchaseError('Informe uma BB_AGENCIA');
  }

  if (!BB_CONTA) {
    throw new PurchaseError('Informe uma BB_CONTA');
  }

  if (!ENVIRONMENT) {
    throw new PurchaseError('Informe uma ENVIRONMENT');
  } else if (ENVIRONMENT !== 'dev' && ENVIRONMENT !== 'prod') {
    throw new PurchaseError('ENVIRONMENT permitidas: "dev" ou "prod');
  }
}