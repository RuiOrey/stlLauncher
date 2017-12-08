document.getElementById( "loadLink" ).addEventListener( "click", viewSTL );

var currentContext;
var fileUrl = "test.stl"

function viewSTL( event )
    {
        event.preventDefault();
        alert( "view" );
        showSTL();
    }


