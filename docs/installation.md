---
title: "Installation Guide"
---

## Installation Guide

This guide will run you through installing all the tools and prerequisites required for the workshop.

## Contents

1. [Code Editor](#code-editor)

2. [Browser](#browser)

3. [Command-Line](#command-line)

4. [Node.js & npm](#nodejs--npm)

5. [`canvas-sketch`](#canvas-sketch)

6. [`canvas-sketch-util`](#canvas-sketch-util)

7. [ThreeJS](#threejs)

8. [Other Dependencies](#other-dependencies)

## Code Editor

If you don't have a JavaScript code editor, you can download [VSCode](https://code.visualstudio.com/) from its website.

## Browser

I recommend [Chrome](https://www.google.com/chrome/) for development, as it has great support for canvas rendering and exporting high-resolution images.

All browsers come built-in with the `<canvas>` API, so you don't need to install that yourself.

## Command-Line

In macOS, you can go to *Applications > Utilities > Terminal.app* to run Terminal and enter commands.

In Windows, you can click *Start* and search for `cmd.exe`, or download [cmder.net](http://cmder.net/) for a more powerful experience.

If you are new to the command-line, you can see some [Tips for using the Command-Line](./command-line.md).

## Node.js & npm

You can download and install the latest version of [Node.js](https://nodejs.org/en/) (version 22.x or higher) from its website. This will come included with a recent version of npm (11.x or higher).

Once installed, you should be able to run `node --version` and `npm --version` from your command-line.

## `canvas-sketch`

We will be using [`canvas-sketch`](https://github.com/mattdesl/canvas-sketch/) and its command-line interface (CLI) during the workshop.

To install the CLI with npm, use the `--global` or `-g` flag like so:

```sh
npm install canvas-sketch-cli --global
```

> :bulb: Note the `-cli` suffix in the name; this tells npm to install the CLI tool, not the code library.

## `canvas-sketch-util`

As the workshop progresses, we will start to depend on third-party utilities for math, random number generation, and other features. The [canvas-sketch-util](https://github.com/mattdesl/canvas-sketch-util/) library includes many of these features, and you can install it with npm.

Run the following from your project folder:

```sh
npm install canvas-sketch-util
```

Now, your code can require it like so:

```js
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
```

## ThreeJS

In the second part of the workshop, we will introduce [ThreeJS](https://threejs.org/), a 3D engine on top of WebGL and GLSL.

To install it, run the following from your project folder:

```sh
npm install three
```

Now, you can require it like so:

```js
const THREE = require('three');
```

## Other Dependencies

If you find a third-party module on [npm](https://www.npmjs.com/package/) that you like, you can install and require it in the same way as you did `canvas-sketch-util` and `three`.

### [← Back to Documentation](../README.md)
