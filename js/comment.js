var timer = null;
var commentHash = {};
var numOfComments = 0;

function errorMsg(msg)
{
    $("#parent").append(
        $("<p/>").html(msg)
    )
}

// createComment(): Create a comment element
// string type: comment type (youtube|slido)
// string name: name of a comment
// string text: content
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
            .attr("width", "14px")
            .attr("height", "14px")
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

// loadComments(): load the comments API
// string url     : the url of the API endpoint
// string youtube : youtube stream id
// string slido   : slido event hash
// boolean first  : is first time or not
function loadComments(url, youtube=null, slido=null, first=false)
{
    $("#loading").remove();
    //
    data = {}
    if(youtube)
        data["youtube"] = youtube;
    if (slido)
        data["slido"] = slido;
    if(!youtube && !slido)
    {
        errorMsg("Provide ether youtube or slido.");
        clearInterval(timer);
        return;
    }
    //
    $.ajax({
        url: url,
        data: data,
        type: "GET",
        dataType: "json"
    })
    .done(function(json) {
        console.log(`array len = ${json.length}`);
        for(var i = 0; i < json.length; i++) {
            let obj = json[i];
            let objHash = hashComment(obj);
            if (!commentHash[objHash])
            {
                commentHash[objHash] = true;
                if(first)
                    $("#parent").append(createComment(obj["type"], obj["name"], obj["text"]));
                else
                    $("#parent").prepend(createComment(obj["type"], obj["name"], obj["text"]));
            }
        }
        console.log(`Refreshed comments in ${new Date(Date.now()).toString()}`);
    })
    .fail(function(xhr, status, errorThrown) {
        console.log('XHR Error');
        console.log(`Error: ${errorThrown}`);
        console.log(`Status: ${status}`);
        console.dir(xhr);
        clearInterval(timer);
    })
    .always(function(xhr, status) {
    });
}

const defaultRefreshTime = 1500;

$(document).ready(function() {
    let param = new URLSearchParams(window.location.search);
    let ytID = param.get("youtube");
    let slidoID = param.get("slido");
    let refTime = isNaN(parseInt(param.get("refTime"), 10))? defaultRefreshTime : parseInt(param.get("refTime"), 10);
    let url = param.get("url");
    if(url)
    {
        loadComments(url, ytID, slidoID, true);
        timer = window.setInterval(function() {
            loadComments(url, ytID, slidoID, false);
        }, refTime);
    }
    else
    {
        $("body").append(
            $("<p/>").html("Provide the ?url=.")
        );
    }
});