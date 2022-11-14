import { IBoletoRepository, ICreateBoleto } from "@application/repositories/boleto/boleto.repository";
import { AsyncMaybe } from "@core/logic/maybe";
import { IBoleto } from "@domain/boleto/dto/boleto.dto";
import { BB, IResponseCreateBoleto } from "../../utils/bb";
import { generateBoleto } from "@infra/utils/generate-boleto";
import { formatDate } from "@infra/utils/format-date";
import { addDays } from "date-fns";

export class BoletoRepository implements IBoletoRepository {
    async createBoleto({
        environment,
        BB_API_KEY,
        BB_BASIC_CREDENTIALS,
        BB_AGENCIA,
        BB_CONTA,
        BB_CONVENIO,
        BB_WALLET,
        BB_WALLET_VARIATION,
        BB_API_URL,
        BB_APP_KEY,
        BB_OAUTH_URL,
        nomeComprador,
        cpfComprador,
        cepCliente,
        enderecoComprador,
        bairroComprador,
        cidadeComprador,
        estadoComprador,
        numeroBoleto,
        total,
    }: ICreateBoleto
    ): Promise<IResponseCreateBoleto> {
        // instance of class Banco do Brasil (BB)
        const bb = new BB(BB_OAUTH_URL, BB_API_URL, BB_APP_KEY);

        // call function for create a boleto
        const request = await bb.createBoleto({
            bairroComprador,
            bbApiKey: BB_API_KEY,
            bbBasicCredentials: BB_BASIC_CREDENTIALS,
            bbConvenio: BB_CONVENIO,
            bbWallet: BB_WALLET,
            bbWalletVariation: BB_WALLET_VARIATION,
            cepCliente,
            cidadeComprador,
            cpfComprador,
            enderecoComprador,
            estadoComprador,
            nomeComprador,
            numeroBoleto,
            total
        });

        // generate PDF
        const linkBoleto = await generateBoleto({
            environment,
            agencia: BB_AGENCIA,
            conta: BB_CONTA,
            bbConvenio: BB_CONVENIO,
            bbWallet: BB_WALLET,
            cepCliente,
            cidadeComprador,
            codigoBarraNumerico: request.codigoBarraNumerico,
            dataVencimento: formatDate(addDays(new Date(), 1), 'dd/MM/yyyy'),
            enderecoComprador,
            estadoComprador,
            nomeComprador,
            numeroBoleto: request.numero,
            total,
        });

        // return boleto
        return request;
    }

    async findLastBoleto(agencia: string, apiKey: string, basicCredentials: string, conta: string, BB_OAUTH_URL: string, BB_API_URL: string, BB_APP_KEY: string): AsyncMaybe<IBoleto> {
        // instance of class Banco do Brasil (BB)
        const bb = new BB(BB_OAUTH_URL, BB_API_URL, BB_APP_KEY);

        // get list of boletos generated in the last 3 days
        const request = await bb.searchBoleto({
            bbAgencia: agencia,
            bbApiKey: apiKey,
            bbBasicCredentials: basicCredentials,
            bbConta: conta
        });

        // ordering by numeroBoletoBB
        const boletos = request.boletos.sort((a, b) => Number(a.numeroBoletoBB) - Number(b.numeroBoletoBB));

        // retornar boleto
        return boletos[boletos.length - 1];
    }

    async findBoletosByConta(conta: string): Promise<IBoleto[]> {
        throw new Error("Method not implemented.");
    }
}