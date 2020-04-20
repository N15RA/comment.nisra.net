var commentHash = {};
var numOfComments = 0;
function createComment(type, name, text)
{
    var urlDict = {"youtube" : "https://youtube.com/favicon.ico", "slido": "https://www.sli.do/favicon.ico"};
    var elem = $("<div/>")
        .attr("id", "comment")
        .attr("name", "comment" + numOfComments.toString(10))
        .html(": " + text)
        .prepend(
            $("<span/>")
            .attr("id", "username")
            .css("font-weight", "bold")
            .html(name)
        )
        .prepend(
            $("<img/>")
            .attr("id", "icon")
            .attr("src", urlDict[type])
            .attr("width", "12px")
            .attr("height", "12px")
        );
    numOfComments++;
    console.log(`Now comment = ${numOfComments}`);
    return elem;
}

// Return the md5 of a comment
function hashComment(obj)
{
    return md5(obj["name"] + obj["text"] + obj["time"] + obj["type"]);
}

function loadComments(youtube, slido)
{
    $("#loading").remove();
    $.ajax({
        url:"http://localhost:8080/messages",
        data: {
            "youtube": youtube,
            "slido": slido
        },
        type: "GET",
        dataType: "json"
    })
    .done(function(json) {
        console.log(json);
        for(var i = 0; i < json.length; i++) {
            var obj = json[i];
            let objHash = hashComment(obj);
            if (!commentHash[objHash])
            {
                commentHash[objHash] = true;
                $("#parent").append(createComment(obj["type"], obj["name"], obj["text"]));
            }
        }
        console.log(`Refreshed comments in ${new Date(Date.now()).toString()}`);
    })
    .fail(function(xhr, status, errorThrown) {
        alert('XHR Error');
        console.log(`Error: ${errorThrown}`);
        console.log(`Status: ${status}`);
        console.dir(xhr);
    })
    .always(function(xhr, status) {
    });
}

$(document).ready(function() {
    let param = new URLSearchParams(window.location.search);
    let ytID = param.get("youtube");
    let slidoID = param.get("slido");
    let timer = window.setInterval(function() {
        loadComments(ytID, slidoID);
    }, 1500);
});