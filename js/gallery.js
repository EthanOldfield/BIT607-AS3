const wrapper = document.querySelector('.carousel-track-wrapper');
const track = document.querySelector('.carousel-track');
const prev = document.querySelector('.carousel-arrow.prev');
const next = document.querySelector('.carousel-arrow.next');
let current = 0;


// Images for each section of the gallery.
const workImages = [
    { title: 'Haircuts & Styling', desc: 'Dog with sunglasses', base: 'dog_sunglasses', ext: 'full' },
    { title: 'Full Grooming', desc: 'Dog getting haircut.', base: 'dog_haircut', ext: 'full' },
    { title: 'Spa Treatments', desc: 'Dog getting cleaned.', base: 'dog_wash', ext: 'full' },
    { title: 'Brushing & De-shed', desc: 'Dog getting brushed.', base: 'dog_brushing', ext: 'full' }
];

const teamImages = [
    { title: 'James', desc: 'Senior Stylist', base: '/staff/stylist-ai', ext: 'full' },
    { title: 'Tom', desc: 'Veterinarian', base: '/staff/veterinarian-ai', ext: 'full' },
    { title: 'Robert', desc: 'Elderly Dog Handler', base: '/staff/elderly-handler-ai', ext: 'full' },
    { title: 'Carl', desc: 'Receptionist', base: '/staff/receptionist-ai', ext: 'full' }
];

const salonImages = [
    { title: 'Exterior', desc: 'Our salon viewed from outside.', base: '/salon/exterior', ext: 'full' },
    { title: 'Office', desc: 'Our work area.', base: '/salon/office', ext: 'full' },
    { title: 'Exterior Ground View', desc: 'Our salon viewed from the footpath.', base: '/salon/exterior-two', ext: 'full' },
    { title: 'Footpath', desc: 'The footpath outside our salon.', base: '/salon/footpath', ext: 'full' },
    { title: 'Street Sign', desc: 'The street we reside in.', base: '/salon/street-sign', ext: 'full' }
];


// Method to build the inner HTML for a single slide.
function buildSlide(img)
{
    return `
        <picture>
            <source srcset="${getSrcset(img.base, img.ext, true)}" type="image/webp">
            <img src="images/gallery/${img.base}_${img.ext}.webp" class="placeholder-image" alt="${img.title}" loading="lazy">
        </picture>
        <div class="carousel-slide-body">
            <h3>${img.title}</h3>
            <p>${img.desc}</p>
        </div>`;
}

// Populate the main work carousel with slides.
workImages.forEach(img =>
{
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = buildSlide(img);
    track.appendChild(slide);
});


// Dot markers for mobile views.
const dotsEl = document.querySelector('.carousel-dots');

// Method to create and append a dot for each slide.
function buildDots()
{
    dotsEl.innerHTML = '';
    for (let i = 0; i < workImages.length; i++)
    {
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
    }
}

// Method to sync the active dot with the current slide.
function updateDots()
{
    dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) =>
    {
        d.classList.toggle('active', i === current);
    });
}


// Card sliding logic.

// Method to get the full width of a slide including its gap.
function getSlideWidth()
{
    const gap = parseFloat(getComputedStyle(track).gap);
    return document.querySelector('.carousel-slide').offsetWidth + gap;
}

buildDots();

// Method to move the carousel to a specific slide index.
function goTo(index)
{
    const max = workImages.length - getVisible();
    current = Math.max(0, Math.min(index, max));
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    prev.disabled = current === 0;
    next.disabled = current >= max;
    updateDots();
}

// Method to get how many slides are visible at once based on screen width.
function getVisible()
{
    return window.innerWidth >= 769 ? 3 : 1;
}

// Start on the first slide once the layout has settled.
requestAnimationFrame(() => goTo(0));

// Listen for arrow button clicks to move between slides.
next.addEventListener('click', () => goTo(current + 1));
prev.addEventListener('click', () => goTo(current - 1));


// Drag / swipe logic.
let dragStartX = 0, dragDeltaX = 0, isDragging = false;

// Record where the drag started and disable transitions while dragging.
wrapper.addEventListener('mousedown', e =>
{
    e.preventDefault();
    dragStartX = e.clientX;
    dragDeltaX = 0;
    isDragging = true;
    track.classList.add('no-transition');
    wrapper.classList.add('dragging');
});

// Follow the mouse and shift the track in real time.
window.addEventListener('mousemove', e =>
{
    if (!isDragging) return;
    dragDeltaX = e.clientX - dragStartX;
    track.style.transform = `translateX(-${current * getSlideWidth() - dragDeltaX}px)`;
});

// On release, snap to the nearest slide depending on how far it was dragged.
window.addEventListener('mouseup', () =>
{
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('no-transition');
    wrapper.classList.remove('dragging');
    const threshold = getSlideWidth() * 0.15;
    dragDeltaX < -threshold ? goTo(current + 1) : dragDeltaX > threshold ? goTo(current - 1) : goTo(current);
});

// Same as mousedown but for touch devices.
wrapper.addEventListener('touchstart', e =>
{
    dragStartX = e.touches[0].clientX;
    dragDeltaX = 0;
    isDragging = true;
    track.classList.add('no-transition');
}, { passive: true });

// Follow the finger and shift the track in real time.
wrapper.addEventListener('touchmove', e =>
{
    if (!isDragging) return;
    dragDeltaX = e.touches[0].clientX - dragStartX;
    track.style.transform = `translateX(-${current * getSlideWidth() - dragDeltaX}px)`;
}, { passive: true });

// On lift, snap to the nearest slide depending on how far it was swiped.
wrapper.addEventListener('touchend', () =>
{
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('no-transition');
    const threshold = getSlideWidth() * 0.15;
    dragDeltaX < -threshold ? goTo(current + 1) : dragDeltaX > threshold ? goTo(current - 1) : goTo(current);
});


