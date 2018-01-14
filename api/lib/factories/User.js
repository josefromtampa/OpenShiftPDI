var _ = require("lodash"),
  MongoFactory = require("./MongoFactory"),
  Hash = require('password-hash-and-salt'),
  Promise = require("bluebird")

module.exports = {

  getList: function (req, res) {
    // paginate ?page=2&limit=25
    // sort ?sort=updatedAt ASC
    // search ?search=bacon

    var query = parseQuery(req.query)
    //console.log(query)

    User
      .find(query.find)
      .paginate(query.paginate)
      //.skip(query.skip)
      .then(function (response) {
        res.json({success: true, data: response})
      }, function (err) {
        res.notFound(new NotFoundError())
      })
  },

  get: function (req, res) {
    // by id
    MongoFactory
      .findUserById(req.params.id, User)
      .then(function (response) {
        if (response) {
          if (response._id) {
            response.id = response._id
            delete response._id
          }
          res.json({success: true, data: response})
        }
        else
          res.notFound(new NotFoundError())
      }, function (err) {
        res.notFound(new NotFoundError())
      })
  },

  delete: function (req, res) {
    // by id
    if (!req.params.id) {
      return res.badRequest({
        success: false,
        message: "Id Required"
      })
    }
    MongoFactory
      .deleteByMongoId(req.params.id, User)
      .then(function (response) {
        //console.log('delete', response)
        if (!response.result || !response.result.ok) {
          return res.serverError({
            success: false,
            message: ["Error deleting ", "'", req.params.id, "'"].join("")
          })
        }
        if (!response.result.n) {
          return res.notFound(new NotFoundError())
        }
        return res.json({success: true})

      }, function (err) {
        res.notFound(new NotFoundError())
      })
  },

  put: function (req, res) {
    return hasBody(req.body)
      .then(function(user) {
        if (!user.id)
          user.id = req.params.id
        return user
      })
      .then(hashUserPassword) 
      .then(saveUser)
      .then(function (user) {
        res.json(_.omit(user, ["password"]))
      })
      .catch(BodyRequiredError, function(err) {
        res.badRequest(err)
      })
      .catch(function (err) {
        res.serverError({status: false, err: err})
      })
  },

  post: function (req, res) {
    return hasBody(req.body)
      .then(isUsernameAvailable)
      .then(addCompany)
      .then(hashUserPassword)
      .then(saveUser)
      .then(function (user) {
        res.json({success: true, data: [_.omit(user, ["password"])]})
      })
      .catch(BodyRequiredError, function(err) {
        res.badRequest(err)
      })
      .catch(UsernameRequiredError, function(err) {
        res.badRequest(err)
      })
      .catch(UsernameTakenError, function (err) {
        res.status(409).json(err)
      })
      .catch(function (err) {
        res.serverError({status: false, err: err})
      })
  }
}

function addCompany (user) {
  if (!_.isArray(user.companies) || !user.companies.length) {
    var ibhs = "IBHS"
    return Company.findOne({name: ibhs})
      .then(function(company) {
        if (!company) {
          return Promise.reject(new CompanyNotFoundError(ibhs))
        }
        user.companies = [company]
        return user
      })
  }
  return Promise.resolve(user)
}

function saveUser(user) {
  return MongoFactory.upsert(user, undefined, User)
}

function hashUserPassword(user) {

    if (user.password) {
        return hashPassword(user.password)
          .then(function (hashedValue) {
              user.password = hashedValue
              return user
          });
    } else {
        return user;
    }// if-else

}

function hashPassword(password) {
  return new Promise(function (resolve, reject) {
    if (!password) {
      return resolve()
    }
    Hash(password)
      .hash(function (err, hashedPassword) {
        if (err) {
          return reject(err)
        }
        resolve(hashedPassword)
      })
  })
}

function hasBody(body) {
  return !body || !_.isObject(body)
    ? Promise.reject(new BodyRequiredError())
    : Promise.resolve(body)
}

function isUsernameAvailable(user) {
  return new Promise(function (resolve, reject) {
    if (!user.username) {
      return reject(new UsernameRequiredError())
    }

    User.count({
      username: user.username
    })
      .exec(function (err, n) {
        if (err) {
          return reject(err)
        }
        if (n) {
          return reject(new UsernameTakenError(user.username))
        }
        resolve(user)
      })
  })
}

function parseQuery(query) {
  //console.log("parseQuery", query)
  if (!_.isObject(query)) {
    query = {}
  }
  var parsedQuery = {
      find: {
        //where: undefined,
        //or: undefined
      },
      paginate: {
        page: 0,
        limit: 50
      },
      skip: 0
    },
    maxLimit = 100

  if (query.search) {
    var queryString = query.search
    parsedQuery.find.or = [
      {username: {contains: queryString}},
      {email: {contains: queryString}},
      {firstName: {contains: queryString}},
      {lastName: {contains: queryString}},
    ]
  }

  if (query.skip) {
    parsedQuery.skip = parseInt(query.skip)
  }

  if (query.sort) {
    parsedQuery.find.sort = query.sort
  } else {
    parsedQuery.find.sort = 'updatedAt DESC'
  }

  if (query.limit) {
    var limit = parseInt(query.limit)
    if (limit > maxLimit) {
      limit = maxLimit
    }
    parsedQuery.paginate.limit = limit
  }

  if (query.page) {
    parsedQuery.paginate.page = query.page
  }
  return parsedQuery
}


// error types

function NotFoundError() {
  this.message = 'Not found'
  this.success = false
  this.name = "NotFoundError"
}
NotFoundError.prototype = Object.create(Error.prototype)

function UsernameTakenError(username) {
  this.message = 'username "' + username + '" is already taken'
  this.success = false
  this.name = "UsernameTakenError"
}
UsernameTakenError.prototype = Object.create(Error.prototype)

function BodyRequiredError() {
  this.message = "Missing request body"
  this.success = false
  this.name = "BodyRequiredError"

}
BodyRequiredError.prototype = Object.create(Error.prototype)

function UsernameRequiredError() {
  this.message = "username is required"
  this.success = false
  this.name = "UsernameRequiredError"
}
UsernameRequiredError.prototype = Object.create(Error.prototype)
