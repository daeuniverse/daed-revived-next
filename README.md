# daed

A modern web dashboard for dae

![pr-closed](https://img.shields.io/github/issues-pr-closed/daeuniverse/daed?style=for-the-badge)
![last-commit](https://img.shields.io/github/last-commit/daeuniverse/daed?style=for-the-badge)
![build](https://img.shields.io/github/actions/workflow/status/daeuniverse/daed/release.yml?style=for-the-badge)
![downloads](https://img.shields.io/github/downloads/daeuniverse/daed/total?style=for-the-badge)
![license](https://img.shields.io/github/license/daeuniverse/daed?style=for-the-badge)

## Preview

![preview-login](./docs/preview-login.webp)

## Features

- [x] Easy to use, with keyboard navigation / shortcuts builtin
- [x] Beautiful and intuitive UI
- [x] Light / Dark mode
- [x] Mobile friendly

## Getting started

### Prerequisites

> Clone the repository with submodules

```shell
git clone https://github.com/daeuniverse/daed.git
cd daed

# Initialize submodules
git submodule update --init --recursive
```

> Install golang toolchain, which is required for dae-wing

Learn more about golang at [go.dev](https://go.dev/doc/install)

> Install Bun, which is required fo daed

```shell
curl -fsSL https://bun.sh/install | bash
```

Learn more about bun at [bun.sh](https://bun.sh)

### Build and run dae-wing

> Build dae-wing

```shell
cd wing

make deps
go build -o dae-wing
```

> Run dae-wing with root privileges

```shell
sudo ./dae-wing run -c ./ --api-only
```

Learn more about dae-wing at [dae-wing](https://github.com/daeuniverse/dae-wing)

### Build and run daed

> Install Dependencies

```shell
bun install
```

> Build Artifacts

```shell
bun run build
```

> Run Server

```shell
bun start
```

## Contributing

Feel free to open issues or submit your PR, any feedbacks or help are greatly appreciated.

Special thanks go to all these amazing people.

[![contributors](https://contrib.rocks/image?repo=daeuniverse/daed)](https://github.com/daeuniverse/daed/graphs/contributors)

If you would like to contribute, please see the [instructions](./CONTRIBUTING.md). Also, it is recommended following the [commit-msg-guide](./docs/commit-msg-guide.md).

## Credits

- [dae-wing](https://github.com/daeuniverse/dae-wing)
- [Bun](https://github.com/oven-sh/bun)
- [Next.JS](https://github.com/vercel/next.js)
- [NextUI](https://github.com/nextui-org/nextui)
