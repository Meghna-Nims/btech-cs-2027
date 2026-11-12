
(() => {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Student image fade
  const students = [...document.querySelectorAll(".student-slide")];
  let studentIndex = Math.max(0, students.findIndex(s => s.classList.contains("is-active")));

  if (students.length > 1) {
    const showStudent = i => {
      studentIndex = i % students.length;
      students.forEach((s, n) => {
        s.classList.toggle("is-active", n === studentIndex);
        s.setAttribute("aria-hidden", String(n !== studentIndex));
      });
    };

    if (!reducedMotion.matches) {
      setInterval(() => {
        if (!document.hidden) showStudent(studentIndex + 1);
      }, 3000);
    }
  }

  // Recognition carousel
  const carousel = document.querySelector("#recognitionCarousel");
  if (!carousel) return;

  const track = carousel.querySelector(".recognition-track");
  const slides = [...track.querySelectorAll(".recognition-slide")];
  const dots = [...document.querySelectorAll(".recognition-dots button")];
  let index = 0;

  if (slides.length < 2) return;

  const showSlide = i => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, n) => s.setAttribute("aria-hidden", String(n !== index)));
    dots.forEach((d, n) => {
      d.classList.toggle("is-active", n === index);
      d.setAttribute("aria-pressed", String(n === index));
    });
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => showSlide(i)));

  
if (!reducedMotion.matches) {
  setInterval(() => {
    if (!document.hidden) showSlide(index + 1);
  }, 2000);
}

})();

