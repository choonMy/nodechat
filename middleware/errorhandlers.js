exports.notFound = function notFound(req, res, next){
    res.send(404, 'You seem lost. You must have taken a wrong turn backthere.');    
};

exports.error = function error(err, req, res, next){
    console.log(err);
    res.send(500, 'Something broke. What did you do?');
};