// Team and salon section rendering.

// Method to build a static grid of cards inside a container.
function buildGrid(containerId, images)
{
    const container = document.getElementById(containerId);
    const grid = document.createElement('div');
    grid.className = 'card-grid';
    images.forEach(img =>
    {
        const card = document.createElement('div');
        card.className = 'service-card w3-card';
        card.innerHTML = buildSlide(img);
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

// Method to build a fully self-contained carousel inside any given container.
function buildCarousel(containerId, images)
{
    const container = document.getElementById(containerId);

    // Inject the carousel structure into the container.
    container.innerHTML = `
        <div class="carousel-outer">
            <button class="carousel-arrow prev" aria-label="Previous">&#8249;</button>
            <div class="carousel-track-wrapper">
                <div class="carousel-track"></div>
            </div>
            <button class="carousel-arrow next" aria-label="Next">&#8250;</button>
        </div>
        <div class="carousel-dots"></div>`;

    const cTrack = container.querySelector('.carousel-track');
    const cPrev = container.querySelector('.carousel-arrow.prev');
    const cNext = container.querySelector('.carousel-arrow.next');
    const cWrapper = container.querySelector('.carousel-track-wrapper');
    const cDotsEl = container.querySelector('.carousel-dots');
    let cCurrent = 0;

    // Populate the carousel track with slides.
    images.forEach(img =>
    {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = buildSlide(img);
        cTrack.appendChild(slide);
    });

    // Method to get the full width of a slide including its gap.
    function cGetSlideWidth()
    {
        const gap = parseFloat(getComputedStyle(cTrack).gap);
        return cTrack.querySelector('.carousel-slide').offsetWidth + gap;
    }

    // Method to get how many slides are visible at once based on screen width.
    function cGetVisible()
    {
        return window.innerWidth >= 769 ? 3 : 1;
    }

    // Method to sync the active dot with the current slide.
    function cUpdateDots()
    {
        cDotsEl.querySelectorAll('.carousel-dot').forEach((d, i) =>
        {
            d.classList.toggle('active', i === cCurrent);
        });
    }

    // Method to move this carousel to a specific slide index.
    function cGoTo(index)
    {
        const max = images.length - cGetVisible();
        cCurrent = Math.max(0, Math.min(index, max));
        cTrack.style.transform = `translateX(-${cCurrent * cGetSlideWidth()}px)`;
        cPrev.disabled = cCurrent === 0;
        cNext.disabled = cCurrent >= max;
        cUpdateDots();
    }

    // Method to create and append a dot for each slide.
    function cBuildDots()
    {
        cDotsEl.innerHTML = '';
        for (let i = 0; i < images.length; i++)
        {
            const d = document.createElement('button');
            d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => cGoTo(i));
            cDotsEl.appendChild(d);
        }
    }

    // Listen for arrow button clicks to move between slides.
    cNext.addEventListener('click', () => cGoTo(cCurrent + 1));
    cPrev.addEventListener('click', () => cGoTo(cCurrent - 1));

    // Drag / swipe logic for nested carousels.
    let cDragStartX = 0, cDragDeltaX = 0, cIsDragging = false;

    cWrapper.addEventListener('mousedown', e => { e.preventDefault(); cDragStartX = e.clientX; cDragDeltaX = 0; cIsDragging = true; cTrack.classList.add('no-transition'); cWrapper.classList.add('dragging'); });
    window.addEventListener('mousemove', e => { if (!cIsDragging) return; cDragDeltaX = e.clientX - cDragStartX; cTrack.style.transform = `translateX(-${cCurrent * cGetSlideWidth() - cDragDeltaX}px)`; });
    window.addEventListener('mouseup', () => { if (!cIsDragging) return; cIsDragging = false; cTrack.classList.remove('no-transition'); cWrapper.classList.remove('dragging'); const t = cGetSlideWidth() * 0.15; cDragDeltaX < -t ? cGoTo(cCurrent + 1) : cDragDeltaX > t ? cGoTo(cCurrent - 1) : cGoTo(cCurrent); });

    cWrapper.addEventListener('touchstart', e => { cDragStartX = e.touches[0].clientX; cDragDeltaX = 0; cIsDragging = true; cTrack.classList.add('no-transition'); }, { passive: true });
    cWrapper.addEventListener('touchmove', e => { if (!cIsDragging) return; cDragDeltaX = e.touches[0].clientX - cDragStartX; cTrack.style.transform = `translateX(-${cCurrent * cGetSlideWidth() - cDragDeltaX}px)`; }, { passive: true });
    cWrapper.addEventListener('touchend', () => { if (!cIsDragging) return; cIsDragging = false; cTrack.classList.remove('no-transition'); const t = cGetSlideWidth() * 0.15; cDragDeltaX < -t ? cGoTo(cCurrent + 1) : cDragDeltaX > t ? cGoTo(cCurrent - 1) : cGoTo(cCurrent); });

    cBuildDots();

    // Start on the first slide once the layout has settled.
    requestAnimationFrame(() => cGoTo(0));
}

// Method to build galleries and decide whether to show a grid or carousel depending on screen size and image count.
function initSection(containerId, images, threshold)
{
    const isMobile = window.innerWidth < 769;
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    if (isMobile || images.length >= threshold)
    {
        buildCarousel(containerId, images);
    } else
    {
        buildGrid(containerId, images);
    }
}

initSection('team-section', teamImages, Infinity);
initSection('salon-section', salonImages, 4);

// Re-evaluate layouts when the window is resized.
window.addEventListener('resize', () =>
{
    initSection('team-section', teamImages, Infinity);
    initSection('salon-section', salonImages, 4);
});