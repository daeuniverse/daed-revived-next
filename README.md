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

### Docker

> Pull and run the prebuilt docker image in the background

```shell
docker run -d --name daed -p 3000:3000 ghcr.io/daeuniverse/daed
```

Alternatively, you can build and run the docker image on your own

> Build the docker image

```shell
docker build . -t daed
```

> Run the docker image you just build in the background

```shell
docker run -d --name daed -p 3000:3000 daed
```

### Build from the source files on your own

> Clone the repository with submodules

```shell
git clone https://github.com/daeuniverse/daed.git
cd daed

# Initialize submodules
git submodule update --init --recursive
```

> Install the toolchain

- [Golang](https://go.dev) (required by dae-wing)
- [Node.js](https://nodejs.org), [pnpm](https://pnpm.io) (required by daed)

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
pnpm install
```

> Build Artifacts

```shell
pnpm run build
```

> Run Server

```shell
pnpm start
```

## Contributing

Feel free to open issues or submit your PR, any feedbacks or help are greatly appreciated.

Special thanks go to all these amazing people.

[![contributors](https://contrib.rocks/image?repo=daeuniverse/daed)](https://github.com/daeuniverse/daed/graphs/contributors)

If you would like to contribute, please see the [instructions](./CONTRIBUTING.md). Also, it is recommended following the [commit message guide](./docs/commit-msg-guide.md).

## Credits

- [dae-wing](https://github.com/daeuniverse/dae-wing)
- [Next.JS](https://github.com/vercel/next.js)
- [NextUI](https://github.com/nextui-org/nextui)
