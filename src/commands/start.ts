import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

interface AppWorksProps {
  displayName: string
  description: string
  version: string
  awgPlatformVersion: string
  type: string
  release: string
}

export default class Start extends Command {
  static description = 'Create a new appworks app from a template. Defaults to `starter`'

  static examples = [
    `$ appworks start --name MyApp
cloning repository https://github.com/opentext/appworks-app-starter...
`,
    `$ appworks start --name MyApp --template https://github.com/opentext/appworks-js-example-camera
cloning repository https://github.com/opentext/appworks-js-example-camera...
`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    template: flags.string({char: 't', description: 'git repository to clone'}),
    name: flags.string({char: 'n', description: 'name of your new project'}),
    version: flags.string({char: 'v', description: 'version number of your project'}),
    release: flags.string({char: 'r', description: 'release number of your project'}),
    description: flags.string({char: 'd', description: 'description of your project'}),
    awgPlatformVersion: flags.string({char: 'a', description: 'AppWorks Gateway platform version of your project'}),
  }

  static args = [{name: 'repo'}]

  private static defaultTemplate = 'https://github.com/opentext/appworks-app-starter'

  private static async getName(flags: any): Promise<string> {
    let name = flags.name
    if (!name) {
      return cli.prompt('Please provide a name for your app')
    } else {
      return name
    }
  }

  private static getVersion(flags: any): string {
    const version = flags.version || '0.0.0'

    const versionReg = /^\d{1,2}\.\d{1,2}\.\d{1,2}$/
    if (!versionReg.test(version)) {
      throw new Error('Invalid version number passed. Version must take on the form `x.x.x`')
    }

    return version
  }

  private static getTemplate(flags: any): string {
    return flags.template || Start.defaultTemplate
  }

  private static getRelease(flags: any): string {
    return flags.release || '1'
  }

  private static getDescription(flags: any): string {
    return flags.description || 'An AppWorks app created with the AppWorks CLI'
  }

  private static getAwgPlatformVersion(flags: any): string {
    return flags.awgPlatformVersion || '16'
  }

  private static createAppDirectory(name: string): string {
    const directory = path.join(process.cwd(), name)
    if (fs.existsSync(directory)) {
      throw new Error(`Directory ${directory} exists. Please remove it and run this command again, or rename your app`)
    }
    fs.mkdirSync(directory)
    return directory
  }

  private static async cloneRepo(repoUrl: string, directory: string): Promise<void> {
    const Git = require('nodegit')
    return Git.Clone(repoUrl, directory)
  }

  private static async createPropertiesFile(properties: AppWorksProps, directory: string): Promise<void> {
    const propertiesFileText = '' +
      `displayName=${properties.displayName}${os.EOL}` +
      `description=${properties.description}${os.EOL}` +
      `version=${properties.version}${os.EOL}` +
      `awgPlatformVersion=${properties.awgPlatformVersion}${os.EOL}` +
      `release=${properties.release}${os.EOL}` +
      `type=${properties.type}${os.EOL}`

    fs.writeFile(path.join(directory, 'app.properties'), propertiesFileText, err => {
      if (err) {
        throw err
      }
    })
  }

  async run() {
    const {flags} = this.parse(Start)

    const name = await Start.getName(flags)
    const template = Start.getTemplate(flags)
    const description = Start.getDescription(flags)
    const version = Start.getVersion(flags)
    const release = Start.getRelease(flags)
    const awgPlatformVersion = Start.getAwgPlatformVersion(flags)
    this.log(`Creating AppWorks app "${name}", version ${version}, description "${description}"`)

    const directory = Start.createAppDirectory(name)

    this.log(`Cloning repo ${template} into ${directory}...`)
    await Start.cloneRepo(template, directory)
    this.log('Done')

    this.log('Creating app.properties...')
    const props: AppWorksProps = {
      displayName: name,
      type: 'app',
      description,
      version,
      release,
      awgPlatformVersion,
    }
    await Start.createPropertiesFile(props, directory)
    this.log('Done')

    this.log(`${name} successfully created`)
  }
}
