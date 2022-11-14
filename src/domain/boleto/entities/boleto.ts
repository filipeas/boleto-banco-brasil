import { Entity } from "@core/domain/entity";

type IBoletoProps = {
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

export class Boleto extends Entity<IBoletoProps>{
    private constructor(props: IBoletoProps) {
        super(props);
    }

    get numeroBoletoBB() {
        return this.props.numeroBoletoBB;
    }

    get dataRegistro() {
        return this.props.dataRegistro;
    }

    get dataVencimento() {
        return this.props.dataVencimento;
    }

    get valorOriginal() {
        return this.props.valorOriginal;
    }

    get carteiraConvenio() {
        return this.props.carteiraConvenio;
    }

    get variacaoCarteiraConvenio() {
        return this.props.variacaoCarteiraConvenio;
    }

    get codigoEstadoTituloCobranca() {
        return this.props.codigoEstadoTituloCobranca;
    }

    get estadoTituloCobranca() {
        return this.props.estadoTituloCobranca;
    }

    get contrato() {
        return this.props.contrato;
    }

    get dataMovimento() {
        return this.props.dataMovimento;
    }

    get dataCredito() {
        return this.props.dataCredito;
    }

    get valorAtual() {
        return this.props.valorAtual;
    }

    get valorPago() {
        return this.props.valorPago;
    }

    static create(props: IBoletoProps) {
        const boleto = new Boleto(props);
        return boleto;
    }
}