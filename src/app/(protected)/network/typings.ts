export type Node = {
  id: string
  name: string
  tag?: string | null
  protocol: string
  link: string
  subscriptionID?: string | null
}

export type Subscription = {
  id: string
  tag?: string | null
  updatedAt: string

  nodes: { edges: Node[] }
}

export type Group = {
  id: string
  name: string
  policy: string
  nodes: Node[]
  subscriptions: Subscription[]
}
