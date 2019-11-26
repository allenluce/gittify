'use strict'
const transformTools = require('browserify-transform-tools')
const git = require('nodegit')
const appRoot = require('app-root-path')
const { callbackify } = require('util')

String.prototype.repexp = function (tag, replacement) {
  return this.replace(new RegExp(tag.replace(/([!$()*+./:=?[\\\]^{|}])/g, '\\$1'), 'g'), replacement)
}

async function transform (content, options) {
  let ph = {}
  if (options.config && options.config.placeholders) {
    ph = options.config.placeholders
  }

  const repo = await git.Repository.open(appRoot.path)
  let abbv = 7
  try {
    const gitConfig = await repo.config()
    abbv = await gitConfig.getInt32("core.abbrev")
  } catch (e) {
    if (e.message != "config value 'core.abbrev' was not found") throw e
  }
  const commit = await repo.getHeadCommit()
  const branch = await repo.getCurrentBranch()
  return content.repexp(ph.githash || '__GITHASH__', commit.sha().substring(0, abbv))
    .repexp(ph.gitfullhash || '__GITFULLHASH__', commit.sha())
    .repexp(ph.gitbranch || '__GITBRANCH__', branch.name())
    .repexp(ph.gitworkdir || '__GITWORKDIR__', repo.workdir())
}

module.exports = transformTools.makeStringTransform('gittify', callbackify(transform))
