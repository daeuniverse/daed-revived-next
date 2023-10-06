import { languages } from 'monaco-editor'

export const daeLang: languages.IMonarchLanguage = {
  // set defaultToken as `invalid` to turn on debug mode
  // defaultToken: 'invalid',
  ignoreCase: false,
  keywords: [
    'dip',
    'direct',
    'domain',
    'dport',
    'fallback',
    'ipversion',
    'l4proto',
    'mac',
    'must_direct',
    'pname',
    'qname',
    'request',
    'response',
    'routing',
    'sip',
    'sport',
    'tcp',
    'udp',
    'upstream'
  ],

  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

  symbols: /[->&!:,]+/,

  operators: ['&&', '!'],

  tokenizer: {
    root: [
      [/@[a-zA-Z]\w*/, 'tag'],

      [/[a-zA-Z]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],

      { include: '@whitespace' },

      [/[{}()]/, '@brackets'],

      [/@symbols/, { cases: { '@operators': 'operator', '@default': '' } }],

      [/\d+/, 'number'],

      [/[,:]/, 'delimiter'],

      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/'([^'\\]|\\.)*$/, 'string.invalid'],
      [/"/, 'string', '@string_double'],
      [/'/, 'string', '@string_single']
    ],

    string_double: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, 'string', '@pop']
    ],

    string_single: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/'/, 'string', '@pop']
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'white'],
      [/#.*$/, 'comment']
    ]
  }
}
