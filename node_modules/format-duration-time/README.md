# format-duration-time
This is a package to format duration, written in TypeScript.<br>
[![Build Status](https://travis-ci.org/gigosa/format-duration-time.svg?branch=master)](https://travis-ci.org/gigosa/format-duration-time)
[![Codecov Coverage](https://img.shields.io/codecov/c/github/gigosa/format-duration-time/master.svg?style=)](https://codecov.io/gh/gigosa/format-duration-time/)

## Install
npm
```
npm i format-duration-time
```
yarn
```
yarn add format-duration-time
```

## Usage
You can import this package to your code as below in JavaScript and TypeScript.

```
import duration from 'format-duration-time';
```

or

```
var duration = require("format-duration-time").default
```

The followings are some sample codes to use this package.
```
duration(3600000).format('h')// 1
duration(9000000).format('h:m')// 2:30
duration(1, 'h').format('m[minute]ss[second]')//60minute00second
duration(60, 's').format('mm')// 01
duration(1000, 's').format('s', {digitSeparator: ','})// 1,000
duration(1, 'S').format('SSSS')// 0001
duration(90, 'm').format('h', { digitSeparator: ',', decimalPlace: 3, roundType: 'round'})//1.500
```

duration and format methods should be called with following arguments.
```
duration(value, unit).format(template);
```
To padding zero on the head of formated duration, format function should be called by multiple token.
```
duration(1, 'S').format('SSSS')// 0001
```

Default input unit is milli second.<br>
To escape your token in the template you can use square brackets.
```
duration(1, 'h').format('m[minute]ss[second]')//60minute00second
```

### Avalable duration unit
||unit argument|
|-|-|
|Day|d|
|Hour|h|
|Minute|m|
|Second|s|
|Milli second|S(default)|

### Avalable format templates

||token|examples|
|-|-|-|
|Day|d <br> dd <br> ...|1, 2, 3, ... <br> 01, 02, 03 ... <br> ...|
|Hour|h <br> hh <br> ...|1, 2, 3, ... <br> 01, 02, 03 ... <br> ...|
|Minute|m <br> mm <br> ...|1, 2, 3, ...  <br> 01, 02, 03, ... <br> ...|
|Second|s <br> ss <br> ...|1, 2, 3, ... <br> 01, 02, 03, ... <br> ...|
|Milli second|S <br> SS <br> ...|1, 2, 3, ... <br> 01, 02, 03, ... <br> ...|

To add or subtract duration, you can use add or sub method like following examples.
```
duration(2, 'm').add(1, 's').format('m [minutes,]s [seconds]')//2 minutes,1 seconds
duration(2, 'm').sub(1, 's').format('m [minutes,]s [seconds]')//1 minutes,59 seconds
```
add and sub methods does not change the original duration object.
```
const firstDuration = duration(1);
const secondDuration = firstDuration.add(1);
firstDuration.format('S');// 1
secondDuration.format('S');// 2
```

## Options

This is an optional parameter.<br>
You can add following options in the format function as Object.
```
duration(value, unit).format(template, {options})
```

### digitSeparator

```
{ digitSeparator: string }
```

To put digit separator in every 3 digit, add digitSeparator option.<br>
Value of digitSeparator must be string.
```
duration(1000, 's').format('s', {digitSeparator: ','})// 1,000
```

### decimalPlace

```
{ decimalPlace: number }
```

You can set number of decimal digits to display.<br>
decimalPlace option will work on only the smallest template token.<br>
Value of decimalPlace must be integer.

```
duration(90, 'm').format('h:m', { decimalPlace: 3})// 1:30.000
```

### roundType

```
{ roundType: 'floor', 'ceil' or 'round' }
```

Set roundType to round the lowest value.<br>
The default type is floor.

```
duration(30, 's').format('m', { roundType: 'round'})//1
```

**You can set multiple options like folowing example.**
```
duration(90, 'm').format('h', { digitSeparator: ',', decimalPlace: 3, roundType: 'round'})//1.500
```