//gallery section
(() => {
  const carousel = document.querySelector("#facilitiesCarousel");
  if (!carousel) return;

  const cards = [...carousel.querySelectorAll(".facility-card")];
  if (cards.length < 2) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let timer;

  function advanceCarousel() {
    cards.forEach(card => {
      const slot = Number(card.dataset.slot);
      card.dataset.slot = String((slot + cards.length - 1) % cards.length);
    });
  }

  function startCarousel() {
    clearInterval(timer);
    if (document.hidden || reducedMotion.matches) return;
    timer = setInterval(advanceCarousel, 2800);
  }

  document.addEventListener("visibilitychange", startCarousel);
  reducedMotion.addEventListener("change", startCarousel);
  startCarousel();

  const lightbox = document.getElementById("facilityLightbox");
  const lightboxImage = document.getElementById("facilityLightboxImage");
  const closeBtn = lightbox?.querySelector(".facility-lightbox-close");

  if (!lightbox || !lightboxImage || !closeBtn) return;

  cards.forEach(card => {
    const img = card.querySelector("img");

    img?.addEventListener("click", () => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeLightbox();
  });
})();

// videos section



(() => {
  const orbit=document.querySelector("#storiesOrbit");
  const marquee=document.querySelector("#storiesMarquee");
  const modal=document.querySelector("#storyModal");
  const playerBox=document.querySelector("#storyModalPlayer");
  if(!orbit||!marquee||!modal||!playerBox)return;

  const topStories=[
    {title:"Brand Film ",id:"EjJlNHOXIXk"},
    {title:"World Health Summit Regional Meeting 2025 ",id:"BNAbDpv-BIU"},
    {title:"Petr Fiala's Visit to NIMS University ",id:"WYsxFymT-2s"},
    {title:"NIMS University FPV Campus Tour ",id:"vjZlcB_w2-Q"}
  ];

  const bottomStories=[
    {title:"AI ML Advertisement",id:"xgq50_i9k7c"},
    {title:"USP",id:"y3y4T-xdFBA"},
    {title:"Student Story 1",id:"gd4OBNkfU3o"},
    {title:"Student Story 2",id:"cqEIpuYNv7c"},
    {title:"Student Story 3",id:"vAHY7T9uGWU"},
    {title:"Testimonial ",id:"eZ-GRDRQ-0Q"},
    {title:"Testimonial 2",id:"RFWfcduoPSc"},
    {title:"Global HR Industry Summit",id:"zbTpDJ9KehA"},
    {title:"Walkthrough Marik Labs",id:"T2zYEz2om-Q"},
    {title:"Marik Visit Testimonial",id:"mj0b_P6dXG8"},
    {title:"Placement Day Celebration",id:"WezAB606iWI"},
    {title:"Brand Video",id:"z_bOyIGb-Sw"},
    {title:"Hostel",id:"YqucPQQTRrE"},
    {title:"Hostel Facilities",id:"S-eyw3BJNUA"},
    {title:"Campus Facilities",id:"o8ykj5UegSc"},
  ];

  let current=0,timer,startX=0,animating=false;
  const cards=[];

  const embed=id=>`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;

  function setThumbnail(img,id){
    const qualities=["maxresdefault","sddefault","hqdefault"];
    let quality=0;
    img.onerror=()=>{
      quality++;
      if(quality<qualities.length)img.src=`https://img.youtube.com/vi/${id}/${qualities[quality]}.jpg`;
    };
    img.src=`https://img.youtube.com/vi/${id}/${qualities[quality]}.jpg`;
  }

  function createPlayer(story){
    const iframe=document.createElement("iframe");
    iframe.src=embed(story.id);
    iframe.title=story.title;
    iframe.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen=true;
    return iframe;
  }

  function openPopup(story){
    clearInterval(timer);
    playerBox.replaceChildren(createPlayer(story));
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    document.body.classList.add("story-modal-open");
    modal.querySelector(".story-modal-close")?.focus();
  }

  function closePopup(){
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
    document.body.classList.remove("story-modal-open");
    playerBox.replaceChildren();
    startSlider();
  }

  function updateCard(card,index,offset,animate=true){
    const story=topStories[(index+topStories.length)%topStories.length];
    card.dataset.story=(index+topStories.length)%topStories.length;
    card.dataset.position=offset===0?"center":offset<0?"left":"right";
    card.style.setProperty("--offset",`${offset}%`);
    card.style.zIndex=offset===0?3:1;
    card.style.transition=animate?"transform .9s cubic-bezier(.22,.61,.36,1)":"none";

    if(card.dataset.id!==story.id){
      card.dataset.id=story.id;
      const img=card.querySelector("img");
      setThumbnail(img,story.id);
      img.alt=story.title;
    }
  }

  function playInline(card){
    const story=topStories[Number(card.dataset.story)];
    clearInterval(timer);
    card.classList.add("is-playing");
    card.replaceChildren(createPlayer(story));
  }

  function makeCard(){
    const card=document.createElement("div");
    card.className="story-orbit-card";
    const img=document.createElement("img");
    const play=document.createElement("button");
    play.type="button";
    play.className="story-play-icon";
    play.setAttribute("aria-label","Play video");
    card.append(img,play);
    orbit.appendChild(card);

    card.addEventListener("click",()=>{
      if(card.classList.contains("is-playing")||animating)return;
      if(card.dataset.position==="center")playInline(card);
      else{
        current=Number(card.dataset.story);
        resetCards();
      }
    });
    return card;
  }

  function renderInitial(){
    for(let i=0;i<3;i++)cards.push(makeCard());
    cards.forEach((card,i)=>updateCard(card,current+i-1,(i-1)*110,false));
  }

  function resetCards(){
    cards.forEach(card=>{
      card.classList.remove("is-playing");
      if(!card.querySelector("img")){
        const img=document.createElement("img");
        const play=document.createElement("button");
        play.type="button";
        play.className="story-play-icon";
        play.setAttribute("aria-label","Play video");
        card.append(img,play);
      }
    });
    cards.forEach((card,i)=>updateCard(card,current+i-1,(i-1)*110,false));
    startSlider();
  }

  function nextSlide(){
  if(animating||document.hidden||orbit.querySelector(".is-playing")||modal.classList.contains("is-open"))return;

  animating=true;

  cards.forEach(card=>{
    card.style.transition="transform .9s cubic-bezier(.22,.61,.36,1)";
  });

  requestAnimationFrame(()=>{
    cards.forEach((card,i)=>{
      card.style.setProperty("--offset",`${[-220,-110,0][i]}%`);
    });
  });

  setTimeout(()=>{
    current=(current+1)%topStories.length;

    const first=cards.shift();
    cards.push(first);

    updateCard(cards[0],current-1,-110,false);
    updateCard(cards[1],current,0,false);
    updateCard(cards[2],current+1,110,false);

    cards.forEach(card=>card.style.transition="none");

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        cards.forEach(card=>{
          card.style.transition="transform .9s cubic-bezier(.22,.61,.36,1)";
        });
        animating=false;
      });
    });
  },950);
}

  function startSlider(){
    clearInterval(timer);
    if(!document.hidden&&!orbit.querySelector(".is-playing")&&!modal.classList.contains("is-open")&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      timer=setInterval(nextSlide,4000);
    }
  }
  document.querySelector(".stories-next")?.addEventListener("click",()=>{
  clearInterval(timer);
  nextSlide();
  startSlider();
});

