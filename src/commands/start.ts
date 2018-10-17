import {Command, flags} from '@oclif/command'

export default class Start extends Command {
  static description = 'Create a new appworks app from a template. Defaults to `starter`'

  static examples = [
    `$ appworks start
cloning repository https://github.com/opentext/appworks-app-starter...
`,
    `$ appworks start --template https://github.com/opentext/appworks-js-example-camera
cloning repository https://github.com/opentext/appworks-js-example-camera...
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    template: flags.string({char: 't', description: 'git repository to clone'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Start)

    const name = flags.template || 'world'
    this.log(`hello ${name} from .\\src\\commands\\start.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }
  }
}
