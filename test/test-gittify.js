/* global describe before after it */
const transformTools = require('browserify-transform-tools')
const expect = require('chai').expect
const path = require('path')
const sinon = require('sinon')
const git = require('nodegit')
const gittify = require('..')

describe('gittify', function () {
  before(function (done) {
    this.sandbox = sinon.createSandbox()
    this.sandbox.stub(git.Commit.prototype, 'sha').callsFake(() => '989a3bf44a28080e67d4fcd3d81b7fb8c725df64')
    this.sandbox.stub(git.Repository.prototype, 'head').callsFake(() => ({name: () => 'refs/heads/somebranch'}))
    this.sandbox.stub(git.Repository.prototype, 'workdir').callsFake(() => '/the/working/dir')
    done()
  })
  after(function (done) {
    this.sandbox.restore()
    done()
  })
  it('should correctly transform a file', function (done) {
    const jsFile = path.resolve(__dirname, '../fixtures/index.js')
    transformTools.runTransform(gittify, jsFile, function (err, result) {
      if (err) return done(err)
      expect(result).to.contain(`console.log('The hash is 989a3bf44a28080e67d4fcd3d81b7fb8c725df64')`)
      expect(result).to.contain(`console.log('The branch is refs/heads/somebranch')`)
      expect(result).to.contain(`console.log('The workdir is /the/working/dir')`)
      done()
    })
  })
  it('should correctly transform a file with config info', function (done) {
    const configuredGittify = gittify.configure({
      placeholders: {
        githash: 'GORTHASH',
        gitbranch: 'snake time!',
        gitworkdir: 'lovely[]'
      }
    })

    const jsFile = path.resolve(__dirname, '../fixtures/index2.js')
    transformTools.runTransform(configuredGittify, jsFile, function (err, result) {
      if (err) return done(err)
      expect(result).to.contain(`console.log('The hash should be 989a3bf44a28080e67d4fcd3d81b7fb8c725df64')`)
      expect(result).to.contain(`console.log('The branch should be refs/heads/somebranch')`)
      expect(result).to.contain(`console.log('The workdir should be /the/working/dir')`)
      done()
    })
  })
})
