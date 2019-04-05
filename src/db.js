const { MongoClient, ObjectID } = require('mongodb');

const logger = require('./logger.js');

module.exports = new db();

function db() {
    this.log = logger;
    this.config = null;
    this._db = null;
}

db.prototype.connect = function(config) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(config.database.uri, { useNewUrlParser: true }, (err, cl) => {
            if (err) reject(err);
            else {
                this.log.info("Database connection successful!");
                this._db = cl.db(config.database.db);
                resolve(this);
            }
        });
    });
};

db.prototype.getUser = function(user) {
    return new Promise((resolve, reject) => {
        this._db.collection("users").findOne({"id": user.id}, (err, res) => {
            if (err) reject(err);
            if(!res) return resolve(this.createUser(user));

            resolve(res);
        });
    });
};

db.prototype.createUser = function(user) {
    return new Promise((resolve, reject) => {
        this._db.collection("users").insertOne(
            {
                id: user.id,
                username: user.username,
                discriminator: user.discriminator,
                tag: user.tag,
                avatar: user.avatar,
                completed_challenges: [],
                permission: 'Z'
            },
            (err, res) => {
                if (err) reject(err);

                this.log.debug(`User added: ${user.tag}`);
                resolve(res.ops);
            }
        );
    });
};

db.prototype.createChallenge = function(challenge) {
    return new Promise((resolve, reject) => {
        this._db.collection("challenges").insertOne(challenge, (err, res) => {
            if (err) reject(err);

            resolve(res.ops[0]);
        });
    });
};

db.prototype.getChallenges = function() {
    return new Promise((resolve, reject) => {
        this._db.collection("challenges").find({}, (err, res) => {
            if (err) reject(err);

            resolve(res.toArray());
        });
    });
};

db.prototype.getChallenge = function(challenge) {
    return new Promise((resolve, reject) => {
        this._db.collection("challenges").findOne({"_id": new ObjectID(challenge._id)}, (err, res) => {
            if (err) reject(err);

            resolve(res);
        });
    });
};

db.prototype.getChallengebyFlag = function(flag) {
    return new Promise((resolve, reject) => {
        this._db.collection("challenges").findOne({"flag": flag}, (err, res) => {
            if (err) reject(err);

            resolve(res);
        });
    });
};

db.prototype.editChallengeFlag = function(challenge, newflag) {
    return new Promise((resolve, reject) => {
        this._db.collection("challenges").findOneAndUpdate(
            {"id": challenge.id},
            {$set: {"flag": newflag}},
            (err, res) => {
                if (err) reject(err);

                resolve(res.result.value);
            }
        );
    });
};

db.prototype.deleteChallenge = function(challenge) {
    return new Promise((resolve, reject) => {
        this._db.collection("challenges").findOneAndDelete({"_id": new ObjectID(challenge._id)}, (err, res) => {
                if (err) reject(err);

                resolve(res.value);
            }
        );
    });
};

db.prototype.solveChallenge = function(user, flag) {
    return new Promise((resolve, reject) => {
        this._db.collection("users").findOneAndUpdate(
            {id: user.id},
            {$push: {completed_challenges: flag._id}},
            (err, res) => {
                if (err) reject(err);

                resolve(flag);
            }
        );
    });
};

db.prototype.checkAdmin = function(_user) {
    return this.getUser(_user)
    .then(user => {
        return user.permission.includes("A");
    });
};
