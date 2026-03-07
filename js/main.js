const toggle = document.getElementById("mobile-menu-toggle");
const menu = document.getElementById("mobile-menu");

// Listen for clicks to open the nav menu.
toggle.addEventListener("click", (e) =>
{
	e.stopPropagation();
	menu.classList.toggle("hidden");
});

// Close nav menu when clicking outside.
document.addEventListener("click", (e) =>
{
	if (!menu.contains(e.target) && !toggle.contains(e.target))
	{
		menu.classList.add("hidden");
	}
});

// Close nav menu on scroll.
window.addEventListener("scroll", () =>
{
	menu.classList.add("hidden");
});

// Send-to-top button logic.
const scrollBtn = document.getElementById("scroll-top-btn");

window.addEventListener("scroll", () =>
{
	// Once the window is past 300px, show the scroll-to-top button.
	scrollBtn.classList.toggle("visible", window.scrollY > 300);
});

// Dark mode toggle button logic.
function applyTheme(theme)
{
	document.documentElement.setAttribute("data-theme", theme);
	localStorage.setItem("theme", theme);
}

function toggleTheme()
{
	const current = document.documentElement.getAttribute("data-theme");
	applyTheme(current === "dark" ? "light" : "dark");
}

document.getElementById("theme-toggle").addEventListener("click", toggleTheme);
document
	.getElementById("theme-toggle-mobile")
	.addEventListener("click", toggleTheme);

// Load saved theme on page load.
const saved = localStorage.getItem("theme");
if (saved) applyTheme(saved);

// Check open status (for the salon status indicator bullet).
function updateOpenStatus()
{
	// Get current date and time.
	const now = new Date();
	const day = now.getDay();
	const hours = now.getHours();
	const minutes = now.getMinutes();
	const time = hours + minutes / 60;

	let isOpen = false;

	if (day >= 1 && day <= 5)
		// Monday - Friday
		isOpen = time >= 8 && time < 18;
	else if (day === 6)
		// Saturday
		isOpen = time >= 9 && time < 14;
	// Sunday is always closed.

	// Get the indicator element.
	const bullet = document.querySelector(".status-bullet");
	const card = document.querySelector(".status-card");

	if (!bullet || !card) return;

	// If it is open, set it's style to the open status. Else dark.
	if (isOpen)
	{
		bullet.style.backgroundColor = "var(--status-open-text)";
		card.className = "status-card open";
		card.querySelector("span").textContent = "Open Now";
	} else
	{
		bullet.style.backgroundColor = "var(--status-closed-text)";
		card.className = "status-card closed";
		card.querySelector("span").textContent = "Closed";
	}
}

updateOpenStatus();


// Limit image quality on mobile or poor connections.
function getSrcset(base, ext, allowFull = false)
{
	// Get device condition.
	const isMobile = window.innerWidth < 769;
	const poorConnection =
		navigator.connection &&
		(navigator.connection.saveData ||
			["slow-2g", "2g", "3g"].includes(navigator.connection.effectiveType));

	// If the WiFi connection is poor or data-saving is enabled.
	if (poorConnection)
	{
		return `images/gallery/${base}_low.webp 480w`;
	}

	// If full-res is allowed and it's a mobile device.
	if (allowFull && isMobile)
	{
		return `images/gallery/${base}_low.webp 480w, images/gallery/${base}_medium.webp 768w`;
	}

	// If the devices is a phone.
	if (isMobile)
	{
		// Phone displays don't need the level of detail medium quality has.
		return `images/gallery/${base}_low.webp 480w`;
	}

	// If it's on the gallery page and is a wide-screen device (only that page will set this value to true).
	if (allowFull)
	{
		return `images/gallery/${base}_low.webp 480w, images/gallery/${base}_medium.webp 768w, images/gallery/${base}_${ext}.webp 2000w`;
	}

	// Final option, computers typically but this can include tablets or other wide screens.
	return `images/gallery/${base}_low.webp 480w, images/gallery/${base}_medium.webp 768w`;
}

document.querySelectorAll("picture source[srcset]").forEach((source) =>
{
	const srcset = source.getAttribute("srcset");
	const fullMatch = srcset.match(
		/images\/gallery\/(.+?)_(?:full|normal)\.webp/,
	);

	if (!fullMatch) return;
	const ext = srcset.includes("_normal.webp") ? "normal" : "full";
	const base = fullMatch[1];

	source.setAttribute("srcset", getSrcset(base, ext));
});
