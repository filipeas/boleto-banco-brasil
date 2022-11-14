import { IBoletoRepository } from "@application/repositories/boleto/boleto.repository";
import { Either, left, right } from "@core/logic/either";
import { IBoleto } from "@domain/boleto/dto/boleto.dto";
import { BoletoMapper } from "@domain/boleto/mappers/boleto.mapper";
import { NotFoundError } from "@errors/not-found.error";
import { inject, injectable } from "tsyringe";

type IRequest = {
    BB_AGENCIA: string;
    BB_API_KEY: string;
    BB_BASIC_CREDENTIALS: string;
    BB_CONTA: string;
    BB_OAUTH_URL: string;
    BB_API_URL: string;
    BB_APP_KEY: string;
}
type IResponse = Either<NotFoundError, IBoleto>;

@injectable()
export class FindLastBoleto {
    constructor(
        @inject('BoletoRepository')
        private boletoRepository: IBoletoRepository
    ) { }

    async run({ BB_AGENCIA, BB_API_KEY, BB_BASIC_CREDENTIALS, BB_CONTA, BB_OAUTH_URL, BB_API_URL, BB_APP_KEY }: IRequest): Promise<IResponse> {
        const boleto = await this.boletoRepository.findLastBoleto(
            BB_AGENCIA,
            BB_API_KEY,
            BB_BASIC_CREDENTIALS,
            BB_CONTA,
            BB_OAUTH_URL,
            BB_API_URL,
            BB_APP_KEY
        );
        if (!boleto) {
            return left(new NotFoundError("Último boleto não encontrado"));
        }

        return right(BoletoMapper.toDomain(boleto));
    }
}