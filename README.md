# Gittify

Browserify transform to replace placeholders with Git information.

By default, it replaces:

- __GITHASH__ with the current SHA of the repo,
- __GITBRANCH__ with the current checked-out branch,
- __GITWORKDIR__ with the current directory of the checked-out branch, and

So this:

```js
console.log('The hash is __GITHASH__')
console.log('The branch is __GITBRANCH__')
console.log('The workdir is __GITWORKDIR__')
```

Transforms into:

```js
console.log('The hash is 4d607c72e229a2a8db192644778d93a8fc358c19')
console.log('The branch is master')
console.log('The workdir is /home/aluce/src/gittify')
```

## Install

    npm install gittify browserify

## Usage

Transforming a file on the command line:

    browserify input.js -t gittify > output.js

From Node.js:

    const browserify = require('browserify')
    const gittify = require('gittify')
    const fs = require('fs')

    const b = browserify('input.js')
    const output = fs.createWriteStream('output.js')

    b.transform(gittify)
    b.bundle().pipe(output)

    // Can also feed it a config
    browserify().transform('gittify', {
        placeholders {
            githash: 'GORTHASH',
            gitbranch: 'snake time!',
            gitworkdir: 'lovely[]'
        }
    })

You can also add the transform to your `package.json`:

```json
{
    "browserify": {
        "transform": [
            "gittify"
        ]
    }
}
```
