/* global describe before after it */
const transformTools = require('browserify-transform-tools')
const expect = require('chai').expect
const path = require('path')
const sinon = require('sinon')
const git = require('nodegit')
const gittify = require('..')
const {promisify} = require('util')

describe('gittify', function () {
  beforeEach(function () {
    this.sandbox = sinon.createSandbox()
    this.sandbox.stub(git.Commit.prototype, 'sha').callsFake(() => '989a3bf44a28080e67d4fcd3d81b7fb8c725df64')
    this.sandbox.stub(git.Repository.prototype, 'head').callsFake(() => ({name: () => 'refs/heads/somebranch'}))
    this.sandbox.stub(git.Repository.prototype, 'workdir').callsFake(() => '/the/working/dir')
    this.sandbox.stub(git.Config.prototype, 'getInt32').callsFake((a) => 7) // To guard against local config
  })
  afterEach(function () {
    this.sandbox.restore()
  })
  it('should correctly transform a file', async function () {
    const jsFile = path.resolve(__dirname, '../fixtures/index.js')
    const result = await promisify(transformTools.runTransform)(gittify, jsFile)
    expect(result).to.contain(`console.log('The hash is 989a3bf')`)
    expect(result).to.contain(`console.log('The full hash is 989a3bf44a28080e67d4fcd3d81b7fb8c725df64')`)
    expect(result).to.contain(`console.log('The branch is refs/heads/somebranch')`)
    expect(result).to.contain(`console.log('The workdir is /the/working/dir')`)
  })

  it('should trim SHA length to core.abbrev value', async function () {
    git.Config.prototype.getInt32.restore() // Restore before replacing
    this.sandbox.stub(git.Config.prototype, 'getInt32').callsFake((varName) => {
      expect(varName).to.equal("core.abbrev")
      return 10
    })
    const jsFile = path.resolve(__dirname, '../fixtures/index.js')
    const result = await promisify(transformTools.runTransform)(gittify, jsFile)
    expect(result).to.contain(`console.log('The hash is 989a3bf44a')`)
    expect(result).to.contain(`console.log('The full hash is 989a3bf44a28080e67d4fcd3d81b7fb8c725df64')`)
    expect(result).to.contain(`console.log('The branch is refs/heads/somebranch')`)
    expect(result).to.contain(`console.log('The workdir is /the/working/dir')`)
  })

  it('should correctly transform a file with configured overrides', async function () {
    const configuredGittify = gittify.configure({
      placeholders: {
        githash: 'GORTHASH',
        gitfullhash: 'GORTFULLHASH',
        gitbranch: 'snake time!',
        gitworkdir: 'lovely[]'
      }
    })

    const jsFile = path.resolve(__dirname, '../fixtures/index2.js')
    const result = await promisify(transformTools.runTransform)(configuredGittify, jsFile)
    expect(result).to.contain(`console.log('The hash should be 989a3bf')`)
    expect(result).to.contain(`console.log('The full hash should be 989a3bf44a28080e67d4fcd3d81b7fb8c725df64')`)
    expect(result).to.contain(`console.log('The branch should be refs/heads/somebranch')`)
    expect(result).to.contain(`console.log('The workdir should be /the/working/dir')`)
  })
})
