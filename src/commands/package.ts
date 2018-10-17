import {Command, flags} from '@oclif/command'

export default class Start extends Command {
  static description = 'Package the app in the current directory to be deployed on the AppWorks Gateway'

  static examples = [
    `$ appworks package
packaging the 'www' directory for deployment...
`,
    `$ appworks package --dir build
packaging the 'build' directory for deployment...
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    dir: flags.string({
      char: 'd',
      description: 'the directory to package for deployment - this directory contains your application\'s final javascript, html, css, images, and any other assets'
    }),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'directory'}]

  async run() {
    const {args, flags} = this.parse(Start)

    const name = flags.dir || 'www'
    this.log(`hello ${name} from .\\src\\commands\\package.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
