let express = require('express');
let router = express.Router();

/**
 *  GET home page index
 */
router.get('/', function(req, res, next) {

    if (req.session.user){
        res.render('index', { title: req.session.user });
    }else {
        res.render('index', { title: 'login' });
    }
});

module.exports = router;
