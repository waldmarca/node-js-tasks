const yargs = require('yargs')
const path = require('path')
const fs = require('fs')

const args = yargs
  .usage('Usage: node $0 [options]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .example('node $0 --entry ./path --dist ./path --delete')
  .option('entry', {
    alias: 'e',
    describe: 'Путь к исходной директории',
    demandOption: true,
  })
  .option('dist', {
    alias: 'd',
    describe: 'Директория сортировки',
    default: './dist',
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удалить исходную директорию?',
    boolean: true,
    default: false,
  })
  .epilog('Задание 1')
  .argv

const config = {
  src: path.normalize(path.join(__dirname, args.entry)),
  dist: path.normalize(path.join(__dirname, args.dist)),
  delete: args.delete,
}

function createDir(src, cb) {
  fs.mkdir(src, (err) => {
    if (err && err.code === 'EEXIST') return cb(null)
    if (err) return cb(err)

    cb(null)
  })
}

function sorter(src) {
  fs.readdir(src, (err, files) => {
    if (err) throw err

    files.forEach((file) => {
      const currentPath = path.join(src, file)

      const innerDir = path.basename(currentPath)[0].toUpperCase()

      fs.stat(currentPath, (err, stats) => {
        if (err) throw err

        if (stats.isDirectory()) {
          sorter(currentPath)
        } else {
          createDir(config.dist, (err) => {
            if (err) throw err

            createDir(path.join(args.dist, innerDir), (err) => {
              if (err) throw err

              fs.link(
                currentPath,
                path.join(args.dist, innerDir, path.basename(currentPath)),
                (err) => {
                  if (err) {
                    console.error(err)
                    return
                  }
                }
              )

              if (args.delete) {
                console.log(currentPath)
                fs.unlink(currentPath, (err) => {
                  if (err) {
                    console.log(err)
                    return
                  }
                })
              }
            })
          })
        }
      })
    })
  })
}
try {
  sorter(config.src)
} catch (error) {
  console.log(error)
}

process.on('exit', () => {
  if (args.delete) {
    fs.rmdirSync(config.src, { recursive: true }, (err) => {
      if (err) throw err
    })
  }
})