document.querySelector(".stories-prev")?.addEventListener("click",()=>{
  clearInterval(timer);
  if(animating)return;
  current=(current-1+topStories.length)%topStories.length;
  resetCards();
  startSlider();
});

  function renderMarquee(){
    marquee.replaceChildren();

    [...bottomStories,...bottomStories].forEach((story,index)=>{
      const card=document.createElement("button");
      card.type="button";
      card.className="story-marquee-card";
      card.setAttribute("aria-label",`Play ${story.title}`);

      if(index>=bottomStories.length){
        card.setAttribute("aria-hidden","true");
        card.tabIndex=-1;
      }

      const img=document.createElement("img");
      img.alt=index<bottomStories.length?story.title:"";
      img.loading="lazy";
      if(!story.id.startsWith("VIDEO_ID_"))setThumbnail(img,story.id);

      const play=document.createElement("span");
      play.className="story-play-icon";
      card.append(img,play);
      card.addEventListener("click",()=>openPopup(story));
      marquee.appendChild(card);
    });
  }

  modal.querySelectorAll("[data-close-story]").forEach(btn=>btn.addEventListener("click",closePopup));

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape"&&modal.classList.contains("is-open"))closePopup();
  });

  orbit.addEventListener("touchstart",e=>{
    startX=e.changedTouches[0].clientX;
    clearInterval(timer);
  },{passive:true});

  orbit.addEventListener("touchend",e=>{
    if(orbit.querySelector(".is-playing"))return;
    const delta=e.changedTouches[0].clientX-startX;
    if(Math.abs(delta)>45&&!animating){
      current=(current+(delta<0?1:-1)+topStories.length)%topStories.length;
      resetCards();
    }
    startSlider();
  },{passive:true});

  orbit.addEventListener("mouseenter",()=>clearInterval(timer));
  orbit.addEventListener("mouseleave",startSlider);
  document.addEventListener("visibilitychange",startSlider);

  renderInitial();
  renderMarquee();
  startSlider();
})();



// leadership

(() => {
  const viewport = document.querySelector("#leadersViewport");
  const track = document.querySelector("#leadersTrack");
  if (!viewport || !track) return;

  const prev = document.querySelector("#leadersPrev");
  const next = document.querySelector("#leadersNext");
  const modal = document.querySelector("#leaderModal");
  const player = document.querySelector("#leaderModalPlayer");
  const close = modal?.querySelector(".leader-modal-close");
  const backdrop = modal?.querySelector(".leader-modal-backdrop");
  let index = 0;

  function visibleCount() {
    if (innerWidth <= 480) return 1;
    if (innerWidth <= 767) return 2;
    return 3;
  }

  function update() {
    const cards = [...track.querySelectorAll(".leader-card")];
    if (!cards.length) return;
    index = Math.max(0, Math.min(index, cards.length - visibleCount()));
    const card = cards[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.style.transform = `translateX(-${index * (card.getBoundingClientRect().width + gap)}px)`;
  }

  next?.addEventListener("click", () => {
    const max = track.querySelectorAll(".leader-card").length - visibleCount();
    index = index >= max ? 0 : index + 1;
    update();
  });

  prev?.addEventListener("click", () => {
    const max = track.querySelectorAll(".leader-card").length - visibleCount();
    index = index <= 0 ? max : index - 1;
    update();
  });

  function openVideo(url) {
    if (!url || !modal || !player) return;
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.title = "Industry leader video";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture";
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("leader-modal-open");
  }

  function closeVideo() {
    if (!modal || !player) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    player.replaceChildren();
    document.body.classList.remove("leader-modal-open");
  }

  track.addEventListener("click", event => {
    const button = event.target.closest(".leader-play");
    if (!button) return;
    openVideo(button.dataset.video);
  });

  close?.addEventListener("click", closeVideo);
  backdrop?.addEventListener("click", closeVideo);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeVideo();
  });

  window.addEventListener("resize", update);
  update();
})();

