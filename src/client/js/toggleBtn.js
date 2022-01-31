const toggleBtn = document.querySelector("#navbar-toggle-btn");
const navbar = document.querySelector("#nav-bar");

const NONE_DISPLAY_KEYWORD = "none-display";

let hideNavbar = true;
navbar.classList.remove(NONE_DISPLAY_KEYWORD);

const handleClick = () => {
  hideNavbar = hideNavbar ? false : true;
  navbar.classList = hideNavbar ? "hide" : "show";
};

toggleBtn.addEventListener("click", handleClick);
