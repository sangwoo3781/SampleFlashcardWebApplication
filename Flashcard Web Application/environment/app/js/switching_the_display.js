"use strict";

window.onload = () => {
    let displayingIndex = 0;

    // Hide all but the first word
    const words = document.getElementsByClassName("word");
    for (let i = 1; i < words.length; i++) {
        words[i].style.display = "none";
    }
    
    // Change view of answer
    const showAnswerButton = document.getElementById("show");
    showAnswerButton.onclick = () => {
        words[displayingIndex].children[1].style.visibility = "visible";
        words[displayingIndex].children[2].style.visibility = "visible";
        showAnswerButton.disabled = true;
    };

    const hideAnswer = () => {
        words[displayingIndex].children[1].style.visibility = "hidden";
        words[displayingIndex].children[2].style.visibility = "hidden";
    };

    // Preb, Next button
    const prevButton = document.getElementById("prev");
    prevButton.onclick = () => {
        showAnswerButton.disabled = false;
        hideAnswer();
        words[displayingIndex].style.display = "none";
        displayingIndex--;
        words[displayingIndex].style.display = "block";
        buttonDisabling();
    };

    const nextButton = document.getElementById("next");
    nextButton.onclick = () => {
        showAnswerButton.disabled = false;
        hideAnswer();
        words[displayingIndex].style.display = "none";
        displayingIndex++;
        words[displayingIndex].style.display = "block";
        buttonDisabling();
    };
    const buttonDisabling = () => {
        switch (displayingIndex) {
            case 0:
                prevButton.disabled = true;
                nextButton.disabled = false;
                break;
            case words.length - 1:
                prevButton.disabled = false;
                nextButton.disabled = true;
                break;
            default:
                prevButton.disabled = false;
                nextButton.disabled = false;
                break;
        }
    };
    buttonDisabling();
};
