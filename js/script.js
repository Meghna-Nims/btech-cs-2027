
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
  const dotsContainer = document.querySelector(".recognition-dots");

  if (!track || slides.length !== 3 || !dotsContainer) return;

  const secondSlide = slides[1];
  const longList = secondSlide.querySelector(".recognition-long-list");
  const longCards = longList
    ? [...longList.querySelectorAll(".recognition-long-row")]
    : [];

  const isMobile = () => window.innerWidth <= 575;

  let index = 0;
  let timer = null;
  let dots = [];

  function getSlideCount() {
    return isMobile() ? 4 : 3;
  }

  function createDots() {
    const count = getSlideCount();

    dotsContainer.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `Show recognition slide ${i + 1}`);
      dot.setAttribute("aria-pressed", "false");

      dot.addEventListener("click", () => {
        showSlide(i);
        startAutoplay();
      });

      dotsContainer.appendChild(dot);
    }

    dots = [...dotsContainer.querySelectorAll("button")];
  }

  function showSlide(i) {
    const count = getSlideCount();

    index = (i + count) % count;

    if (isMobile()) {
      if (index === 0) {
        track.style.transform = "translateX(0%)";
      } else if (index === 1 || index === 2) {
        track.style.transform = "translateX(-100%)";
        showInnerCard(index - 1);
      } else {
        track.style.transform = "translateX(-200%)";
      }

      slides.forEach((slide, n) => {
        slide.setAttribute("aria-hidden", String(
          n !== 0 && n !== 1 && n !== 2
            ? true
            : index === 0 ? n !== 0
            : index === 3 ? n !== 2
            : n !== 1
        ));
      });

    } else {
      track.style.transform = `translateX(-${index * 100}%)`;

      slides.forEach((slide, n) => {
        slide.setAttribute("aria-hidden", String(n !== index));
      });
    }

    dots.forEach((dot, n) => {
      dot.classList.toggle("is-active", n === index);
      dot.setAttribute("aria-pressed", String(n === index));
    });
  }

  function showInnerCard(i) {
    if (!longList || !longCards.length) return;

    const card = longCards[i];

    const left =
      card.getBoundingClientRect().left -
      longList.getBoundingClientRect().left +
      longList.scrollLeft;

    longList.scrollTo({
      left,
      behavior: "smooth"
    });
  }

  function startAutoplay() {
    clearInterval(timer);

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    timer = setInterval(() => {
      if (!document.hidden && !carousel.matches(":hover")) {
        showSlide(index + 1);
      }
    }, isMobile() ? 3000 : 2000);
  }

  function handleResize() {
    const previousCount = dots.length;
    const newCount = getSlideCount();

    if (previousCount !== newCount) {
      index = 0;
      createDots();
      showSlide(0);
    }

    startAutoplay();
  }

  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", startAutoplay);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) clearInterval(timer);
    else startAutoplay();
  });

  window.addEventListener("resize", handleResize);

  createDots();
  showSlide(0);
  startAutoplay();
})();

//gallery section

(() => {
  const carousel = document.querySelector("#facilitiesCarousel");
  if (!carousel) return;

  const stage = carousel.querySelector(".facilities-stage");
  const cards = [...stage.querySelectorAll(".facility-card")];

  const prevBtn = carousel.querySelector(".facilities-prev");
  const nextBtn = carousel.querySelector(".facilities-next");

  if (cards.length < 2) return;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const lightbox = document.querySelector("#facilityLightbox");
  const lightboxImage = document.querySelector("#facilityLightboxImage");
  const closeBtn = lightbox?.querySelector(".facility-lightbox-close");

  let activeIndex = 0;
  let activeCard = null;
  let isHovered = false;
  let timer = null;

  function updateCarousel() {
    const total = cards.length;

    cards.forEach((card, i) => {
      const slot = (i - activeIndex + total) % total;

      if (slot <= 6) {
        card.dataset.slot = slot;
        card.classList.remove("is-hidden");
      } else {
        card.classList.add("is-hidden");
      }
    });
  }

  function advanceCarousel() {
    if (isHovered || document.hidden) return;

    activeIndex = (activeIndex + 1) % cards.length;
    updateCarousel();
  }

  function moveCarousel(direction) {
    activeIndex =
      (activeIndex + direction + cards.length) % cards.length;

    updateCarousel();
    startCarousel();
  }

  prevBtn?.addEventListener("click", () => {
    moveCarousel(-1);
  });

  nextBtn?.addEventListener("click", () => {
    moveCarousel(1);
  });

  function pauseCarousel() {
    clearInterval(timer);
    timer = null;
  }

  function startCarousel() {
    pauseCarousel();

    if (
      document.hidden ||
      reducedMotion.matches ||
      isHovered ||
      lightbox?.classList.contains("active")
    ) return;

    timer = setInterval(advanceCarousel, 1800);
  }

  /* HOVER EXPANSION */

  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      if (card.classList.contains("is-hidden")) return;

      if (activeCard) {
        activeCard.classList.remove("is-active");
      }

      activeCard = card;
      isHovered = true;

      stage.classList.add("is-hovering");
      card.classList.add("is-active");

      pauseCarousel();
    });
  });

  stage.addEventListener("mouseleave", () => {
    if (activeCard) {
      activeCard.classList.remove("is-active");
      activeCard = null;
    }

    stage.classList.remove("is-hovering");

    isHovered = false;
    startCarousel();
  });

  /* LIGHTBOX */

  if (lightbox && lightboxImage && closeBtn) {
    cards.forEach(card => {
      const img = card.querySelector("img");

      img?.addEventListener("click", () => {
        if (card.classList.contains("is-hidden")) return;

        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;

        lightbox.classList.add("active");
        document.body.style.overflow = "hidden";

        pauseCarousel();
      });
    });

    function closeLightbox() {
      lightbox.classList.remove("active");
      document.body.style.overflow = "";
      startCarousel();
    }

    closeBtn.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", event => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && lightbox.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseCarousel();
    } else {
      startCarousel();
    }
  });

  reducedMotion.addEventListener("change", startCarousel);

  updateCarousel();
  startCarousel();

})();


