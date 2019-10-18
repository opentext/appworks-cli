import {Command, flags} from '@oclif/command'
import * as archiver from 'archiver'
import * as fs from 'fs'
import * as ora from 'ora'
import * as os from 'os'
import * as path from 'path'
import * as PropertiesReader from 'properties-reader'
import * as rimraf from 'rimraf'
import * as uuid from 'uuid/v4'

export enum Properties {
  displayName = 'displayName',
  version = 'version',
  awgPlatformVersion = 'awgPlatformVersion',
  description = 'description'
}

export default class Package extends Command {
  static description = 'Package the app in the current directory to be deployed on the AppWorks Gateway'

  static examples = [
    `$ appworks package
(packages the 'www' directory for deployment)
`,
    `$ appworks package --from build --to dist
(packages the 'build' directory for deployment)
`,
  ]

  static defaultBuildDir = 'www'
  static defaultOutputDir = 'package'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    from: flags.string({
      char: 'i',
      description: `the directory to package for deployment - this directory contains your application\'s final javascript, html, css, images, and any other assets. default is "${Package.defaultBuildDir}"`
    }),
    to: flags.string({
      char: 'o',
      description: `the directory to store the packaged bundle. default is "${Package.defaultOutputDir}"`
    }),
    force: flags.boolean({
      char: 'f'
    }),
  }

  private static readonly mobileZipFileName = 'mobile.zip'
  private static readonly iconFileName = 'icon.png'
  private static readonly propertiesFileName = 'app.properties'
  private static readonly stagingAreaDirName = uuid()
  private static readonly requiredProperties = [
    Properties.displayName,
    Properties.awgPlatformVersion,
    Properties.description,
    Properties.version
  ]

  private static validate(flags: any) {
    Package.validateBuildDir(flags)
    Package.validatePropertiesFile()
    Package.validateIcon()
  }

  private static validateBuildDir(flags: any) {
    const buildDir = flags.from || Package.defaultBuildDir
    const directory = path.join(process.cwd(), buildDir)
    if (!fs.existsSync(directory)) {
      throw new Error(`Directory ${directory} does not exist.`)
    }
  }

  private static validatePropertiesFile() {
    const file = path.join(process.cwd(), Package.propertiesFileName)
    if (!fs.existsSync(file)) {
      throw new Error(`${file} not found. This file is required for deployment`)
    }

    const properties = Package.getProperties()
    Package.requiredProperties.forEach(property => {
      if (!properties.get(property)) {
        throw new Error(`Property "${property}" not defined in ${Package.propertiesFileName}. This value is required`)
      }
    })
  }

  private static validateIcon() {
    const file = path.join(process.cwd(), Package.iconFileName)
    if (!fs.existsSync(file)) {
      throw new Error(`${file} not found. This file is required for deployment`)
    }
  }

  private static getProperties(): any {
    const file = path.join(process.cwd(), Package.propertiesFileName)
    return PropertiesReader(file)
  }

  private static parseProperties(): any {
    const properties = Package.getProperties()
    const displayName = properties.get(Properties.displayName)
    const version = properties.get(Properties.version)
    const awgPlatformVersion = properties.get(Properties.awgPlatformVersion)
    const description = properties.get(Properties.description)

    return {
      displayName,
      version,
      awgPlatformVersion,
      description
    }
  }

  private static createOutputDirectory(flags: any) {
    const outDir = flags.to || Package.defaultOutputDir
    const pathToOutDir = path.join(process.cwd(), outDir)
    if (!fs.existsSync(pathToOutDir)) {
      fs.mkdirSync(pathToOutDir)
    }
  }

  private static stripUnnecessaryCharacters(str: string): string {
    return str
      .replace(/\s/g, '')
      .replace(/_/g, '')
  }

  private static zipBuildDir(flags: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const buildDir = flags.from || Package.defaultBuildDir
      const directory = path.join(process.cwd(), buildDir)
      const pathToStagingArea = path.join(os.tmpdir(), Package.stagingAreaDirName)
      const pathToZip = path.join(pathToStagingArea, Package.mobileZipFileName)

      const output = fs.createWriteStream(pathToZip)
      const archive = archiver('zip')

      output.on('close', () => {
        resolve(pathToZip)
      })

      archive.on('error', err => {
        reject(err)
      })

      archive.pipe(output)
      archive.directory(directory, '')
      archive.finalize()
        .then(() => {})
        .catch(err => reject(err))
    })
  }

  private static zipPackageDir(packageName: string, pathToBuildZip: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pathToStagingArea = path.join(os.tmpdir(), Package.stagingAreaDirName)
      const pathToZip = path.join(pathToStagingArea, packageName)
      const output = fs.createWriteStream(pathToZip)
      const archive = archiver('zip')

      output.on('close', () => {
        resolve(pathToZip)
      })

      archive.on('error', err => {
        reject(err)
      })

      archive.pipe(output)
      archive.file(pathToBuildZip, {name: path.basename(pathToBuildZip)})

      const iconFile = path.join(process.cwd(), Package.iconFileName)
      archive.file(iconFile, {name: Package.iconFileName})

      const propertiesFile = path.join(process.cwd(), Package.propertiesFileName)
      archive.file(propertiesFile, {name: Package.propertiesFileName})

      archive.finalize()
        .then(() => {})
        .catch(err => reject(err))
    })
  }

  private static writeFileToOutputDir(flags: any, pathToFile: string): string {
    const outDir = flags.to || Package.defaultOutputDir
    const pathToOutDir = path.join(process.cwd(), outDir)
    const pathToFinalFile = path.join(pathToOutDir, path.basename(pathToFile))
    fs.writeFileSync(pathToFinalFile, fs.readFileSync(pathToFile))
    return pathToFinalFile
  }

  /**
   * Return the path to the staging area
   */
  private static createStagingArea() {
    const pathToStagingArea = path.join(os.tmpdir(), Package.stagingAreaDirName)
    if (!fs.existsSync(pathToStagingArea)) {
      fs.mkdirSync(pathToStagingArea)
    }
  }

  private static async clearStagingArea() {
    const pathToStagingArea = path.join(os.tmpdir(), Package.stagingAreaDirName)
    rimraf(pathToStagingArea, err => {
      if (err) {
        throw err
      }
    })
  }

  async run() {
    const {flags} = this.parse(Package)

    const spinnerLogger = ora('Creating application zip').start()

    if (!flags.force) {
      spinnerLogger.text = 'Validating app structure and flags'
      Package.validate(flags)
    }

    Package.createOutputDirectory(flags)

    const {displayName, version} = Package.parseProperties()
    const packageFileName = `${Package.stripUnnecessaryCharacters(displayName)}_${version}.zip`

    Package.createStagingArea()

    const pathToBuildZip = await Package.zipBuildDir(flags)
    const pathToPackagedZip = await Package.zipPackageDir(packageFileName, pathToBuildZip)
    spinnerLogger.text = 'Done'

    spinnerLogger.text = `Writing ${packageFileName} to output directory...`
    const pathToFinalZip = Package.writeFileToOutputDir(flags, pathToPackagedZip)
    spinnerLogger.text = 'Done'

    spinnerLogger.text = 'Clearing staging area'
    await Package.clearStagingArea()
    spinnerLogger.text = 'Done'

    spinnerLogger.stop()

    this.log('Your app is now ready to be deployed to the AppWorks Gateway')
    this.log(`=> ${pathToFinalZip}`)
  }

}
