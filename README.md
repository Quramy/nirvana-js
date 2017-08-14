# Nirvana
JavaScript runner using Electron.

## Install

```sh
npm install electron nirvana
```

## Usage

```sh
nirvana [option] your-javascript.js
```

### Show BrowserWindow

```sh
nirvana -s -w script.js
```

### Custom Context HTML

```sh
nirvana --custom-context-file fixture.html script.js
```

### Concurrency

```sh
nirvana --concurrency 2 script1.js script2.js script3.js
```

## License
MIT