// placement path 

(() => {
  const viewport = document.querySelector("#placementPathViewport");
  const track = document.querySelector("#placementPathTrack");
  const prev = document.querySelector("#placementPathPrev");
  const next = document.querySelector("#placementPathNext");
  if (!viewport || !track || !prev || !next) return;

  const cards = [...track.querySelectorAll(".placement-path-card")];
  if (cards.length < 2) return;

  let index = 0;
  let timer;
  let hovering = false;

  function visibleCount() {
    return innerWidth <= 767 ? 1 : 2;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function updateSlider() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = cards[0].getBoundingClientRect().width + gap;
    index = Math.min(index, maxIndex());
    track.style.transform = `translateX(-${index * step}px)`;
    prev.disabled = index === 0;
    next.disabled = index === maxIndex();
  }

  function advance() {
    index = index >= maxIndex() ? 0 : index + 1;
    updateSlider();
  }

  function startAutoSlide() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!hovering && !document.hidden) advance();
    }, 3000);
  }

  next.addEventListener("click", () => {
    index = index >= maxIndex() ? 0 : index + 1;
    updateSlider();
    startAutoSlide();
  });

  prev.addEventListener("click", () => {
    index = index <= 0 ? maxIndex() : index - 1;
    updateSlider();
    startAutoSlide();
  });

  viewport.addEventListener("mouseenter", () => hovering = true);
  viewport.addEventListener("mouseleave", () => hovering = false);
  viewport.addEventListener("touchstart", () => hovering = true, { passive: true });
  viewport.addEventListener("touchend", () => hovering = false, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(timer);
    else startAutoSlide();
  });

  window.addEventListener("resize", updateSlider);

  updateSlider();
  startAutoSlide();
})();

// faculty section

/* FACULTY POPUP + DESKTOP AND MOBILE SLIDER */

(() => {

  function initFaculty() {

    const section = document.querySelector(".faculty-section");
    if (!section) return;

    const row = section.querySelector(".faculty-row");
    const modal = document.querySelector("#facultyModal");
    const modalBody = document.querySelector("#facultyModalBody");

    const prevBtn = section.querySelector(".faculty-prev");
    const nextBtn = section.querySelector(".faculty-next");

    if (!row || !prevBtn || !nextBtn) return;

    const cards = Array.from(row.querySelectorAll(".faculty-col"));

    if (!cards.length) return;

    const mobile = window.matchMedia("(max-width: 575px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const positionClasses = [
      "faculty-pos-1",
      "faculty-pos-2",
      "faculty-pos-3",
      "faculty-pos-4",
      "faculty-pos-5"
    ];

    let currentIndex = 0;
    let sliderTimer = null;

    const getVisibleCount = () => mobile.matches ? 1 : 5;


    /* FACULTY POPUP */

    function openProfile(card) {

      if (!modal || !modalBody) return;

      const profileId = card.dataset.profile;

      if (!profileId) return;

      const profile = document.getElementById(profileId);

      if (!profile || !profile.classList.contains("faculty-profile")) return;

      modalBody.innerHTML = profile.innerHTML;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";

      stopSlider();

    }

    function closeProfile() {

      if (!modal || !modalBody) return;

      modal.classList.remove("active");
      modalBody.innerHTML = "";

      document.body.style.overflow = "";

      startSlider();

    }

    if (modal) {

      const closeBtn = modal.querySelector(".faculty-modal-close");
      const overlay = modal.querySelector(".faculty-modal-overlay");

      if (closeBtn) {
        closeBtn.addEventListener("click", closeProfile);
      }

      if (overlay) {
        overlay.addEventListener("click", closeProfile);
      }

      document.addEventListener("keydown", function (e) {

        if (
          e.key === "Escape" &&
          modal.classList.contains("active")
        ) {
          closeProfile();
        }

      });

    }

    section.addEventListener("click", function (e) {

      const card = e.target.closest(".faculty-card");

      if (!card) return;

      openProfile(card);

    });


    /* RENDER FACULTY */

    function renderFaculty() {

      const visibleCount = getVisibleCount();

      cards.forEach((card, index) => {

        const visible =
          index >= currentIndex &&
          index < currentIndex + visibleCount;

        card.classList.toggle("is-visible", visible);

        card.classList.remove(...positionClasses);

        if (visible) {

          const position = index - currentIndex;

          if (!mobile.matches && positionClasses[position]) {
            card.classList.add(positionClasses[position]);
          }

        }

      });

    }


    /* NEXT FACULTY */

    function nextFaculty() {

      const visibleCount = getVisibleCount();

      if (currentIndex + visibleCount < cards.length) {

        currentIndex += visibleCount;

      } else {

        currentIndex = 0;

      }

      renderFaculty();

    }


    /* PREVIOUS FACULTY */

    function previousFaculty() {

      const visibleCount = getVisibleCount();

      if (currentIndex >= visibleCount) {

        currentIndex -= visibleCount;

      } else {

        currentIndex =
          Math.floor((cards.length - 1) / visibleCount) * visibleCount;

      }

      renderFaculty();

    }


    /* AUTO SLIDER */

    function stopSlider() {

      clearInterval(sliderTimer);
      sliderTimer = null;

    }

    function startSlider() {

      stopSlider();

      if (
        document.hidden ||
        motion.matches ||
        (modal && modal.classList.contains("active")) ||
        cards.length <= getVisibleCount()
      ) {
        return;
      }

      const delay = mobile.matches ? 3000 : 4500;

      sliderTimer = setInterval(function () {

        nextFaculty();

      }, delay);

    }


    /* ARROW NAVIGATION */

    nextBtn.addEventListener("click", function () {

      nextFaculty();
      startSlider();

    });

    prevBtn.addEventListener("click", function () {

      previousFaculty();
      startSlider();

    });


    /* RESPONSIVE */

    function resetSlider() {

      currentIndex = 0;

      renderFaculty();
      startSlider();

    }

    mobile.addEventListener("change", resetSlider);

    motion.addEventListener("change", startSlider);

    document.addEventListener("visibilitychange", startSlider);


    /* INITIALIZE */

    renderFaculty();
    startSlider();

  }


  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", initFaculty);

  } else {

    initFaculty();

  }

})();



