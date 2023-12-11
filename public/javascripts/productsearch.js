$(document).ready(function () {
    $("#search_box").on("input", function () {
        var value = $("#search_box").val().toLowerCase();
        var resultsContainer = $("#resultsContainer");
        resultsContainer.empty();

        $.get('/searchproduct', { q: value }, (data) => {
            data.forEach(element => {
                console.log(element);
                var resultDiv = $("<div>").css({
                    'color': 'black',
                    'background-color': 'white',
                    'padding': '7px',
                    'border': '1px solid black',
                    'text-align': 'center',
                    'cursor': 'pointer'
                }).text(element.name);

                resultDiv.hover(
                    function () {
                        $(this).css({
                            'background-color': '#007bff',
                            'color': 'white'
                        });
                    },
                    function () {
                        $(this).css({
                            'background-color': 'white',
                            'color': 'black'
                        });
                    }
                );

                resultDiv.click(function () {
                    window.location.href = '/productdetails/' + element._id;
                });
                resultsContainer.append(resultDiv);
            });
        });
    });
});
