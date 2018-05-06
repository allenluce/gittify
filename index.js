'use strict'
const transformTools = require('browserify-transform-tools')
const git = require('nodegit')
const appRoot = require('app-root-path')

function escapeRegExp (str) {
  return str.replace(/([!$()*+./:=?[\\\]^{|}])/g, '\\$1')
}

function transform (content, options, done) {
  let ph = {}
  if (options.config && options.config.placeholders) {
    ph = options.config.placeholders
  }
  const githash = ph.githash || '__GITHASH__'
  const gitbranch = ph.gitbranch || '__GITBRANCH__'
  const gitworkdir = ph.gitworkdir || '__GITWORKDIR__'
  git.Repository.open(appRoot.path).then(function (repo) {
    return Promise.all([
      repo,
      repo.getHeadCommit(),
      repo.getCurrentBranch()
    ]).then(function (rets, err) {
      const repo = rets[0]
      const commit = rets[1]
      const branch = rets[2]
      let nc = content.replace(new RegExp(escapeRegExp(githash), 'g'), commit.sha())
      nc = nc.replace(new RegExp(escapeRegExp(gitbranch), 'g'), branch.name())
      nc = nc.replace(new RegExp(escapeRegExp(gitworkdir), 'g'), repo.workdir())
      return done(null, nc)
    })
  }).catch(done)
}

module.exports = transformTools.makeStringTransform('gittify', transform)
