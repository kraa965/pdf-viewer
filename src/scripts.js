var pdfjsLib = window["pdfjs-dist/build/pdf"];
var canvas = document.getElementById("pdf-render");
var ctx = canvas.getContext("2d");

var renderInProgress = false;

var myState = {
    pdf: null,
    currentPage: 1,
    scale: 2,
};

const url = "/src/assets/sample1.pdf";

var loadingTask = pdfjsLib.getDocument(url);
loadingTask.promise.then(
    (pdf) => {
        console.log("PDF loaded...");
        myState.pdf = pdf;
        document.querySelector("#page-count").textContent =
            myState.pdf._pdfInfo.numPages;
        render();
    },
    (error) => {
        console.error(error);
    }
);

function render() {
    if (!renderInProgress) {
        myState.pdf.getPage(myState.currentPage).then((page) => {
            renderInProgress = true;
            console.log("Page loaded...");

            var viewport = page.getViewport(myState);

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            var renderContext = {
                canvasContext: ctx,
                viewport: viewport,
            };

            var renderTask = page.render(renderContext);
            renderTask.promise.then(() => {
                console.log("Page rendered....");
                renderInProgress = false;
            });
            document.querySelector("#page-num").textContent = myState.currentPage;
        });
    }
}

document.getElementById("prev-page").addEventListener("click", (e) => {
    if (myState.pdf == null || myState.currentPage == 1) return;

    myState.currentPage -= 1;
    document.getElementById("current_page").value = myState.currentPage;
    render();
});

document.getElementById("next-page").addEventListener("click", (e) => {
    if (
        myState.pdf !== null &&
        myState.currentPage < myState.pdf._pdfInfo.numPages
    ) {
        myState.currentPage += 1;
        document.getElementById("current_page").value = myState.currentPage;
        render();
    }
});

document.getElementById("current_page").addEventListener("keypress", (e) => {
    if (myState.pdf == null) return;
    if (e.key === "Enter") {
        var inputVal = document.getElementById("current_page");
        var desiredPage = inputVal.valueAsNumber;
        if (desiredPage < 0) {
            myState.currentPage = 1;
        } else {
            myState.currentPage =
                desiredPage <= myState.pdf._pdfInfo.numPages
                    ? desiredPage
                    : myState.pdf._pdfInfo.numPages;
        }
        inputVal.value = myState.currentPage;
        render();
    }
});

document.getElementById("zoom_in").addEventListener("click", (e) => {
    if (myState.pdf == null) return;
    myState.scale += 0.2;
    render();
});

document.getElementById("zoom_out").addEventListener("click", (e) => {
    if (myState.pdf == null) return;
    myState.scale -= 0.2;
    render();
});