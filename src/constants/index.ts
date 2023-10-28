export const graphqlAPIURL = `http://${process.env.HOSTNAME}:${process.env.PORT}/api/wing/graphql`

export enum NodeType {
  vmess,
  vless,
  shadowsocks,
  shadowsocksR,
  trojan,
  tuic,
  juicity,
  http,
  socks5
}
