var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Match = require('../models/match');
var Stage = require('../models/stage');
var Tournament = require('../models/tournament');
var Team = require('../models/team');
var Vuser = require('../models/vuser');
var Federation = require('../models/federation');
var WebSocketServer = require('ws').Server;
var server = require('../app');
var async = require('async');

var wss = new WebSocketServer({ server: server });
var clients = new Set();

wss.on('connection', function connection(ws) {
    clients.add(ws);
    ws.on('close', function() {
        clients.delete(ws);
    });
});


router.post('/get-my-matches', function(req, res, next) {
    let idVk = "vkontakte:" + req.body.idVk;
    console.log(idVk);

    User.findOne({authId: idVk}, function (err, user) {
        if (user == null) {
            return res.json([]);
        }

        Match.find({_id: {$in: user.matchesToReferee}}, function (err, matches) {

            async.map(matches, function (match, done) {
                Stage.findById(match.stage, function (err, stage) {
                    if (err) done(err);

                    Tournament.findById(stage.tournament, function (err, tournament) {
                        if (err) done(err);

                        Federation.findById(match.federation, function (err, federation) {
                            if (err) done(err);

                            Team.findById(match.team1, function (err, team1) {
                                if (err) done(err);

                                Team.findById(match.team2, function (err, team2) {
                                    if (err) done(err);

                                    done(null, {
                                        idMatch: match._id,
                                        tournament: tournament.name,
                                        matchConfig: tournament.matchConfig,
                                        federation: federation.name,
                                        stage: stage.name,
                                        team1: {
                                            idTeam: team1._id,
                                            name: team1.name,
                                            players: team1.vplayers
                                        },
                                        team2: {
                                            idTeam: team2._id,
                                            name: team2.name,
                                            players: team2.vplayers
                                        },
                                    });
                                });
                            });
                        });
                    });
                })
            }, function (err, matchesArr) {
                if (err)
                    return res.json([]);

                async.map(matchesArr, function (match, done) {
                    Vuser.find({_id: {$in: match.team1.players}}, function (err, vusers) {
                        if (err) done(err);

                        match.team1.players = vusers.map(vuser => {
                            return {
                                id: vuser._id,
                                name: vuser.name
                            }
                        });

                        Vuser.find({_id: {$in: match.team2.players}}, function (err, vusers) {
                            if (err) done(err);

                            match.team2.players = vusers.map(vuser => {
                                return {
                                    id: vuser._id,
                                    name: vuser.name
                                }
                            });

                            done(null, match);
                        });
                    });
                }, function (err, arr) {
                    return res.json(arr);
                });
            });
        });
    });
});

router.get('/:idMatch/get-info', function(req, res, next) {
    let idMatch = req.params.idMatch;

    Match.findById(idMatch, function (err, match) {
        return res.json(match.events);
    });
});

router.get('/set-info', function(req, res, next) {
    // let idMatch = req.params.idMatch;
    // let number = req.body.number;
    // let data = req.body.data;
    //
    // Match.findById(idMatch, function (err, match) {
    //     match.events.push({
    //         number: number,
    //         data: data,
    //     });
    //
    //     console.log(req.body);
    //
    //     match.save(function (err) {
    //         return res.json({
    //             status: "OK",
    //             code: 200
    //         });
    //     });
    // });

    let idMatch = req.body.idMatch;
    let number = req.params.number;
    let data = req.params.data;

    clients.forEach((ws) => {
        ws.send(JSON.parse({
            number: number,
            data: data
        }));
    });

    Match.findById(idMatch, function (err, match) {
        match.events.push({
            number: number,
            data: data,
        });

        console.log(req.body);

        match.save(function (err) {
            return res.json({
                status: "OK",
                code: 200
            });
        });
    });

});

router.get('/add-referee', function(req, res, next) {
    console.log("add-referee", req.query);
    User.findById(req.query.idSend, function (err, user) {
        user.matchesToReferee.push(req.query.idMatch);
        user.save((err) => {
            console.log(user);
            res.json({status: 200});
        });
    });
});

module.exports = router;
