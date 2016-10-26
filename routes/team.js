var express = require('express');
var router = express.Router();
var Team = require('../models/team');
var Tournament = require('../models/tournament');

router.post('/create', function(req, res, next) {
    var team = new Team({
        name: req.body.name,
        creators: [req.user._id],
        city: req.body.city,
        motto: req.body.motto,
        players: [],
        player_requests: []
    });
    
    team.save(function (err) {
        if(err) {
            res.status(500);
            return res.json({
                message: "что-то не так"
            });
        }

        res.json({
            _id: team._id
        });
    });
});

router.get('/:id', function(req, res, next) {
    var id = req.param("id");
    Team.findOne({_id : id}, function (err, result) {
        if(err || !result) {
            return next();
        }
        res.json(result);
    });
});

router.post('/get-team', function(req, res, next) {
    Team.find({creators: req.user._id}, function (err, result) {
        return res.json(result);
    });
});

router.post('/get-team-by-tournament/:idTournament', function(req, res, next) {
    Tournament.findById(req.params.idTournament, function (err, tournament) {
        if(err || !tournament) {
            return next(err);
        }
        Team.find({_id: {$in: tournament.teams_requests}}, function (err, teams) {
            return res.json(teams);
        });
    });
});
module.exports = router;
