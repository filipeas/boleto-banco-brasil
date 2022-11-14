export interface IClientProvider {
  createPurchase<T = {}, K = {}>(data: T): Promise<K>
}