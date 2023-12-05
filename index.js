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
  .epilog('Задание 2.1')
  .argv

const config = {
  src: path.normalize(path.join(__dirname, args.entry)),
  dist: path.normalize(path.join(__dirname, args.dist)),
  delete: args.delete,
}

function readdir(src) {
  return new Promise((resolve, reject) => {
    fs.readdir(src, (err, files) => {
      if (err) reject(err)

      resolve(files)
    })
  })
}

function mkDir(src) {
  return new Promise((resolve, reject) => {
    createDir(src, (err) => {
      if (err) reject(err)

      resolve()
    })
  })
}

function copyFile(from, to) {
  return new Promise((resolve, reject) => {
    fs.link(from, to, (err) => {
      if (err) reject(err)

      resolve()
    })
  })
}

function stats(src) {
  return new Promise((resolve, reject) => {
    fs.stat(src, (err, stat) => {
      if (err) reject(err)

      resolve(stat)
    })
  })
}

function createDir(src, cb) {
  fs.mkdir(src, function (err) {
    if (err && err.code === 'EEXIST') return cb(null)
    if (err) return cb(err)

    cb(null)
  })
}

(async () => {
  async function sorter(src) {
    const files = await readdir(src)

    for (const file of files) {
      const currentPath = path.join(src, file)
      const stat = await stats(currentPath)

      if (stat.isDirectory()) {
        await sorter(currentPath)
      } else {
        await mkDir(config.dist)

        const innerDir = path.basename(currentPath)[0].toUpperCase()

        await mkDir(path.join(args.dist, innerDir))
        await copyFile(
          currentPath,
          path.join(args.dist, innerDir, path.basename(currentPath))
        )
      }
    }
  }

  try {
    await sorter(config.src)

    if (args.delete) {
      fs.rmSync(config.src, { recursive: true })
    }
  } catch (error) {
    console.log(error)
  }
})()