$(function() {
    
    var apiUrl = appUrl + '/api/bars';
    
    $(".search").submit(function() {
        var query = $("#search").val();
        if (query === "")
            return false;
        
        $(".bar:not(.placeholder)").remove();
        $.getJSON(apiUrl, {q: query}, function(data) {
            data.businesses.forEach(function(bar) {
                var barEl = $(".bar.placeholder").clone();
                barEl.find(".bar-thumbnail img").attr("src", bar.image_url);
                barEl.find(".bar-title a").text(bar.name).attr("href", bar.url);
                barEl.find(".bar-intents-count").text(bar.intents.length);
                if (bar.snippet_text)
                    barEl.find(".bar-text").text('"' + bar.snippet_text + '"');
                barEl
                    .attr("data-id", bar.id)
                    .removeClass("placeholder")
                    .appendTo(".bars");
            });
        });
        
        return false;
    });
    
    $(document).on("click", "body.authed .bar-intents", function() {
        var bar = $(this).closest(".bar");
        $.post(apiUrl, {barId: bar.attr("data-id")}, function(result) {
            bar.find(".bar-intents-count").text(result.count);
        });
    });
    
});