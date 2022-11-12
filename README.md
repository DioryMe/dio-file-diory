# Dio-file-diory

## Deploy

Run `yarn deploy` with available AWS access keys & secret, e.g.:

```
aws-vault exec jvalanen -- yarn deploy
```

## Test

```
node test.js local
aws-vault exec jvalanen -- node test.js s3
```

## Troubleshooting

Issue:

```

\nSomething went wrong installing the \"sharp\" module\n\nCannot find module '../build/Release/sharp-linux-x64.node'\nRequire stack:\n- /var/task/node_modules/sharp/lib/sharp.js\n- /var/task/node_modules/sharp/lib/constructor.js\n- /var/task/node_modules/sharp/lib/index.js\n- /var/task/node_modules/@diograph/file-generator/dist/image/thumbnailer.js\n- /var/task/node_modules/@diograph/file-gen

```

Fix:

```

npm install --platform=linux --arch=x64

```

```

```