// success stories

document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".success-stories-grid");
  const prev = document.querySelector(".success-prev");
  const next = document.querySelector(".success-next");

  if (!slider || !prev || !next) return;

  function getScrollAmount() {
    const card = slider.querySelector(".success-card");
    const gap = parseFloat(getComputedStyle(slider).gap) || 0;
    return card ? card.offsetWidth + gap : 0;
  }

  prev.addEventListener("click", () => {
    slider.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth"
    });
  });

  next.addEventListener("click", () => {
    slider.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth"
    });
  });
});



// classroom
(() => {
    const track = document.querySelector("#classroomTrack");
    if (!track) return;

    const prev = document.querySelector(".classroom-prev");
    const next = document.querySelector(".classroom-next");
    const originalSlides = [...track.children];

    if (originalSlides.length < 2) return;

    const firstClone = originalSlides[0].cloneNode(true);
    const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");

    track.appendChild(firstClone);
    track.insertBefore(lastClone, originalSlides[0]);

    let index = 1;
    let timer;
    let isAnimating = false;
    const interval = 4000;

    function updateSlider(animate = true) {
        track.style.transition = animate ? "transform .7s cubic-bezier(.22,.61,.36,1)" : "none";
        track.style.transform = `translate3d(-${index * 100}%,0,0)`;
    }

    function moveSlide(direction) {
        if (isAnimating) return;

        isAnimating = true;
        index += direction;
        updateSlider(true);
    }

    track.addEventListener("transitionend", () => {
        if (index === originalSlides.length + 1) {
            index = 1;
            updateSlider(false);
        } else if (index === 0) {
            index = originalSlides.length;
            updateSlider(false);
        }

        isAnimating = false;
    });

    next.addEventListener("click", () => {
        moveSlide(1);
        restartAutoSlide();
    });

    prev.addEventListener("click", () => {
        moveSlide(-1);
        restartAutoSlide();
    });

    function startAutoSlide() {
        clearInterval(timer);
        timer = setInterval(() => moveSlide(1), interval);
    }

    function restartAutoSlide() {
        startAutoSlide();
    }

    const slider = document.querySelector(".classroom-slider");

    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", startAutoSlide);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearInterval(timer);
        else startAutoSlide();
    });

    updateSlider(false);
    startAutoSlide();
})();