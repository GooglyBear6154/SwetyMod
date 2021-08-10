
function updatePoints(user, pts, viewers){
    for( var key in viewers ){
        if( viewers[key].name == user ){
            viewers[key].points = (viewers[key].points + pts);
            return viewers;
        }
    }
};