(() => {
  const section = document.querySelector(".facilities-section");
  if (!section) return;

  const stage = section.querySelector(".facilities-stage");
  const lightbox = section.querySelector("#facilityLightbox");

  if (!stage || !lightbox) return;

  const popupImage = lightbox.querySelector("#facilityLightboxImage");
  const popupTitle = lightbox.querySelector("#facilityPopupTitle");
  const popupCategory = lightbox.querySelector("#facilityPopupCategory");
  const popupDescription = lightbox.querySelector("#facilityPopupDescription");
  const popupCount = lightbox.querySelector("#facilityPopupCount");
  const closeButton = lightbox.querySelector(".facility-lightbox-close");

  const cards = [...stage.querySelectorAll(".facility-card")];

  function openPopup(card) {
    const image = card.querySelector("img");
    const title = card.querySelector("figcaption");

    if (!image || !title) return;

    const index = cards.indexOf(card) + 1;

    popupImage.src = image.currentSrc || image.src;
    popupImage.alt = image.alt || title.textContent.trim();

    popupTitle.textContent = title.textContent.trim();
    popupCategory.textContent = card.dataset.category || "CAMPUS FACILITY";
    popupDescription.textContent = card.dataset.description || "";
    popupCount.textContent =
      `${String(index).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;

    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  stage.addEventListener("click", (event) => {
    const card = event.target.closest(".facility-card");

    if (card && stage.contains(card)) {
      openPopup(card);
    }
  });

  closeButton?.addEventListener("click", closePopup);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closePopup();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("active")) {
      closePopup();
    }
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

    const cards = [...track.querySelectorAll(".leader-card")];

    if (!cards.length) return;

    let index = 0;
    let timer = null;
    let isHovered = false;

    function visibleCount() {
        if (window.innerWidth <= 480) return 1;
        if (window.innerWidth <= 767) return 2;
        return 3;
    }

    function update() {
        const gap = parseFloat(getComputedStyle(track).gap) || 0;
        const cardWidth = cards[0].getBoundingClientRect().width;
        const maxIndex = Math.max(0, cards.length - visibleCount());

        index = Math.max(0, Math.min(index, maxIndex));

        track.style.transform =
            `translateX(-${index * (cardWidth + gap)}px)`;
    }

    function moveNext() {
        const maxIndex = Math.max(0, cards.length - visibleCount());

        index = index >= maxIndex ? 0 : Math.min(index + visibleCount(), maxIndex);
        update();
    }

    function movePrev() {
        const maxIndex = Math.max(0, cards.length - visibleCount());

        index = index <= 0
            ? maxIndex
            : Math.max(0, index - visibleCount());

        update();
    }

    function startAutoplay() {
        clearInterval(timer);

        if (isHovered || document.hidden || modal?.classList.contains("is-open")) {
            return;
        }

        timer = setInterval(moveNext, 2500);
    }

    function pauseAutoplay() {
        clearInterval(timer);
        timer = null;
    }

    // Navigation buttons
    next?.addEventListener("click", () => {
        moveNext();
        startAutoplay();
    });

    prev?.addEventListener("click", () => {
        movePrev();
        startAutoplay();
    });

    // Pause on hover
    viewport.addEventListener("mouseenter", () => {
        isHovered = true;
        pauseAutoplay();
    });

    viewport.addEventListener("mouseleave", () => {
        isHovered = false;
        startAutoplay();
    });

    // Video modal
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

        pauseAutoplay();
    }

    function closeVideo() {
        if (!modal || !player) return;

        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        player.replaceChildren();
        document.body.classList.remove("leader-modal-open");

        startAutoplay();
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

    window.addEventListener("resize", () => {
        update();
    });

    document.addEventListener("visibilitychange", startAutoplay);

    update();
    startAutoplay();

})();


// placement path internships

(() => {
  const viewport = document.querySelector("#placementPathViewport");
  const track = document.querySelector("#placementPathTrack");
  const prev = document.querySelector("#placementPathPrev");
  const next = document.querySelector("#placementPathNext");

  if (!viewport || !track || !prev || !next) return;

  const cards = [...track.querySelectorAll(".placement-path-card")];
  if (cards.length < 2) return;

  let index = 0;
  let timer = null;
  let hovering = false;

  function visibleCount() {
    return window.innerWidth <= 767 ? 1 : 2;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCount());
  }

  function updateSlider() {
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    const step = cardWidth + gap;

    index = Math.min(index, maxIndex());

    track.style.transform = `translateX(-${index * step}px)`;

    prev.disabled = index === 0;
    next.disabled = index >= maxIndex();
  }

  function advance() {
    const step = visibleCount();
    index = index >= maxIndex() ? 0 : Math.min(index + step, maxIndex());
    updateSlider();
  }

  function startAutoSlide() {
    clearInterval(timer);

    timer = setInterval(() => {
      if (!hovering && !document.hidden) {
        advance();
      }
    }, 3000);
  }

  next.addEventListener("click", () => {
    index = index >= maxIndex()
      ? 0
      : Math.min(index + visibleCount(), maxIndex());

    updateSlider();
    startAutoSlide();
  });

  prev.addEventListener("click", () => {
    index = index <= 0
      ? maxIndex()
      : Math.max(index - visibleCount(), 0);

    updateSlider();
    startAutoSlide();
  });

  viewport.addEventListener("mouseenter", () => {
    hovering = true;
  });

  viewport.addEventListener("mouseleave", () => {
    hovering = false;
  });

  viewport.addEventListener("touchstart", () => {
    hovering = true;
  }, { passive: true });

  viewport.addEventListener("touchend", () => {
    hovering = false;
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      startAutoSlide();
    }
  });

  window.addEventListener("resize", updateSlider);

  updateSlider();
  startAutoSlide();
})();

// faculty section

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

    const cards = [...row.querySelectorAll(".faculty-col")];
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
      modal.querySelector(".faculty-modal-close")?.addEventListener("click", closeProfile);

      modal.querySelector(".faculty-modal-overlay")?.addEventListener("click", closeProfile);

      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
          closeProfile();
        }
      });
    }

    section.addEventListener("click", e => {
      const card = e.target.closest(".faculty-card");
      if (card) openProfile(card);
    });

    function renderFaculty() {
      const visibleCount = getVisibleCount();

      cards.forEach((card, index) => {
        const visible =
          index >= currentIndex &&
          index < currentIndex + visibleCount;

        card.classList.toggle("is-visible", visible);
        card.classList.remove(...positionClasses);

        if (visible && !mobile.matches) {
          const position = index - currentIndex;

          if (positionClasses[position]) {
            card.classList.add(positionClasses[position]);
          }
        }
      });
    }

    function nextFaculty() {
      const visibleCount = getVisibleCount();

      currentIndex =
        currentIndex + visibleCount < cards.length
          ? currentIndex + visibleCount
          : 0;

      renderFaculty();
    }

    function previousFaculty() {
      const visibleCount = getVisibleCount();

      currentIndex =
        currentIndex >= visibleCount
          ? currentIndex - visibleCount
          : Math.floor((cards.length - 1) / visibleCount) * visibleCount;

      renderFaculty();
    }

    function stopSlider() {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }

    function startSlider() {
      stopSlider();

      if (
        document.hidden ||
        motion.matches ||
        modal?.classList.contains("active") ||
        cards.length <= getVisibleCount()
      ) return;

      sliderTimer = setInterval(nextFaculty, mobile.matches ? 3000 : 4500);
    }

    nextBtn.addEventListener("click", () => {
      nextFaculty();
      startSlider();
    });

    prevBtn.addEventListener("click", () => {
      previousFaculty();
      startSlider();
    });

    function resetSlider() {
      currentIndex = 0;
      renderFaculty();
      startSlider();
    }

    mobile.addEventListener("change", resetSlider);
    motion.addEventListener("change", startSlider);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopSlider();
      } else {
        startSlider();
      }
    });

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

    const cards = [...slider.querySelectorAll(".success-card")];

    if (cards.length < 2) return;

    let currentIndex = 0;
    let timer = null;
    let isHovered = false;

    function getVisibleCards() {
        if (window.innerWidth <= 575) return 1;
        if (window.innerWidth <= 991) return 2;
        return 3;
    }

    function getStep() {
        const card = cards[0];
        const gap = parseFloat(getComputedStyle(slider).gap) || 0;

        return (card.offsetWidth + gap) * getVisibleCards();
    }

    function showGroup(index) {
        const maxIndex = Math.max(0, cards.length - getVisibleCards());

        currentIndex = Math.max(0, Math.min(index, maxIndex));

        slider.scrollTo({
            left: currentIndex * (
                cards[0].offsetWidth +
                (parseFloat(getComputedStyle(slider).gap) || 0)
            ),
            behavior: "smooth"
        });
    }

    function moveNext() {
        const visible = getVisibleCards();
        const maxIndex = Math.max(0, cards.length - visible);

        if (currentIndex >= maxIndex) {
            showGroup(0);
        } else {
            showGroup(Math.min(currentIndex + visible, maxIndex));
        }
    }

    function movePrev() {
        const visible = getVisibleCards();

        if (currentIndex <= 0) {
            showGroup(Math.max(0, cards.length - visible));
        } else {
            showGroup(Math.max(0, currentIndex - visible));
        }
    }

    function startAutoplay() {
        clearInterval(timer);

        if (isHovered || document.hidden) return;

        timer = setInterval(moveNext, 2500);
    }

    function pauseAutoplay() {
        clearInterval(timer);
        timer = null;
    }

    next.addEventListener("click", () => {
        moveNext();
        startAutoplay();
    });

    prev.addEventListener("click", () => {
        movePrev();
        startAutoplay();
    });

    slider.addEventListener("mouseenter", () => {
        isHovered = true;
        pauseAutoplay();
    });

    slider.addEventListener("mouseleave", () => {
        isHovered = false;
        startAutoplay();
    });

    document.addEventListener("visibilitychange", startAutoplay);

    window.addEventListener("resize", () => {
        showGroup(currentIndex);
    });

    showGroup(0);
    startAutoplay();
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

// counter
document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll(".placement-stats .counter");
    const section = document.querySelector(".placement-stats");

    if (!section || !counters.length) return;

    let started = false;

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * target);

            counter.textContent = currentValue.toLocaleString("en-IN");

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString("en-IN");
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
});

document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll(".package-counter");
    const section = document.querySelector(".package-card")?.parentElement;

    if (!section || !counters.length) return;

    let started = false;

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const prefix = counter.dataset.prefix || "";
        const suffix = counter.dataset.suffix || "";
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = (easedProgress * target).toFixed(0);

            counter.textContent = prefix + currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = prefix + target + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
});
document.addEventListener("DOMContentLoaded", function () {
    const counters = document.querySelectorAll(".research-counter");
    const section = document.querySelector(".research-stats-row");

    if (!section || !counters.length) return;

    let started = false;

    function animateCounter(counter) {
        const target = Number(counter.dataset.target);
        const suffix = counter.dataset.suffix || "";
        const duration = 2000;
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easedProgress * target);

            counter.textContent =
                currentValue.toLocaleString("en-IN") + suffix;

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent =
                    target.toLocaleString("en-IN") + suffix;
            }
        }

        requestAnimationFrame(updateCounter);
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting && !started) {
                started = true;

                counters.forEach(function (counter) {
                    animateCounter(counter);
                });

                observer.disconnect();
            }
        });
    }, {
        threshold: 0.3
    });

    observer.observe(section);
});

// sticky bottom

(() => {
  const stickyBar = document.querySelector("#stickyAdmissionBar");
  const header = document.querySelector(".site-header");

  const hideSections = [
    ".admission-open-section",
    ".campus-showcase",
    ".nims-footer"
  ];

  if (!stickyBar || !header) return;

  let headerPassed = false;
  let shouldHide = false;
  let footerReached = false;

  function updateStickyBar() {
    const atPageBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 5;

    stickyBar.classList.toggle(
      "is-visible",
      headerPassed && !shouldHide && !footerReached && !atPageBottom
    );
  }

  const headerObserver = new IntersectionObserver(([entry]) => {
    headerPassed = !entry.isIntersecting;
    updateStickyBar();
  }, { threshold: 0 });

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.matches(".nims-footer")) {
        footerReached = entry.isIntersecting;
      }

      if (entry.target.matches(".admission-open-section, .campus-showcase")) {
        entry.target.dataset.reached = entry.isIntersecting;
      }
    });

    shouldHide = hideSections.some(selector => {
      const section = document.querySelector(selector);
      return section && section.dataset.reached === "true";
    });

    updateStickyBar();
  }, { threshold: 0 });

  headerObserver.observe(header);

  hideSections.forEach(selector => {
    const section = document.querySelector(selector);
    if (section) sectionObserver.observe(section);
  });

  window.addEventListener("scroll", updateStickyBar, { passive: true });
  window.addEventListener("resize", updateStickyBar);

  updateStickyBar();
})();
