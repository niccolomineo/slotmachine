document.addEventListener("DOMContentLoaded", function() {
  var overlayContainer = document.querySelector("#overlay-container");
  overlayControls = function(e) {
    var spaceWasPressed = e.keyCode === 32;
    var enterWasPressed = e.keyCode === 13;
    switch (true) {
      case spaceWasPressed:
        return false;
      case enterWasPressed:
        overlayContainer.style.display = "none";
        document.body.removeEventListener("keyup", overlayControls);
    }
  }
  document.body.addEventListener("keyup", overlayControls);
});