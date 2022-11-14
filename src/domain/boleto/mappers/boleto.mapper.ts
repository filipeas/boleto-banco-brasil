import { IBoleto } from "../dto/boleto.dto";
import { Boleto } from "../entities/boleto";

export class BoletoMapper {
    static toDto(boleto: Boleto): IBoleto {
        const {
            carteiraConvenio,
            codigoEstadoTituloCobranca,
            contrato,
            dataCredito,
            dataMovimento,
            dataRegistro,
            dataVencimento,
            estadoTituloCobranca,
            numeroBoletoBB,
            valorAtual,
            valorOriginal,
            valorPago,
            variacaoCarteiraConvenio
        } = boleto;

        return {
            carteiraConvenio,
            codigoEstadoTituloCobranca,
            contrato,
            dataCredito,
            dataMovimento,
            dataRegistro,
            dataVencimento,
            estadoTituloCobranca,
            numeroBoletoBB,
            valorAtual,
            valorOriginal,
            valorPago,
            variacaoCarteiraConvenio
        };
    }

    static toDomain(boleto: IBoleto): Boleto {
        const { ...rest } = boleto;
        return Boleto.create({ ...rest });
    }
}